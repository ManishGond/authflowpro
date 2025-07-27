import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export const sendVerificationEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USER!,
      pass: process.env.MAILTRAP_PASS!,
    },
  });

  const verifyURL = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  // Load email template
  const htmlPath = path.join(__dirname, "..", "emails", "verifyEmail.html");
  let html = fs.readFileSync(htmlPath, "utf8");

  // Replace placeholder with actual URL
  html = html.replace(/{{verifyURL}}/g, verifyURL);

  console.log("📨 Sending verification email to:", email);
  console.log("🧪 Final verifyURL:", verifyURL);
  console.log("📄 Final HTML snippet:", html.slice(0, 300)); // optional

  await transporter.sendMail({
    from: '"AuthFlowPro" <no-reply@authflowpro.com>',
    to: email,
    subject: "Verify your email @AuthFlowPro",
    html,
  });
};
