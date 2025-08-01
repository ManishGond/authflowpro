import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "../utils/sendVerificationEmail";
import jwt from "jsonwebtoken";
import { getIO } from "../utils/socket";
import axios from "axios";

const prisma = new PrismaClient();
export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, recaptchaToken } = req.body;

  // 1. Validate reCAPTCHA Token
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

    const { data } = await axios.post(verificationURL);

    if (!data.success) {
      return res.status(400).json({ message: "reCAPTCHA verification failed." });
    }
  } catch (err) {
    console.error("❌ CAPTCHA Verification Error:", err);
    return res.status(500).json({ message: "Failed to verify reCAPTCHA." });
  }

  // 2. Proceed with registration
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hr

    await prisma.verificationToken.create({
      data: { token, userId: user.id, expiresAt },
    });
    console.log("📩 Received email verification request");
    await sendVerificationEmail(email, token);
    res.status(201).json({ message: "Registered! Check email to verify." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed." });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found!" });

    if (!user.isVerified)
      return res
        .status(403)
        .json({ message: "Please verify your email first." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials." });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed." });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;
  try {
    console.log("📩 [VerifyEmail] Token received:", token);

    const record = await prisma.verificationToken.findUnique({
      where: { token: token as string },
    });
    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: "Token is invalid or expired." });
    }

    const user = await prisma.user.findUnique({ where: { id: record.userId } });

    if (user?.isVerified) {
      return res
        .status(200)
        .json({ message: "Email already verified", email: user.email });
    }

    const updatedUser = await prisma.user.update({
      where: { id: record.userId },
      data: { isVerified: true },
    });

    await prisma.verificationToken.delete({
      where: { token: token as string },
    });

    const io = getIO();
    io.emit(`user:verified:${updatedUser.email}`, true);

    res.json({
      message: "Email verified successfully!",
      email: updatedUser.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Verification failed." });
  }
};
