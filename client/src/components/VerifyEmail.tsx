import axios from "axios"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import socket from "../utils/socket"

const VerifyEmail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const token = new URLSearchParams(location.search).get("token")
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`/api/auth/verify-email?token=${token}`);
        const { email } = res.data

        socket.emit("user:verified", { email })

        setStatus("✅ Email Verified!");
        setTimeout(() => navigate("/"), 3000);
      } catch (error) {
        setStatus("❌ Verification failed or token expired.");
      }
    }

    if (token) verify()
  }, [token, navigate])

  return (
    <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>
      <h2>{status}</h2>
    </div>
  );
}

export default VerifyEmail;