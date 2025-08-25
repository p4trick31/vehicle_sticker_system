import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { FaMapMarkerAlt, FaPhoneAlt, FaBirthdayCake, FaUser, FaSpinner} from 'react-icons/fa';


const modalStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '8px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  zIndex: 1000,
  width: '1100px',
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  zIndex: 999,
};



const buttonStyle = {
  padding: '10px 20px',
  margin: '10px 5px 0',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const confirmationModalStyle = {
  ...modalStyle,
  zIndex: 1001,
  width: '400px',
  border: '1px solid #065f46'
};



const ViewApplicationModal = ({ application, selectedForm, onClose, onApprove, onDisapprove, refreshAccessToken}) => {
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showDisapproveConfirm, setShowDisapproveConfirm] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userPosition, setUserPosition] = useState(null);





useEffect(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    .spin {
      animation: spin 1s linear infinite;
      display: inline-block;
      margin-right: 5px;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  return () => {
    document.head.removeChild(style);
  };
}, []);




  useEffect(() => {
    const role = localStorage.getItem('authRole');
    console.log('Auth Role from localStorage:', role); // This should log 'client'
  }, []);
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


const client1ApproveApplication = async () => {
  try {
    await axios.post(
      `http://localhost:8000/api/application/${application.id}/approve/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return true;
  } catch (error) {
    console.error('Client1 approval failed:', error);
    alert('Approval failed');
    return false;
  }
};

const client2ApproveApplication = async () => {
  try {
    await axios.post(
      `http://localhost:8000/api/application/get_submitted/${application.id}/client2_approve/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return true;
  } catch (error) {
    console.error('Client2 approval failed:', error);
    alert('Approval failed');
    return false;
  }
};


  const handleApproveOrDisapprove = (action, signature) => {
  if (action === 'approve') {
    // Send POST to approve endpoint with signature
  } else if (action === 'disapprove') {
    // Send POST to disapprove endpoint
  }
};
 const labelStyle = {
    color: '#065f46',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginTop: '10px'
  };
   const personStyle = {
    color: '#065f46',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginTop: '25px',

  };

  const sectionTitleStyle = {
    color: '#065f46',
    borderBottom: '2px solid #065f46',
    paddingBottom: '5px',
    marginTop: '20px'
  };

  if (!application) return null;

  const token = localStorage.getItem('access');

  const approveApplication = async () => {
  setIsLoading(true);

  let success = false;

  if (userPosition === 'personnel1') {
    success = await client1ApproveApplication();
  } else if (userPosition === 'personnel2') {
    success = await client2ApproveApplication();
  }

  if (success) {
    onApprove();
    setSuccessMessage("Application approved successfully!");
    setShowSuccessModal(true);

    setTimeout(() => {
      setShowSuccessModal(false);
      onClose();
    }, 2000);
  }

  setShowApproveConfirm(false);
  setIsLoading(false);
};


  const disapproveApplication = async () => {
    setIsLoading(true);

    try {
      await axios.post(
        `http://localhost:8000/api/application/${application.id}/disapprove/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ); // in approveApplication
     
      onDisapprove();
     

      setSuccessMessage("Application disapproved successfully!");
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        onClose();
      }, 2000);
      setShowDisapproveConfirm(false)
    } catch (error) {
      console.error('Disapproval failed:', error);
      alert('Disapproval failed');
    }  finally {
   
    setIsLoading(false);
  }
  };



    const fieldStyle = { marginLeft: '5px' };
    const com_Style = { marginLeft: '5px' };
    const adressStyle = { marginLeft: '5px' };
    const or_regiStyle = { marginLeft: '5px' };

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={modalStyle}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
        <h2 style={{ color: '#065f46',
    paddingBottom: '5px',
    marginTop: '20px'}}>Application Details:</h2>

         <div><strong>Application No.:</strong> <span>{application.id}</span></div>
    
        <div>
  <strong>Date:</strong>{' '}
  <span>
    {new Date(application.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}
  </span>
</div>

       </div>


<div style={{
  display: 'flex',
  gap: '30px',
  padding: '30px',
  backgroundColor: '#fff',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  maxWidth: '1200px',
  margin: '0px auto',
  fontFamily: 'Segoe UI, sans-serif',
}}>
  {/* Left: Image Slideshow */}
 

  {/* Right: Application Details */}
  <div>
   <div style={{ display: 'flex', justifyContent: 'left' }}>
          {application.picture_id ? (
  <img src={`http://localhost:8000/${application.picture_id}`} 
              alt="Uploaded"
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '4px',
                objectFit: 'cover',
                marginBottom: '20px',
              }}
            />
          ) : (
            <p>No photo uploaded</p>
          )}
           <div style={{
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: '12px 16px',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    color: '#000',
    fontSize: '1.4rem',
    fontWeight: 500,
    gap: '10px',
    marginBottom: '16px'
  }}>
    <FaUser color="#065f46" />
    <div style={{ color: '#065f46', fontWeight: 'bold' }}>Name:</div>
    <span>{application.name}</span>
  </div>
         
     </div>
 

  <div style={{ flex: 2, fontSize: '16px', color: '#333' }}>
    <div style={{ display: 'flex', gap: '50px' }}>

      <div>
      <h2 style={sectionTitleStyle}>Personal Info</h2>
      <div style={personStyle}><FaMapMarkerAlt /> Address:</div>
      <span style={{color: '#333', fontFamily: 'Cambria', fontWeight: 'bold',fontSize: '18px', padding: '3px', borderBottom: '2px solid #065f46'}}>{application.address}</span>

      <div style={personStyle}><FaPhoneAlt /> Contact No.:</div>
      <span style={{color: '#333', fontFamily: 'Cambria', fontWeight: 'bold',fontSize: '18px', padding: '3px', borderBottom: '2px solid #065f46'}}>{application.contact}</span>

      <div style={personStyle}><FaBirthdayCake /> Birthday:</div>
      <span style={{color: '#333', fontFamily: 'Cambria', fontWeight: 'bold',fontSize: '18px', padding: '3px', borderBottom: '2px solid #065f46'}}>{new Date(application.birthday).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</span>

      <div style={personStyle}><FaUser /> Age:</div>
      <span style={{color: '#333', fontFamily: 'Cambria', fontWeight: 'bold', fontSize: '18px', padding: '3px', borderBottom: '2px solid #065f46'}}>{application.age ?? 'N/A'}</span>
      </div>
      <div>
      <h2 style={sectionTitleStyle}>Vehicle Info</h2>

      <div style={labelStyle}>Registration No.:
      <span style={{color: '#333', fontFamily: 'Cambria', fontSize: '18px', padding: '3px', borderBottom: '2px solid #065f46'}}>{application.vehicle_register}</span></div>

      <div style={labelStyle}>OR No./Date:
      <span style={{color: '#333', fontFamily: 'Cambria', fontSize: '18px', padding: '3px', borderBottom: '2px solid #065f46'}}>{application.or_no}</span></div>
  

      <div style={labelStyle}>Vehicle Type:
      <span style={{color: '#333', fontFamily: 'Cambria', fontSize: '18px', padding: '3px', borderBottom: '2px solid #065f46'}}>{application.vehicle_type}</span></div>

      <div style={labelStyle}>Plate No.:
      <span style={{color: '#333', fontFamily: 'Cambria', fontSize: '18px', padding: '3px', borderBottom: '2px solid #065f46'}}>{application.plate_number}</span></div>

      <div style={labelStyle}> Color:
      <span style={{color: '#333', fontFamily: 'Cambria', fontSize: '18px', padding: '3px', borderBottom: '2px solid #065f46'}}>{application.color}</span></div>

      <div style={labelStyle}> Make/Model:
      <span style={{color: '#333', fontFamily: 'Cambria', fontSize: '18px', padding: '3px', borderBottom: '2px solid #065f46'}}>{application.model_make}</span></div>

      <div style={labelStyle}> Chassis No.:
      <span style={{color: '#333', fontFamily: 'Cambria', fontSize: '18px', padding: '3px', borderBottom: '2px solid #065f46'}}>{application.chassis_no}</span></div>

      <div style={labelStyle}> Engine No.:
      <span style={{color: '#333', fontFamily: 'Cambria', fontSize: '18px', padding: '3px', borderBottom: '2px solid #065f46'}}>{application.engine_no}</span></div>
      </div>

        
         
    </div>
  </div>
     </div>
   <div style={{ flex: 1.2, position: 'relative', textAlign: 'center' }}>
  {(() => {
    const prependURL = (path) =>
      path?.startsWith('http') ? path : `http://localhost:8000/${path}`;

    const images = [];

    
    if (application.picture_id) {
      images.push({ label: 'Picture ID', url: prependURL(application.picture_id) });
    }
    if (application.photos) {
      images.push({ label: 'OR/CR Photo', url: prependURL(application.photos) });
    }
    if (application.license_photos) {
      images.push({ label: 'License Photo', url: prependURL(application.license_photos) });
    }
    if (application.vehicle_photos) {
      images.push({ label: ' Vehicle View', url: prependURL(application.vehicle_photos) });
    }
    if (application.pipe_photos) {
      images.push({ label: ' Pipe of Vehicle', url: prependURL(application.pipe_photos) });
    }

    const currentImage = images[currentPhotoIndex];

    
    
    return images.length > 0 ? (
      <>
        <h3 style={{ marginBottom: '10px', fontSize: '18px', color: '#333' }}>
          {currentImage.label}
        </h3>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          {isFullscreen && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}
    onClick={() => setIsFullscreen(false)}
  >
    <img
      src={currentImage.url}
      alt={currentImage.label}
      style={{
        maxWidth: '90%',
        maxHeight: '90%',
        objectFit: 'contain',
        borderRadius: '12px',
        boxShadow: '0 0 20px rgba(255,255,255,0.2)',
      }}
    />
    <button
      onClick={() => setIsFullscreen(false)}
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
    >
      <X size={32} color="#fff" />
    </button>
  </div>
)}

          <button
            onClick={() => setCurrentPhotoIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentPhotoIndex === 0}
            style={{
              position: 'absolute',
              top: '50%',
              left: '40px',
              transform: 'translateY(-50%)',
              backgroundColor: '#065f46',
              border: 'none',
              padding: '8px',
              borderRadius: '50%',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
              cursor: currentPhotoIndex === 0 ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s ease',
              zIndex: 1,
              color: '#065f46'
            }}
          >
            <ArrowLeft size={24} color={currentPhotoIndex === 0 ? '#aaa' : '#fafafa'} />
          </button>

          <img
            src={currentImage.url}
            alt={currentImage.label}
            style={{
              width: '100%',
              maxWidth: '420px',
              maxHeight: '320px',
              objectFit: 'contain',
              borderRadius: '10px',
              border: '1px solid #ccc',
              background: '#fafafa',
              cursor: 'pointer',
            }}
            onClick={() => setIsFullscreen(true)}
          />


          <button
            onClick={() => setCurrentPhotoIndex((prev) => Math.min(prev + 1, images.length - 1))}
            disabled={currentPhotoIndex === images.length - 1}
            style={{
              position: 'absolute',
              top: '50%',
              right: '40px',
              transform: 'translateY(-50%)',
              backgroundColor: '#065f46',
              border: 'none',
              padding: '8px',
              borderRadius: '50%',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
              cursor:
                currentPhotoIndex === images.length - 1 ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s ease',
              zIndex: 1,
              
            }}
          >
            <ArrowRight size={24} color={currentPhotoIndex === images.length - 1 ? '#aaa' : '#fafafa'} />
          </button>
        </div>
      </>
    ) : (
      <p>No images uploaded</p>
    );
  })()}
  
  
</div>


</div>




        

        {/* Action Buttons */}
      
<div
  style={{
    marginTop: "30px",
    display: "flex",
    justifyContent: "space-between", // pushes left + right apart
    alignItems: "center",
    gap: "20px",
  }}
>
  {/* Left side */}
  {application.is_approved && (
    <p style={{ textAlign: "left", margin: 0 }}>
      Checked and Reviewed by: <i>Mr. {application.checked_by}</i>
    </p>
  )}
  <div></div>

  {/* Right side (buttons) */}
  <div style={{ display: "flex", gap: "10px" }}>
          <button
  onClick={() => setShowApproveConfirm(true)}
  style={{ ...buttonStyle, backgroundColor: '#065f46', color: 'white' }}
>
  Approve
</button>
{userPosition !== 'personnel2' && (
  <button
    onClick={() => setShowDisapproveConfirm(true)}
    style={{ ...buttonStyle, backgroundColor: '#f44336', color: 'white' }}
  >
    Disapprove
  </button>
)}
</div>

 <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'transparent',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
        }}
        aria-label="Close"
      >
        <X size={32} color="#065f46" />
      </button>

        </div>
      </div>

      {showSuccessModal && (
  <>
    <div style={overlayStyle} />
    <div style={{ 
      ...confirmationModalStyle, 
      borderColor: '#065f46', 
      textAlign: 'center' 
    }}>
      <h3 style={{ color: '#065f46' }}>✅ Success</h3>
      <p>{successMessage}</p>
    </div>
  </>
)}


      {/* Confirm Approve Modal */}
      {showApproveConfirm && (
        <>
          <div style={overlayStyle} />
          <div style={confirmationModalStyle}>
            <h3>Confirm Approval</h3>
            <p>Are you sure you want to approve this application?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => {
                  approveApplication();
                }}
                 disabled={isLoading}
                style={{ ...buttonStyle, backgroundColor: '#065f46', color: 'white', cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.6 : 1, }}
              >
                {isLoading ? <><FaSpinner className="spin" /> Approving...</> : 'Yes, Approve'}

              </button>
              <button
                onClick={() => setShowApproveConfirm(false)}
                style={{ ...buttonStyle, backgroundColor: '#ccc' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}


     
       
      


      {/* Confirm Disapprove Modal */}
      {showDisapproveConfirm && (
        <>
          <div style={overlayStyle} />
          <div style={confirmationModalStyle}>
            <h3>Confirm Disapproval</h3>
            <p>Are you sure you want to disapprove this application?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => {
                  disapproveApplication();
                  
                }}
                disabled={isLoading}
                style={{ ...buttonStyle, backgroundColor: '#f44336', color: 'white', cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.6 : 1, }}
              >
                {isLoading ? <><FaSpinner className="spin" /> Disapproving...</> : 'Yes, Disapprove'}

              </button>
              <button
                onClick={() => setShowDisapproveConfirm(false)}
                style={{ ...buttonStyle, backgroundColor: '#ccc' }}
              >
                Cancel
              </button>
            </div>
          </div>
         

        </>
        
      )}
      
    </>
    
  );
  
};


export default ViewApplicationModal;
