import { Link } from "react-router-dom";
import "../css/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-section">
          <h4>TestCaseGen</h4>
          <p>
            TestCaseGen helps generate functional test cases from Agile user
            stories using semantic AI-based analysis.
          </p>
        </div>

        <div className="footer-section">
          <h5>Contact Us</h5>
          <p>Email: support@testcasegen.com</p>
          <p>Phone: +94 71 234 5678</p>
        </div>

        <div className="footer-section footer-legal">
          <h5>Legal</h5>
          <ul>
            <li>
              <Link to="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms">Terms of Service</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        © 2025 TestCaseGen. All rights reserved.
      </div>
    </footer>
  );
}
