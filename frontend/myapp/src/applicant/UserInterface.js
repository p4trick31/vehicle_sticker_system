import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaListAlt, FaSignOutAlt, FaRedo, FaExclamationTriangle, FaBell, FaTimes, FaClock, FaUserCircle } from 'react-icons/fa';
import logo from '../logo.jpg';
import axios from 'axios';
import { refreshAccessToken } from '../utils/tokenUtils';
import PushNotificationModal from '../components/PushNotificationModal';
import { FiKey, FiEdit, FiSave, FiX  } from "react-icons/fi"; 





const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [applications, setApplications] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showRenewalPendingModal, setShowRenewalPendingModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [renewals, setRenewals] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ username: "", email: "" });

useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/api/current-user/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser(res.data);
      
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  fetchCurrentUser();
}, []);



  useEffect(() => {
    fetchPendingCount();
  }, []);

  const fetchPendingCount = async () => {
  try {
    const token = localStorage.getItem('token'); // adjust key if different

    const response = await axios.get('http://localhost:8000/api/renewal/', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    setRenewals(response.data);
   
  } catch (error) {
    console.error('Error fetching pending renewals:', error);
  }
};






 useEffect(() => {
  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:8000/api/application/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setApplications(response.data);
      
    } catch (error) {
      if (error.response && error.response.status === 401) {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          // Retry the request with new token
          try {
            const retryResponse = await axios.get('http://localhost:8000/api/application/', {
              headers: { Authorization: `Bearer ${newAccessToken}` },
            });
            setApplications(retryResponse.data);
          } catch (retryError) {
            console.error('Retry failed:', retryError);
          }
        } else {
          console.error('Could not refresh token.');
        }
      } else {
        console.error('Error fetching applications:', error);
      }
    }
  };

  fetchApplications();
}, []);


  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // reset back to original
    setEditedData({
      username: currentUser.username,
      email: currentUser.email,
    });
    setIsEditing(false);
  };

const handleSave = async () => {
  try {
    await axios.put("http://localhost:8000/api/update-user/", {
      id: currentUser.id,       
      username: editedData.username,
      email: editedData.email,
    });

    setCurrentUser({ ...currentUser, ...editedData });
    setIsEditing(false);
  } catch (err) {
    console.error("Error updating user:", err);
  }
};



useEffect(() => {
  const savedModalState = localStorage.getItem('showNotificationModal') === 'true';
  setShowNotificationModal(savedModalState);
}, []);

// Restore modal open state on first mount
useEffect(() => {
  const savedModalState = localStorage.getItem('showNotificationModal') === 'true';
  setShowNotificationModal(savedModalState);
}, []);

// Save modal state and fetch notifications
useEffect(() => {
  if (showNotificationModal) {
    localStorage.setItem('showNotificationModal', 'true');
  } else {
    localStorage.removeItem('showNotificationModal');
  }

  if (showNotificationModal) {
    async function fetchNotifications() {
      try {
        let token = localStorage.getItem("token");
        if (!token) return;

        let res = await fetch("http://localhost:8000/api/notifications/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          const newAccessToken = await refreshAccessToken();
          if (newAccessToken) {
            token = newAccessToken;
            res = await fetch("http://localhost:8000/api/notifications/", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          } else {
            console.error("Could not refresh token.");
            return;
          }
        }

        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]);
      }
    }

    fetchNotifications();
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }

  return () => {
    document.body.style.overflow = 'auto';
  };
}, [showNotificationModal]);

useEffect(() => {
  async function fetchNotifications() {
    try {
      let token = localStorage.getItem("token");
      if (!token) return;

      let res = await fetch("http://localhost:8000/api/notifications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          token = newAccessToken;
          res = await fetch("http://localhost:8000/api/notifications/", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          console.error("Could not refresh token.");
          return;
        }
      }

      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications on mount:", error);
      setNotifications([]);
    }
  }

  fetchNotifications();
}, []);




  const handleApplySticker = () => {
    const hasPending = applications.some(app => app.app_status === 'Pending');
    if (hasPending) {
      setShowPendingModal(true);
    } else {
      navigate('/input');
    }
  };

  const handlePendingTransactions = () => {
    navigate('/steps/');
  };

  const handleRenewal = () => {
    const hasPending = renewals.some(renew => renew.renewal_status === 'Pending');
    if (hasPending) {
      setShowRenewalPendingModal(true);
    } else {
    setShowRenewalModal(true);
   }
  };


   const handlePendingRenewal = () => {
    navigate('/pending-renewal/');
  };
  

  const handleNotification = () => {
  setShowNotificationModal(true);
};

  const handleLogout = () => {
  // Optional: clear token and sessionStorage
    localStorage.removeItem("token");
    sessionStorage.clear(); // Clears seenSubscriptionModal for new session
    localStorage.removeItem("subscriptionDismissed"); // 👈 Allow showing again next login

    if (onLogout) {
      onLogout();
      navigate("/", { replace: true });
      window.location.reload();
    }
  };
    const handleConfirmRenewal = () => {
    setShowRenewalModal(false);
    navigate('/renewal-form');
    // navigate('/renewal'); // Uncomment if you have a renewal route
  };

  const handleCancelRenewal = () => {
    setShowRenewalModal(false);
  };










  return (
    


    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '20px',
        position: 'relative',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      }}
    >
     
          
      {/* Back button at top-left */}
      <button
  onClick={() => setShowConfirm(true)}
  style={{
    position: 'absolute',
    top: '20px',
    left: '20px',
    color: '#1f2937',
    border: 'none',
    padding: '10px',
    cursor: 'pointer',
    background: 'none',
    borderRadius: '50%',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',

 
  }}
>
  <FaSignOutAlt size={25} style={{ transform: 'scaleX(-1)' }}/>
</button>
  
 <PushNotificationModal />


      {/* Notification icon at top-right */}
    
      <button
        onClick={handleNotification}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: '#facc15',
          color: '#1f2937',
          border: 'none',
          borderRadius: '50%',
          padding: '10px',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
        }}
      >
        <FaBell size={20} />
        {notifications.length > 0 && (
    <span
      style={{
        position: 'absolute',
        top: '-5px',
        right: '-5px',
        backgroundColor: '#ef4444',
        color: '#fff',
        borderRadius: '9999px',
        padding: '2px 6px',
        fontSize: '12px',
        fontWeight: 'bold',
      }}
    >
      {notifications.length}
    </span>
  )}
      </button>
        <button
        onClick={() => setShowProfile(!showProfile)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "40px",
          color: "#065f46",
          position: 'absolute',
          top: '20px',
          right: '70px',
        }}
      >
        <FaUserCircle style={{fontSize: '42px'}}/>
      </button>
      {showProfile && (
           <div
    onClick={() => setShowProfile(false)}
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "flex-start",
      zIndex: 1000,
      overflow: "hidden", // prevents outer screen from scrolling
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        marginTop: "70px",
        marginRight: "40px",
        width: "300px",
        maxHeight: "350px", // ✅ scrollable
        overflowY: "auto",
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        padding: "15px", // ✅ inner padding for content
        display: "flex",
        flexDirection: "column",
      }}
    >

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => setShowProfile(false)}
          style={{
            background: "none",
            border: "none",
            color: "#1f2937",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          <FaTimes />
        </button>
      </div>
          <h2 style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}>
            <FaUserCircle style={{ marginRight: "5px" }} />
            My Profile
          </h2>
           

          <div style={{ marginBottom: "5px" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
              Username:
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedData.username}
                onChange={(e) =>
                  setEditedData({ ...editedData, username: e.target.value })
                }
                style={{
                  padding: "8px",
                  width: "100%",
                  borderRadius: "5px",
                  border: "1px solid #065f46",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
            ) : (
              <p>{currentUser.username}</p>
            )}
          </div>

          <div style={{ marginBottom: "5px" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
              Email:
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editedData.email}
                onChange={(e) =>
                  setEditedData({ ...editedData, email: e.target.value })
                }
                style={{
                  padding: "8px",
                  width: "100%",
                  borderRadius: "5px",
                  border: "1px solid #065f46",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
            ) : (
              <p>{currentUser.email}</p>
            )}
          </div>

          <div>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  style={{
                    marginRight: "10px",
                    background: "#065f46",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  <FiSave style={{ marginRight: "5px" }} />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    background: "#991b1b",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  <FiX style={{ marginRight: "5px" }} />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                style={{
                  background: "#fff",
                  color: "#065f46",
                  border: "1px solid #065f46",
                  padding: "6px 12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                <FiEdit style={{ marginRight: "5px" }} />
                Edit
              </button>
            )}
          </div>

          <button
            style={{
              marginTop: "15px",
              padding: "10px 15px",
              border: "none",
              borderRadius: "6px",
              backgroundColor: "#065f46",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onClick={() => navigate("/forgot-password")}
          >
            <FiKey /> Change Password
          </button>
        </div>
        </div>
      )}

     {showNotificationModal && (
  <div
    onClick={() => setShowNotificationModal(false)}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      zIndex: 1000,
      overflow: 'hidden', // prevents outer screen from scrolling
    }}
  >
    <div
  onClick={(e) => e.stopPropagation()}
  style={{
    marginTop: '70px',
    marginRight: '20px',
    width: '300px',
    maxHeight: '350px', // adjust as needed
    overflowY: 'auto',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    padding: '0px', // remove outer padding so we can set inside
    display: 'flex',
    flexDirection: 'column',
  }}
>

      <div
        style={{
          position: 'sticky',
          top: 0,
          backgroundColor: '#ffffff',
          zIndex: 10,
          padding: '15px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h4 style={{ margin: '10px 0', color: '#1f2937', display: 'flex', alignItems: 'center' }}>
          <FaBell style={{ marginRight: '5px', color: '#facc15' }} /> Notifications
        </h4>
        <button
          onClick={() => setShowNotificationModal(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#1f2937',
            cursor: 'pointer',
            fontSize: '18px',
          }}
        >
          <FaTimes />
        </button>
      </div>
      <div
        style={{
          marginTop: '10px',
          fontSize: '14px',
          color: '#374151',
          maxHeight: 'auto',
          marginLeft: '5px',
          
          display: 'flex',
          flexDirection: 'column-reverse', // Show latest on top
        }}
      >
        {notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                backgroundColor: '#f0fdf4',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '10px',
                marginBottom: '10px',
                color: '#1f2937'
              }}
            >
              <FaBell style={{ marginRight: '8px', color: '#065f46', flexShrink: 0, marginTop: '3px' }} />
              <span>{notif}</span>
            </div>
          ))
        ) : (
          <div
            style={{
              textAlign: 'center',
              color: '#6b7280',
              padding: '20px 0',
            }}
          >
            You have no new notifications at this time.
          </div>
        )}
      </div>
    </div>
  </div>
)}




      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '50px',
          gap: '20px',
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />

        <div style={{ textAlign: 'center', color: '#1f2937', margin: '10px 0' }}>
          <h4 style={{ margin: '5px 0' }}>Republic of the Philippines</h4>
          <h3 style={{ margin: '5px 0' }}>DR. EMILIO B. ESPINOSA, SR. MEMORIAL</h3>
          <h4 style={{ margin: '5px 0' }}>STATE COLLEGE OF AGRICULTURE AND TECHNOLOGY</h4>
          <h5 style={{ margin: '5px 0' }}>(Masbate State College)</h5>
          <h5 style={{ margin: '5px 0' }}>PRODUCTION AND COMMERCIALIZATION</h5>
          <h5 style={{ margin: '5px 0', color: '#065f46' }}>www.debesmscat.edu.ph</h5>
          <h5 style={{ margin: '5px 0' }}>(DEBESMSCAT Vehicle Pass)</h5>
        </div>

        <h2
  style={{
    color: '#065f46',
    fontWeight: '700',
    margin: 0,
    fontSize: '28px',
  }}
>
  Hi {currentUser ? currentUser.username : ''}, <br />
  <span style={{ color: '#1f2937', fontWeight: '500' }}>Welcome to your Dashboard! </span>
</h2>





        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%',
            maxWidth: '300px',
            margin: '10px 0',
          }}
        >
          <button
            onClick={handleApplySticker}
            style={{
              ...buttonStyle,
              backgroundColor: '#facc15',
              color: '#1f2937',
            }}
          >
            <FaCar style={{ marginRight: '8px' }} />
            Apply Sticker
          </button>

          <button
            onClick={handlePendingTransactions}
            style={{
              ...buttonStyle,
              backgroundColor: '#065f46',
              color: '#ffffff',
            }}
          >
            <FaListAlt style={{ marginRight: '8px' }} />
            Pending Transactions
          </button>

          <button
            onClick={handleRenewal}
            style={{
              ...buttonStyle,
              backgroundColor: '#1f2937',
              color: '#ffffff',
            }}
          >
            <FaRedo style={{ marginRight: '8px' }} />
            Renewal
          </button>

          <button
            onClick={handlePendingRenewal}
            style={{
              ...buttonStyle,
              backgroundColor: '#ffffff',
              color: '#065f46',
              border: '1px solid #065f46'
            }}
          >
            <FaClock style={{ marginRight: '8px' }} />
            Pending Renewal
          </button>
        

        {/* Important renewal notice right after the Renewal button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              backgroundColor: '#f0fdf4',
              padding: '12px',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
              width: '100%',
              color: '#1f2937',
              fontSize: '14px',
            }}
          >
            <FaExclamationTriangle style={{ marginRight: '10px', color: '#facc15', flexShrink: 0 }} />
            <span>
              Please make sure you have already applied for a sticker in this new system before requesting renewal.
The system performs data validation to verify if the vehicle is eligible for renewal.
            </span>
          </div>
          </div>

        {/* Notice message */}
        <div
          style={{
            backgroundColor: '#fefce8',
            padding: '18px',
            borderRadius: '10px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
            maxWidth: '450px',
            width: '100%',
            textAlign: 'justify',
            fontSize: '15px',
            color: '#1f2937',
            marginTop: '20px',
          }}
        >
          <strong>Notice:</strong> Please ensure all your information is updated before submitting any applications.
          Always check for announcements and new guidelines to avoid delays.
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '30px',
              borderRadius: '10px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              width: '90%',
              maxWidth: '300px',
            }}
          >
            <h3 style={{ marginBottom: '15px' }}>Are you sure you want to logout?</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button
                onClick={handleLogout}
                style={{
                  ...buttonStyle,
                  backgroundColor: '#065f46',
                  color: '#ffffff',
                  flex: 1,
                }}
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  ...buttonStyle,
                  backgroundColor: '#facc15',
                  color: '#1f2937',
                  flex: 1,
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Renewal Confirmation Modal */}
      {showRenewalModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '25px',
              borderRadius: '10px',
              maxWidth: '300px',
              textAlign: 'center',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            }}
          >
            
            <h3 style={{ marginBottom: '15px', color: '#1f2937' }}><FaExclamationTriangle style={{ marginRight: '10px', color: '#facc15', flexShrink: 0, fontSize: '22' }} />Renewal Confirmation</h3>
            <p style={{ fontSize: '15px', color: '#1f2937' }}>
              Before you proceed to the renewal process, make sure you have your vehicle's OR/CR ready to upload and provide the necessary information to validate your request.
            </p>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-evenly' }}>
             
              <button
                onClick={handleCancelRenewal}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#facc15',
                  color: '#1f2937',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Cancel
              </button>
               <button
                onClick={handleConfirmRenewal}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#065f46',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Pending Application Modal */}
      {showPendingModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '25px',
              borderRadius: '10px',
              maxWidth: '300px',
              textAlign: 'center',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>
              <FaExclamationTriangle style={{ marginRight: '10px', color: '#facc15' }} />
              Pending Application
            </h3>
            <p style={{ fontSize: '15px', color: '#1f2937' }}>
              You already have an application with status <strong>Pending</strong>. Please wait for it to be processed before applying again.
            </p>
            <button
              onClick={() => setShowPendingModal(false)}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#065f46',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
      {showRenewalPendingModal && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}
  >
    <div
      style={{
        backgroundColor: '#ffffff',
        padding: '25px',
        borderRadius: '10px',
        maxWidth: '320px',
        textAlign: 'center',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
      }}
    >
      <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>
        <FaExclamationTriangle style={{ marginRight: '10px', color: '#facc15' }} />
        Pending Renewal
      </h3>
      <p style={{ fontSize: '15px', color: '#1f2937' }}>
        You already have a <strong>renewal</strong> request with status <strong>Pending</strong>. Please wait for it to be processed before submitting a new one.
      </p>
      <button
        onClick={() => setShowRenewalPendingModal(false)}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#065f46',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '600',
        }}
      >
        OK
      </button>
    </div>
  </div>
)}

    </div>
  );
};

const buttonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px',
  border: 'none',
  borderRadius: '8px',
  fontWeight: '600',
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
};

export default Dashboard;
