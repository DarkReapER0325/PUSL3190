import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import "../css/Generator.css";

// Main page for AI-driven test case generation from user stories.
function Generator() {
  const navigate = useNavigate();

  const [story, setStory] = useState("");
  // intent and confidence come from the backend's semantic detection.
  const [intent, setIntent] = useState("");
  const [confidence, setConfidence] = useState(null);
  // Generated test cases include id, description, and expected_result fields.
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [historyId, setHistoryId] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [correctionSubmitted, setCorrectionSubmitted] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [correctIntent, setCorrectIntent] = useState("");
  const [suggestedCategory, setSuggestedCategory] = useState("");

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const generate = async () => {
    if (!story.trim()) {
      setError("Please enter a user story.");
      return;
    }

    // Verify user is authenticated before making the request to the backend.
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      setError("Please log in before generating test cases.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      // Clear previous results before generating new ones.
      setError("");
      setIntent("");
      setConfidence(null);
      setTestCases([]);

      // Send user story to backend; token is also sent via axios interceptor.
      const response = await axios.post(
        "/generate",
        {
          story: story,
        },
        {
          // Redundant token header for explicit auth (axios interceptor also handles this).
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Unpack response: intent, confidence, and test_cases or error message.
      setIntent(response.data.intent || "");
      setConfidence(response.data.confidence ?? null);
      setTestCases(response.data.test_cases || []);
      setHistoryId(response.data.history_id || null); // ✅ THIS WAS MISSING
      setError(response.data.error || "");
      setCorrectionSubmitted(false);
      setFeedbackSubmitted(false); // reset feedback state
    } catch (error) {
      console.error("Generation failed:", error);

      // Handle session expiration (401) separately from other errors.
      if (error.response?.status === 401) {
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");

        setError("Your session has expired. Please log in again.");
        navigate("/login");
        return;
      }

      // Show backend-provided error or a generic fallback.
      setError(
        error.response?.data?.detail || "Failed to generate test cases.",
      );
    } finally {
      setLoading(false);
    }
  };

  const copyTable = () => {
    if (!testCases.length) return;

    // Format test cases as tab-delimited text for easy pasting into spreadsheets.
    const tableText = testCases
      .map((tc) => `${tc.id}\t${tc.description}\t${tc.expected_result}`)
      .join("\n");

    // Include metadata (intent and confidence) at the top of the clipboard content.
    const fullText = `Detected Feature: ${intent}\nConfidence: ${
      confidence ?? "N/A"
    }\n\nID\tDescription\tExpected Result\n${tableText}`;

    navigator.clipboard.writeText(fullText);
  };

  const submitCorrection = async () => {
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    if (!correctIntent && !suggestedCategory.trim()) {
      alert("Please select a category OR suggest a new category.");
      return;
    }

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      await axios.post(
        "/feedback/correction",
        {
          story: story,
          predicted_intent: intent,
          correct_intent: correctIntent || null,
          suggested_category: suggestedCategory || null,
          rating: rating,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCorrectionSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit correction.");
    }
  };

  const submitRating = async () => {
    if (!historyId) {
      alert("No history found.");
      return;
    }

    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      await axios.post(
        `/feedback/history/${historyId}`,
        {
          rating: rating,
          comment: feedbackComment, // ✅ FIXED
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setFeedbackSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit rating.");
    }
  };

  return (
    <div className="generator-page">
      <div className="generator-header">
        <h1>Automated Test Case Generator</h1>
        <p>
          Generate functional test cases automatically from Agile user stories
          using AI.
        </p>
      </div>

      <div className="generator-card">
        <div className="story-section">
          <label>User Story</label>
          <textarea
            placeholder="As a user, I want to log in so that I can access my account"
            value={story}
            onChange={(e) => setStory(e.target.value)}
          />
          <span className="char-count">{story.length} chars</span>
        </div>

        <button className="generate-btn" onClick={generate} disabled={loading}>
          {loading ? "Generating..." : "✨ Generate Test Cases"}
        </button>

        {/* Show error state if generation failed or input is invalid. */}
        {error && (
          <div className="error-message-box">
            <p>{error}</p>

            <div className="feedback-section">
              {correctionSubmitted ? (
                <div className="feedback-success">
                  ✅ Correction submitted. Thank you!
                </div>
              ) : (
                <>
                  <h4 className="feedback-title">Help improve detection</h4>

                  {/* STAR RATING */}
                  <div className="feedback-stars">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <span
                        key={num}
                        onClick={() => setRating(num)}
                        className={`star ${num <= rating ? "active" : ""}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  {/* CATEGORY DROPDOWN */}
                  <select
                    value={correctIntent}
                    onChange={(e) => setCorrectIntent(e.target.value)}
                    className="feedback-select"
                  >
                    <option value="">Select correct category</option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.label}>
                        {category.label}
                      </option>
                    ))}
                  </select>

                  <p className="feedback-helper-text">
                    If none of the categories match, suggest a new category
                    below.
                  </p>

                  {/* SUGGEST CATEGORY */}
                  <input
                    type="text"
                    placeholder="Suggest a new category (optional)"
                    value={suggestedCategory}
                    onChange={(e) => setSuggestedCategory(e.target.value)}
                    className="feedback-input"
                  />

                  {/* SUBMIT */}
                  <button
                    className="feedback-btn"
                    onClick={submitCorrection}
                    disabled={rating === 0}
                  >
                    Submit Feedback
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {/* Show intent and confidence only if no error and generation succeeded. */}
        {!error && (intent || confidence !== null) && (
          <div className="result-summary">
            <p>
              <strong>Detected Feature:</strong> {intent}
            </p>
            <p>
              <strong>Confidence:</strong>{" "}
              {confidence !== null ? confidence : "N/A"}
            </p>
          </div>
        )}

        {!error && testCases.length > 0 && (
          <>
            <div className="results-header">
              <h3>Generated Test Cases</h3>
              <button className="copy-btn" onClick={copyTable}>
                📋 Copy Table
              </button>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Description</th>
                    <th>Expected Result</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {testCases.map((tc, index) => (
                    <tr key={index}>
                      <td>{tc.id}</td>
                      <td>{tc.description}</td>
                      <td>{tc.expected_result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {historyId && (
              <div className="rating-section">
                <h3 className="rating-title">Rate this result</h3>

                {feedbackSubmitted ? (
                  <p className="rating-success">
                    ✅ Feedback submitted. Thank you!
                  </p>
                ) : (
                  <>
                    {/* ⭐ STAR RATING */}
                    <div className="rating-stars">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <span
                          key={num}
                          onClick={() => setRating(num)}
                          className={`star ${num <= rating ? "active" : ""}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    {/* 💬 COMMENT BOX */}
                    <textarea
                      placeholder="Write your feedback..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      className="rating-textarea"
                    />

                    {/* 🚀 SUBMIT */}
                    <button
                      className="rating-btn"
                      onClick={submitRating}
                      disabled={rating === 0}
                    >
                      Submit Feedback
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Generator;
