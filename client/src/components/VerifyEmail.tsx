import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios"; // ✅ custom axios instance

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState("Verifying...");
  const [hasVerified, setHasVerified] = useState(false); // ✅ Prevent double call
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || hasVerified) return;

    const verify = async () => {
      try {
        setHasVerified(true); // ✅ mark before call to prevent rerun
        const res = await axios.get(`/api/auth/verify-email?token=${token}`);
        setStatus(res.data.message || "Verification successful");
      } catch (err: any) {
        setStatus(err.response?.data?.message || "Verification failed.");
      }
    };

    verify();
  }, [token, hasVerified]);

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
