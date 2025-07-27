import { Router } from "express";
import { loginUser, registerUser, verifyEmail } from "../controllers/authController";

const authRouter = Router()

authRouter.post("/register", registerUser)
authRouter.post("/login", loginUser)
authRouter.get("/verify-email", verifyEmail)

export default authRouter