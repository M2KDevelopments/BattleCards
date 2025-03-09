// Declare Express App
import http from "http";
import express from "express";
import { Server } from "socket.io"
import { onConnection } from "./websockets.js"

const app = express();
app.use(express.json());

// Create HTTP server
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

// https://www.youtube.com/watch?v=ZKEqqIO7n-k&t=290s
io.on("connection", onConnection);

const port = process.env.PORT || 3002;
httpServer.listen(port, () => console.log(`Running on ${port}`));