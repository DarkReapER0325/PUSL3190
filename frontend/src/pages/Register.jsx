import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "../api/axiosInstance";
import "../css/Register.css";

// User registration page with email, password, and terms acceptance.
export default function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Backend requires terms acceptance before account creation.
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate all required fields before sending to backend.
    if (!firstName.trim() || !lastName.trim()) {
      alert("Please enter your first name and last name");
      return;
    }

    if (!email.trim()) {
      alert("Please enter your email address");
      return;
    }

    if (!password.trim()) {
      alert("Please enter your password");
      return;
    }

    // Verify password confirmation matches before submission.
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Backend also enforces terms acceptance; this is a client-side mirror.
    if (!termsAccepted) {
      alert("Please accept the Terms of Service and Privacy Policy");
      return;
    }

    try {
      // Send all account data to backend for signup; backend stores user and hashes password.
      await axios.post("/signup", {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        terms_accepted: termsAccepted,
      });

      alert("Account created successfully!");
      // Redirect to login page so user can authenticate with new credentials.
      navigate("/login");
    } catch (err) {
      // Show backend error message (e.g., "Email already registered").
      alert(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="register-container">
      <div className="register-title">
        <h1>Create an account</h1>
        <p>Start generating better test cases today</p>
      </div>

      <div className="register-card">
        <form onSubmit={handleRegister}>
          <div className="row">
            <div className="form-group">
              <label>First name</label>
              <input
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Last name</label>
              <input
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

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

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label htmlFor="terms">
              I agree to the <Link to="/terms">Terms of Service</Link> and{" "}
              <Link to="/privacy">Privacy Policy</Link>
            </label>
          </div>

          <button type="submit" className="register-btn">
            Create Account
          </button>

          <div className="login-link">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
