import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaUserCircle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im'; // spinner icon

const LoginForm = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');
        const loginData = { username, password };

        try {
            const response = await axios.post('http://localhost:8000/api/login/', loginData);
            if (response.data && response.data.access && response.data.refresh) {
                localStorage.setItem('token', response.data.access);
                localStorage.setItem('refresh', response.data.refresh);
                localStorage.setItem('isAuthenticated', 'true');

                setSuccessMessage(true);
                setLoading(false);

                setTimeout(() => {
                    if (onLoginSuccess) {
                        localStorage.removeItem("notificationShown");
                        onLoginSuccess();
                    }
                    navigate('/dashboard');
                }, 1500);
            } else {
                setErrorMessage('Unexpected response from server');
                setShowPopup(true);
                setLoading(false);
            }
        } catch (error) {
            if (error.response) {
                setErrorMessage('Invalid username or password. Please try again.');
            } else if (error.request) {
                setErrorMessage('No response from server. Please try again.');
            } else {
                setErrorMessage('Network error or server is unreachable.');
            }
            setShowPopup(true);
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.iconHeader}>
                <FaUserCircle size={60} color="#065f46" />
            </div>
            <h2 style={styles.title}>Login</h2>

            {/* Success message above form */}
            {successMessage && (
                <div style={styles.messageWrapper}>
                    <FaCheckCircle size={20} color="#22c55e" />
                    <p style={styles.successText}>Successfully logged in!</p>
                </div>
            )}

            {/* Error message above form */}
            {showPopup && (
                <div style={styles.messageWrapper}>
                    
                    <p style={styles.errorText}>{errorMessage}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.inputWrapper}>
                    <FaUser style={styles.inputIcon} />
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputWrapper}>
                    <FaLock style={styles.inputIcon} />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <button type="submit" style={styles.button} disabled={loading || successMessage}>
                    {loading ? (
                        <ImSpinner2 className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                        'Login'
                    )}
                </button>
                            <p
          style={styles.forgotPassword}
          onClick={() => navigate('/forgot-password')}
        >
          <span style={styles.forgotLink}><u>Forgot Password?</u></span>
        </p>
            </form>

            <style>
                {`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

export default LoginForm;

const styles = {
    container: {
        maxWidth: '300px',
        margin: '20px auto',
        padding: '5px',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        textAlign: 'center',
        position: 'relative',
    },
    iconHeader: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '1rem',
    },
    title: {
        color: '#065f46',
        fontWeight: 'bold',
        marginBottom: '1rem',
    },
    messageWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
    },
    successText: {
        color: '#22c55e',
        fontSize: '0.95rem',
        fontWeight: '500',
        margin: 0,
    },
    errorText: {
        color: '#f87171',
        fontSize: '0.95rem',
        fontWeight: '500',
        margin: 0,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    inputWrapper: {
        position: 'relative',
        width: '100%',
    },
    inputIcon: {
        position: 'absolute',
        left: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#065f46',
    },
    input: {
        width: '80%',
        padding: '0.8rem 0.8rem 0.8rem 2.5rem',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.3s',
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
    forgotPassword: {
        marginTop: '0.8rem',
        fontSize: '0.9rem',
        cursor: 'pointer',
        
    },
    forgotLink: {
        color: '#065f46',
        textDecoration: 'none',
        fontWeight: '500',
    },
};
