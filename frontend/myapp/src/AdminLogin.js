import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaLock } from 'react-icons/fa';
import { PiUserCircleBold } from 'react-icons/pi';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';


const AdminLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const [adminUsername, setAdminUsername] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSuccess(false);

    const loginData = { username: adminUsername, password: adminPassword };

    try {
        const response = await axios.post('http://localhost:8000/api/admin/login/', loginData);

        if (response.data && response.data.access) {
            localStorage.setItem('access', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);
            localStorage.setItem('isAuthenticated', 'true');

            setMessage('Admin login successful!');
            setSuccess(true);

            setTimeout(() => {
                if (onLoginSuccess) {
                    localStorage.removeItem('notificationShown');
                    onLoginSuccess('admin');
                }
                onClose();
                navigate('/admin');
            }, 1500);
        } else {
            setMessage('Unexpected response from server.');
        }
    } catch (error) {
        if (error.response && error.response.data) {
            setMessage(error.response.data.error || 'Invalid admin credentials.');
        } else if (error.request) {
            setMessage('No response from server. Please try again.');
        } else {
            setMessage('Network error or server is unreachable.');
        }
    } finally {
        setLoading(false);
    }
};

    if (!isOpen) return null;

   return (
    <div style={styles.modalBackground}>
        <div style={styles.modalContent}>
            {/* ✅ Success or error message at the top */}
            {(message || error) && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '6px',
                        backgroundColor: success ? '#d1fae5' : '#fee2e2',
                        color: success ? '#065f46' : '#b91c1c',
                        fontWeight: 500,
                        transition: 'all 0.3s ease',
                    }}
                >
                    {success ? <FaCheckCircle size={20} color="#22c55e" /> : <FaTimesCircle size={20} color="#b91c1c" />}
                    <p style={{ margin: 0 }}>{message || error}</p>
                </div>
            )}

            <PiUserCircleBold size={60} color="#065f46" style={{ marginBottom: '1rem' }} />
            <h2 style={styles.heading}>Admin Login</h2>

            <form onSubmit={handleLogin} style={styles.form}>
                <div style={styles.inputContainer}>
                    <FaUser style={styles.icon} />
                    <input
                        type="text"
                        placeholder="Username"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        required
                        style={styles.input}
                        disabled={loading}
                    />
                </div>
                <div style={styles.inputContainer}>
                    <FaLock style={styles.icon} />
                    <input
                        type="password"
                        placeholder="Password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                        style={styles.input}
                        disabled={loading}
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        ...styles.button,
                        opacity: loading ? 0.7 : 1,
                        pointerEvents: loading ? 'none' : 'auto',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    {loading && <ImSpinner2 style={{ animation: 'spin 1s linear infinite' }} />}
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <button onClick={onClose} style={styles.closeButton}>Close</button>

            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    </div>
);

};

export default AdminLoginModal;

const styles = {
    modalBackground: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    },
    heading: {
        color: '#065f46',
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '1rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    inputContainer: {
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '0.6rem 0.8rem',
        backgroundColor: '#f9f9f9',
    },
    icon: {
        marginRight: '0.6rem',
        color: '#065f46',
        flexShrink: 0,
    },
    input: {
        flex: 1,
        border: 'none',
        outline: 'none',
        backgroundColor: 'transparent',
        fontSize: '1rem',
    },
    button: {
        padding: '0.8rem',
        backgroundColor: '#facc15',
        color: '#1f2937',
        border: 'none',
        borderRadius: '6px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    error: {
        color: '#dc2626',
        fontSize: '0.95rem',
        marginTop: '0.5rem',
    },
    closeButton: {
        marginTop: '0.8rem',
        backgroundColor: '#e5e7eb',
        color: '#374151',
        border: 'none',
        borderRadius: '6px',
        padding: '0.6rem 1.2rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
};
