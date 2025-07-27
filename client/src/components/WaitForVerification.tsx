import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import socket from "../utils/socket";

const WaitForVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get("email");

  useEffect(() => {
    if (!email) return;

    const eventName = `user:verified:${email}`;

    socket.on(eventName, () => {
      console.log("✅ User verified via socket");
      navigate("/");
    });

    return () => {
      socket.off(eventName);
    };
  }, [email, navigate]);

  return (
    <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>
      <div>
        <h2>Waiting for Email Verification...</h2>
        <div className="spinner" />
      </div>
    </div>
  );
};

export default WaitForVerification;
