import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaClock, FaArrowLeft, FaFileAlt, FaSpinner, FaEdit} from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const PendingRenewalPage = () => {
  const [renewals, setRenewals] = useState([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedRenewalId, setSelectedRenewalId] = useState(null);
  const [newPicture, setNewPicture] = useState(null);

  



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
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching pending renewals:', error);
  }
};


  const handleEditClick = (id) => {
    setSelectedRenewalId(id);
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    setNewPicture(e.target.files[0]);
  };

  const handleCancel = () => {
    setShowModal(false);
    setNewPicture(null);
    setSelectedRenewalId(null);
  };

  const handleSave = async () => {
    if (!newPicture || !selectedRenewalId) return;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('picture_id', newPicture);

    try {
      await axios.patch(
        `http://localhost:8000/api/renewal/${selectedRenewalId}/update_picture/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setShowModal(false);
      setNewPicture(null);
      setSelectedRenewalId(null);
      fetchPendingCount(); // Refresh the renewals
    } catch (error) {
      console.error('Error updating picture:', error);
    }
  };


  return (
   
    <div style={{ padding: '40px', textAlign: 'center' }}>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
                <FaArrowLeft />
              </button>
     <div style={{ textAlign: 'center', color: '#1f2937', margin: '10px 0' }}>
          <h4 style={{ margin: '5px 0' }}>Republic of the Philippines</h4>
          <h3 style={{ margin: '5px 0' }}>DR. EMILIO B. ESPINOSA, SR. MEMORIAL</h3>
          <h4 style={{ margin: '5px 0' }}>STATE COLLEGE OF AGRICULTURE AND TECHNOLOGY</h4>
          <h5 style={{ margin: '5px 0' }}>(Masbate State College)</h5>
          <h5 style={{ margin: '5px 0' }}>PRODUCTION AND COMMERCIALIZATION</h5>
          <h5 style={{ margin: '5px 0', color: '#065f46' }}>www.debesmscat.edu.ph</h5>
          <h5 style={{ margin: '5px 0' }}>(DEBESMSCAT Vehicle Pass)</h5>
    </div>
      <h2 style={{ color: '#065f46', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
        <FaClock />
        Pending Renewals
      </h2>
     {renewals.length === 0 ? (
  <p style={{ fontSize: '18px', marginTop: '20px', textAlign: 'center' }}>
    You have no renewal applications yet.
  </p>
) : (

  renewals.map((renewal) => (
    <div key={renewal.id} style={{
      border: '1px solid #ccc',
      borderRadius: '12px',
      padding: '30px',
      margin: '20px auto',
      maxWidth: '700px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      backgroundColor: '#fafafa',
      textAlign: 'left',
      borderBottom: '2px solid #065f46',
      borderRight: '2px solid #065f46'
    }}>
    <h3 style={statusStyle}>Renewal Application Status:</h3>
    <p>Your 2x2 ID photo  {!renewal.is_checked && (
  <FaEdit
    size={18}
    onClick={() => handleEditClick(renewal.id)}
    style={{ cursor: 'pointer' }}
  />
)}
</p>



      <div style={{display: 'flex', textAlign: 'left', marginLeft: '0', alignItems: 'center', marginBottom :'50px'}}>
        
      {/* Picture ID at the top */}
      <div style={photoWrapper}>
              {renewal.picture_id && (
                <img
                  src={renewal.picture_id.startsWith('http') ? renewal.picture_id : `http://localhost:8000${renewal.picture_id}`}
                  alt="Picture ID"
                  style={pictureStyle}
                />
              )}
            </div>
       {showModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Update Picture ID</h3>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {newPicture && (
              <img
                src={URL.createObjectURL(newPicture)}
                alt="Preview"
                style={{ marginTop: '15px', width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
              />
            )}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button onClick={handleSave} style={{ padding: '8px 20px', backgroundColor: '#065f46', color: '#fff', border: 'none', borderRadius: '6px' }}>Save</button>
              <button onClick={handleCancel} style={{ padding: '8px 20px', backgroundColor: '#ccc', color: '#000', border: 'none', borderRadius: '6px' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
       <div style={{marginLeft: '10px'}}>
      {/* Applicant Name */}
      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
      <h3 style={{  margin: 0,
  color: '#065f46', 
  paddingBottom: '3px' }}>Name:</h3>
      <h2 style={{    color: '#333',
    fontFamily: 'Cambria',
    fontWeight: 'bold',
    fontSize: '18px',
    padding: '3px',
    borderBottom: '2px solid #065f46' }}>
        {renewal.full_name || 'Applicant Name'}
      </h2>
      </div>
       <div style={{display: 'flex', flexDirection: 'column'}}>
      {/* Purpose */}
      <h3 style={{ margin: 0,  
  color: '#065f46'}}>Purpose:</h3>
      <p style={{  color: '#333',
    fontFamily: 'Cambria',
    fontWeight: 'bold',
    fontSize: '15px',
    padding: '5px 10px',
    borderLeft: '3px solid #065f46', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'}}>
        Renewal Processing of Vehicle Sticker
      </p>
      </div>
      </div>
      </div>

      {/* Status */}
      <p style={{ fontWeight: 'bold', color: '#065f46', marginBottom: '5px' }}>
        Status: {renewal.status}
      </p>

      {/* Date Submitted */}
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
        Submitted on: {new Date(renewal.created_at).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}
      </p>
       {/* Status Message */}
    {renewal.status === 'Waiting Approval' && (
  <div>
<p style={{ backgroundColor: '#e6f4ea', padding: '10px 15px', borderRadius: '8px', color: '#065f46', marginBottom: '30px'}}><MdVerified size={20} style={{ margin: '0px 10px' }}  />
  Congratulations! Your renewal application has been validated by <strong>{renewal.checked_by}</strong> on{' '}
  {new Date(renewal.checked_at).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })}. Thank you for your patience.
</p>

<p style={{ backgroundColor: '#f3f4e6ff', padding: '10px 15px', borderRadius: '8px', color: '#065f46'}}><FaSpinner size={20} style={{ margin: '0px 10px' }} />

  Hello {renewal.full_name}, your renewal application has now been forwarded to <strong>Ms. Nonalyn D. Tombocon</strong> for final validation. Thank you.
</p>
  </div>
)}
 {renewal.status === 'Checking Renewal' && (
  <div>
    <p style={{ backgroundColor: '#f3f4e6ff', padding: '10px 15px', borderRadius: '8px', color: '#065f46', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', borderLeft: '2px solid #065f46 '}}><FaSpinner size={20} style={{ margin: '0px 10px' }} />
      Hello {renewal.full_name}, your renewal application has been submitted to <strong>Mr. Richard Sales</strong> for initial validation. Thank you.
    </p>
  </div>
 )}

 

      {/* View Form Button */}
      {renewal.status === 'Renewal Done' && (
          <div>
<p style={{ backgroundColor: '#e6f4ea', padding: '10px 15px', borderRadius: '8px', color: '#065f46', marginBottom: '30px' }}><MdVerified size={20} style={{ margin: '0px 10px' }}  />
  Congratulations! Your renewal application has been validated by <strong>{renewal.approved_by}</strong> on{' '}
  {new Date(renewal.approved_at).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })}. Thank you for your patience.
</p>

<p style={{ backgroundColor: '#f3f4e6ff', padding: '10px 15px', borderRadius: '8px', color: '#065f46' }}>
  <MdVerified size={20} style={{ margin: '0px 10px' }}  />
  Hello {renewal.full_name}, your vehicle sticker form is now ready for download. It includes the signatures of the validating officers. Thank you.
<button
      onClick={() => navigate(`/form-view/${renewal.id}`)}
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
          onClick={() => navigate(`/temporary-sticker/${renewal.id}`)}
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
</p>

        
          </div>
      )}
    </div>
  ))
)}

      
    </div>
    
  );
};
const statusStyle = {
  margin: '5px 0',
  display: 'flex',
  gap: '8px',
  color: '#065f46',
  paddingBottom: '3px'
};

const photoWrapper = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '50px'
};

const pictureStyle = {
  width: '120px',
  height: '120px',
  borderRadius: '8px',
  objectFit: 'cover',
  display: 'block',
  margin: '0 5px'
};

const modalOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100vh',
  width: '100vw',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999
};

const modalContent = {
  backgroundColor: '#fff',
  padding: '30px',
  borderRadius: '10px',
  textAlign: 'center',
  width: '400px'
};
const styles = {
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
     header: {
    color: '#065f46',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
  },
  card: {
    marginTop: '20px',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    maxWidth: '600px',
    margin: '20px auto',
    textAlign: 'left',
    backgroundColor: '#f9f9f9',
  },
  viewButton: {
    marginTop: '10px',
    backgroundColor: '#065f46',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
  },
}

export default PendingRenewalPage;
