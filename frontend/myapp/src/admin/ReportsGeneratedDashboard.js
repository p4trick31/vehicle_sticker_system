import React, { useEffect, useState } from "react";
import axios from "axios";
import { refreshAccessToken } from "../utils/tokenUtils";
import { jsPDF } from "jspdf";
import { FiDownload } from "react-icons/fi";


const ReportsGeneratedDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);


  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const deleteReport = (reportDate) => {
  // Filter out the report to delete
  const updatedReports = reports.filter(r => r.date !== reportDate);
  
  // Update localStorage and state
  localStorage.setItem("reports_history", JSON.stringify(updatedReports));
  setReports(updatedReports);
};


  const downloadReportPDF = (report) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const lines = doc.splitTextToSize(report.text, pageWidth - margin * 2);

  doc.setFontSize(12);
  doc.text(lines, margin, 60);

  doc.save(`Report_${report.date.replace(/\//g, "-")}.pdf`);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};


  const fetchData = async () => {
    try {
      let token = localStorage.getItem("access");
      if (!token) return;

      let response;
      try {
        response = await axios.get("http://localhost:8000/api/all-applications/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("adh",response.data)
      } catch (err) {
        if (err.response && err.response.status === 401) {
          const newToken = await refreshAccessToken();
          if (!newToken) return;
          response = await axios.get("http://localhost:8000/api/all-applications/", {
            headers: { Authorization: `Bearer ${newToken}` },
          });
          
        } else {
          throw err;
        }
      }

      if (response?.data) {
        generateReport(response.data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

const generateReport = (raw) => {
  const todayStr = new Date().toLocaleDateString();
  let storedReports = JSON.parse(localStorage.getItem("reports_history")) || [];

  // Keep previous reports as-is
  const frozenReports = storedReports.filter(r => r.date !== todayStr);

  // Group only today's applications
  const todaysApps = raw.filter(app => {
    const relevantDates = [
      app.created_at,
      app.approved_time,
      app.client2_approved_time,
      app.disapproved_time,
      app.checked_at,
      app.approved_at,
    ].filter(Boolean);

    return relevantDates.some(d => new Date(d).toLocaleDateString() === todayStr);
  });

  if (todaysApps.length === 0) {
    // Nothing new for today, just keep frozen reports
    setReports(frozenReports);
    return;
  }

  const group = {
    applications: {
      "Checking Application": 0,
      "Application Waiting Approval": 0,
      "Application Done": 0,
      "Application Disapproved": 0,
    },
    renewals: {
      "Checking Renewal": 0,
      "Renewal Waiting Approval": 0,
      "Renewal Done": 0,
    },
    vehicleTypeCount: {},
    uniqueApplicationUsers: new Set(),
    uniqueRenewalUsers: new Set(),
  };

  todaysApps.forEach(app => {
    const isRenewal = app.is_renewal;
    const status = app.status;

    if (!isRenewal) {
      if (status === "Checking Application") group.applications["Checking Application"]++;
      else if (status === "Waiting Approval") group.applications["Application Waiting Approval"]++;
      else if (status === "Application Done") {
        group.applications["Application Done"]++;
        group.uniqueApplicationUsers.add(app.username);
        if (app.vehicle_type) {
          group.vehicleTypeCount[app.vehicle_type] =
            (group.vehicleTypeCount[app.vehicle_type] || 0) + 1;
        }
      } else if (status === "Disapproved") group.applications["Application Disapproved"]++;
    } else {
      if (status === "Checking Renewal") group.renewals["Checking Renewal"]++;
      else if (status === "Waiting Approval") group.renewals["Renewal Waiting Approval"]++;
      else if (status === "Renewal Done") {
        group.renewals["Renewal Done"]++;
        group.uniqueRenewalUsers.add(app.username);
        if (app.vehicle_type) {
          group.vehicleTypeCount[app.vehicle_type] =
            (group.vehicleTypeCount[app.vehicle_type] || 0) + 1;
        }
      }
    }
  });

  const reportText = `
As of ${formatDate(todayStr)}, the system processed ${Object.values(group.applications).reduce((a, b) => a + b, 0)} new applications and ${Object.values(group.renewals).reduce((a, b) => a + b, 0)} renewals.

For new applications:
- Under Checking: ${group.applications["Checking Application"]}
- Waiting for Approval: ${group.applications["Application Waiting Approval"]}
- Completed: ${group.applications["Application Done"]}
- Disapproved: ${group.applications["Application Disapproved"]}

For renewals:
- Under Checking: ${group.renewals["Checking Renewal"]}
- Waiting for Approval: ${group.renewals["Renewal Waiting Approval"]}
- Completed: ${group.renewals["Renewal Done"]}

User Activity:
- Users Completed Applications: ${group.uniqueApplicationUsers.size}
- Users Completed Renewals: ${group.uniqueRenewalUsers.size}

Vehicle Types:
${Object.entries(group.vehicleTypeCount).map(([type, count]) => `${type} (${count})`).join(", ") || "No data"}.
`;

  storedReports = [...frozenReports, { date: todayStr, text: reportText.trim() }];
  storedReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  localStorage.setItem("reports_history", JSON.stringify(storedReports));
  setReports(storedReports);
};


  useEffect(() => {
    const savedReports = JSON.parse(localStorage.getItem("reports_history")) || [];
    setReports(savedReports);
    fetchData();
  }, []);



  const containerStyle = {
    maxWidth: '100%',
    margin: "40px 50px",
    padding: "0 20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
    background: '#eee',
    padding: '20px'
  };

  const headerStyle = {
    textAlign: "left",
    fontSize: "2rem",
    fontWeight: "600",
    marginBottom: 30,
    color: "#111827",
  };

  const reportCardStyle = {
    background: "#f9fafb",
    padding: 15,
    borderRadius: 16,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    marginBottom: 24,
    lineHeight: 1.6,
    whiteSpace: "pre-line",
    border: "1px solid #e5e7eb",
    transition: "box-shadow 0.3s ease",
    cursor: "default",
  };

  const reportCardHoverStyle = {
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
  };

  const buttonStyle = {
    background: "transparent",
    color: "#2563eb",
    border: "1px solid #2563eb",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "0.9rem",
    marginBottom: 12,
    outlineOffset: "2px",
    transition: "all 0.3s ease",
  };

  const buttonHoverStyle = {
    background: "#2563eb",
    color: "#fff",
  };

  // To handle hover effect for report card and button:
  const [hoveredReportIndex, setHoveredReportIndex] = useState(null);
  const [hoveredButtonIndex, setHoveredButtonIndex] = useState(null);

   return (
    <div style={containerStyle}>
      <h2 style={headerStyle}> Daily Report Summary</h2>
      {loading ? (
        <p style={{ textAlign: "center", fontSize: 16, color: "#6b7280" }}>
          Loading reports...
        </p>
      ) : reports.length > 0 ? (
        reports.map((r, i) => (
          <div
            key={i}
            style={{
              ...reportCardStyle,
              ...(hoveredReportIndex === i ? reportCardHoverStyle : {}),
            }}
            onMouseEnter={() => setHoveredReportIndex(i)}
            onMouseLeave={() => setHoveredReportIndex(null)}
          >
            <h3
              style={{
                marginBottom: 12,
                fontWeight: 700,
                fontSize: 18,
                color: "#111827",
                userSelect: "none",
              }}
            >
              Report Date: {formatDate(r.date)}

            </h3>
            <button
              style={{
                ...buttonStyle,
                ...(hoveredButtonIndex === i ? buttonHoverStyle : {}),
              }}
              onMouseEnter={() => setHoveredButtonIndex(i)}
              onMouseLeave={() => setHoveredButtonIndex(null)}
              onClick={() =>
                setExpandedIndex(expandedIndex === i ? null : i)
              }
              aria-expanded={expandedIndex === i}
              aria-controls={`report-text-${i}`}
            >
              {expandedIndex === i ? "Hide Report" : "View Report"}
            </button>
            <button
  style={{
    ...buttonStyle,
    marginLeft: 8,
    ...(hoveredButtonIndex === `download-${i}` ? buttonHoverStyle : {}),
  }}
  onMouseEnter={() => setHoveredButtonIndex(`download-${i}`)}
  onMouseLeave={() => setHoveredButtonIndex(null)}
  onClick={() => downloadReportPDF(r)}
>
 <FiDownload style={{ marginRight: 6 }} /> Download PDF
</button>
<button
  style={{
    ...buttonStyle,
    marginLeft: 8,
    borderColor: "#dc2626",
    color: "#dc2626",
    ...(hoveredButtonIndex === `delete-${i}` ? { background: "#dc2626", color: "#fff" } : {}),
  }}
  onMouseEnter={() => setHoveredButtonIndex(`delete-${i}`)}
  onMouseLeave={() => setHoveredButtonIndex(null)}
  onClick={() => {
    setReportToDelete(r.date);
    setModalOpen(true);
  }}
>
  🗑 Delete
</button>
{modalOpen && (
    <div style={{
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(26, 26, 26, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  }}>
    <div style={{
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '10px',
      width: '300px',
      textAlign: 'center'
    }}>
      <p style={{ marginBottom: 20, fontSize: 16 }}>
        Are you sure you want to delete this report?
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
        <button
          style={{
            ...buttonStyle,
            borderColor: "#dc2626",
            color: "#dc2626",
            padding: "6px 12px",
          }}
          onClick={() => {
            deleteReport(reportToDelete);
            setModalOpen(false);
            setReportToDelete(null);
          }}
        >
          Yes, Delete
        </button>
        <button
          style={{
            ...buttonStyle,
            padding: "6px 12px",
          }}
          onClick={() => {
            setModalOpen(false);
            setReportToDelete(null);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}




            {expandedIndex === i && (
  <div
    id={`report-text-${i}`}
    style={{
      marginTop: 12,
      fontSize: 15,
      color: "#4b5563",
      whiteSpace: "pre-line",
      userSelect: "text",
      padding: 16,
      borderLeft: "4px solid #2563eb",
      background: "#f3f4f6",
      borderRadius: 8,
      transition: "all 0.3s ease",
      cursor: "pointer",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "#eee";
      e.currentTarget.style.color = "#1e3a8a";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "#f3f4f6";
      e.currentTarget.style.color = "#4b5563";
    }}
  >
    {r.text}
  </div>
)}

          </div>
        ))
      ) : (
        <p style={{ textAlign: "center", fontSize: 16, color: "#6b7280" }}>
          No reports found.
        </p>
      )}
    </div>
    
  );
};

export default ReportsGeneratedDashboard;
