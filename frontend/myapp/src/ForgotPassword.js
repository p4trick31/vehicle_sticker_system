// src/pages/ForgotPassword.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Extract query parameters from URL
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");


  const handleUsernameSubmit = async (e) => {
  e.preventDefault();
  setErrorMessage(""); // clear previous errors

  try {
    const res = await fetch(`http://localhost:8000/api/check-username/${username}/`);
    const data = await res.json();

    console.log(res.data)

    if (data.exists) {
      setEmail(data.email);
      setStep(2);
      handleSendCode();
    } else {
      setErrorMessage("❌ Username not found. Please try again.");
    }
  } catch (error) {
    console.error("Error checking username:", error);
    setErrorMessage("⚠️ Something went wrong. Please try again later.");
  }
};

const handleSendCode = async () => {
  try {
    const res = await fetch(`http://localhost:8000/api/send-code/${username}/`);
    const data = await res.json();

    if (data.success) {
      setEmail(data.email);
      setStep(2); // go to code input step
    } else {
      alert(data.error || "Failed to send code.");
    }
  } catch (error) {
    console.error("Error sending code:", error);
    alert("Something went wrong. Try again later.");
  }
};

const handleCodeSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("http://localhost:8000/api/verify_code/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, code }),  // <-- send username too
    });
    const data = await res.json();

    if (data.success) {
      // ✅ Code correct
      console.log("Verified email:", data.email);
      setResetToken(data.token); 
      setStep(3);
    } else {
      setError("❌ The code you entered is incorrect. Please try again.");
    }
  } catch (err) {
    console.error(err);
    setError("⚠️ Something went wrong. Try again later.");
  }
};


  


  const handlePasswordReset = async (e) => {
  e.preventDefault();

  if (newPassword !== confirmPassword) {
    alert("❌ Passwords do not match!");
    return;
  }
  

  try {
    const response = await fetch("http://localhost:8000/api/reset_password/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      username, 
      token: resetToken,   // use the token you stored
      new_password: newPassword,
      confirm_password: confirmPassword,
    }),
    });

    const data = await response.json();

    if (data.success) {
      alert("✅ Password successfully reset! Please log in.");
      navigate("/");
    } else {
      alert("⚠️ " + (data.error || "Unable to reset password."));
    }
  } catch (err) {
    alert("⚠️ Something went wrong. Please try again later.");
  }
};



  return (
    
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        <FaArrowLeft />
      </button>
      

      <h3 style={styles.title}>Forgot/Change Password</h3>

      {step === 1 && (
        <form onSubmit={handleUsernameSubmit} style={styles.form}>
  <input
    type="text"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    placeholder="Enter your username"
    style={styles.input}
  />
  <button type="submit" style={styles.button}>Next</button>

  {errorMessage && (
    <p style={{ color: "red", marginTop: "8px" }}>{errorMessage}</p>
  )}
</form>

        
      )}

      {step === 2 && (
  <form onSubmit={handleCodeSubmit} style={styles.form}>
    <p style={styles.description}>
      Your email <strong>{email}</strong> is receiving a 6-digit code. Please enter it below:
    </p>
    <input
      type="text"
      placeholder="Enter code"
      value={code}
      onChange={(e) => setCode(e.target.value)}
      required
      style={styles.input}
      maxLength={6}
    />
    {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}
    <button type="submit" style={styles.button}>Verify Code</button>
  </form>
)}


      {step === 3 && (
  <form onSubmit={handlePasswordReset} style={styles.form}>
    <p style={styles.description}>Reset password for:</p>
    
    {/* Username display */}
    <input
      type="text"
      value={username}   // <-- this should come from state you set earlier
      readOnly
      style={{ ...styles.input, backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
    />

    <input
      type="password"
      placeholder="New password"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      required
      style={styles.input}
    />
    <input
      type="password"
      placeholder="Confirm new password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      required
      style={styles.input}
    />
    <button type="submit" style={styles.button}>Reset Password</button>
  </form>
)}

    </div>
  );
};

export default ForgotPassword;

const styles = {
  container: {
    maxWidth: '350px',
    margin: '50px auto',
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: '#fff',
    boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
    textAlign: 'center',
    fontFamily: 'Segoe UI, sans-serif',
    position: 'relative',
  },
  title: {
    marginBottom: '10px',
    color: '#065f46',
  },
  description: {
    marginBottom: '20px',
    color: '#4b5563',
    fontSize: '0.95rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '0.8rem',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '1rem',
    outline: 'none',
  },
  button: {
    padding: '0.8rem',
    backgroundColor: '#facc15',
    color: '#1f2937',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  backButton: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    backgroundColor: '#065f46',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '45px',
    height: '45px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '18px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
  },
};
