import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import "../css/AdminFeedback.css";

function AdminFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/admin/feedback");
      setFeedbackList(response.data);
    } catch {
      setMessage("Failed to load feedback suggestions.");
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  const loadFeedback = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/admin/feedback");
      setFeedbackList(response.data);
    } catch {
      setMessage("Failed to load feedback suggestions.");
    } finally {
      setLoading(false);
    }
  };

  loadFeedback();
}, []);

  const approveFeedback = async (id) => {
    try {
      await axiosInstance.post(`/admin/feedback/${id}/approve`);
      setMessage("Suggested category approved successfully.");
      fetchFeedback();
    } catch  {
      setMessage("Failed to approve suggested category.");
    }
  };

  const rejectFeedback = async (id) => {
    try {
      await axiosInstance.post(`/admin/feedback/${id}/reject`);
      setMessage("Suggested category rejected successfully.");
      fetchFeedback();
    } catch {
      setMessage("Failed to reject suggested category.");
    }
  };

  return (
    <div className="admin-feedback-page">
      <div className="admin-feedback-header">
        <h1>Admin Review Panel</h1>
        <p>
          Review user-suggested categories submitted through the correction
          feedback workflow.
        </p>
      </div>

      {message && <div className="admin-feedback-message">{message}</div>}

      <div className="admin-feedback-card">
        {loading ? (
          <p className="loading-text">Loading feedback suggestions...</p>
        ) : (
          <table className="admin-feedback-table">
            <thead>
              <tr>
                <th>User Story</th>
                <th>Predicted Intent</th>
                <th>Correct Intent</th>
                <th>Suggested Category</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {feedbackList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-row">
                    No suggested categories found.
                  </td>
                </tr>
              ) : (
                feedbackList.map((item) => (
                  <tr key={item.id}>
                    <td>{item.story}</td>
                    <td>{item.predicted_intent || "N/A"}</td>
                    <td>{item.correct_intent || "N/A"}</td>
                    <td>{item.suggested_category || "N/A"}</td>
                    <td>{item.rating || "N/A"}</td>
                    <td>
                      <span className={`status-badge ${item.status || "pending"}`}>
                        {item.status || "pending"}
                      </span>
                    </td>
                    <td>
                      {(item.status || "pending") === "pending" ? (
                        <div className="admin-action-buttons">
                          <button
                            className="approve-btn"
                            onClick={() => approveFeedback(item.id)}
                          >
                            Approve
                          </button>

                          <button
                            className="reject-btn"
                            onClick={() => rejectFeedback(item.id)}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="reviewed-text">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminFeedback;