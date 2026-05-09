import { Navigate } from "react-router-dom";

// Route guard that redirects authenticated users away from public pages (login/signup).
export default function PublicOnlyRoute({ children }) {
  // Retrieve complete auth state from localStorage or sessionStorage.
  const getAuthData = () => {
    try {
      // Check localStorage first (persistent sessions).
      const localUser = localStorage.getItem("user");
      const localToken = localStorage.getItem("token");

      // Validate both auth values exist and are not string artifacts ("undefined", "null").
      if (
        localUser &&
        localUser !== "undefined" &&
        localUser !== "null" &&
        localToken
      ) {
        return {
          user: JSON.parse(localUser),
          token: localToken,
        };
      }

      // Fall back to sessionStorage if localStorage has no valid auth.
      const sessionUser = sessionStorage.getItem("user");
      const sessionToken = sessionStorage.getItem("token");

      // Validate both auth values exist and are not string artifacts.
      if (
        sessionUser &&
        sessionUser !== "undefined" &&
        sessionUser !== "null" &&
        sessionToken
      ) {
        return {
          user: JSON.parse(sessionUser),
          token: sessionToken,
        };
      }

      return null;
    } catch {
      // If auth data is corrupted, clear everything to force re-login.
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      return null;
    }
  };

  const auth = getAuthData();

  // If user is already authenticated, redirect to the app; otherwise show the public page.
  if (auth) {
    return <Navigate to="/generator" replace />;
  }

  return children;
}
