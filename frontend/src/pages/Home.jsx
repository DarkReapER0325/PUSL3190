import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "../css/Home.css";

export default function Home() {
  return (
    <div className="home-container">

      <section className="hero-section">
        <span className="badge">Automated Test Case Generation</span>

        <h2>
          Turn User Stories into <span>Structured Test Cases</span>
        </h2>

        <p>
          Reduce manual QA effort with an AI-assisted tool that analyzes Agile user stories and generates structured functional test cases in seconds.
        </p>

        <div className="hero-buttons">
          <Link to="/signup" className="primary-btn">
            Get Started For Free <ArrowRight size={17} />
          </Link>

        </div>

        <div className="hero-info">
          <span>✔ No credit card required</span>
          <span>✔ Free tier available</span>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <h3>Why Choose Our Generator?</h3>
        <p>Streamline your testing process with intelligent automation</p>

        <div className="features-grid">
          <FeatureCard
            title="Save Time"
            description="Generate comprehensive test cases in seconds instead of hours."
          />
          <FeatureCard
            title="Improve Quality"
            description="Ensure consistent and thorough test coverage using AI suggestions."
          />
          <FeatureCard
            title="Team Collaboration"
            description="Share and export test cases easily with standardized documentation."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="steps-section">
        <h3>How It Works</h3>
        <p>Three simple steps to generate your test cases</p>

        <div className="steps-grid">
          <Step number="1" title="Input User Story" />
          <Step number="2" title="Generate Cases" />
          <Step number="3" title="Export & Use" />
        </div>
      </section>

    </div>
  );
}

/* 🔽 THESE WERE MISSING — DO NOT REMOVE 🔽 */

function FeatureCard({ title, description }) {
  return (
    <div className="feature-card">
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
}

function Step({ number, title }) {
  return (
    <div className="step-card">
      <div className="step-number">{number}</div>
      <h4>{title}</h4>
    </div>
  );
}
