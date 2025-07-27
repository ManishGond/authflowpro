import { Server } from "socket.io";

let io: Server;

export const initSocketIO = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL, // <--- from backend .env
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🧠 Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized!");
  return io;
};
