import express from "express";
import http from "http";
import { Server } from "socket.io";
import * as dotenv from "dotenv";
import { dirname, join } from "path";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const server = http.createServer(app);
const io = new Server(server);

// 
io.on("connection", (socket) => {
  console.log("user connected");
});

app.use(express.static(join(__dirname, "../client")));

app.get("/", (req, res) => {
  res.send("<h1>Welcome to the chat app</h1>");
});

app.get("/chat", (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "../client") });
});

server.listen(PORT, () => {
  console.log(`Server listening at ${PORT}`);
});
