// import morgan from "morgan";
// // Use common preset or 'dev' for better formatting
// app.use(morgan("dev"));
// POST /api/auth/login 200 65ms
// morgan("combined") // includes more details like IP, user-agent
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import { authLimiter } from "./middleware/rateLimit";

dotenv.config()

const app = express()

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json())
app.use(morgan("dev"))
app.use("/api/auth", authLimiter, authRoutes)

// '/' routes
app.get("/", (_, res) => {
  res.send("🔥 AuthFlowPro backend is running!");
})

export default app