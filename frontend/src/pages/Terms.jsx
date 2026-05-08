import "../css/StaticPages.css";

export default function Terms() {
  return (
    <div className="static-page">
      <div className="static-card">
        <h1>Terms of Service</h1>

        <p>
          This system is developed as part of an academic project for automated
          test case generation using AI.
        </p>

        <h3>Usage</h3>
        <p>
          Users can input Agile user stories and generate test cases. The
          generated output is for assistance purposes only and may require manual validation.
        </p>

        <h3>Limitations</h3>
        <p>
          The system does not guarantee 100% accuracy of generated test cases.
        </p>

        <h3>User Responsibility</h3>
        <p>
          Users are responsible for reviewing and validating generated results before use.
        </p>
      </div>
    </div>
  );
}