import React from 'react';


const ReportModal = ({
  show,
  reason,
  message,
  setReason,
  setMessage,
  onClose,
  onSubmit,
}) => {
  if (!show) return null;



  const reasonDetails = {
    Bug: 'An unexpected error or feature is not working as intended.',
    'System Crash': 'The system crashes, freezes, or becomes unusable.',
    'UI Problem': 'There are visual or layout issues on the screen.',
    'Performance Issue': 'The system is slow or unresponsive.',
    Other: 'Any other issue not listed above.',
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: '100vw',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '12px',
        width: '420px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        fontFamily: 'Segoe UI, sans-serif'
      }}>
        <h2 style={{
          marginBottom: '20px',
          textAlign: 'center',
          color: '#065f46',
          fontWeight: '600'
        }}>
          🛠️ Report a System Issue
        </h2>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: '500', marginBottom: '6px', display: 'block' }}>Select a Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '14px',
              
            }}
          >
            <option value="">-- Choose an Issue --</option>
            <option value="Bug">🐞 Bug</option>
            <option value="System Crash">💥 System Crash</option>
            <option value="UI Problem">🎨 UI Problem</option>
            <option value="Performance Issue">🐢 Performance Issue</option>
            <option value="Other">❓ Other</option>
          </select>
          {reason && reasonDetails[reason] && (
            <p style={{ marginTop: '6px', fontSize: '13px', color: '#065f46' }}>
              {reasonDetails[reason]}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: '500', marginBottom: '6px', display: 'block' }}>Additional Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="4"
            placeholder="Please describe the issue clearly..."
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              backgroundColor: '#e0e0e0',
              color: 'black',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              width: '150px',
              height: '40px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            style={{
              padding: '8px 18px',
              backgroundColor: '#065f46',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              width: '150px',
              height: '40px'
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
