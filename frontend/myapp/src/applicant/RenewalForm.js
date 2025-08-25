// components/RenewalForm.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlusCircle, FaTimesCircle, FaCheckCircle, FaSpinner} from 'react-icons/fa';
import { refreshAccessToken } from '../utils/tokenUtils'; // adjust path as needed


const RenewalForm = ({ onSubmit, applicationId }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    contactNumber: '',
    vehicleModel: '',
    orcrFile: null,
    licensePhoto: null,
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [success, setSuccess] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);


  const handleChange = (e) => {
    const { name, files, value } = e.target;
    const file = files ? files[0] : null;
    if (file && files.length > 1) return;
    setFormData((prev) => ({
      ...prev,
      [name]: file || value,
    }));
  };

  const handleRemoveFile = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: null,
    }));
  };
  useEffect(() => {
  const style = document.createElement('style');
  style.innerHTML = keyframesStyle;
  document.head.appendChild(style);
}, []);

 const iconStyle = {
  fontSize: '20px',
};
const successIconStyle = {
  color: '#065f46',
  fontSize: '40px',
  marginBottom: '10px',
  opacity: 0,
  transform: 'scale(0.95)',
  animation: 'fadeInZoom 0.5s ease-out forwards',
};
const errorIconStyle = {
  color: '#b91c1c',
  fontSize: '40px',
  marginBottom: '10px',
  opacity: 0,
  transform: 'scale(0.95)',
  animation: 'fadeInZoom 0.5s ease-out forwards',
};

const keyframesStyle = `
@keyframes fadeInZoom {
  to {
    opacity: 1;
    transform: scale(1);
  }
}
`;

// Add <style> tag to inject keyframes into the document

const spinnerStyle = {
  display: 'inline-block',
  animation: 'spin 1s linear infinite',
  marginRight: '8px',
};

// In your CSS or useEffect dynamically:
const style = document.createElement('style');
style.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);


  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setShowConfirmModal(false);
  setIsLoading(true);

  const { fullName, address, contactNumber, vehicleModel, orcrFile, licensePhoto } = formData;

  if (!fullName || !address || !contactNumber || !vehicleModel || !orcrFile || !licensePhoto) {
    setError('Please fill out all fields and upload required documents.');
    setIsLoading(false);
    return;
  }


  let token = localStorage.getItem('token');
  if (!token) {
    setError('You must be logged in to submit a renewal.');
    setIsLoading(false);
    return;
  }

  const data = new FormData();
  data.append('full_name', fullName);
  data.append('address', address);
  data.append('contact_number', contactNumber);
  data.append('vehicle_model', vehicleModel);
  data.append('orcr_file', orcrFile);
  data.append('license_photo', licensePhoto);

    for (let [key, value] of data.entries()) {
    console.log(`${key}:`, value);
  }






  const submitRequest = async (accessToken) => {
    return await fetch('http://localhost:8000/api/renewal/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: data,
    });
  };

  try {
    let response = await submitRequest(token);

    // If token expired, try refreshing
    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        response = await submitRequest(newToken);
      } else {
        setError('Session expired. Please log in again.');
        setIsLoading(false);

        return;
      }
    }

    setTimeout(async () => {
      const errData = await response.json();
      if (response.ok) {
        setShowSuccessModal(true);
        setSuccess('Renewal submitted successfully!');
      } else {
        setError(errData.error || 'Failed to submit renewal. Please check your input or try again.');
      }
      setIsLoading(false);
    }, 10000); // 10 seconds validation delay
  } catch (err) {
    console.error('Error:', err);
    setError('An error occurred. Please try again.');
    setIsLoading(false);
  }
};





  return (
    <div>
     

   
    <div style={styles.container}>
       <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
        <FaArrowLeft />
      </button>
     

      <div style={styles.headerText}>
        <h4 style={{margin: '2px'}}>Republic of the Philippines</h4>
        <h3 style={{margin: '2px'}}>DEBESMSCAT</h3>
        <h4 style={{margin: '2px'}}>(Masbate State College)</h4>
        <h4 style={{margin: '2px'}}>PRODUCTION AND COMMERCIALIZATION</h4>
        <p style={{ color: '#065f46', margin: '2px' }}>www.debesmscat.edu.ph</p>
        <h3>(DEBESMSCAT Vehicle Pass)</h3>
      </div>
       
      <h2 style={styles.title}>Vehicle Pass Renewal Form</h2>

      {error && (
        <div style={styles.errorBox}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={(e) => {
        e.preventDefault();
        setShowConfirmModal(true);
      }}>

        
        <h3 style={styles.sectionTitle}>Personal Information</h3>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g., Juan Dela Cruz"
            required
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="e.g., Brgy. San Vicente, Masbate City"
            required
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Contact Number</label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            placeholder="e.g., 0912-345-6789"
            required
            style={inputStyle}
          />
        </div>

        <h3 style={styles.sectionTitle}>Vehicle Information</h3>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Vehicle Model</label>
          <input
            type="text"
            name="vehicleModel"
            value={formData.vehicleModel}
            onChange={handleChange}
            placeholder="e.g., Toyota Vios 2020"
            required
            style={inputStyle}
          />
        </div>

       <div style={formGroupStyle}>
  <label style={labelStyle}>Upload OR/CR Document</label>

  {!formData.orcrFile ? (
    <>
      <label htmlFor="orcrUpload" style={styles.uploadBox}>
        <span>Click to upload OR/CR</span>
      </label>
      <input
        id="orcrUpload"
        type="file"
        name="orcrFile"
        onChange={handleChange}
        accept="image/*,application/pdf"
        required
        style={{ display: 'none' }}
      />
    </>
  ) : (
    <div style={styles.previewImageBox}>
      {formData.orcrFile.type.startsWith('image') ? (
        <img
          src={URL.createObjectURL(formData.orcrFile)}
          alt="OR/CR Preview"
          style={styles.previewImage}
        />
      ) : (
        <span>{formData.orcrFile.name}</span>
      )}
      <FaTimesCircle
        style={styles.removeIcon}
        onClick={() => handleRemoveFile('orcrFile')}
      />
    </div>
  )}

  <small style={styles.note}>Accepted: JPG, PNG, PDF (Max 5MB)</small>
</div>



       <div style={formGroupStyle}>
  <label style={labelStyle}>Upload Driver's License</label>

  {!formData.licensePhoto ? (
    <>
      <label htmlFor="licenseUpload" style={styles.uploadBox}>
        <span>Click to upload License</span>
      </label>
      <input
        id="licenseUpload"
        type="file"
        name="licensePhoto"
        onChange={handleChange}
        accept="image/*"
        required
        style={{ display: 'none' }}
      />
    </>
  ) : (
    <div style={styles.previewImageBox}>
      <img
        src={URL.createObjectURL(formData.licensePhoto)}
        alt="License Preview"
        style={styles.previewImage}
      />
      <FaTimesCircle
        style={styles.removeIcon}
        onClick={() => handleRemoveFile('licensePhoto')}
      />
    </div>
  )}

  <small style={styles.note}>Accepted: JPG, PNG (Max 5MB)</small>
</div>

        <div style={styles.buttonRow}>
          <button type="button" onClick={() => navigate('/dashboard')} style={cancelBtnStyle}>Cancel</button>
          <button type="submit" style={submitBtnStyle}>Submit Renewal</button>
        </div>
      </form>

      <div style={styles.noticeBox}>
        <strong>📢 Important Notice:</strong>
        <ul style={styles.noticeList}>
          <li>If the vehicle is new or different from the one previously registered, please go to Apply Sticker instead of using the renewal form.</li>
          <li>Ensure all documents are clear and readable before uploading.</li>
          <li>Only one renewal request per registered vehicle is allowed at a time.</li>
        </ul>
      </div>
    </div>
    {/* Confirm Modal */}
{showConfirmModal && (
  <div style={modalBackdropStyle}>
    <div style={modalBoxStyle}>
      <h3>Are you sure you want to submit this renewal?</h3>

      {/* Important Notice Box */}
      <div style={importantNoticeStyle}>
        <span style={iconStyle}>⚠️</span>
        <div>
          <strong>Important:</strong> Please ensure that your submitted information and documents match your previous application. 
          If they match exactly, your renewal may be auto-approved by the system within <strong>10 seconds</strong> and forwarded to the validation personnel.
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
        <button onClick={() => setShowConfirmModal(false)} style={cancelBtnStyle}>Cancel</button>
        <button onClick={handleSubmit} style={submitBtnStyle}>Yes, Submit</button>
      </div>
    </div>
  </div>
)}


{/* Loading Modal */}
{error && !isLoading && !showConfirmModal && !showSuccessModal && (
  <div style={modalBackdropStyle}>
    <div style={modalBoxStyle}>
      <FaTimesCircle style={errorIconStyle} />
      <h3 style={{ color: '#b91c1c' }}>Submission Failed</h3>
      <p>{error}</p>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
        <button onClick={() => setError('')} style={cancelBtnStyle}>Close</button>
        
        {/* Create New Application Button */}
        <button
          onClick={() => {
            setError('');
            navigate('/dashboard'); // Redirect to form
          }}
          style={{
            ...cancelBtnStyle,
            backgroundColor: '#065f46',
            color: 'white',
          }}
        >
          Create New
        </button>
      </div>
    </div>
  </div>
)}



{isLoading && (
  <div style={modalBackdropStyle}>
    <div style={modalBoxStyle}>
      <h3 style={{ color: '#065f46', display: 'flex', alignItems: 'center' }}>
        <FaSpinner style={spinnerStyle} />

        Validating Submission...
      </h3>
      <p>Please wait while we check your application. This process may take up to 10 seconds.</p>
    </div>
  </div>
)}
{/* Success Modal */}
{showSuccessModal && (
  <div style={modalBackdropStyle}>
    <div style={modalBoxStyle}>
      {/* ✅ Animated Icon */}
      <FaCheckCircle style={successIconStyle} />

      {/* ✅ Message */}
      <h3 style={{ color: '#065f46' }}>Renewal Application Accepted</h3>
      <p>Your renewal request has been successfully submitted for personnel approval</p>

      {/* Close Button */}
      <div style={{ textAlign: 'right', marginTop: '20px' }}>
        <button onClick={() => {
  setShowSuccessModal(false);
  setTimeout(() => navigate('/dashboard'), 300); // 300ms delay
}}
 style={cancelBtnStyle}>
          Close
        </button>
      </div>
    </div>
  </div>
)}


     </div>
     
  );
  
};

const formGroupStyle = {
  margin: '20px',
};

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  color: '#374151',
  fontWeight: '500',
};



const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '15px',
};

const cancelBtnStyle = {
  padding: '10px 20px',
  backgroundColor: '#e5e7eb',
  color: '#065f46',
  border: '1px solid #065f46',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '600',
  width: '200px'
};
const importantNoticeStyle = {
  backgroundColor: '#fefce8',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  color: '#92400e',
  padding: '12px 15px',
  display: 'flex',
  alignItems: 'flex-start',
  marginTop: '15px',
  fontSize: '14px',
};


const submitBtnStyle = {
  padding: '10px 20px',
  backgroundColor: '#065f46',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '600',
  width: '200px'
};
const modalBackdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalBoxStyle = {
  backgroundColor: '#fff',
  padding: '30px',
  borderRadius: '10px',
  maxWidth: '400px',
  textAlign: 'center',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
};

const styles = {
  container: {
    maxWidth: '700px',
    margin: 'auto',
    padding: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    fontFamily: 'Segoe UI, sans-serif',
  },
  backButton: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    backgroundColor: '#065f46',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '45px',
    height: '45px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '18px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
  },
  headerText: {
    textAlign: 'center',
    color: '#1f2937',
    marginBottom: '30px',
  },
  title: {
    marginBottom: '25px',
    color: '#111827',
    textAlign: 'center',
  },
  sectionTitle: {
    marginBottom: '10px',
    color: '#111827',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '5px',
  },
  note: {
    color: '#6b7280',
    fontSize: '12px',
  },
  buttonRow: {
    display: 'flex',
    margin: '30px',
    gap: '30px',
  },
  noticeBox: {
    backgroundColor: '#fefce8',
    padding: '15px 20px',
    border: '1px solid #fcd34d',
    borderRadius: '8px',
    color: '#92400e',
    margin: '25px 0',
  },
  noticeList: {
    marginTop: '10px',
    paddingLeft: '20px',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '10px 15px',
    borderRadius: '6px',
    marginBottom: '20px',
  },
  uploadBox: {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  height: '40px',
  backgroundColor: '#f3f4f6',
  border: '2px dashed #d1d5db',
  borderRadius: '10px',
  cursor: 'pointer',
  textAlign: 'center',
  color: '#6b7280',
  fontSize: '14px',
  transition: 'all 0.3s ease',
},

previewImageBox: {
  position: 'relative',
  maxWidth: '250px',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  overflow: 'hidden',
  marginTop: '10px',
},

previewImage: {
  width: '100%',
  height: 'auto',
  display: 'block',
},


removeIcon: {
  position: 'absolute',
  top: '5px',
  right: '5px',
  backgroundColor: '#ffffff',
  borderRadius: '50%',
  color: '#dc2626',
  cursor: 'pointer',
  fontSize: '18px',
  padding: '2px',
},

};



export default RenewalForm;