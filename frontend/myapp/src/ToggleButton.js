import React from 'react';

function ToggleButton({ showLogin, toggleForm, isClient }) {
    return (
        <div className="form-toggle">
            {isClient ? (
                <>
                    <button onClick={() => toggleForm(true)} disabled={showLogin}>
                        Client Login
                    </button>
                </>
            ) : (
                <>
                    <button onClick={() => toggleForm(true)} disabled={showLogin}>
                        User Login
                    </button>
                    <button onClick={() => toggleForm(false)} disabled={!showLogin}>
                        User Signup
                    </button>
                </>
            )}
            <style>
                {`
                /* Main container styling */
                .form-toggle {
                    width: 90%;
                    max-width: 400px;
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    margin: 30px auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                /* Button styling */
                .form-toggle button {
                    flex: 1;
                    padding: 10px 16px;
                    font-size: 15px;
                    color: #065f46; /* Dark green text */
                    background-color: #f0fdf4; /* Very light green background */
                    border: 2px solid #065f46; /* Outline to make it subtle */
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .form-toggle button:disabled {
                    background-color: #f3f4f6; /* Neutral disabled background */
                    color: #9ca3af; /* Gray text for disabled */
                    border-color: #d1d5db;
                    cursor: not-allowed;
                }

                .form-toggle button:hover:not(:disabled) {
                    background-color: #d1fae5; /* Slightly darker light green on hover */
                }
                `}
            </style>
        </div>
    );
}

export default ToggleButton;
