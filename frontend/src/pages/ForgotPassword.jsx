import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axiosInstance";
import "../css/ForgotPassword.css";

// Page for initiating password recovery via email.
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  // Generic message displayed to user regardless of whether email exists.
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that email field is not empty before making request.
    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    try {
      // Request a password reset token; backend returns same message
      // regardless of whether the email exists (security best practice).
      const res = await axios.post("/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      console.error("Forgot password failed:", err);
      // Show generic error message to avoid revealing account existence.
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <h1>Forgot Password?</h1>
        <p>Enter your email address to request password recovery assistance.</p>

        <form onSubmit={handleSubmit}>
          <label>Email address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit">Continue</button>
        </form>

        {message && <div className="forgot-message">{message}</div>}

        <Link to="/login" className="back-login">
          Back to login
        </Link>
      </div>
    </div>
  );
}
