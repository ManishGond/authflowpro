import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "../utils/sendEmail";
import jwt from "jsonwebtoken";
import { getIO } from "../utils/socket";

const prisma = new PrismaClient();
export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hr

    await prisma.verificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
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
    const record = await prisma.verificationToken.findUnique({
      where: {
        token: token as string,
      },
      include: {
        user: true,
      },
    });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: "Token is invalid or expired." });
    }

    await prisma.user.update({
      where: {
        id: record.userId,
      },
      data: {
        isVerified: true,
      },
    });

    await prisma.verificationToken.delete({
      where: {
        token: token as string,
      },
    });

    const io = getIO();
    io.emit(`user:verified:${record.user.email}`, {
      message: "Email verified successfully!",
      email: record.user.email,
    });

    res.json({
      message: "Email verified successfully!",
      email: record.user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Verification failed." });
  }
};
