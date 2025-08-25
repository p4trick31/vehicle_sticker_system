import React from 'react';
import ClientLogin from './ClientLogin';

const ClientModal = ({ isOpen, onClose, onLoginSuccess }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <button onClick={onClose} style={styles.closeButton}>&times;</button>
        <ClientLogin onLoginSuccess={onLoginSuccess} />
      </div>
    </div>
  );
};

export default ClientModal;

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
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
    position: 'relative',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '12px',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '20px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};
