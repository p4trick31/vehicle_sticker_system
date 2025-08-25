// components/RenewalModal.js
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { FaFileUpload, FaTimes, FaCheckCircle } from 'react-icons/fa';


const RenewalModal = ({ isOpen, onClose, renewal, handleApprove, handleClientApprove, refreshAccessToken }) => {

  const [previewImage, setPreviewImage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [userPosition, setUserPosition] = useState(null);
  

  

  


useEffect(() => {

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('access'); // or 'access' if you want to standardize

      const res = await axios.get('http://localhost:8000/api/current-user/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserPosition(res.data.profile?.position);
      





    } catch (err) {
      if (err.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          localStorage.setItem("access", newToken);

          try {
            const retryRes = await axios.get('http://localhost:8000/api/current-user/', {
              headers: { Authorization: `Bearer ${newToken}` },
            });

            setUserPosition(retryRes.data.profile?.position);

          } catch (retryErr) {
            console.error("Retry failed:", retryErr);
          }
        }
      } else {
        console.error("Fetch error:", err);
      }
    }
  };

  fetchCurrentUser();
}, []);


  if (!isOpen || !renewal) return null;

    const handleApproveClick = () => {
    setShowConfirmModal(true);
  };



const confirmApprove = async () => {
  setShowConfirmModal(false);
  setIsApproving(true); // Show loading spinner

  try {
    // Determine which approve function to call based on userPosition
    if (userPosition === 'personnel1') {
      await handleApprove(renewal.id);
    } else if (userPosition === 'personnel2') {
      await handleClientApprove(renewal.id);
    }

    setTimeout(() => {
      setIsApproving(false);      // Hide spinner
      setShowSuccessModal(true);  // Then show success
    }, 3000); // Delay for UX smoothness
  } catch (error) {
    console.error("Approval failed:", error);
    setIsApproving(false);
    // Optional: show error modal or toast
  }
};



  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
        
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '10px',
          width: '90%',
          maxWidth: '900px',
          maxHeight: '85%',
          position: 'relative',
          
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            fontSize: '32px',
            color: '#fff',
            cursor: 'pointer',
          }}
        > <X size={32} color="#065f46" />
          
        </button>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '0px 30px'}}>
        <h2 style={{color:'#065f46'}}>Renewal Request Info: </h2>
        <p><strong>Status:</strong> <span style={dataStyle}>{renewal.status}</span></p>
        <p><strong>Date:</strong> <span style={dataStyle}>{new Date(renewal.created_at).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})}</span></p>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', padding: '20px', background: '#f9f9f9', border: '1px solid #065f46', borderRadius: '5px'}}>
        <p style={{ fontStyle: 'italic', color: '#4CAF50' }}>
  This application has been reviewed and validated by the system. The applicant is qualified to renew their vehicle sticker.
</p>    
        <div style={{display: 'flex', gap: '100px',
    backgroundColor: '#f9f9f9',
    padding: '5px 10px',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    color: '#065f46',
    fontSize: '1rem',
    fontWeight: 500}}>
        <div>
          <p><strong>Name:</strong> <span style={ dataStyle}>{renewal.full_name}</span></p>
          <p><strong>Email:</strong> <span style={ dataStyle}>{renewal.user_email}</span> </p>
          <p><strong>Address:</strong> <span style={ dataStyle}>{renewal.address || 'N/A'}</span> </p>
        </div>
        <div>
          <p><strong>Contact Number:</strong><span style={ dataStyle}> {renewal.contact_number || 'N/A'} </span></p>
          <p><strong>Vehicle Model:</strong> <span style={ dataStyle}>{renewal.vehicle_model || 'N/A'} </span></p>
        </div>
        </div>
       
        <div style={{ margin: 'auto' }}>
          <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
          <h4>
  <FaFileUpload style={{ marginRight: '8px', color: '#065f46', fontSize: '25px' }} />
  Uploaded Files
</h4>
<p style={{color: '#6c6b6bff',
    fontFamily: 'Cambria',
    fontSize: '17px'}}>(Click image to view bigger size.)</p>
</div>


          <div style={{display: 'flex', gap: '50px'}}>
          {renewal.orcr_file_url && (
            <div>
              <p style={{color: '#333',
    fontFamily: 'Cambria',
    fontWeight: 'bold',
    fontSize: '18px',}}>OR/CR:</p>
              

             <img
  src={renewal.orcr_file_url}
  alt="OR/CR"
  style={{ width: '250px', height: '200px', cursor: 'pointer', border: '1px solid #065f46', borderRadius: '5px' }}
  onClick={() => setPreviewImage(renewal.orcr_file_url)}
/>

            </div>
          )}
          {renewal.license_photo_url && (
            <div>
              <p  style={{color: '#333',
    fontFamily: 'Cambria',
    fontWeight: 'bold',
    fontSize: '18px',}}>Driver's License:</p>
             <img
  src={renewal.license_photo_url}
  alt="License"
  style={{ width: '250px', height: '200px', cursor: 'pointer', border: '1px solid #065f46', borderRadius: '5px' }}
  onClick={() => setPreviewImage(renewal.license_photo_url)}
/>

            </div>
          )}
        </div>
        </div>

       <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          {renewal.is_checked && (
    <p style={{ textAlign: "left", margin: 0 }}>
      Checked and Reviewed by: <i>Mr. {renewal.checked_by}</i>
    </p>
  )}
  <div></div>
  <button
    onClick={handleApproveClick}
    style={{
      backgroundColor: '#065f46',
      color: '#ffffff',
      padding: '10px 20px',
      border: 'none',
      fontWeight: 'bold',
      borderRadius: '5px',
      cursor: 'pointer',
      width: '150px',
    }}
  >
    Approve
  </button>
</div>

        </div>
      </div>
      {previewImage && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}
    onClick={() => setPreviewImage(null)} // close on background click
  >
    <div style={{ position: 'relative' }}>
      <FaTimes
        onClick={() => setPreviewImage(null)}
        style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
        }}
      />
      <img
        src={previewImage}
        alt="Preview"
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          borderRadius: '10px',
          boxShadow: '0 0 10px rgba(255,255,255,0.5)',
        }}
      />
    </div>
  </div>
)}
{/* Confirm Modal */}
{showConfirmModal && (
  <div style={modalOverlay}>
    <div style={modalBox}>
      <h3>Are you sure you want to approve this renewal?</h3>
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-around' }}>
        <button onClick={confirmApprove} style={confirmButton}>Yes, Approve</button>
        <button onClick={() => setShowConfirmModal(false)} style={cancelButton}>Cancel</button>
      </div>
    </div>
  </div>
)}

{isApproving && (
  <div style={modalOverlay}>
    <div style={{ ...modalBox, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={spinnerStyle} />
      <p style={{ marginTop: '15px' }}>Approving renewal...</p>
    </div>
  </div>
)}


{/* Success Modal */}
{showSuccessModal && (
  <div style={modalOverlay}>
    <div style={{ ...modalBox, backgroundColor: '#ffffff', borderColor: '#065f46', color: '#065f46' }}>
      <FaCheckCircle size={40} />
      <p style={{ fontSize: '18px', marginTop: '10px' }}>Renewal Approved Successfully!</p>
      <button  onClick={() => {
    onClose();
    window.location.reload() // call your modal close function
    setShowSuccessModal(false); // hide the success modal
  }} style={{ marginTop: '15px', ...confirmButton }}>
        Close
      </button>
    </div>
  </div>
)}



    </div>
    
  );
};

const spinnerStyle = {
  border: '6px solid #f3f3f3',
  borderTop: '6px solid #065f46',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  animation: 'spin 1s linear infinite',
};

// Define the keyframes in global CSS
const styleSheet = document.styleSheets[0];
const keyframes =
  `@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }`;

styleSheet.insertRule(keyframes, styleSheet.cssRules.length);



const modalOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1001,
};

const modalBox = {
  backgroundColor: '#fff',
  padding: '30px',
  borderRadius: '10px',
  border: '2px solid #065f46',
  textAlign: 'center',
  minWidth: '300px',
};

const confirmButton = {
  backgroundColor: '#065f46',
  color: '#fff',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const cancelButton = {
  backgroundColor: '#e5e7eb',
  color: '#111827',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};


const dataStyle = {
    color: '#333',
    fontFamily: 'Cambria',
    fontWeight: 'bold',
    fontSize: '18px',
    padding: '3px',
    borderBottom: '2px solid #065f46'
};

export default RenewalModal;
