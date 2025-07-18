import express from "express";
import http from "http";
import { Server } from "socket.io";
import * as dotenv from "dotenv";
import { dirname, join } from "path";
import path from "path";
import redis from "redis";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "dev";
const REDIS_URL =
  process.env.REDIS_URL ||
  (NODE_ENV === "prod" ? process.env.REDIS_URL : "redis://localhost:6379");

console.log(`Environment: ${NODE_ENV}`);
console.log(`Redis URL: ${REDIS_URL.replace(/\/\/.*@/, "//***@")}`);

// TODO: USE NGNIX OR HAPROXY LATER
const pubClient = createClient({ url: REDIS_URL }); // publish events
const subClient = pubClient.duplicate(); // to listen for events

await pubClient.connect();
console.log("PubClient connected on", PORT);
await subClient.connect();
console.log("SubClient connected on", PORT);

const server = http.createServer(app);

// const io = new Server(server);
const io = new Server(server, {
  cors: {
    origin:
      NODE_ENV === "prod"
        ? process.env.ALLOWED_ORIGINS?.split(",") || [
            process.env.ALLOWED_ORIGINS,
          ]
        : "*",
  },
});

// redis communicating
io.adapter(createAdapter(pubClient, subClient));

// create redis client
const client = redis.createClient({
  url: REDIS_URL,
});
client.on("connect", () => {
  console.log(`[${NODE_ENV}] Redis storage client connected on port ${PORT}`);
});
client.on("error", (err) => {
  console.error("Redis client error:", err);
});

await client.connect();

io.on("connection", (socket) => {
  console.log("user connected");
  // joining a room
  socket.on("join_room", async (room, username) => {
    console.log(`${username} just joined the ${room}`);
    socket.join(room);
    socket.to(room).emit("server_message", `${username} just joined ${room}`);
    // redis key for each room
    const redisKey = `chat:${room}`;

    // get messages based on the room
    const history = await client.lRange(redisKey, 0, -1);
    history.forEach((items) => {
      const { user, message, room } = JSON.parse(items);
      socket.emit("chat_history", { user, message, room });
    });
  });

  // send_message event from client. when the client sends a message, redis saves the message and socket emits to every other room
  socket.on("send_message", async ({ room, user, message }) => {
    console.log(`[${room}] ${user}, ${message}`);

    const redisKey = `chat:${room}`;
    const payload = JSON.stringify({ user, message, room });

    // push into redis array user and message

    await client.rPush(redisKey, payload);

    socket.to(room).emit("receive_message", { user, message });
  });
  // disconnect user when they close the tab
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.use(express.static(join(__dirname, "../client")));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "../client") });
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await client.quit();
  await pubClient.quit();
  await subClient.quit();
  process.exit(0);
});

server.listen(PORT, () => {
  console.log(`Server listening at ${PORT}`);
});
