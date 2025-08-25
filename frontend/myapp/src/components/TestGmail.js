export default function TestEmailButton() {
  const handleSendEmail = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8000/api/test-send-email/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Failed to send email: " + error.message);
    }
  };

  return (
    <button
      onClick={handleSendEmail}
      style={{
        backgroundColor: "#065f46",
        color: "white",
        padding: "10px 20px",
        border: "none",
        borderRadius: "6px",
        fontSize: "16px",
        cursor: "pointer",
        margin: "10px"
      }}
    >
      Send Test Email
    </button>
  );
}
