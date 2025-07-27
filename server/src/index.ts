import http from "http";
import app from "./app";
import dotenv from "dotenv";
import { initSocketIO } from "./utils/socket";

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// ✅ Correct: Store the returned `io`
const io = initSocketIO(server);

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
