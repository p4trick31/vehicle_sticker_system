import React, { useEffect, useState, useRef, } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../logo.jpg'; // School logo// Placeholder for e-signature
import { FaBars, FaSignOutAlt, FaFileAlt, FaBook, FaUserCircle, FaPen, FaPlus, FaEye, FaCheckCircle, FaSign  } from 'react-icons/fa';
import { FaCalendarDays, FaSignature } from 'react-icons/fa6';
import LogoutModal from './modal/LogoutModal';
import ReportModal from './modal/ReportModal';
import GuidelinesModal from './modal/GuidelinesModal'; // adjust path if different
import SignatureModal from './modal/SignatureModal'; // adjust path as needed
import { refreshAccessToken } from '../utils/tokenUtils';
import RenewalModal from './modal/RenewalModal';
import ViewApplicationModal from './modal/ViewApplicationModal';
import { MdDashboard, MdNoteAdd, MdAutorenew, MdCheckCircle, MdPendingActions, MdVerified} from 'react-icons/md';
import { FiKey, FiEdit, FiSave, FiX  } from "react-icons/fi"; 






const colors = {
  darkGreen: '#003300',
  lightGreen: '#004d00',
  yellowGold: '#FFD700',
  black: '#000000',
};

const DisplayPage = ({onLogout}) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState(() => {
  return localStorage.getItem('selectedView') || 'dashboard'; // default to dashboard if nothing saved
});
  const [approvedIds, setApprovedIds] = useState(JSON.parse(localStorage.getItem('approvedApplications')) || []);
  const [disapprovedIds, setDisapprovedIds] = useState(JSON.parse(localStorage.getItem('disapprovedApplications')) || []);
  const [approvalSuccess, setApprovalSuccess] = useState(false);
  const [disapprovalSuccess, setDisapprovalSuccess] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureImg, setSignatureImg] = useState(null);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [renewals, setRenewals] = useState([]);
  const [selectedRenewal, setSelectedRenewal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userPosition, setUserPosition] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ username: "", email: "" });





  const navigate = useNavigate();
  const menuRef = useRef();
  const inputRef = useRef(null);
  const signaturePadRef = useRef();


const refreshPage = () => {
  window.location.reload();
};


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
      id: currentUser.id,          // ✅ include ID
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
  localStorage.setItem('selectedView', view); // save to localStorage whenever view changes
}, [view]);

const handleEditSignature = () => {
  setShowSignatureModal(true);
  setTimeout(() => {
    if (signaturePadRef.current && signatureImg) {
      const canvas = signaturePadRef.current.getCanvas();
      const ctx = canvas.getContext('2d');
      const image = new Image();
      image.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // clear before loading
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
      image.src = signatureImg;
    }
  }, 200); // Give time for modal to render
};

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

      setCurrentUser(res.data);
      console.log(res.data)

      setUserPosition(res.data.profile?.position);
      



      const signature = res.data.profile?.signature;
      if (signature) {
        const fullURL = `http://localhost:8000${signature}`;
        setSignatureImg(fullURL);
        
      }

    } catch (err) {
      if (err.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          localStorage.setItem("access", newToken);

          try {
            const retryRes = await axios.get('http://localhost:8000/api/current-user/', {
              headers: { Authorization: `Bearer ${newToken}` },
            });

            setCurrentUser(retryRes.data);
            setUserPosition(retryRes.data.profile?.position);

            const signature = retryRes.data.profile?.signature;
            if (signature) {
              const fullURL = `http://localhost:8000${signature}`;
              setSignatureImg(fullURL);
              
            }
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





const handleSaveSignature = async (base64Signature) => {
  try {
    const response = await fetch('http://localhost:8000/api/save-signature/', {
      method: 'POST',
      
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access')}`
        
      },
      
      body: JSON.stringify({ signature: base64Signature })
    });

    if (response.ok) {
      const result = await response.json();

      if (result.signature_url) {
        const fullURL = `http://localhost:8000${result.signature_url}?t=${Date.now()}`; // cache busting
        setSignatureImg(fullURL);
      }

      setShowSignatureModal(false);
      console.log('✅ Signature saved and updated.');
    } else {
      console.error('❌ Failed to save signature');
    }
  } catch (err) {
    console.error('❌ Error saving signature:', err);
  }
};




useEffect(() => {
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setMenuOpen(false);
    }
  };

  if (menuOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  } else {
    document.removeEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [menuOpen]);

const fetchApplications = async () => {
    try {
      let token = localStorage.getItem('access');
      const res = await axios.get('http://localhost:8000/api/applications/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data);
      console.log("data", res.data)
    } catch (err) {
      if (err.response && err.response.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          try {
            const retryRes = await axios.get('http://localhost:8000/api/applications/', {
              headers: { Authorization: `Bearer ${newToken}` }
            });
            setApplications(retryRes.data);
          } catch (retryErr) {
            setError('Could not fetch applications after retry.');
          }
        } else {
          setError('Session expired. Please log in again.');
        }
      } else {
        setError('Could not fetch applications.');
      }
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  
  fetchApplications();
}, []);

useEffect(() => {
  const fetchRenewals = async () => {
    try {
      let token = localStorage.getItem('access');
      const res = await axios.get('http://localhost:8000/api/renewal/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRenewals(res.data);
      console.log(res.data)

    } catch (err) {
      if (err.response && err.response.status === 401) {
        const newToken = await refreshAccessToken(); // assumes this function is available
        if (newToken) {
          try {
            const retryRes = await axios.get('http://localhost:8000/api/renewal/', {
              headers: { Authorization: `Bearer ${newToken}` },
            });
            setRenewals(retryRes.data);
          } catch (retryErr) {
            console.error('Retry failed:', retryErr);
          }
        } else {
          console.error('Session expired. Please log in again.');
        }
      } else {
        console.error('Fetch error:', err);
      }
    }
  };

  fetchRenewals();
}, []);

const handleApprove = async (id) => {
  try {
    const token = localStorage.getItem('access');
    await axios.put(
      `http://localhost:8000/api/renewal/${id}/approve/`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error("Approval failed:", error);
  }
};

const handleClientApprove = async (id) => {
  try {
    const token = localStorage.getItem('access');
    await axios.post(
      `http://localhost:8000/api/renewal/${id}/client2_approve/`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error("Approval failed:", error);
  }
};


  // Reusable hoverable menu item
const MenuItem = ({ icon, text, onClick }) => (
  <div
    onClick={onClick}
    onMouseEnter={() => setHovered(text)}
    onMouseLeave={() => setHovered(null)}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 20px',
      cursor: 'pointer',
      color: hovered === text ? 'white' : colors.black,
      backgroundColor: hovered === text ? '#065f46' : 'transparent',
      transition: 'all 0.7s ease',
    }}
  >
    {icon} {text}
  </div>
);




  // Add source flag and normalize `is_renewal` for each item before combining
  const normalizedApplications = applications.map(app => ({
    ...app,
    is_renewal: false,  // Assuming all Applications are new
    type: 'application',
  }));

  const normalizedRenewals = renewals.map(renewal => ({
    ...renewal,
    is_renewal: true,
    type: 'renewal',
  }));

  // Combine both arrays
const combinedData = [...normalizedApplications, ...normalizedRenewals].filter(item => {
  
  if (userPosition === 'personnel1') {
    // Exclude disapproved items
    return item.is_disapproved !== true;
  } else if (userPosition === 'personnel2') {
    // Include applications approved by personnel1
    const approvedApplication = item.is_approved === true;

    // Include renewals checked by personnel1
    const approvedRenewal = item.is_checked === true;

    return approvedApplication || approvedRenewal;
  
  } else {
    // Unknown position — exclude everything
    return false;
  }
  
});

  

  const selectedDateStr = selectedDate.toDateString();


  // Filter by selected date
  const filteredCombined = combinedData.filter(item => {
    const itemDate = new Date(item.created_at).toDateString();
    return itemDate === selectedDateStr;
  });

  // Total combined entries on selected date
  const totalSubmitted = combinedData.length;

// Count by type

  const newCount = filteredCombined.filter(item => item.is_renewal === false).length;
  const renewalCount = filteredCombined.filter(item => item.is_renewal === true).length;

  const combineData = [
  // Application filter by userPosition
  ...applications
    .filter((app) => {
      if (userPosition === 'personnel1') {
        return app.is_approved === true;
      } else if (userPosition === 'personnel2') {
        return app.is_client2_approved === true;
      }
      return false;
    })
    .map((app) => ({
      id: app.id,
      full_name: app.name,
      address: app.address,
      type: app.is_renewal ? 'Renewal' : 'New',
      status: app.status,
      approved_at: userPosition === 'peronnel1' ?  app.approved_time : app.client2_approved_time,

    })),

  // Renewal filter by userPosition
  ...renewals
    .filter((renew) => {
      if (userPosition === 'personnel1') {
        return renew.is_checked === true;
      } else if (userPosition === 'personnel2') {
        return renew.client2_approved === true ;
      }
      return false;
    })
    .map((renew) => ({
      id: renew.id,
      full_name: renew.full_name,
      address: renew.address,
      type: 'Renewal',
      status: renew.status,
      approved_at: userPosition === 'personnel1' ? renew.checked_at : renew.approved_at,
    })),
];

const checkedRenewals = renewals.filter((r) => r.is_checked === true);


  const getClientName = async () => {
  try {
    let token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:8000/api/get-users/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = res.data[0];
    return `${user.first_name} ${user.last_name}`;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        const retryRes = await axios.get('http://localhost:8000/api/get-users/', {
          headers: { Authorization: `Bearer ${newToken}` },
        });
        const user = retryRes.data[0];
        return `${user.first_name} ${user.last_name}`;
      }
    }
    console.error('Error fetching user info:', err);
    return 'Unknown User';
  }
};



  const approveApplication = async (id) => {
  try {
    const clientName = await getClientName();
    let token = localStorage.getItem('token');

    await axios.post(`http://localhost:8000/api/application/${id}/approve/`, {
      checked_by: clientName,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setApprovedIds(prev => {
      const updated = [...prev, id];
      localStorage.setItem('approvedApplications', JSON.stringify(updated));
      return updated;
    });

    setApprovalSuccess(true);
    setTimeout(() => setApprovalSuccess(false), 2000);
  } catch (err) {
    if (err.response && err.response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        const clientName = await getClientName();
        await axios.post(`http://localhost:8000/api/application/${id}/approve/`, {
          checked_by: clientName,
        }, {
          headers: { Authorization: `Bearer ${newToken}` },
        });

        setApprovedIds(prev => {
          const updated = [...prev, id];
          localStorage.setItem('approvedApplications', JSON.stringify(updated));
          return updated;
        });

        setApprovalSuccess(true);
        setTimeout(() => setApprovalSuccess(false), 2000);
      }
    }
  }
};


  const disapproveApplication = async (id) => {
  try {
    const clientName = await getClientName();
    let token = localStorage.getItem('token');

    await axios.post(`http://localhost:8000/api/application/${id}/disapprove/`, {
      disapproved_by: clientName,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setDisapprovedIds(prev => {
      const updated = [...prev, id];
      localStorage.setItem('disapprovedApplications', JSON.stringify(updated));
      return updated;
    });

    setDisapprovalSuccess(true);
    setTimeout(() => setDisapprovalSuccess(false), 2000);
  } catch (err) {
    if (err.response && err.response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        const clientName = await getClientName();
        await axios.post(`http://localhost:8000/api/application/${id}/disapprove/`, {
          disapproved_by: clientName,
        }, {
          headers: { Authorization: `Bearer ${newToken}` },
        });

        setDisapprovedIds(prev => {
          const updated = [...prev, id];
          localStorage.setItem('disapprovedApplications', JSON.stringify(updated));
          return updated;
        });

        setDisapprovalSuccess(true);
        setTimeout(() => setDisapprovalSuccess(false), 2000);
      }
    }
  }
};


  const filtered = applications.filter(app => {
  if (view === 'dashboard') {
    return true; // show all applications for dashboard
  } else if (view === 'pending') {
    // Conditional logic based on full_name
    if (userPosition === 'personnel1') {
      return app.status === 'Checking Application';
    } else if (userPosition  === 'personnel2') {
      return app.status === 'Waiting Approval';
    } else {
      return false; // No apps shown for other users
    }

  } else if (view === 'approved') {
    return approvedIds.includes(app.id);
  } else if (view === 'renewals') {
    return app.app_type === 'Renewal';
  }

  return false;
});


  const confirmLogout = () => {
  setShowLogoutModal(true); // show confirmation modal
};

    const handleLogout = () => {
      localStorage.removeItem('refresh');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('authRole');
      localStorage.removeItem('selectedView');
  // Optional: clear token and sessionStorage
      localStorage.removeItem("token");
      sessionStorage.clear(); 
      localStorage.clear();
      if (onLogout) {

        onLogout();
        navigate("/");
        window.location.reload();
      }
    };
  const handleIconClick = () => {
  inputRef.current?.showPicker(); // Open the native date picker
};
  const handleView = (item) => {
    setSelectedRenewal(item);
    setShowSuccessModal(false);
    setIsModalOpen(true);
  };



  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Arial, sans-serif', padding: '0 30px'}}>
        <div style={{display: 'flex', gap: '15px', alignItems: 'center', padding: '10px', borderRadius: '5px'}}>
          <span onClick={() => setMenuOpen(!menuOpen)} style={{ cursor: 'pointer', fontSize: '35px', marginLeft: '10px', color: '#065f46' }}>☰</span>
          <h2 style={{ color: '#065f46', margin: 0 }}>
  {userPosition === 'personnel2' ? 'Approval Dashboard' : 'Checker Dashboard'}
</h2>

          
          <>
  {/* Backdrop Overlay */}
  <div
    onClick={() => setMenuOpen(false)}
    style={{
      display: menuOpen ? 'block' : 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: '100vw',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      zIndex: 999,
    }}
  />
  

  {/* Slide-Down Floating Menu */}
  <div style={{
    position: 'absolute',
    top: '60px',
    left: '20px',
    backgroundColor: 'white',
    color: colors.black,
    border: `1px solid ${colors.darkGreen}`,
    borderRadius: '8px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    width: '200px',
    padding: '10px 0',
    opacity: menuOpen ? 1 : 0,
    transform: menuOpen ? 'translateY(0)' : 'translateY(-10px)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    pointerEvents: menuOpen ? 'auto' : 'none',
  }}>
    {/* Optional Close Button */}
    <div
      onClick={() => setMenuOpen(false)}
      style={{
        textAlign: 'right',
        padding: '0 15px',
        cursor: 'pointer',
        color: '#888',
        fontSize: '18px',
        marginBottom: '8px',
      }}
    >
      ❌
    </div>

    {/* Menu Items */}
    <MenuItem icon={<FaSignOutAlt />} text="Logout" onClick={confirmLogout} />
    <MenuItem icon={<FaFileAlt />} text="Report" onClick={() => setShowReportModal(true)} />
    <MenuItem icon={<FaBook />} text="Guidelines" onClick={() => setShowGuidelinesModal(true)} />


  </div>
</>


        </div>
        {/* Minimalist Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px'}}>
  {/* Left: User Info */}
  <div style={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: '#f9f9f9',
  borderRadius: '10px',
  padding: '15px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  width: '180px'
}}>
  <FaUserCircle size={70} color="#065f46" style={{ marginBottom: '10px' }} />

  <h4 style={{ margin: '0', fontSize: '16px', color: '#333', textAlign: 'center' }}>
    <strong>{userPosition === 'personnel1' ? 'Mr. Richard J. Sales' : 'Nonalyn D. Tombocon' }</strong>
  </h4>
  <p style={{ fontSize: '12px', color: '#065f46', marginTop: '4px', textAlign: 'center' }}>
    {userPosition === 'personnel1' ? 'Chief, Security Service' : 'Director, Production & Commercialization'}
  </p>
</div>

  {/* Center: Header Information */}
  <div style={{ textAlign: 'center', flexGrow: 1, color: '#1f2937' }}>
    <img src={logo} alt="Logo" style={{ width: '80px', marginBottom: '5px' }} />
    <h2 style={{ margin: '2px 0' }}>DEBESMSCAT</h2>
    <h5 style={{ margin: '2px 0' }}>PRODUCTION AND COMMERCIALIZATION</h5>
    <p style={{ margin: '2px 0' }}>Cabitan, Mandaon, Masbate</p>
    <h5 style={{ margin: '2px 0', color: '#065f46' }}>www.debesmscat.edu.ph</h5>
    <h5 style={{ margin: '2px 0' }}>(DEBESMSCAT Vehicle Pass)</h5>
  </div>

  {/* Right Spacer (optional for layout balance) */}
  <div style={{ width: '120px' }}></div>
</div>
        
        
    
      {/* Top Menu */}
 
      

      <div style={{ display: 'flex', flex: 1, flexWrap: 'wrap', border: '1px solid #065f46', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'}}>
        
        {/* Sidebar */}
        <div style={{ minWidth: '200px', backgroundColor: colors.white, color: 'white', padding: '20px', flex: '0 0 200px' }}>
        <h3 style={{ marginBottom: '10px', color: '#065f46' }}>Request Management</h3>

        <button onClick={() => setView('dashboard')} style={getSidebarButtonStyle(view === 'dashboard')}>
            Request Dashboard
        </button>
        <div style={{ position: 'relative' }}>
         <button
    onClick={() => setView('pending')}
    style={getSidebarButtonStyle(view === 'pending')}
  >
    New Request Application
  </button>
{applications.filter(app => {
  if (userPosition === 'personnel1') {
    return !app.is_approved && !app.is_disapproved;
  } else if (userPosition === 'personnel2') {
 
    return app.status === 'Waiting Approval';
  }
  return false;
}).length > 0 && view !== 'pending' && (
    <span
      style={{
        position: 'absolute',
        top: '6px',
        right: '8px',
        width: '8px',
        height: '8px',
        backgroundColor: 'red',
        borderRadius: '50%',
      }}
    />
    
  )}
  

  </div>
  
        <div style={{ position: 'relative' }}>
  <button
    onClick={() => setView('renewal')}
    style={getSidebarButtonStyle(view === 'renewal')}
  >
    Renewal Request
  </button>
{renewals.filter(r => {
  if (userPosition === 'personnel1') {
    return !r.is_checked && !r.is_disapproved;
  } else if (userPosition === 'personnel2') {
    return !r.client2_approved;
  }
  return false;
}).length > 0 && view !== 'renewal' && (
    <span
      style={{
        position: 'absolute',
        top: '6px',
        right: '8px',
        width: '8px',
        height: '8px',
        backgroundColor: 'red',
        borderRadius: '50%',
      }}
    />
  )}
</div>
        <button onClick={() => setView('approved')} style={getSidebarButtonStyle(view === 'approved')}>
            Approved Application
        </button>
        </div>


        {/* Main Content */}



{/* Main Content Area */}
<div style={{ flex: 1, backgroundColor: '#f4f4f4', padding: '20px', overflowY: 'auto', maxHeight: '500px' }}>
  {view === 'dashboard' && (
    <div style={{ padding: '20px' }}>
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={headerh3Style}>
  <MdDashboard size={24} />
  Request Dashboard
</h3>

        <div style={totalStyle}>
        Total Submitted: <strong style={totaldataStyle}>{totalSubmitted}</strong>
        </div>
      </div>

      {/* Submit Today Box */}
    <div
  style={{
    display: 'flex',
    gap: '30px',
    alignItems: 'flex-start',
    padding: '10px',
    backgroundColor: '#f4f4f4',
  }}
>
  {/* Left: Today's Submission Summary */}
 <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '30px 25px',
        width: '420px',
        maxWidth: '100%',
      }}
    >
      {/* Date Header */}
   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'Cambria' }}>
      <h2 style={{ fontSize: '20px', color: '#555', margin: 0, fontWeight: 'bold' }}>
        As of{' '}
        <strong style={{ color: '#111' }}>
          {selectedDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </strong>
      </h2>

      {/* Calendar Icon */}
      <FaCalendarDays
        size={20}
        color="#333"
        style={{ cursor: 'pointer' }}
        onClick={handleIconClick}
        title="Select Date"
      />

      {/* Hidden Date Picker */}
      <input
        ref={inputRef}
        type="date"
        value={selectedDate.toISOString().split('T')[0]}
        onChange={(e) => setSelectedDate(new Date(e.target.value))}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
    </div>


      {/* Request Summary */}
      <h3
        style={{
          marginBottom: '25px',
          fontSize: '22px',
          color: '#065f46',
          fontWeight: '600',
          borderBottom: '2px solid #eee',
          paddingBottom: '10px',
          fontFamily: 'sans-serif',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        }}
      >
        <i className="fa-solid fa-calendar-day" style={{ marginRight: '8px' }}></i>
        Request Summary:
      </h3>

  {/* Count Rows */}
{(() => {
  const todayStr = selectedDate.toDateString();

  // Normalize both arrays
  const normalizedApplications = applications.map(app => ({
    ...app,
    is_renewal: false,
    type: 'application',
    date_to_compare: userPosition === 'personnel1' ? app.created_at : app.person2_received_at
  }));

  const normalizedRenewals = renewals.map(renewal => ({
    ...renewal,
    is_renewal: true,
    type: 'renewal',
    date_to_compare: userPosition === 'personnel1' ? renewal.created_at : renewal.checked_at
  }));

  const combined = [...normalizedApplications, ...normalizedRenewals];

  // Filter entries by selected date (based on userPosition)
  const todayItems = combined.filter(item =>
    new Date(item.date_to_compare).toDateString() === todayStr
  );

  const totalToday = todayItems.length;
  const newCount = todayItems.filter(item => item.type === 'application' && !item.is_renewal).length;
  const renewalCount = todayItems.filter(item => item.type === 'renewal' && item.is_renewal).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {/* Total Requests */}
      <div
        style={{
          backgroundColor: '#f5ffeaff',
          padding: '15px',
          borderRadius: '10px',
          textAlign: 'center',
          borderBottom: '2px solid #eee'
        }}
      >
        <div style={{ fontSize: '20px', color: '#065f46', fontWeight: 'bold' }}>Total Requests Today:</div><br />
        <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#222' }}>{totalToday}</div>
      </div>

      {/* Breakdown */}
      <div style={{ display: 'flex', gap: '15px' }}>
        {/* New Applications */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#f6f8fc',
            padding: '18px',
            borderRadius: '10px',
            textAlign: 'center',
            borderBottom: '2px solid #065f46',
          }}
        >
          <div style={{ fontSize: '16px', color: '#065f46', marginBottom: '3px', fontWeight: 'bold' }}>New</div>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#222' }}>{newCount}</div>
        </div>

        {/* Renewals */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#f6f8fc',
            padding: '18px',
            borderRadius: '10px',
            textAlign: 'center',
            borderBottom: '2px solid #065f46'
          }}
        >
          <div style={{ fontSize: '16px', color: '#065f46', marginBottom: '3px', fontWeight: 'bold' }}>Renewals</div>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#222' }}>{renewalCount}</div>
        </div>
      </div>
    </div>
  );
})()}


</div>


  {/* Right: Overall Application Status Summary */}
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '30px',
      flex: 1,
    }}
  >
    <div style={cardStyle}>
      <h4 style={cardTitle}>Approved </h4>
      
      <p style={cardValue}> < MdVerified size={25} color='#065f46' />
        
        { userPosition === 'personnel1'
      ? applications.filter(app => app.is_approved === true).length +
        renewals.filter(renewal => renewal.is_checked === true).length
      : userPosition === 'personnel2'
        ? applications.filter(app => app.is_client2_approved === true).length +
          renewals.filter(renewal => renewal.client2_approved === true).length
        : 0    }
      </p>
    </div>

   <div style={cardStyle}>
  <h4 style={cardTitle}>Pending</h4>
  <p style={cardValue}><MdPendingActions size={25} color='#065f46'/>  
    {
      userPosition === 'personnel1'
      ? applications.filter(app => app.status === 'Checking Application').length +
        renewals.filter(renewal => renewal.status === 'Checking Renewal' ).length
      : userPosition === 'personnel2'
        ? applications.filter(app =>  app.status === 'Waiting Approval').length +
          renewals.filter(renewal => renewal.status === 'Waiting Approval').length
        : 0  
   
    }
  </p>
</div>


    <div style={cardStyle}>
      <h4 style={cardTitle}>Total Renewals</h4>
      <p style={cardValue}>  <MdAutorenew size={25} color='#065f46'/>
        { renewals.filter(renewal => {
  if (userPosition === 'personnel1') {
    return renewal.status === 'Checking Renewal';
  } else if (userPosition === 'personnel2') {
    return renewal.status === 'Waiting Approval';
  }
  return false;
}).length
}
      </p>
    </div>

    <div style={cardStyle}>
      <h4 style={cardTitle}>Total New Applications</h4>
      <p style={cardValue}> <MdNoteAdd size={25} color='#065f46' /> 
        {applications.filter(app => {
  if (userPosition === 'personnel1') {
    return app.status === 'Checking Application';
  } else if (userPosition === 'personnel2') {
    return app.status === 'Waiting Approval';
  }
  return false; // For other positions, return nothing
}).length
 }
      </p>
    </div>
  </div>
</div>

    </div>
  )}



  {view === 'pending' && (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ 
  display: 'flex', 
  alignItems: 'center',
  background: '#f4f4f4', 
  padding: '10px', 
  paddingBottom: '5px', 
  justifyContent: 'space-between' 
}}>
  <h3 style={headerh3Style}>
  <MdNoteAdd size={24} /> New Request Application</h3>
  <p style={totalStyle}>Total Request: <strong style={totaldataStyle}>{filtered.length}</strong></p>
</div>

      <div style={{ flex: '1 1 auto', overflowY: 'auto', padding: '10px' }}>
        {filtered.length === 0 ? (
          <p>There has no application request for this time.</p>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '0px' }}>
  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px', padding: '10px' }}>
    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 1}}>
      <tr>
        <th style={tableHeaderStyle}>Profile</th>
        <th style={tableHeaderStyle}>Name</th>
        <th style={tableHeaderStyle}>Email</th>
        <th style={tableHeaderStyle}>Date</th>
        <th style={tableHeaderStyle}>Time</th>
        <th style={tableHeaderStyle}>Purpose</th>
        <th style={tableHeaderStyle}>Actions</th>
      </tr>
    </thead>
    <tbody>
      {filtered.length === 0 ? (
        <tr>
          <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#555' }}>
            There has no application request for this time.
          </td>
        </tr>
      ) : (
        filtered.map((app, index) => {
          const dateField = userPosition === 'personnel1' 
          ? app.created_at 
          : app.person2_received_at;

        const submittedDate = new Date(dateField);

        const formattedDate = submittedDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const formattedTime = submittedDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });

          return (
            <tr key={app.id}
            onClick={() => {
  setSelectedApplication(app);
  setShowModal(true); // This opens the modal
}}

  style={{
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    borderLeft: '4px solid transparent',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = '#eaffedff';
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';

  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'white';
    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';

  }}
>
              
              <td style={tableCellStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <img
                      src={`http://localhost:8000${app.picture_id}`}
                    alt="Profile"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid #ccc',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                </div>
              </td>
              <td style={tableCellStyle}>{app.name}</td>
              <td style={tableCellStyle}>{app.user_email}</td>
              <td style={tableCellStyle}>{formattedDate}</td>
              <td style={tableCellStyle}>{formattedTime}</td>
              <td style={tableCellStyle}>
                <span style={{
                  color: '#065f46',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '15px'
                }}>
                  Requesting for checking
                </span>
              </td>
              <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  
                <button
                onClick={() => navigate(`/form-view/${app.id}`)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#065f46';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.color = '#065f46';
                }}
                style={{
                  padding: '7px 10px',
                  fontSize: '13px',
                  backgroundColor: '#f3f4f6',
                  border: '0.5px solid #065f46',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  color: '#065f46',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                View as Form
              </button>

                </div>
              </td>
            </tr>
          );
        })
      )}
    </tbody>
  </table>
</div>




        )}
      </div>
    </div>
  )}{view === 'renewal' && (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center',
      background: '#f4f4f4', 
      padding: '10px', 
      paddingBottom: '5px', 
      justifyContent: 'space-between' 
    }}>
      <h3 style={headerh3Style}>
        <MdAutorenew size={24} /> Renewal Request Application
      </h3>
      <p style={totalStyle}>
        Total Request: <strong style={totaldataStyle}>
          {renewals.filter(renewal => {
              if (userPosition === 'personnel1') {
                return renewal.status === 'Checking Renewal';
              } else if (userPosition === 'personnel2') {
                return renewal.status === 'Waiting Approval';
              }
              return false;
            }).length}
        </strong>
      </p>
    </div>

    <div style={{ flex: '1 1 auto', overflowY: 'auto', padding: '10px' }}>

      {renewals.filter(item => {
  if (userPosition === 'personnel1') {
    return item.status === 'Checking Renewal';
  } else if (userPosition === 'personnel2') {
    return item.status === 'Waiting Approval';
  }
  return false;
})
.length === 0 ? (
        <p>There is no renewal request at this time.</p>
      ) : (
        <div style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '0px' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 1 }}>
              <tr>
                <th style={tableHeaderStyle}>Profile</th>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>Email</th>
                <th style={tableHeaderStyle}>Date</th>
                <th style={tableHeaderStyle}>Time</th>
                <th style={tableHeaderStyle}>Purpose</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {renewals.filter(item => {
  if (userPosition === 'personnel1') {
    return item.status === 'Checking Renewal';
  } else if (userPosition === 'personnel2') {
    return item.status === 'Waiting Approval';
  }
  return false;
})
                .map((item, index) => {
  const dateField = userPosition === 'personnel1' 
    ? item.created_at 
    : item.checked_at;

  const submittedDate = new Date(dateField);

  const formattedDate = submittedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = submittedDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
                  return (
                    <tr
                      key={index}
                      onClick={() => handleView(item)}
                      style={{
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        borderLeft: '4px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#eaffedff';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                      }}
                    >
                      <td style={tableCellStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <img
                      src={
      item.picture_id.startsWith('http')
        ? item.picture_id
        : `http://localhost:8000${item.picture_id}`
    }
                    alt="Profile"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid #ccc',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                </div>
              </td>
                      <td style={tableCellStyle}>{item.full_name || 'N/A'}</td>
                      <td style={tableCellStyle}>{item.user_email || 'N/A'}</td>
                      <td style={tableCellStyle}>{formattedDate}</td>
                      <td style={tableCellStyle}>{formattedTime}</td>
                      <td style={tableCellStyle}>
                        <span style={{
                          color: '#065f46',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontWeight: 'bold',
                          fontSize: '15px'
                        }}>
                          Renewal Request
                        </span>
                      </td>
                      <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                        <button
                            onClick={() => {
                          navigate(`/form-view/${item.id}`);
                          refreshAccessToken(); // refresh after navigating
                        }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#065f46';
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#f3f4f6';
                            e.target.style.color = '#065f46';
                          }}
                          style={{
                            padding: '7px 10px',
                            fontSize: '13px',
                            backgroundColor: '#f3f4f6',
                            border: '0.5px solid #065f46',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            color: '#065f46',
                            fontWeight: 'bold',
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          View as Form
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
)}

    
 
 {view === 'approved' && (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center',
      background: '#f4f4f4', 
      padding: '10px', 
      paddingBottom: '5px', 
      justifyContent: 'space-between' 
    }}>
      <h3 style={headerh3Style}>
        <MdCheckCircle size={24}/> Approved Applications
      </h3>
      <p style={totalStyle}>
        Total Checked: <strong style={totaldataStyle}>
  {
    userPosition === 'personnel1'
      ? applications.filter(app => app.is_approved === true).length +
        renewals.filter(renewal => renewal.is_checked === true).length
      : userPosition === 'personnel2'
        ? applications.filter(app => app.is_client2_approved === true).length +
          renewals.filter(renewal => renewal.client2_approved === true).length
        : 0
  }
</strong>

      </p>
    </div>

    <div style={{ flex: '1 1 auto', overflowY: 'auto', padding: '10px' }}>
      {combineData.length === 0 ? (
        <p>There are no approved applications at this time.</p>
      ) : (
        <div style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '0px' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px', padding: '10px' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 1 }}>
              <tr>
                <th style={tableHeaderStyle}>No.</th>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>Address</th>
                <th style={tableHeaderStyle}>Type</th>
                <th style={tableHeaderStyle}>Date Approved</th>
                <th style={tableHeaderStyle}>Time Approved</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {combineData.map((item, index) => {
                const dateObj = new Date(item.approved_at);
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });
                const formattedTime = dateObj.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                });

                return (
                  <tr key={index}
                    style={{
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e7f8ef';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                    }}
                  >
                    <td style={tableCellStyle}>{index + 1}</td>
                    <td style={tableCellStyle}>{item.full_name || 'N/A'}</td>
                    <td style={tableCellStyle}>{item.address || 'N/A'}</td>
                    <td style={tableCellStyle}>{item.type}</td>
                    <td style={tableCellStyle}>{formattedDate}</td>
                    <td style={tableCellStyle}>{formattedTime}</td>
                    <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                      <FaCheckCircle style={{ color: 'green', marginRight: '8px' }} />
                      <button
                         onClick={() => {
                          navigate(`/form-view/${item.id}`);
                          refreshAccessToken(); // refresh after navigating
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#065f46';
                          e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#f3f4f6';
                          e.target.style.color = '#065f46';
                        }}
                        style={{
                          padding: '7px 10px',
                          fontSize: '13px',
                          backgroundColor: '#f3f4f6',
                          border: '0.5px solid #065f46',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          color: '#065f46',
                          fontWeight: 'bold',
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        View as Form
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
)}

</div>


        {/* E-signature Panel */}
       <div
      style={{
        minWidth: '250px',
        backgroundColor: colors.white,
        color: colors.black,
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      <div style={{ marginBottom: '12px', fontWeight: '600', fontSize: '14px' }}>
        <FaSignature size={25}/> Your E-signature
      </div>
<div
  style={{
    backgroundColor: '#f9f9f9',
    height: '100px',
    borderRadius: '8px',
    border: '1px dashed #ccc',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  }}
>
  {signatureImg ? (
    <img
      src={signatureImg}
      alt="E-signature"
      style={{ maxHeight: '80px' }}
      onError={() => setSignatureImg(null)}
    />
  ) : (
    <span style={{ color: '#aaa', fontSize: '13px' }}>No signature yet</span>
  )}
</div>





       <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          marginTop: '12px',
        }}
      >
        <div
          onClick={() => setShowSignatureModal(true)}
          style={{
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '4px',
            transition: 'background 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#eee')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          title={signatureImg ? 'Edit Signature' : 'Add Signature'}
        >
          <span>{signatureImg ? <FaPen size={18} color="#444" /> : <FaPlus size={18} color="#444" />}{signatureImg ? 'Edit' : 'Add'} </span>
        </div>
      </div>
      <div
      style={{
        borderRadius: "10px",
        padding: "5px",
        maxWidth: "400px",
        margin: "auto",
       
      }}
    >
      <h3 style={{ marginBottom: "15px" }}><FaUserCircle style={{marginRight: '5px'}} />My Profile</h3>
       <div style={{ padding: "20px 0px", maxWidth: "200px" }}>
      {currentUser ? (
        <>
          <div style={{ marginBottom: "20px" }}>
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
      style={{ padding: "8px", width: "100%", borderRadius: "5px", border: "1px solid #ccc", border: "1px solid #065f46",  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', }}
    />
  ) : (
    <p>{currentUser.username}</p>
  )}
</div>

<div style={{ marginBottom: "20px" }}>
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
      style={{ padding: "8px", width: "100%", borderRadius: "5px", border: "1px solid #ccc",  border: "1px solid #065f46",  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', }}
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
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  border: '1px solid #065f46'
                }}
              >
                <FiEdit style={{ marginRight: "5px" }} />
                Edit
              </button>
            )}
          </div>
        </>
      ) : (
        <p>Loading user...</p>
      )}
    </div>

      <button
        style={{
          marginTop: "5px",
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
        onClick={() => navigate('/forgot-password')}
      >
        <FiKey /> Change Password
      </button>
    </div>

    
    </div>


      </div>
      <LogoutModal
  show={showLogoutModal}
  onCancel={() => setShowLogoutModal(false)}
  onConfirm={handleLogout}
  colors={colors}
/>

{showModal && selectedApplication && (
  <ViewApplicationModal
    application={selectedApplication}
    onClose={() => setShowModal(false)}
    onApprove={fetchApplications}
    onDisapprove={fetchApplications}
    refreshAccessToken={refreshAccessToken}
  />
)}




<ReportModal
  show={showReportModal}
  reason={reportReason}
  message={reportMessage}
  setReason={setReportReason}
  setMessage={setReportMessage}
  onClose={() => setShowReportModal(false)}
  onSubmit={async () => {
    try {
      let token = localStorage.getItem('access'); // JWT token
      if (!reportReason) {
        alert('Please select a reason before submitting.');
        return;
      }

      await axios.post(
        'http://localhost:8000/api/submit-report/',
        { reason: reportReason, message: reportMessage },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Report submitted successfully! Thank you.');
      setReportReason('');
      setReportMessage('');
      setShowReportModal(false);
    } catch (err) {
      console.error('Error submitting report:', err);
      alert('There was a problem submitting your report. Please try again.');
    }
  }}
/>
  {showSignatureModal && (
       <SignatureModal
  onClose={() => setShowSignatureModal(false)}
  onSave={handleSaveSignature}
  defaultSignature={signatureImg}
/>

      )}

<GuidelinesModal 
  show={showGuidelinesModal} 
  onClose={() => setShowGuidelinesModal(false)} 
  colors={colors} 
/>

      <RenewalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        renewal={selectedRenewal}
        handleApprove={handleApprove}
        handleClientApprove={handleClientApprove}
        refreshAccessToken={refreshAccessToken}
      />





    </div>

    
  );
  

};

const cardStyle = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '16px',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
  textAlign: 'left',
  borderBottom: '2px solid #065f46',
  borderRight: '2px solid #065f46',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
};
const headerh3Style = {
  margin: 0,
  display: 'flex', 
  alignItems: 'center', 
  gap: '8px', 
  color: '#065f46', 
  paddingBottom: '3px', 
  borderBottom: '2px solid #065f46' 
}

const cardTitle = {
  fontSize: '18px',
  color: '#065f46',
};

const cardValue = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '5px',
  fontSize: '30px',
  fontWeight: 'bold',
  fontFamily: 'sans-serif',
  color: '#333',
  textAlign: 'right',
  marginBottom: '10px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  marginRight: '20px', 
  
   
  
};



const tableHeaderStyle = {
  padding: '12px',
  textAlign: 'left',
  fontWeight: '600',
  fontSize: '14px',
  borderBottom: '1px solid #065f46',
  color: '#065f46',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
};

const tableCellStyle = {
  padding: '10px',
  fontSize: '15px',
  color: '#333',
  fontFamily: 'Cambria',
  verticalAlign: 'middle',
  fontWeight: 'bold',
};




const getSidebarButtonStyle = (active) => ({
  width: '100%',
  backgroundColor: active ? '#065f46' : 'white',
  color: active ? 'white' : '#065f46',
  padding: '10px',
  border: 'none',
  marginBottom: '10px',
  borderRadius: '5px',
  fontWeight: 'bold',
  border: '1px solid #065f46',
  cursor: 'pointer'
});

const getActionBtnStyle = (color) => ({
  backgroundColor: color,
  color: 'white',
  border: 'none',
  padding: '5px 10px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold'
});

const totalStyle = {
  fontSize: '15px', 
  color: '#065f46', 
  fontWeight: 'bold'
}
const totaldataStyle = {
  color: 'black', 
  fontFamily: 'Cambria', 
  fontSize: '1rem', 
  marginLeft: '5px', 
  padding: '5px 10px', 
  borderRadius: '3px',
  border: '1px solid #065f46',
  background: '#ffffff'
}
const appCardStyle = {
  backgroundColor: 'white',
  padding: '15px',
  borderRadius: '10px',
  marginBottom: '15px',
  border: '1px solid #ccc',
};

const SuccessMessage = ({ text }) => (
  <div style={{ backgroundColor: '#d4edda', padding: '10px', borderRadius: '5px', marginBottom: '10px', color: 'green' }}>
    {text}
  </div>
);

const ErrorMessage = ({ text }) => (
  <div style={{ backgroundColor: '#f8d7da', padding: '10px', borderRadius: '5px', marginBottom: '10px', color: 'darkred' }}>
    {text}
  </div>
);

const menuItemStyle = {
  padding: '12px 20px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  borderBottom: '1px solid #eee',
  fontWeight: '500',
  color: '#333',
  backgroundColor: 'white'
};



export default DisplayPage;
