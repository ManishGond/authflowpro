import http from "http";
import app from "./app";
import dotenv from "dotenv";
import { initSocketIO } from "./utils/socket";

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = initSocketIO(server)

// Socket event hookup (future use)
io.on("connection", (socket) => {
  console.log(`🧠 New client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});