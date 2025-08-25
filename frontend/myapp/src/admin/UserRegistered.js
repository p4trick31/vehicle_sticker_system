import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUser,   FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';

const UserRegistered = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // or 'edit' or 'delete'
  const [searchQuery, setSearchQuery] = useState('');
  const [editFormData, setEditFormData] = useState({
    id: null, username: '', first_name: '', last_name: '', email: '', password: ''
  });




const openModal = (mode, user = {}) => {
  setModalMode(mode);
  setEditFormData({
    id: user.id || null,
    username: user.username || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    password: ''
  });
  setShowModal(true);
};



  




  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/get-users/', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` },

        });
        setUsers(response.data);
        setFilteredUsers(response.data);
        console.log(response.data)
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = (user) => {
  setSelectedUser(user);
  setEditFormData({
    username: user.username || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    password: '' // Password field is blank for security
  });
  setShowModal(true);
};

const handleCancel = () => {
  setShowModal(false);
  setSelectedUser(null);
};

const handleSave = () => {
  // Send updated form data to backend or perform update here
  console.log('Saving user:', editFormData);
  setShowModal(false);
  window.location.reload()
};

  const clientUsers = users.filter(user => user.is_staff);
  const regularUsers = users.filter(user => !user.is_staff);

const handleSearch = (query) => {
  setSearchQuery(query);
  const lowerQuery = query.toLowerCase();

  const filtered = regularUsers.filter(
    (user) =>
      (user.username?.toLowerCase().includes(lowerQuery) ||
       user.first_name?.toLowerCase().includes(lowerQuery) ||
       user.last_name?.toLowerCase().includes(lowerQuery))
  );
  setFilteredUsers(filtered);
};

const handleChange = (e) => {
  const { name, value } = e.target;
  setEditFormData((prev) => ({
    ...prev,
    [name]: value
  }));
};

const handleAction = async () => {
  try {
    await axios.post('http://localhost:8000/api/manage-users/', {
      action: modalMode,
      user: editFormData
    });

    setShowModal(false);
    window.location.reload()
 // reload user list
  } catch (error) {
    console.error('User action failed:', error);
  }
};


 const handleDelete = async (userId) => {

    try {
      const response = await axios.delete(`http://localhost:8000/api/users/${userId}/delete/`, {
        headers: {
         'Authorization': `Bearer ${localStorage.getItem('access')}` // if using JWT
        },
      });

      setShowSuccessModal(true);
      setFilteredUsers(response.data);  
      window.location.reload()
      

    // Hide after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
      // Optional: Refresh the user list
    } catch (error) {
      console.error(error);
      alert("Failed to delete user.");
    }
  };






  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <style>{`
        .container {
          width: 95%;
          margin: 0 auto;
          padding: 30px 50px;
          font-family: 'Segoe UI', sans-serif;
        }

        h2, h3 {
          color: #1f2937;
          margin-bottom: 20px;
        }

        .table-section {
          margin-bottom: 40px;
        }

        .user-table {
          width: 100%;
          border-collapse: collapse;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          background: white;
        }

        .user-table th, .user-table td {
          padding: 14px 16px;
          text-align: left;
          font-size: 14px;
        }

        .user-table th {
          position: sticky;
          top: 0;
          background-color: #e1e2e4ff;
          color: #111827;
          font-weight: 600;
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }



        .user-table tr:nth-child(even) {
          background-color: #fafafa;
        }

        .user-table tr:hover {
          background-color: #f0f0f0;
        }

        .loading, .error {
          text-align: center;
          font-size: 16px;
          color: #666;
          margin-top: 50px;
        }

        .header-text {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 30px;
          color: #111827;
          text-align: center;
        }
        .hover-row:hover {
          background-color: #f0f0f0;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        


      
          

      `}</style>

      <div className="container">
        <h2 className="header-text">User Registered Dashboard</h2>


        <div className="table-section" style={{ marginBottom: '30px' }}>
  <h3 style={{ marginBottom: '10px', color: '#111827' }}>Regular Users</h3>
 <div
      style={{
        position: 'relative',
        maxWidth: 400,
        width: '100%',
        marginBottom: 20,
      }}
    >
      <input
        type="text"
        placeholder="Search by username or name"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        style={{
          padding: '8px 12px 8px 36px', // padding-left increased for icon space
          fontSize: '14px',
          borderRadius: 4,
          border: '1px solid #ccc',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
      <FiSearch
        style={{
          position: 'absolute',
          top: '50%',
          left: 10,
          transform: 'translateY(-50%)',
          color: '#888',
          pointerEvents: 'none', // so it doesn't block input clicks
        }}
        size={18}
      />
    </div>

  <div
    style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      maxWidth: '1250px',
    }}
  >
   <table
  className="user-table"
  style={{
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
    tableLayout: 'fixed',
  }}
>
  <thead>
    <tr>
      {['Profile', 'Username', 'Email', 'Position', 'App Status', 'Action'].map((header) => (
        <th
          key={header}
          style={{
            position: 'sticky',
            top: 0,
            backgroundColor: '#e1e2e4ff',
            color: '#111827',
            borderBottom: '2px solid #e5e7eb',
            fontWeight: 600,
            textAlign: 'left',
            padding: '12px',
            zIndex: 1,
          }}
        >
          {header}
        </th>
      ))}
    </tr>
  </thead>
</table>

{/* Scrollable tbody inside separate wrapper */}
<div
  style={{
    maxHeight: '400px',
    overflowY: 'auto',
    overflowX: 'hidden',
  }}
>
  <table
    style={{
      width: '100%',
      borderCollapse: 'collapse',
      tableLayout: 'fixed',
    }}
  >
    <tbody>
      {filteredUsers.length > 0 ? (
        filteredUsers.map((user) => (
          <tr key={user.id} className="hover-row" style={{ borderBottom: '1px solid #e5e7eb' }}>
            <td style={{ padding: '10px 20px' }}>
              <FaUser size={18} style={{ color: '#6b7280' }} />
            </td>
            <td style={{ padding: '10px' }}>{user.username || 'N/A'}</td>
            <td style={{ padding: '10px' }}>{user.email || 'N/A'}</td>
            <td style={{ padding: '10px' }}>{user.position || 'N/A'}</td>
            <td style={{ padding: '10px' }}>{user.status === "Application Done" || user.status === "Renewal Done" ? 'User Done' : 'User Pending'}</td>
            <td style={{ padding: '10px' }}>
              <button
                style={{
                  backgroundColor: 'white',
                  color: '#dc2626',
                  padding: '6px 10px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setSelectedUserId(user.id);
                  setShowConfirmModal(true);
                }}
              >
                <FaTrash /> Delete
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="6" style={{ padding: '12px', textAlign: 'center', color: '#888' }}>
            No results found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>


  </div>
</div>


       <div className="table-section">
  <h3>Client Users</h3>
  <div style={{
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      maxWidth: '1250px',
    }}>

<button
  onClick={() => openModal('create')}
  style={{
    backgroundColor: 'white', // blue-600
    color: '#1d4ed8',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s ease',
  }}
  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e1e2e4ff'} // blue-700
  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'} // blue-600
>
  <FaUserPlus />
  Create New User
</button>


    <table className="user-table">
      <thead>
        <tr>
          <th>Profile
</th>
          <th>Username</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Email</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {clientUsers.length > 0 ? (
          clientUsers.map((user) => (
            <tr key={user.id}>
              <td><FaUser style={{ color: '#1d4ed8' }}  /></td>
              <td>{user.username || 'N/A'}</td>
              <td>{user.first_name || 'N/A'}</td>
              <td>{user.last_name || 'N/A'}</td>
              <td>{user.email || 'N/A'}</td>
<td style={{ display: 'flex', gap: '8px' }}>
  <button
    onClick={() => openModal('edit', user)}
    style={{
      backgroundColor: 'white',
      color: '#2563eb',
      padding: '6px 10px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '14px'
    }}
  >
    <FaEdit /> Edit
  </button>

  <button
    onClick={() => openModal('delete', user)}
    style={{
      backgroundColor: 'white',
      color: '#dc2626',
      padding: '6px 10px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '14px'
    }}
  >
    <FaTrash /> Delete
  </button>
</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6">No client users found.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

      </div>
      {showConfirmModal && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  }}>
    <div style={{
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '10px',
      width: '300px',
      textAlign: 'center'
    }}>
      <h3>Confirm Deletion</h3>
      <p>Are you sure you want to delete this user?</p>
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={() => {
            handleDelete(selectedUserId);
            setShowConfirmModal(false);
          }}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100px'
          }}
        >
          Delete
        </button>
        <button
          onClick={() => setShowConfirmModal(false)}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100px'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{showSuccessModal && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  }}>
    <div style={{
      backgroundColor: '#ecfdf5',
      padding: '25px 30px',
      borderRadius: '10px',
      textAlign: 'center',
      border: '2px solid #10b981'
    }}>
      <h3 style={{ color: '#065f46', marginBottom: '10px' }}>Success</h3>
      <p style={{ color: '#047857' }}>User has been successfully deleted.</p>
    </div>
  </div>
)}{showModal && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(2px)',
  }}>
    <div style={{
      backgroundColor: 'white',
      padding: '25px 30px',
      borderRadius: '10px',
      minWidth: '420px',
      maxWidth: '90%',
      boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
      animation: 'fadeIn 0.25s ease-in-out',
    }}>
      <h3 style={{
        marginBottom: '20px',
        fontSize: '18px',
        fontWeight: 'bold',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '8px',
        color: '#111827'
      }}>
        {modalMode === 'edit' && 'Edit User'}
        {modalMode === 'create' && 'Create User'}
        {modalMode === 'delete' && 'Delete User'}
      </h3>

      {modalMode === 'delete' ? (
        <p style={{ fontSize: '15px', color: '#374151' }}>
          Are you sure you want to delete <strong>{editFormData.username}</strong>?
        </p>
      ) : (
        <form style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="text" name="username" placeholder="Username"
            value={editFormData.username} onChange={handleChange}
            style={inputStyle} />
          <input type="text" name="first_name" placeholder="First Name"
            value={editFormData.first_name} onChange={handleChange}
            style={inputStyle} />
          <input type="text" name="last_name" placeholder="Last Name"
            value={editFormData.last_name} onChange={handleChange}
            style={inputStyle} />
          <input type="email" name="email" placeholder="Email"
            value={editFormData.email} onChange={handleChange}
            style={inputStyle} />
          <input type="password" name="password" placeholder="Password"
            value={editFormData.password} onChange={handleChange}
            style={inputStyle} />
        </form>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '20px',
        gap: '10px'
      }}>
        <button
          onClick={handleCancel}
          style={{
            backgroundColor: '#e5e7eb',
            color: '#374151',
            padding: '8px 14px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleAction}
          style={{
            backgroundColor:
              modalMode === 'delete'
                ? '#dc2626' // red for delete
                : '#065f46', // green for create/edit
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {modalMode === 'edit' && 'Save'}
          {modalMode === 'create' && 'Create'}
          {modalMode === 'delete' && 'Delete'}
        </button>
      </div>
    </div>
  </div>
)}




    </>
  );
};

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '14px',
  fontWeight: '500',
  color: '#374151'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  outline: 'none',
  transition: '0.2s ease',
};

const cancelButtonStyle = {
  padding: '8px 16px',
  backgroundColor: '#f3f4f6',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  color: '#374151',
  fontWeight: '500'
};

const saveButtonStyle = {
  padding: '8px 16px',
  backgroundColor: '#065f46',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  color: '#fff',
  fontWeight: '500'
};


export default UserRegistered;
