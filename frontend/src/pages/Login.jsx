import { Link, useNavigate } from "react-router-dom";
import "../css/Login.css";
import axios from "../api/axiosInstance";
import { useState } from "react";

// User login page with support for persistent or session-only authentication.
export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Controls whether auth data persists across browser sessions (localStorage vs sessionStorage).
  const [remember, setRemember] = useState(false);

  const handleLogin = async () => {
    // Validate both email and password are non-empty.
    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password");
      return;
    }

    try {
      // Send credentials to backend; receives user object and JWT token on success.
      const res = await axios.post("/login", {
        email,
        password,
      });

      const user = res.data.user;
      const token = res.data.access_token;

      // Verify token was returned before storing (should not happen if login succeeded, but safeguard).
      if (!token) {
        alert("Login failed: token not received");
        return;
      }

      // Use localStorage for persistent login (remember me), sessionStorage for session-only.
      if (remember) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("token", token);
      }

      // Redirect to the main app; axios interceptor will now attach the token to requests.
      navigate("/generator");
    } catch (err) {
      // Show backend error message (e.g., "User not found", "Invalid password").
      alert(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to access your saved test cases</p>

        <div className="login-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Trigger login when form is submitted.
              handleLogin();
            }}
          >
            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="login-options">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>

              <Link to="/forgot-password" className="forgot">
                Forgot your password?
              </Link>
            </div>

            <button className="login-btn" type="submit">
              Sign in
            </button>

            <p className="signup-link">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
