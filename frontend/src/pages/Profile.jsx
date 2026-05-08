import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import "../css/Profile.css";

// User profile page showing generation history with filtering, sorting, and export options.
export default function Profile() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter and sort controls for history display.
  const [searchTerm, setSearchTerm] = useState("");
  // Filter and sort controls for history display.
  const [intentFilter, setIntentFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");

  // Retrieve current user from localStorage or sessionStorage.
  const user =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    // Fetch the current user's test case generation history on component mount.
    const fetchHistory = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!token) {
          setError("Please log in to view your history.");
          setLoading(false);
          return;
        }

        // Retrieve history from backend; axios interceptor handles token auth.
        const response = await axios.get("/history", {

          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setHistory(response.data);
      } catch (err) {
        console.error("Failed to load history:", err);
        setError("Failed to load generation history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Apply search (by story or intent) and intent filters; then sort by date.
  const filteredHistory = history
    .filter((item) => {
      const story = item.user_story?.toLowerCase() || "";
      const intent = item.detected_intent?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();

      // Match if search term appears in story or intent.
      const matchesSearch = story.includes(search) || intent.includes(search);

      // Match if intent filter is "all" or item's intent is selected.
      const matchesIntent =
        intentFilter === "all" || item.detected_intent === intentFilter;

      return matchesSearch && matchesIntent;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);

      // Sort by creation date in ascending or descending order.
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

  // Extract unique intents from history to populate the intent filter dropdown.
  const uniqueIntents = [
    ...new Set(history.map((item) => item.detected_intent)),
  ];

  const deleteHistoryItem = async (id) => {
    // Ask user to confirm deletion before making the request.
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this history item?",
    );

    if (!confirmDelete) return;

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      // Remove the item from the database.
      await axios.delete(`/history/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update local state to remove the deleted item from the UI.
      setHistory(history.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete history item:", err);
      alert("Failed to delete history item.");
    }
  };

  const copyHistoryItem = (item) => {
    // Format test cases as tab-delimited text for spreadsheet-friendly copy.
    const tableText = item.test_cases
      .map((tc) => `${tc.id}\t${tc.description}\t${tc.expected_result}`)
      .join("\n");

    // Include metadata (intent and confidence) in the clipboard content.
    const fullText = `Detected Feature: ${item.detected_intent}
Confidence: ${item.confidence_score}

ID\tDescription\tExpected Result
${tableText}`;

    navigator.clipboard.writeText(fullText);
    alert("Copied to clipboard");
  };

  const exportHistoryItemCSV = (item) => {
    // Build CSV rows with proper header and test case data.
    const rows = [
      ["ID", "Description", "Expected Result"],
      ...item.test_cases.map((tc) => [
        tc.id,
        tc.description,
        tc.expected_result,
      ]),
    ];

    // Convert rows to CSV format with proper quoting and escaping.
    const csvContent = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    // Create a blob and trigger browser download.
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    // Filename includes intent and history ID for uniqueness.
    link.setAttribute(
      "download",
      `testcases_${item.detected_intent}_${item.id}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>View your previously generated test cases</p>
      </div>

      <div className="profile-card account-card">
        <div className="avatar-circle">
          {user?.first_name ? user.first_name.charAt(0).toUpperCase() : "U"}
        </div>

        <div className="account-info">
          <h2>
            {user?.first_name && user?.last_name
              ? `${user.first_name} ${user.last_name}`
              : "User Profile"}
          </h2>

          <p>{user?.email || "Unknown user"}</p>
        </div>
      </div>

      <div className="history-section">
        <h2>Generation History</h2>

        <div className="history-controls">
          <input
            type="text"
            placeholder="Search by user story or intent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={intentFilter}
            onChange={(e) => setIntentFilter(e.target.value)}
          >
            <option value="all">All Intents</option>
            {uniqueIntents.map((intent) => (
              <option key={intent} value={intent}>
                {intent}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {loading && <p>Loading history...</p>}

        {error && <div className="history-error">{error}</div>}

        {!loading && !error && filteredHistory.length === 0 && (
          <p className="empty-history">
            No matching generated test cases found.
          </p>
        )}

        {!loading &&
          !error &&
          filteredHistory.map((item) => (
            <div className="history-card" key={item.id}>
              <div className="history-top">
                <div>
                  <h3>{item.detected_intent.replace("_", " ")}</h3>
                  <p className="history-date">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="history-actions">
                  <span className="confidence-badge">
                    Confidence: {item.confidence_score}
                  </span>

                  <div className="history-buttons">
                    <button
                      className="history-btn copy"
                      onClick={() => copyHistoryItem(item)}
                    >
                      📋 Copy
                    </button>

                    <button
                      className="history-btn export"
                      onClick={() => exportHistoryItemCSV(item)}
                    >
                      ⬇️ CSV
                    </button>

                    <button
                      className="history-btn delete"
                      onClick={() => deleteHistoryItem(item.id)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>

              <div className="story-box">
                <strong>User Story:</strong>
                <p>{item.user_story}</p>
              </div>

              <div className="history-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Description</th>
                      <th>Expected Result</th>
                    </tr>
                  </thead>

                  <tbody>
                    {item.test_cases.map((tc, index) => (
                      <tr key={index}>
                        <td>{tc.id}</td>
                        <td>{tc.description}</td>
                        <td>{tc.expected_result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
