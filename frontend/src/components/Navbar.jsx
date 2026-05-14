import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../css/Navbar.css";
import logo from "../assets/TestCaseGen-Logo-001.png";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Retrieve user from localStorage or sessionStorage, handling string artifacts
  // from serialization (like the literal strings "undefined" or "null").
  const getStoredUser = () => {
    try {
      const localUser = localStorage.getItem("user");
      // Check for both absence and invalid string values to avoid parse errors.
      if (localUser && localUser !== "undefined" && localUser !== "null") {
        return JSON.parse(localUser);
      }

      // Fall back to sessionStorage if localStorage had no valid user.
      const sessionUser = sessionStorage.getItem("user");
      if (
        sessionUser &&
        sessionUser !== "undefined" &&
        sessionUser !== "null"
      ) {
        return JSON.parse(sessionUser);
      }

      return null;
    } catch (error) {
      console.error("Failed to parse stored user:", error);

      // Clear all auth data if storage is corrupted to force re-login.
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      return null;
    }
  };

  const getStoredToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  const user = getStoredUser();
  const token = getStoredToken();

  // User is only considered logged in if both user object and token exist.
  const isLoggedIn = Boolean(user && token);
  const isAdmin = user?.is_admin === true;

  // Display first name if available; fall back to email prefix; finally "User".
  const displayName =
    isLoggedIn && user?.first_name
      ? user.first_name
      : user?.email?.includes("@")
        ? user.email.split("@")[0]
        : "User";

  const handleLogout = () => {
    // Clear all auth data from both persistent and session storage.
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    setOpen(false);
    navigate("/");
    // Reload to ensure axios interceptors and component state are reset.
    window.location.reload();
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">
          <img src={logo} alt="TestCaseGen Logo" className="logo-img" />
          <span className="logo-text">
            <span className="logo-blue">TestCase</span>
            <span className="logo-black">Gen</span>
          </span>
        </Link>

        {/* Show greeting only when user is logged in. */}
        {isLoggedIn && (
          <div className="nav-center">
            <span className="greeting">Hello, {displayName}</span>
          </div>
        )}

        <nav className="nav-links">
          {/* Show login/signup for unauthenticated users; show app controls for authenticated users. */}
          {!isLoggedIn ? (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/signup" className="signup-btn">
                Register
              </Link>
            </>
          ) : (
            <>
              <button
                className="generator-btn"
                onClick={() => navigate("/generator")}
              >
                Generator
              </button>

              <div className="profile-menu">
                <button className="menu-btn" onClick={() => setOpen(!open)}>
                  <span>Account</span>
                  <span className="menu-arrow">▾</span>
                </button>

                {open && (
                  <div className="dropdown">
                    {isAdmin && (
                      <button
                        className="dropdown-item admin-item"
                        onClick={() => {
                          setOpen(false);
                          navigate("/admin/feedback");
                        }}
                      >
                        🛠️ Admin Review
                      </button>
                    )}

                    <button
                      className="dropdown-item profile-item"
                      onClick={() => {
                        setOpen(false);
                        navigate("/profile");
                      }}
                    >
                      👤 Profile
                    </button>

                    <button
                      className="dropdown-item logout-item"
                      onClick={handleLogout}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
