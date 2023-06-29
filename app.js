
// const io = require("socket.io")(httpServer, {
//   cors: {
//     origin: "https://example.com",
//     methods: ["GET", "POST"]
//   }
// });
const express = require("express");

const app = express();
const { Server } = require("socket.io");

const server = app.listen(5000, () =>
  console.log("server listening on port " + 5000)
);

const io = new Server(server, {
  cors: {
    // credentials: true,
    origin: "*",
  },
});

let readyPlayersCount = 0;

const pongNameSpace = io.of("/pong");
pongNameSpace.on("connection", (socket) => {
  let room;
  console.log("a user connected", socket.id);

  socket.on("ready", () => {
    // first player join readyPlayersCount is 0, then it will incremented by 1 and first player socket join room0 and when second player join readyPlayersCount is 1 then 1 / 2 will be 0.5. It will become 0 using MAth.floor method so second player also join room0 and so on.
    room = "room" + Math.floor(readyPlayersCount / 2);

    socket.join(room);
    console.log("Player ready..", socket.id);

    readyPlayersCount++;

    if (readyPlayersCount % 2 === 0) {
      console.log("condition true..");
      pongNameSpace.in(room).emit("startGame", socket.id);
    }
  });

  socket.on("paddleMove", (paddleData) => {
    socket.to(room).emit("paddleMove", paddleData);
  });
  socket.on("ballMove", (ballData) => {
    socket.to(room).emit("ballMove", ballData);
  });

  socket.on("disconnect", () => {
    console.log("client disconnected with socket", socket.id);
    socket.leave(room);
  });
});
