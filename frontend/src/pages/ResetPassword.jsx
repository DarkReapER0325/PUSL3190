import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";

// Password reset page accessed via a temporary token link from email.
export default function ResetPassword() {
  // Extract reset token from URL query parameter (e.g., ?token=abc123).
  const [params] = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();

    try {
      // Send the reset token and new password to backend for validation and update.
      const res = await axios.post("/reset-password", {
        token,
        new_password: password,
      });

      setMessage(res.data.message);
      // Auto-redirect to login after 2 seconds so user can log in with new password.
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      // Show backend error (e.g., "Invalid reset token", "Token has expired").
      setMessage(err.response?.data?.detail || "Error");
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <h1>Reset Password</h1>

        <form onSubmit={handleReset}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Reset Password</button>
        </form>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}