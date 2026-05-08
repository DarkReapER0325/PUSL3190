import { Navigate } from "react-router-dom";

// Route guard that redirects unauthenticated users to login.
export default function ProtectedRoute({ children }) {
  // Check localStorage first (persistent), then sessionStorage (session-only).
  const user =
    localStorage.getItem("user") || sessionStorage.getItem("user");

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  // Require both user object and token to access the protected route.
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}