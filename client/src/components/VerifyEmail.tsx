import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios"; // ✅ custom axios instance

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState("Verifying...");
  const navigate = useNavigate();

  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token || hasVerified.current) return;

    const verify = async () => {
      hasVerified.current = true; // ✅ survives unmount in dev mode
      try {
        const res = await axios.get(`/api/auth/verify-email?token=${token}`);
        setStatus(res.data.message || "Verification successful");
      } catch (err: any) {
        setStatus(err.response?.data?.message || "Verification failed.");
      }
    };

    verify();
  }, [token]);


  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>📬 {status}</h2>
      {status.includes("successful") && (
        <button onClick={() => navigate("/")}>Go to Home</button>
      )}
    </div>
  );
};

export default VerifyEmail;
