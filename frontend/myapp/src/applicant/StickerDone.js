import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaFileAlt } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import logo from '../logo.jpg'; // adjust path as needed

const styles = {
  container: {
    backgroundColor: '#fff',
    minHeight: '100vh',
    padding: '30px 20px',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    position: 'relative',
    
  },
    hr: {
    margin: '20px 0',
    border: '1px solid #065f46',
    borderTop: '1px solid #e5e7eb', // subtle light gray line
    width: '100%',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
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
  logo: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    marginBottom: '5px',
  },
  header: {
    fontSize: '22px',
    color: '#065f46',
    margin: '5px 0',
    fontWeight: 'bold',
  },
    subHeader: {
  fontSize: '16px',
  color: '#065f46',
  fontWeight: 'bold',
  margin: '2px 0',
  letterSpacing: '0.5px',
},

subText: {
  fontSize: '17px',
  color: '#475569',
  margin: '5px 0',
  
},
  title: {
    fontSize: '18px',
    color: '#0f172a',
    margin: '20px 0',
  },
    appBox: {
  display: 'flex',
  flexDirection: 'row', 
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  
},
  applicantName: {
    color: '#065f46',
    marginBottom: '8px',
  },
  info: {
    margin: '7px 0',
    color: '#475569',
    fontSize: '15px',
  },
    card: {
    backgroundColor: '#f9fafb',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    padding: '20px',
    marginBottom: '20px',
    textAlign: 'left',
  },
  successMessage: {
  color: '#065f46',
  fontWeight: 'bold',
  fontSize: '16px',
  marginBottom: '8px',
},

note: {
  fontStyle: 'italic',
  color: '#555',
  marginTop: '5px',
},

infoDetail: {
  marginBottom: '4px',
},

approvalInfo: {
  marginTop: '20px',
  padding: '15px',
  backgroundColor: '#ecfdf5',
  borderLeft: '5px solid #065f46',
  borderRadius: '5px',
},

};

async function refreshAccessToken() {
  try {
    const refreshToken = localStorage.getItem('refresh');
    if (!refreshToken) return null;

    const response = await axios.post('http://localhost:8000/api/token/refresh/', {
      refresh: refreshToken,
    });

    localStorage.setItem('token', response.data.access);
    return response.data.access;
  } catch (error) {
    console.error("Failed to refresh token", error);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('isAuthenticated');
    return null;
  }
}

const StickerDone = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvalStatus, setApprovalStatus] = useState({});
  const [disapprovalStatus, setDisapprovalStatus] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);

  
  const fetchApplicationData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8000/api/application/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      console.log("API response:", response.data);
      



      setApplications(response.data);

      // Fetch approval and disapproval status
      const statusMap = {};
      const disapprovalMap = {};
      const statusPromises = response.data.map(async (app) => {
        try {
          const statusResponse = await axios.get(`http://localhost:8000/api/application/${app.id}/approve/`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });

          statusMap[app.id] = statusResponse.data.is_approved;

          const disapprovalResponse = await axios.get(`http://localhost:8000/api/application/${app.id}/disapprove/`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          disapprovalMap[app.id] = disapprovalResponse.data.is_disapproved;
        } catch (error) {
          console.error(`Error fetching status for application ID ${app.id}:`, error.message);
          statusMap[app.id] = false;
          disapprovalMap[app.id] = false;
        }
      });
      await Promise.all(statusPromises);
      setApprovalStatus(statusMap);
      setDisapprovalStatus(disapprovalMap);
    } catch (error) {
        if (error.response && error.response.status === 401) {
          const newAccessToken = await refreshAccessToken();
          if (newAccessToken) {
            await fetchApplicationData(); // Retry after refreshing
          } 
        } else {
          console.error('Error fetching application data:', error.message);
          setError('Failed to fetch applications.');
        }
      } finally {
        setLoading(false);
      }
  };


  useEffect(() => {
    fetchApplicationData();
  }, []);

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/steps')} style={styles.backButton}>
        <FaArrowLeft />
      </button>

      <img src={logo} alt="Logo" style={styles.logo} />
      <h2 style={styles.header}>DEBESMSCAT</h2>
      <h4 style={styles.subHeader}>PRODUCTION AND COMMERCIALIZATION</h4>
      <p style={styles.subText}>Cabitan, Mandaon, Masbate</p>
      <p style={styles.subText}>www.debesmscat.edu.ph</p>
      <p style={styles.subText}>(DEBESMSCAT Vehicle Pass)</p>
      <h3 style={styles.title}>Checking Your Application</h3>

      <hr style={styles.hr} />

      <div style={styles.appBox}>
  {loading ? (
    <p>Loading application data...</p>
  ) : error ? (
    <p style={{ color: 'red' }}>{error}</p>
  ) : applications.length > 0 ? (
    applications.map(application => (
      <div key={application.id} style={styles.card}>
        <img 
          src={application.picture_id} 
          alt="Application ID" 
          style={{
            width: '100px',
            height: '100px',
            objectFit: 'cover',
            borderRadius: '50%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            margin: '10px',
          }} 
        />

        <h2 style={styles.applicantName}>
          Name: {application.name}
        </h2>

        <h4 style={styles.info}>
          Purpose: {application.position} for processing vehicle sticker
        </h4>
        
        <p style={styles.info}>
          <strong>Date & Time Submitted:</strong>{' '}
          {new Date(application.created_at).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </p>

        <p style={styles.info}>
          <strong>Status:</strong> {application.status}
        </p>
        {application.status === "Application Done" && (
  <div style={styles.approvalInfo}>
    <p style={styles.successMessage}><MdVerified size={20} style={{ margin: '0px 10px' }}/>
      Your vehicle sticker application has been successfully completed!
    </p>
    <p style={styles.infoDetail}>
      You may now proceed to download your printable form and temporary sticker.
    </p>
    <p style={styles.note}>
      👉 Click the button below to download the document you need.
    </p>
    <div style={{display: 'flex', gap: '30px'}}>
    <button
      onClick={() => navigate(`/form-view/${application.id}`)}
      style={{
        marginTop: '20px',
        border: '1px solid #065f46',
        backgroundImage: 'linear-gradient(to right, #065f46 50%, white 50%)',
        backgroundSize: '200% 100%',
        backgroundPosition: 'right bottom',
        color: '#065f46',
        padding: '7px 10px',
        borderRadius: '5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: 'bold',
        transition: 'all 0.4s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundPosition = 'left bottom';
        e.currentTarget.style.color = 'white';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundPosition = 'right bottom';
        e.currentTarget.style.color = '#065f46';
      }}
    >
      <FaFileAlt style={{ marginRight: '8px' }} />
      View Form
    </button>
        <button
      onClick={() => navigate(`/temporary-sticker/${application.id}`)}
      style={{
        marginTop: '20px',
        border: '1px solid #065f46',
        backgroundImage: 'linear-gradient(to right, #065f46 50%, white 50%)',
        backgroundSize: '200% 100%',
        backgroundPosition: 'right bottom',
        color: '#065f46',
        padding: '7px 10px',
        borderRadius: '5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: 'bold',
        transition: 'all 0.4s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundPosition = 'left bottom';
        e.currentTarget.style.color = 'white';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundPosition = 'right bottom';
        e.currentTarget.style.color = '#065f46';
      }}
    >
      <FaFileAlt style={{ marginRight: '8px' }} />
      View Temporary Sticker
    </button>
    </div>
  </div>

)}


      </div>
      
    ))
    
  ) : (
    <p>No applications found.</p>
  )}
</div>


    </div>

  );
};

export default StickerDone;
