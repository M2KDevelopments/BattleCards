//environment variables - https://www.npmjs.com/package/dotenv
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./main");
const httpServer = http.createServer(app);
const mywebsockets = require("./websockets");
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

// https://www.youtube.com/watch?v=ZKEqqIO7n-k&t=290s
io.on("connection", mywebsockets.onConnection);

//Dev Port can be found in ../nodemon.json
const port = process.env.PORT || 4000;

httpServer.listen(port, () => console.log(`Running on ${port}`));
