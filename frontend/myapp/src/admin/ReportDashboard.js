import React, { useEffect, useState } from "react";
import axios from "axios";
import { refreshAccessToken } from "../utils/tokenUtils";
import { FiMessageSquare, FiCalendar, FiUser, FiAlertCircle, FiSend } from "react-icons/fi";

const ReportPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [responseReason, setResponseReason] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      let res = await axios.get("http://localhost:8000/api/submit-report/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      setReports(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          localStorage.setItem("access", newToken);
          try {
            let retryRes = await axios.get(
              "http://localhost:8000/api/submit-report/",
              { headers: { Authorization: `Bearer ${newToken}` } }
            );
            setReports(retryRes.data);
          } catch (retryErr) {
            console.error("Retry failed:", retryErr);
          }
        }
      } else {
        console.error("Error fetching reports:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const openModal = (report) => {
  setSelectedReport(report);
  setResponseReason(report.reason); // <-- prefill with original reason
  setResponseMessage("");           // reset message
  setShowModal(true);
};


  const closeModal = () => {
    setShowModal(false);
    setResponseReason("");
    setResponseMessage("");

  };

const handleSendResponse = async () => {
  if (!selectedReport) {
    alert("⚠️ No report selected.");
    return;
  }

  if (!responseReason || !responseMessage) {
    alert("⚠️ Please fill in both Reason and Message.");
    return;
  }

  try {
    const token = localStorage.getItem("access");
    if (!token) {
      alert("⚠️ You are not authenticated. Please log in again.");
      return;
    }

    setSending(true); // ✅ start loading
    setSuccess(false);

    const res = await axios.post(
      `http://localhost:8000/api/respond-report/${selectedReport.id}/`,
      {
        reason: responseReason,
        message: responseMessage,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    localStorage.setItem(`responded_${selectedReport.id}`, "true");

    if (res.status === 200) {
      setSuccess(true); // ✅ show success
      setTimeout(() => {
        setSuccess(false);
        closeModal();
      }, 2000);
    } else {
      alert("⚠️ Something went wrong. Please try again.");
    }
  } catch (err) {
    console.error("Error sending response:", err);
    alert("❌ Failed to send response. Please check the server logs.");
  } finally {
    setSending(false); // ✅ stop loading
  }
};


  if (loading) return <p style={loadingStyle}>Loading reports...</p>;

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>
        My Reports
        <FiAlertCircle style={{ fontSize: "20px", color: "#DC2626", marginLeft: "20px" }} />
      </h2>
      {reports.length === 0 ? (
        <p style={emptyStyle}>No reports found.</p>
      ) : (
        <div style={scrollContainer}>
          <div style={listStyle}>
            {reports.map((report) => {
              const reporterName =
                report.username === "richardsales" ? "Richard Sales" : "Nonalyn Tombocon";

              return (
                <div key={report.id} style={messageCard}>
                  <div style={messageHeader}>
                    <span style={reasonStyle}>
                      <FiMessageSquare style={{ ...iconStyle, marginRight: "6px" }} />
                      <strong style={{ marginRight: "4px", color: "#415572ff" }}>{reporterName}</strong>
                      has reported:
                      <em style={{ marginLeft: "4px" }}>{report.reason}</em>
                    </span>
                    <span style={dateStyle}>
                      <FiCalendar style={iconStyle} /> {new Date(report.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p style={messageText}>"{report.message}"</p>
              
  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
        <div style={senderStyle}>
                    <FiUser style={iconStyle} /> From: <u>{reporterName}</u>
                  </div>
  <button
    style={{
      ...replyBtn,
      backgroundColor: localStorage.getItem(`responded_${report.id}`) ? "#ccc" : replyBtn.backgroundColor,
      cursor: localStorage.getItem(`responded_${report.id}`) ? "not-allowed" : "pointer",
    }}
    onClick={() => {
      if (!localStorage.getItem(`responded_${report.id}`)) {
        openModal(report);
      }
    }}
    disabled={!!localStorage.getItem(`responded_${report.id}`)}
  >
    <FiSend style={{ marginRight: "5px" }} />
    {localStorage.getItem(`responded_${report.id}`) ? "Responded" : "Respond"}
  </button>
</div>


                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Respond to Report</h3>
            <label>Reason:</label>
            <input
              style={modalInput}
              type="text"
              value={responseReason}
              onChange={(e) => setResponseReason(e.target.value)}
            />
            <label>Choose a Response:</label>
<select
  style={modalInput}
  onChange={(e) => setResponseMessage(e.target.value)}
  value={responseMessage}
>
  <option value="">-- Select a Response --</option>

  <option value="Thank you for reporting this bug. Our development team has received your report and will investigate the issue thoroughly. We will work on implementing a fix as soon as possible and keep you updated on the progress.">
    Thank you for reporting this bug. Our development team has received your report and will investigate thoroughly. We will work on implementing a fix as soon as possible and keep you updated.
  </option>

  <option value="We have noted the system crash issue you experienced. Our engineers are currently analyzing the logs and replicating the problem to identify the root cause. Immediate steps are being taken to ensure system stability and prevent future occurrences.">
    We have noted the system crash issue you experienced. Our engineers are analyzing logs and replicating the problem. Immediate steps are being taken to ensure system stability.
  </option>

  <option value="Your feedback regarding the UI problem has been received and logged by our design team. We will review the specific areas of concern and implement improvements to enhance usability, accessibility, and overall user experience.">
    Your feedback regarding the UI problem has been received. We will review the areas of concern and implement improvements to enhance usability and user experience.
  </option>

  <option value="We acknowledge the performance issue you reported. Our technical team is evaluating the system for any bottlenecks and optimizing performance. Measures are being implemented to improve response times, reduce latency, and ensure smooth operation under all conditions.">
    We acknowledge the performance issue you reported. Our technical team is optimizing performance to improve response times and ensure smooth operation.
  </option>

  <option value="Thank you for your report. Our team will review the details carefully and take appropriate action. We may follow up with additional questions if necessary, and we are committed to resolving the issue promptly and keeping you informed throughout the process.">
    Thank you for your report. Our team will review the details and take appropriate action. We may follow up if necessary and will keep you informed.
  </option>
</select>

            <label>Message:</label>
            <textarea
              style={modalTextarea}
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
            />
            
            <div style={{ marginTop: "15px", textAlign: "right" }}>
              <button style={modalBtn} onClick={closeModal}>
                Cancel
              </button>
           <button
  style={{
    ...modalBtn,
    backgroundColor: sending ? "#4b5563" : "#065f46", // gray while loading
    color: "#fff",
    cursor: sending ? "not-allowed" : "pointer",
  }}
  onClick={handleSendResponse}
  disabled={sending}
>
  {sending ? "Sending..." : "Send"}
</button>

{success && (
  <p style={{ color: "green", marginTop: "10px" }}>
    ✅ Response sent successfully!
  </p>
)}


            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===== Styles ===== */
const containerStyle = {
  maxWidth: '100%',
  margin: "40px 50px",
  padding: "30px 20px",
  fontFamily: "Segoe UI, sans-serif",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  background: "#eee",
  borderRadius: "5px",
  height: "auto",
};

const titleStyle = {
  fontSize: "22px",
  color: "#415572ff",
  paddingLeft: "5px",
  borderLeft: "4px solid #065f46",
  marginBottom: "20px",
};

const emptyStyle = {
  textAlign: "center",
  color: "#6b7280",
};

const loadingStyle = {
  textAlign: "center",
  fontSize: "1rem",
};

const listStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const scrollContainer = {
  maxHeight: "530px",
  overflowY: "auto",
  paddingRight: "8px",
  padding: '20px'
};

const messageCard = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "15px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  borderLeft: "2px solid #065f46",
  padding: '20px',
};

const messageHeader = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px",
  fontSize: "0.9rem",
  color: "#374151",
};

const reasonStyle = {
  display: "flex",
  alignItems: "center",
  fontWeight: "500",
};

const dateStyle = {
  display: "flex",
  alignItems: "center",
  color: "#6b7280",
};

const messageText = {
  margin: "8px 0",
  fontSize: "0.95rem",
  color: "#111827",
  marginBottom: "20px",
  backgroundColor: "#f4f3f0ff",
  padding: "20px 12px",
  borderRadius: "6px",
  border: "1px solid #f8f8f8ff",
  maxWidth: "100%",
  
};

const senderStyle = {
  marginTop: "10px",
  fontSize: "0.85rem",
  color: "#4b5563",
  display: "flex",
  alignItems: "center",
};

const iconStyle = {
  marginRight: "5px",
};

const replyBtn = {
  padding: "6px 12px",
  borderRadius: "5px",
  backgroundColor: "#065f46",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  marginTop: "10px",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalContent = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  width: "550px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const modalInput = {
  padding: "8px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  width: "100%",
};

const modalTextarea = {
  ...modalInput,
  height: "80px",
  resize: "none",
};

const modalBtn = {
  padding: "6px 12px",
  borderRadius: "5px",
  border: "none",
  cursor: "pointer",
};

export default ReportPage;
