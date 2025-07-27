import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const WaitForVerification = () => {
  const [params] = useSearchParams();
  const email = params.get("email");
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) return;

    const socket: Socket = io(import.meta.env.VITE_SERVER_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ [Wait] Connected:", socket.id);
    });

    socket.on(`user:verified:${email}`, () => {
      console.log("🎉 Verified in real-time!");
      socket.disconnect();
      navigate("/");
    });

    socket.on("connect_error", (err) => {
      console.error("❌ [Wait] Connection error:", err.message);
    });

    return () => {
      socket.disconnect();
      console.log("🛑 [Wait] Socket disconnected");
    };
  }, [email, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>🔐 Waiting for email verification...</h2>
      <p>Once you verify your email, you'll be redirected automatically.</p>
      <p style={{ fontSize: "24px", marginTop: "20px" }}>⏳ Loading...</p>
    </div>
  );
};

export default WaitForVerification;
