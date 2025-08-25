import React from 'react';

const GuidelinesModal = ({ show, onClose, colors }) => {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        width: '600px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
        position: 'relative'
      }}>
        <h2 style={{ color: colors.darkGreen, marginBottom: '15px' }}>📘 System Guidelines</h2>
        <p style={{ lineHeight: '1.6', fontSize: '16px', color: 'black' }}>
          Welcome to the Admin Vehicle Management Request. Please follow the guidelines below to ensure smooth processing and proper usage of the platform.
        </p>

        <ul style={{ paddingLeft: '20px', color: 'black', fontSize: '17px' }}>
          <li style={li}>✅ <strong>New Request Application:</strong> Review pending applications. You may approve, disapprove, or view full form details.</li>
          <li style={li}>🔄 <strong>Renewal Requests:</strong> Handle requests from applicants who want to renew their previous vehicle stickers.</li>
          <li style={li}>📊 <strong>Dashboard View:</strong> Easily switch between new requests, renewals, and approved applications using the side menu.</li>
          <li style={li}>🖊️ <strong>Signature Feature:</strong> Submit your e-signature to validate approvals. You can update or add a new signature anytime.</li>
          <li style={li}>📥 <strong>Manage Approved Applications:</strong> View the list of all approved requests for record-keeping and future reference.</li>
          <li style={li}>📢 <strong>Report System Issues:</strong> Use the “Report” option in the navigation bar if you encounter any bugs or concerns.</li>
        </ul>

        <p style={{ marginTop: '10px', color: '#555' }}>
          Make sure to regularly check for new requests and keep your signature up to date. Always log out after using the system to keep your session secure.
        </p>

        <button
          onClick={onClose}
          style={{
            marginTop: '20px',
            backgroundColor: colors.darkGreen,
            color: 'white',
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            float: 'right'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
 
};
 const li = {
    margin: '20px'
  };

export default GuidelinesModal;
