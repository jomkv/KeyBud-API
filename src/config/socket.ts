import { Server } from "socket.io";

const connectSocket = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

  io.on("connect", (socket) => {
    console.log(`Socket ${socket.id} has connected`);
  });

  io.on("disconnect", (socket) => {
    console.log(`Socket ${socket.id} has disconnected`);
  });
};

export default connectSocket;
