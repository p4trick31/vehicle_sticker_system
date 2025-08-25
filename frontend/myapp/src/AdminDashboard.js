import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Analytics from './admin/AnalyticsDashboard';
import UserRegistered from './admin/UserRegistered';
import ReportDashboard from './admin/ReportDashboard';
import ReportsGenerated from './admin/ReportsGeneratedDashboard';
import ApplicationList from './admin/ApplicationList';
import { FaSignOutAlt } from 'react-icons/fa';
import { refreshAccessToken  } from './utils/tokenUtils';


const AdminDashboard = ({onLogout}) => {
  const [activePage, setActivePage] = useState('default');
  const [selectedButton, setSelectedButton] = useState(() => {
  return localStorage.getItem('selectedButton') || 'dashboard'; // default
});
  const [hoveredButton, setHoveredButton] = useState(null);
  const [applicationCounts, setApplicationCounts] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hideReportDot, setHideReportDot] = useState(false);
  
  const navigate = useNavigate();

  const handleBackHome = () => {
    if (onLogout) {
        onLogout(); // Call onLogout to reset authentication
        navigate('/'); // Redirect to home
        window.location.reload()
        localStorage.removeItem('selectedButton'); // Clear saved sidebar selection
        localStorage.removeItem('selectedView'); 
    } else {
        console.log("onLogout function is not defined");
        console.log(onLogout); // This will help you see if it's defined
    }
};

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
  localStorage.setItem('selectedButton', selectedButton);
}, [selectedButton]);


  const fetchReports = async () => {
    try {
      let res = await axios.get("http://localhost:8000/api/submit-report/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      setReports(res.data);
      console.log(res.data)
    } catch (err) {
      if (err.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          localStorage.setItem("access", newToken);
          try {
            let retryRes = await axios.get(
              "http://localhost:8000/api/submit-report/",
              { headers: { Authorization: `Bearer ${newToken}` } }
            );
            setReports(retryRes.data);
          } catch (retryErr) {
            console.error("Retry failed:", retryErr);
          }
        }
      } else {
        console.error("Error fetching reports:", err);
      }
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  const fetchApplicationCounts = async () => {
    try {
      let token = localStorage.getItem('access');

      try {
        // Fetch users
        const userResponse = await axios.get('http://localhost:8000/api/get-users/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const users = userResponse.data;
        console.log(token)

        // Fetch applications
        const applicationResponse = await axios.get('http://localhost:8000/api/applications/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const applications = applicationResponse.data;

        const approveApplicationCount = applications.filter(app => app.status === 'Payment Done').length;
        const unpaidApplicationCount = applications.filter(app => app.payment_status === 'unpaid').length;
        const pendingApplicationCount = applications.filter(app => app.app_status === 'Pending').length;
        const allApplicationCount = applications.length;
        const pendingUsersCount = users.filter(user => user.is_staff !== true).length;

        setApplicationCounts({
          user: pendingUsersCount,
          pending: pendingApplicationCount,
          approved: approveApplicationCount,
          list: allApplicationCount,
          inbox: unpaidApplicationCount,
        });

      } catch (err) {
        if (err.response?.status === 401) {
          console.warn("Access token expired. Refreshing...");

          const newToken = await refreshAccessToken();
         

          localStorage.setItem('access', newToken);

          // Retry requests with new token
          const userResponse = await axios.get('http://localhost:8000/api/get-users/', {
            headers: { Authorization: `Bearer ${newToken}` },
          });
          const users = userResponse.data;

          const applicationResponse = await axios.get('http://localhost:8000/api/applications/', {
            headers: { Authorization: `Bearer ${newToken}` },
          });
          const applications = applicationResponse.data;

          const approveApplicationCount = applications.filter(app => app.status === 'Payment Done').length;
          const unpaidApplicationCount = applications.filter(app => app.payment_status === 'unpaid').length;
          const pendingApplicationCount = applications.filter(app => app.app_status === 'Pending').length;
          const allApplicationCount = applications.length;
          const pendingUsersCount = users.filter(user => user.is_staff !== true).length;

          setApplicationCounts({
            user: pendingUsersCount,
            pending: pendingApplicationCount,
            approved: approveApplicationCount,
            list: allApplicationCount,
            inbox: unpaidApplicationCount,
          });
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    }
  };

  fetchApplicationCounts();
}, []);



  const handleButtonClick = (page) => {
    setActivePage(page);
    setSelectedButton(page);
  };

  const renderContent = () => {
  switch (selectedButton) {
    case 'dashboard':
      return <Analytics />;
    case 'user':
      return <UserRegistered />;
    case 'report':
      return <ReportDashboard />;
    case 'rep_generated':
      return <ReportsGenerated />;
    case 'list':
      return <ApplicationList />;
    default:
      return <Analytics />;
  }
};


  return (
   <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
  {/* Sidebar */}
  <div style={{
    width: '250px',
    backgroundColor: '#f4f4f4',
    padding: '20px',
    color: '#333',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
    borderRight: '1px solid #e0e0e0',
    transition: 'all 0.3s ease',
  }}>
    <h2 style={{
      marginBottom: '30px',
      fontSize: '1.4rem',
      borderBottom: '2px solid #222',
      paddingBottom: '8px',
      color: '#222'
    }}>
      Admin Panel
    </h2>

<ul style={{ listStyle: 'none', padding: 0, width: '100%' }}>
  {menuItems.map(({ label, page }) => {
    const isSelected = selectedButton === page;

    const showRedDot = page === 'report' && reports && reports.length > 0;
    console.log(reports.length)

    

    return (
      <li key={page}>
        <button
          style={{
            width: '100%',
            padding: '12px 20px',
            marginBottom: '10px',
            backgroundColor: isSelected ? '#333' : '#fff',
            color: isSelected ? '#fff' : '#333',
            border: '1px solid #ccc',
            borderRadius: '6px',
            textAlign: 'left',
            transition: 'all 0.3s ease',
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: isSelected ? '0 3px 10px rgba(0,0,0,0.1)' : 'none',
          }}
          onClick={() => {
        setSelectedButton(page);  // save which button is selected
        handleButtonClick(page);
        if (page === 'report') {
          setHideReportDot(true); // hide the dot after clicking report
        } else {
          setHideReportDot(false);
        }
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.target.style.backgroundColor = '#eaeaea';
          e.target.style.color = '#000';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.target.style.backgroundColor = '#fff';
          e.target.style.color = '#333';
          
        }
      }}
          
        >
          {label}
           {showRedDot && !hideReportDot && (
          <span style={{
  float: 'right',
  top: '6px',
  right: '6px', // closer to edge
  height: '10px',
  width: '10px',
  backgroundColor: 'red',
  borderRadius: '50%',
  zIndex: 10 // make sure it's on top
}}></span>

        )}
          {applicationCounts[page] !== undefined && (
        <span
  style={{
    float: 'right',
    borderBottom: selectedButton === page ? '2px solid #fff' : '2px solid #333',
    color: selectedButton === page ? '#fff' : '#333',
    borderRadius: '3px',
    padding: '3px 8px',
    fontSize: '0.95rem',
    fontFamily: 'Cambria',
    fontWeight: 'bold',
    transition: 'transform 0.3s ease',
    background: selectedButton === page ? '#333' : '#fff'
  }}
  onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
>
  {applicationCounts[page]}
</span>

          )}
        </button>
      </li>
    );
  })}
</ul>


      <button
        onClick={() => setShowConfirm(true)}
        style={{
          marginTop: 'auto',
          padding: '12px 20px',
          backgroundColor: '#ff4d4f',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.08)',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#cc3c3e'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#ff4d4f'}
      >
        <FaSignOutAlt />
        Logout
      </button>
  </div>
   {showConfirm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px 30px',
            borderRadius: '8px',
            minWidth: '300px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginBottom: '15px' }}>Confirm Logout</h3>
            <p style={{ marginBottom: '20px' }}>
              Are you sure you want to log out?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  padding: '8px 14px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBackHome}
                style={{
                  backgroundColor: '#ff4d4f',
                  color: 'white',
                  padding: '8px 14px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      

      {/* Center display area */}
<div style={{
  flexGrow: 1,
  backgroundColor: '#f8f9fa',
  padding: '20px',
  overflowY: 'auto',


}}>
  {renderContent()}
</div>

      
    </div>
  );
};

const menuItems = [
  { label: 'Analytics', page: 'analytics' },
  { label: 'User Registered', page: 'user' },
  { label: 'Report Message', page: 'report' },
  { label: 'Reports Generated', page: 'rep_generated' },
  { label: 'List of Application', page: 'list' },

];

// Button styles


export default AdminDashboard;
