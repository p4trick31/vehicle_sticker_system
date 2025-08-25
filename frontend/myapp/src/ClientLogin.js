import React, { useState, useEffect} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaCheckCircle } from 'react-icons/fa';
import { PiUserCircleBold } from 'react-icons/pi';
import { ImSpinner2 } from 'react-icons/im';



const ClientLogin = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        setUsername('');
        setPassword('');
        setMessage('');
        setSuccess(false);
        localStorage.removeItem('authRole');
        }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setSuccess(false);

        const loginData = { username, password };

        try {
            const response = await axios.post('http://localhost:8000/api/loginClient/', loginData);
            if (response.data && response.data.access) {
                localStorage.setItem('access', response.data.access);
                localStorage.setItem('refresh', response.data.refresh);
                localStorage.setItem('isAuthenticated', 'true');

                setMessage('Login successful!');
                setSuccess(true);

                setTimeout(() => {
                    if (onLoginSuccess) {
                    localStorage.removeItem('notificationShown');
                    onLoginSuccess('client');
                    }
                }, 1500);
        }
else {
                setMessage('Unexpected response from server.');
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setMessage(error.response.data.error || 'Invalid username or password.');
            } else if (error.request) {
                setMessage('No response from server. Please try again.');
            } else {
                setMessage('Network error or server is unreachable.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <PiUserCircleBold size={60} color="#065f46" style={{ display: 'block', margin: '0 auto 1rem auto' }} />
            <h2 style={styles.heading}>Client Login</h2>

            {message && (
                <div style={{ ...styles.messageWrapper, color: success ? '#22c55e' : '#f87171' }}>
                    {success && <FaCheckCircle size={18} style={{ marginRight: '5px' }} />}
                    <p style={styles.message}>{message}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.inputContainer}>
                    <FaUser style={styles.icon} />
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputContainer}>
                    <FaLock style={styles.icon} />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? (
                        <ImSpinner2 style={{ animation: 'spin 1s linear infinite' }} />
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

export default ClientLogin;

// Inline styles
const styles = {
    container: {
        width: '90%',
        maxWidth: '300px',
        margin: '50px auto',
        padding: '1.5rem',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.05)',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        textAlign: 'center',
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
    messageWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
        fontSize: '0.95rem',
        fontWeight: '500',
    },
    message: {
        margin: 0,
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
