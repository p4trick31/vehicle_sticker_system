import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaUserCircle, FaCheckCircle } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';

const SignupForm = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (username.length < 4) {
        setMessage('Username must be at least 4 characters long.');
        setSuccess(false);
        return;
    }

    if (!email.endsWith('@gmail.com')) {
        setMessage('Email must end with @gmail.com.');
        setSuccess(false);
        return;
    }

    if (password.length < 6) {
        setMessage('Password must be at least 6 characters long.');
        setSuccess(false);
        return;
    }

    setLoading(true);
    setMessage('');

    const signupData = {
        username,
        email,
        password,
    };

    try {
        const response = await axios.post('http://localhost:8000/api/signup/', signupData);
        if (response && response.data) {
            setMessage('✅ User created successfully! You can now login.');
            setSuccess(true);
            setTimeout(() => {
                setMessage('');
                setSuccess(false);
                setUsername('');
                setEmail('');
                setPassword('');
                
            }, 2000);
        } else {
            setMessage('Unexpected response from the server.');
            setSuccess(false);
        }
    } catch (error) {
        if (error.response && error.response.data) {
            setMessage(error.response.data.error || 'Username already exists, please choose another one.');
        } else {
            setMessage('Server unavailable. Please try again later.');
        }
        setSuccess(false);
    } finally {
        setLoading(false);
    }
};

    return (
        <div style={styles.container}>
            <div style={styles.iconHeader}>
                <FaUserCircle size={60} color="#065f46" />
            </div>
            <h2 style={styles.title}>Sign Up</h2>

            {message && (
                <div style={{ ...styles.messageWrapper, color: success ? '#22c55e' : '#f87171' }}>
                    {success ? <FaCheckCircle size={18} style={{ marginRight: '5px' }} /> : null}
                    <p style={styles.message}>{message}</p>
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
    <FaEnvelope style={styles.inputIcon} />
    <input
        type="email"
        placeholder="Email (example@gmail.com)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{
            ...styles.input,
            border: email.length > 0 && !email.endsWith('@gmail.com')
                ? '1px solid #f87171'
                : '1px solid #e5e7eb',
        }}
    />
</div>

                <div style={styles.inputWrapper}>
                    <FaLock style={styles.inputIcon} />
                    <input
                        type="password"
                        placeholder="Password (min 6 chars)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            ...styles.input,
                            border: password.length > 0 && password.length < 6
                                ? '1px solid #f87171'
                                : '1px solid #e5e7eb',
                        }}
                    />
                </div>
                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? (
                        <ImSpinner2 className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                        'Sign Up'
                    )}
                </button>
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

export default SignupForm;

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
    messageWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
    },
    message: {
        margin: 0,
        fontSize: '0.95rem',
        fontWeight: '500',
    },
};
