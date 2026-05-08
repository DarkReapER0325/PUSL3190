import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";

import Home from "./pages/Home";
import Generator from "./pages/Generator";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

import "./index.css";

// Main app router with protected, public-only, and unrestricted routes.
function App() {
  return (
    <Router>
      {/* Three-part layout: fixed navbar, scrollable main content, fixed footer. */}
      <div className="app-wrapper">
        <Navbar />

        <main className="main-content">
          <Routes>
            {/* Unrestricted routes accessible to all users. */}
            <Route path="/" element={<Home />} />

            {/* Protected routes: redirect to login if user is not authenticated. */}
            <Route
              path="/generator"
              element={
                <ProtectedRoute>
                  <Generator />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Public-only routes: redirect to generator if user is already authenticated. */}
            <Route
              path="/signup"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />

            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />

            {/* Password recovery routes: publicly accessible (no auth required). */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Static pages: publicly accessible for users to read terms and privacy. */}
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
