import express from "express";
import http from "http";
import { Server } from "socket.io";
import * as dotenv from "dotenv";
import { dirname, join } from "path";
import path from "path";
import redis from "redis";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const server = http.createServer(app);
const io = new Server(server);
// create redis client
const client = redis.createClient();
client.on("error", (err) => {
  console.error("Redis client error:", err);
});

await client.connect();

// this function loops through the redis storage on the event of send_messages and emits that to every user except the current user

async function sendMessage(socket) {
  try {
    const data = await client.lRange("send_message", 0, -1);

    data.forEach((x) => {
      const [redisUser, redisMessage, redisRoom] = x.split(":");

      socket.emit("send_message", {
        user: redisUser,
        message: redisMessage,
        room: redisRoom,
      });
    });
  } catch (err) {
    console.error("Error fetching messages from Redis:", err);
  }
}

io.on("connection", (socket) => {
  console.log("user connected");

  sendMessage(socket);
  // joining a room
  socket.on("join_room", (room) => {
    console.log(`Joining room: ${room}`);
    socket.join(room);
    socket.to(room).emit("server_message", `a user just joined ${room}`);
  });

  // sending a chat message
  socket.on("send_message", ({ room, user, message }) => {
    console.log(`[${room}] ${user}, ${message}`);

    // push into redis array user and message
    client.rPush("send_message", `${user}:${message}:${room}`);

    socket.to(room).emit("receive_message", { user, message });
  });
  // disconnect user when they close the tab
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.use(express.static(join(__dirname, "../client")));

// app.get("/", (req, res) => {
//   res.send("<h1>Welcome to the chat app</h1>");
// });

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "../client") });
});

server.listen(PORT, () => {
  console.log(`Server listening at ${PORT}`);
});
