// src/components/modals/LogoutModal.js
import React from 'react';

const LogoutModal = ({ show, onCancel, onConfirm, colors }) => {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: '100vw',
      backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0,0,0,0.25)',
        width: '320px',
        textAlign: 'center',
      }}>
        <h3 style={{ marginBottom: '20px', color: colors.darkGreen }}>Confirm Logout</h3>
        <p>Are you sure you want to log out?</p>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '25px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ccc',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              backgroundColor: colors.darkGreen,
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
