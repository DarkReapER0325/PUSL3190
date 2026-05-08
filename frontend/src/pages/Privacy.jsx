import "../css/StaticPages.css";

export default function Privacy() {
  return (
    <div className="static-page">
      <div className="static-card">
        <h1>Privacy Policy</h1>

        <p>
          This application stores user data to provide its core functionality.
        </p>

        <h3>Data Collected</h3>
        <ul>
          <li>Email address</li>
          <li>User stories submitted</li>
          <li>Generated test cases</li>
        </ul>

        <h3>Data Usage</h3>
        <p>
          Data is used only to generate test cases and maintain user history.
        </p>

        <h3>Data Sharing</h3>
        <p>
          This system does not share user data with third parties.
        </p>
      </div>
    </div>
  );
}