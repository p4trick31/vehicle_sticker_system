import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate,  useParams} from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import logo from '../logo.jpg';

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

const fields = [
  { label: 'Date:', type: 'date', name: 'date', placeholder: '' },
  { label: 'Name:', type: 'text', name: 'name', placeholder: 'ex: Juan Dela Cruz' },
  { label: 'Address:', type: 'text', name: 'address', placeholder: 'ex: Brgy. Mabuhay, Mandaon, Masbate' },
  { label: 'Contact Number:', type: 'text', name: 'contact', placeholder: 'ex: 09XXXXXXXXX' },
  { label: 'Birthday:', type: 'date', name: 'birthday', placeholder: '' },
  { label: 'Age:', type: 'number', name: 'age', placeholder: 'ex: 25' },
  { label: 'Certificate of Registration No:', type: 'text', name: 'vehicle_register', placeholder: 'ex: 1234567890' },
  { label: 'O.R No / Date:', type: 'text', name: 'or_no', placeholder: 'ex: 987654 / 2024-05-15' },
  { label: 'Plate Number:', type: 'text', name: 'plate_number', placeholder: 'ex: ABC 1234' },
  { label: 'Color:', type: 'text', name: 'color', placeholder: 'ex: Red' },
  { label: 'Chassis No:', type: 'text', name: 'chassis_no', placeholder: 'ex: NMT123456789' },
  { label: 'Model/Make:', type: 'text', name: 'model_make', placeholder: 'ex: Honda Click 125i' },
  { label: 'Engine No:', type: 'text', name: 'engine_no', placeholder: 'ex: ENG987654321' }
];

const today = new Date().toISOString().split('T')[0];

const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    date: today,
    name: '',
    address: '',
    contact: '',
    birthday: '',
    age: '',
    vehicle_register: '',
    or_no: '',
    vehicle_type: 'motorcycle',
    plate_number: '',
    color: '',
    chassis_no: '',
    model_make: '',
    engine_no: '',
    photos: [],
    picture_id: [],
    license: [],
    vehicle_photos: [], 
    pipe_photos: []
  });
  const [submittedDataId, setSubmittedDataId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasPendingApplication, setHasPendingApplication] = useState(false);
  const [acceptCertify, setAcceptCertify] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);



  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
  const checkPendingApplication = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found.');
        return;
      }

      const response = await axios.get('http://localhost:8000/api/application/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setHasPendingApplication(response.data.pending);
    } catch (error) {
      console.error('Error checking for pending applications:', error);
    }
  };

  checkPendingApplication();
}, []);

  useEffect(() => {
    if (id) {
      const fetchApplication = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:8000/api/application/${id}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = response.data;

          setFormData({
            date: data.date ? data.date.slice(0, 10) : '',
            name: data.name || '',
            address: data.address || '',
            contact: data.contact || '',
            birthday: data.birthday ? data.birthday.slice(0, 10) : '',
            age: data.age || '',
            vehicle_register: data.vehicle_register || '',
            or_no: data.or_no || '',
            vehicle_type: data.vehicle_type || 'motorcycle',
            plate_number: data.plate_number || '',
            color: data.color || '',
            chassis_no: data.chassis_no || '',
            model_make: data.model_make || '',
            engine_no: data.engine_no || '',
            photos: [],
            picture_id: [],
            license: [],
            vehicle_photos: [],
            pipe_photos: []
          });
        } catch (error) {
          console.error('Error fetching application data:', error);
        } finally {
        setLoading(false);
      }
      };
      fetchApplication();
    }
  }, [id]);

 

  useEffect(() => {
    if (showConfirmModal || showPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showConfirmModal, showPopup]);

   if (loading) {
  return (
    <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '18px', color: '#065f46' }}>
      Loading application data...
    </div>
  );
}






  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


const MAX_PHOTO_SIZE_MB = 5;
const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;
   
const handlePhotoChange = (e) => {
  const selectedFiles = Array.from(e.target.files);
  const totalFiles = selectedFiles.length;

  const file = selectedFiles[0];

  if (!file) return;

  if (totalFiles > 1 || formData.photos.length >= 1) {
    setErrorMessage('You can only upload 1 photo for OR/CR.');
    setShowErrorModal(true);
    return;
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    setErrorMessage(`File size exceeds ${MAX_PHOTO_SIZE_MB}MB. Please upload a smaller image.`);
    setShowErrorModal(true);
    return;
  }

  setFormData((prev) => ({
    ...prev,
    photos: selectedFiles.slice(0, 1),
  }));
};


  const handlePictureIdChange = (e) => {
  const selectedFiles = Array.from(e.target.files);

  const file = selectedFiles[0];

  if (!file) return;

  if (selectedFiles.length > 1 || formData.picture_id.length >= 1) {
    setErrorMessage('You can only upload one 2x2 ID photo.');
    setShowErrorModal(true);
    return;
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    setErrorMessage(`File size exceeds ${MAX_PHOTO_SIZE_MB}MB. Please upload a smaller image.`);
    setShowErrorModal(true);
    return;
  }

  setFormData((prev) => ({
    ...prev,
    picture_id: selectedFiles.slice(0, 1),
  }));
};

const handleLicenseChange = (e) => {
  const selectedFiles = Array.from(e.target.files);

  const file = selectedFiles[0];

  if (!file) return;
  if (selectedFiles.length > 1 || formData.license.length >= 1) {
    setErrorMessage('You can only upload one license image.');
    setShowErrorModal(true);
    return;
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    setErrorMessage(`File size exceeds ${MAX_PHOTO_SIZE_MB}MB. Please upload a smaller image.`);
    setShowErrorModal(true);
    return;
  }

  setFormData((prev) => ({
  ...prev,
  license: selectedFiles.slice(0, 1), // Store max 1 file
}));

};


const handleVehiclePhotoChange = (e) => {
  const selectedFiles = Array.from(e.target.files);
  const file = selectedFiles[0];
  if (!file) return;

  if (selectedFiles.length > 1 || formData.vehicle_photos.length >= 1) {
    setErrorMessage('You can only upload one vehicle photo.');
    setShowErrorModal(true);
    return;
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    setErrorMessage(`File size exceeds ${MAX_PHOTO_SIZE_MB}MB. Please upload a smaller image.`);
    setShowErrorModal(true);
    return;
  }
  setFormData((prev) => ({
    ...prev,
    vehicle_photos: selectedFiles.slice(0, 1),
  }));
};
const handlePipePhotoChange = (e) => {
  const selectedFiles = Array.from(e.target.files);
  const file = selectedFiles[0];
  if (!file) return;

  if (selectedFiles.length > 1 || formData.pipe_photos.length >= 1) {
    setErrorMessage('You can only upload one pipe photo.');
    setShowErrorModal(true);
    return;
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    setErrorMessage(`File size exceeds ${MAX_PHOTO_SIZE_MB}MB. Please upload a smaller image.`);
    setShowErrorModal(true);
    return;
  }
  setFormData((prev) => ({
    ...prev,
    pipe_photos: selectedFiles.slice(0, 1),
  }));
};




    const removePhoto = (index) => {
  setFormData((prev) => ({
    ...prev,
    photos: prev.photos.filter((_, i) => i !== index)
  }));
};


  const removePictureId = (index) => {
  setFormData((prev) => ({
    ...prev,
    picture_id: prev.picture_id.filter((_, i) => i !== index)
  }));
};




    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('You need to be logged in to submit an application.');
      setShowConfirmModal(false);
      return;
    }
 

 

   const handleFinalSubmit = async (e) => {
  e.preventDefault();


  const formDataToSubmit = new FormData();

  // Append all non-file fields
  Object.entries(formData).forEach(([key, value]) => {
  // Skip file fields here
  if (
    key !== 'vehicle_photos' &&
    key !== 'pipe_photos' &&
    key !== 'license' &&
    key !== 'picture_id' &&
    key !== 'photos'
  ) {
    formDataToSubmit.append(key, value);
  }
});

  // Append file fields
  if (formData.vehicle_photos.length) {
  formData.vehicle_photos.forEach((photo, index) => {
    console.log(`📷 Attaching vehicle photo ${index + 1}:`, photo);
    formDataToSubmit.append('vehicle_photos', photo);
  });
}


if (formData.pipe_photos.length) {
  formDataToSubmit.append('pipe_photos', formData.pipe_photos[0]);
}

if (formData.license.length) {
  formDataToSubmit.append('license_photos', formData.license[0]);
}

if (formData.picture_id.length) {
  formDataToSubmit.append('picture_id', formData.picture_id[0]);
}

if (formData.photos.length) {
  formDataToSubmit.append('photos', formData.photos[0]);
}

  // Debug output
  console.log("📤 Submitting FormData:");
  for (let [key, value] of formDataToSubmit.entries()) {
    console.log(`${key}:`, value);
  }

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    setShowConfirmModal(false);

    // 👉 Step 2: Show loading spinner
    setSubmitting(true);

  setTimeout(async () => {
      let response;

      if (id) {
        response = await axios.patch(
          `http://localhost:8000/api/application/${id}/`,
          formDataToSubmit,
          config
        );
      } else {
        response = await axios.post(
          `http://localhost:8000/api/application/`,
          formDataToSubmit,
          config
        );
      }

      // 👉 Step 4: Success flow
      setSubmittedDataId(response.data.id);
      setErrorMessage('');
      setFormData({
        date: '',
        name: '',
        address: '',
        contact: '',
        birthday: '',
        age: '',
        vehicle_register: '',
        or_no: '',
        vehicle_type: 'motorcycle',
        plate_number: '',
        color: '',
        chassis_no: '',
        model_make: '',
        engine_no: '',
        photos: [],
        picture_id: [],
        license: [],
        vehicle_photos: [],
        pipe_photos: []
      });

      setSubmitting(false); // Hide spinner
      setShowPopup(true);   // Show success modal

    }, 3000);

  } catch (error) {
    console.error('❌ Submit failed:', error);
    setErrorMessage(
      error.response?.data?.detail ||
      JSON.stringify(error.response?.data) ||
      'Failed to submit. Please check your data.'
    );
    setSubmitting(false);
  }
};


 const closePopup = () => {
  setShowPopup(false);
  setTimeout(() => {
    navigate('/dashboard');
  }, 300); // wait for modal to fade out
};



  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <button
  onClick={() => navigate(-1)}
  style={{
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
  }}
>
  <FaArrowLeft />
</button>

        
        <img src={logo} alt="Logo" style={logoStyle} />
        <div>
          <h5 style={textStyle}>Republic of the Philippines</h5>
          <h4 style={textStyle}>DR. EMILIO B. ESPINOSA, SR. MEMORIAL</h4>
          <h4 style={textStyle}>STATE COLLEGE OF AGRICULTURE AND TECHNOLOGY</h4>
          <h5 style={textStyle}>(Masbate State College)</h5>
          <h4 style={{ ...textStyle, color: '#065f46' }}>PRODUCTION AND COMMERCIALIZATION</h4>
          <h5 style={textStyle}>Mandaon, Masbate</h5>
          <h5 style={textStyle}>www.debesmscat.edu.ph</h5>
          <h5 style={textStyle}>(DEBESMSCAT Vehicle Pass)</h5>
          <h2 style={{ textAlign: 'center', color: '#065f46', marginBottom: '20px' }}>
        {id ? 'Edit Application Form' : 'New Application Form'}
      </h2>
        </div>
      </div>

      {hasPendingApplication && !id ? (
        <div style={pendingMessageStyle}>
          You have a pending or disapproved application. Please wait for approval before submitting another form.
        </div>
      ) : (
        <form encType="multipart/form-data" method="POST"
          onSubmit={(e) => {
            e.preventDefault();
            
             const errors = {};
            fields.forEach((field) => {
              if (!formData[field.name] || formData[field.name].toString().trim() === '') {
                errors[field.name] = true;
              }
            });
            if (!formData.vehicle_type) {
              errors.vehicle_type = true;
            }
            if (formData.photos.length === 0) {
              errors.photos = true;
            }

            if (formData.picture_id.length === 0) {
              errors.picture_id = true;
            }
            if (formData.license.length === 0) {
              errors.license = true;
            }
            if (formData.vehicle_photos.length === 0) {
              errors.vehicle_photos = true;
            }
             if (formData.pipe_photos.length === 0) {
              errors.pipe_photos = true;
            }


            // Always set formErrors first
            setFormErrors(errors);

            if (Object.keys(errors).length > 0) {
              return;
            }

            if (!acceptCertify) {
              setErrorMessage('You must check the certification box before submitting.');
              setShowErrorModal(true);
              return;
            }
            setErrorMessage('');
            setShowConfirmModal(true);
          }}
          style={formStyle}
        >
          {fields.map((field, idx) => (
  <div key={idx} style={fieldContainerStyle}>
    <label style={labelStyle}>
      {field.label}
      {formErrors[field.name] && <span style={{ color: 'red' }}>*</span>}
    </label>
    <input
      style={inputStyle}
      type={field.type}
      name={field.name}
      value={formData[field.name]}
      onChange={handleChange}
      placeholder={field.placeholder}
    />
  </div>
))}


          <div style={fieldContainerStyle}>
            <label style={labelStyle}>
              Vehicle Type:
              {formErrors.vehicle_type && <span style={{ color: 'red' }}>*</span>}
            </label>



            <select
              style={inputStyle}
              name="vehicle_type"
              value={formData.vehicle_type}
              onChange={handleChange}
              required
            >
              <option value="motorcycle">Motorcycle</option>
              <option value="habal_habal">Habal Habal</option>
              <option value="tricycle">Tricycle</option>
              <option value="delivery_truck">Delivery Truck/Vans</option>
              <option value="private_suv">Private SUV/AUV/Sedan</option>
              <option value="pub_puj_puv">PUB/PUJ/PUV</option>
            </select>
          </div>

           <div>
  <div style={{ marginBottom: '10px' }}>
    <label style={labelStyle}>
      <strong>Upload OR/CR photo</strong> <i>(only 1 image required)</i>
      {formErrors.photos && <span style={{ color: 'red' }}>*</span>}
    </label>

    {/* Hidden file input */}
    <input
      type="file"
      name="photos"
      id="photoUpload"
      accept="image/*"
      onChange={handlePhotoChange}
      multiple={false}
      style={{ display: 'none' }}
    />

    {/* Show "+" only if no photo yet */}
    {formData.photos.length === 0 && (
      <label
        htmlFor="photoUpload"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          border: '2px dashed #ccc',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '48px',
          color: '#888',
          backgroundColor: '#f9f9f9',
          transition: '0.3s ease',
          marginTop: '5px'
        }}
        onMouseEnter={(e) => (e.target.style.borderColor = '#888')}
        onMouseLeave={(e) => (e.target.style.borderColor = '#ccc')}
      >
        +
      </label>
    )}

    {/* Preview if image is selected */}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
      {formData.photos.map((file, index) => (
        <div key={index} style={{ position: 'relative' }}>
          <img
            src={URL.createObjectURL(file)}
            alt=""
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'cover',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
          <button
            type="button"
            onClick={() => removePhoto(index)}
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              background: 'red',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  </div>


      <div>
        <label style={labelStyle}>
  <strong>Upload 2x2 ID</strong> <i> (required for the operator of the vehicle)</i>: 
  {formErrors.picture_id && <span style={{ color: 'red' }}>*</span>}
</label>

        <input
      type="file"
      name="picture_id"
      id="pictureUpload"
      accept="image/*"
      onChange={handlePictureIdChange}
      multiple={false}
      style={{ display: 'none' }}
    />

    {/* Show "+" only if no photo yet */}
    {formData.picture_id.length === 0 && (
      <label
        htmlFor="pictureUpload"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          border: '2px dashed #ccc',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '48px',
          color: '#888',
          backgroundColor: '#f9f9f9',
          transition: '0.3s ease',
          marginTop: '5px'
        }}
        onMouseEnter={(e) => (e.target.style.borderColor = '#888')}
        onMouseLeave={(e) => (e.target.style.borderColor = '#ccc')}
      >
        +
      </label>
    )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
          {formData.picture_id.map((file, index) =>(
            <div key={index} style={{ position: 'relative' }}>
              <img
                src={URL.createObjectURL(file)}
                alt={`ID ${index + 1}`}
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <button
                onClick={() => removePictureId(index)}
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: 'red',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div style={{ marginTop: '10px' }}>
  <label style={labelStyle}>
    <strong>Upload your Driver’s License</strong> <i>(1 image only)</i>:
     {formErrors.license && <span style={{ color: 'red' }}>*</span>}
  </label>
  <input
    type="file"
    name="license"
    accept="image/*"
    id ='licenseUpload'
    onChange={handleLicenseChange}
    multiple={false}
    style={{ display: 'none' }}
  />
   {formData.license.length === 0 && (
      <label
        htmlFor="licenseUpload"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          border: '2px dashed #ccc',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '48px',
          color: '#888',
          backgroundColor: '#f9f9f9',
          transition: '0.3s ease',
          marginTop: '5px'
        }}
        onMouseEnter={(e) => (e.target.style.borderColor = '#888')}
        onMouseLeave={(e) => (e.target.style.borderColor = '#ccc')}
      >
        +
      </label>
    )}
  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
    {formData.license.map((file, index) => (
      <div key={index} style={{ position: 'relative' }}>
        <img
          src={URL.createObjectURL(file)}
          alt={`License ${index + 1}`}
          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button
          onClick={() =>
            setFormData((prev) => ({
              ...prev,
              license: prev.license.filter((_, i) => i !== index),
            }))
          }
          style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: 'red',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      </div>
    ))}
  </div>
</div>

<div style={{ marginTop: '10px' }}>
  <label style={labelStyle}>
    <strong>Upload your vehicle and pipe photos</strong> <br />
    <i>
      🚫 <b>Note:</b> Vehicles with <u>open pipe</u> are <b>not allowed</b>.
    </i>
    {(formErrors.vehicle_photos || formErrors.pipe_photos) && (
      <span style={{ color: 'red' }}>*</span>
    )}
  </label>
  <div style={{display: 'flex', gap: '20px'}}>
  {/* Vehicle Photos Input */}
  <div style={{ marginTop: '10px' }}>
    <p style={{
  fontWeight: '600',
  fontSize: '14px',
  marginBottom: '6px',
  color: '#333',
}}>Vehicle Photos</p>
    <input
      type="file"
      name="vehicle_photos"
      accept="image/*"
      id ='vehicleUpload'
      style={{ display: 'none' }}
      onChange={handleVehiclePhotoChange}
    />
    {formData.vehicle_photos.length === 0 && (
      <label
        htmlFor="vehicleUpload"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          border: '2px dashed #ccc',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '48px',
          color: '#888',
          backgroundColor: '#f9f9f9',
          transition: '0.3s ease',
        }}
        onMouseEnter={(e) => (e.target.style.borderColor = '#888')}
        onMouseLeave={(e) => (e.target.style.borderColor = '#ccc')}
      >
        +
      </label>
    )}
    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
      {formData.vehicle_photos.map((file, index) => (
        <div key={`vehicle-${index}`} style={{ position: 'relative' }}>
          <img
            src={URL.createObjectURL(file)}
            alt={`Vehicle view ${index + 1}`}
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'cover',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
          <button
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                vehicle_photos: prev.vehicle_photos.filter((_, i) => i !== index),
              }))
            }
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              background: 'red',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  </div>

  {/* Pipe Photos Input */}
  <div style={{ marginTop: '10px' }}>
    <p style={{
  fontWeight: '600',
  fontSize: '14px',
  marginBottom: '6px',
  color: '#333',
}}>Vehicle Pipe Photos</p>
    <input
      type="file"
      name="pipe_photos"
      accept="image/*"
      onChange={handlePipePhotoChange}
      id ='pipeUpload'
      style={{ display: 'none' }}
    />
     {formData.pipe_photos.length === 0 && (
      <label
        htmlFor="pipeUpload"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          border: '2px dashed #ccc',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '48px',
          color: '#888',
          backgroundColor: '#f9f9f9',
          transition: '0.3s ease',
        }}
        onMouseEnter={(e) => (e.target.style.borderColor = '#888')}
        onMouseLeave={(e) => (e.target.style.borderColor = '#ccc')}
      >
        +
      </label>
    )}
    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
      {formData.pipe_photos?.map((file, index) => (
        <div key={`pipe-${index}`} style={{ position: 'relative' }}>
          <img
            src={URL.createObjectURL(file)}
            alt={`Pipe view ${index + 1}`}
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'cover',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
          <button
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                pipe_photos: prev.pipe_photos.filter((_, i) => i !== index),
              }))
            }
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              background: 'red',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  </div>
  </div>
</div>


    

          <div
  style={{
    display: 'flex',
    alignItems: 'flex-start',
    marginTop: '20px',
    marginBottom: '15px',
    padding: '15px',
    border: '1px solid #065f46',
    borderRadius: '8px',
    backgroundColor: '#f0fdf4', // light green background for important notice
  }}
>
  <input
    type="checkbox"
    id="certify"
    checked={acceptCertify}
    onChange={() => setAcceptCertify(!acceptCertify)}
    style={{
      marginRight: '12px',
      marginTop: '4px',
      width: '25px',
      height: '25px',
      cursor: 'pointer'
    }}
  />
  <label
    htmlFor="certify"
    style={{
      fontFamily: 'Times New Roman, serif',
      fontSize: '18px',
      color: '#065f46',
      lineHeight: '1.5',
      cursor: 'pointer'
    }}
  >
    <strong>I CERTIFY</strong> that this information is true and correct pursuant to pertinent laws and regulations.
  </label>
</div>


          

          
          <div style={{display: 'flex', gap: '50px', justifyContent: 'space-around', margin: '0px 10px'}}>
          

          <button type="button" onClick={() => navigate(-1)} style={backButtonStyle}>
            <FaTimesCircle style={{ marginRight: '8px' }} /> Cancel
          </button>
          <button type="submit" style={submitButtonStyle}>
            <FaCheckCircle style={{ marginRight: '8px' }} /> Submit
          </button>
          </div>
        </form>
      )}
   {submitting && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  }}>
    <div style={{
      padding: '20px 40px',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '10px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      fontSize: '20px',
      color: '#065f46',
    }}>
      <FaSpinner
        style={{
          animation: 'spin 1s linear infinite',
          WebkitAnimation: 'spin 1s linear infinite',
        }}
      />
      <span style={{ marginLeft: '10px' }}>Submitting...</span>
    </div>

    {/* Inline style injection for keyframes */}
    <style>
      {`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
)}


      {showPopup && <SuccessModal id={submittedDataId} onClose={closePopup} navigate={navigate} />}

         

      {showErrorModal && (
      <>
        <div style={modalOverlayStyle} onClick={() => setShowErrorModal(false)} />
        <div style={confirmModalStyle}>
          <h3 style={{ color: '#b91c1c' }}>Error</h3>
          <p>{errorMessage}</p>
          <button
            onClick={() => setShowErrorModal(false)}
            style={{
              ...submitButtonStyle,
              backgroundColor: '#b91c1c',
              marginTop: '15px'
            }}
          >
            Close
          </button>
        </div>
      </>
    )}


      {showConfirmModal && (
        <>
          <div style={modalOverlayStyle} onClick={() => setShowConfirmModal(false)} />
          <div style={confirmModalStyle}>
            <h3>Confirm Your Information</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto', textAlign: 'left' }}>
              {fields.map((field) => (
                <p key={field.name}><strong>{field.label}</strong> {formData[field.name]}</p>
              ))}
              <p><strong>Vehicle Type:</strong> {formData.vehicle_type}</p>
              <div>
                <strong>Uploaded OR / CR:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>
                  {formData.photos.map((file, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(file)}
                      alt={`Photo ${index + 1}`}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '10px' }}>
                <strong>Uploaded ID Images:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>
                  {formData.picture_id.map((file, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(file)}
                      alt={`ID ${index + 1}`}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  ))}
                </div>
                <p><strong>Driver's License:</strong></p>
{formData.license.map((file, index) => (
  <img key={index} src={URL.createObjectURL(file)} alt="License" style={{ width: '80px', height: '80px', margin: '5px', objectFit: 'cover' }} />
))}

<p><strong>Vehicle Photos:</strong></p>
{formData.vehicle_photos.map((file, index) => (
  <img key={index} src={URL.createObjectURL(file)} alt="vehicle_photos" style={{ width: '80px', height: '80px', margin: '5px', objectFit: 'cover' }} />
))}
<p><strong>Vehicle Pipe Photos:</strong></p>
{formData.pipe_photos.map((file, index) => (
  <img key={index} src={URL.createObjectURL(file)} alt="pipe_photos" style={{ width: '80px', height: '80px', margin: '5px', objectFit: 'cover' }} />
))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '10px' }}>
              <button onClick={() => setShowConfirmModal(false)} style={{ ...backButtonStyle, marginTop: '0' }}>
                <FaTimesCircle style={{ marginRight: '8px' }} /> Cancel
              </button>
              <button onClick={handleFinalSubmit} style={{ ...submitButtonStyle, marginTop: '0' }}>
                <FaCheckCircle style={{ marginRight: '8px' }} /> Confirm Submit
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
// Fields, styles, and constants same as before

const SuccessModal = ({ id, onClose, navigate }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose();
      navigate('/dashboard');
    }, 300);
  };

  const modalVisibleStyle = {
    ...successModalStyle,
    transform: visible ? 'translate(-50%, -50%)' : 'translate(-50%, -60%)',
    opacity: visible ? 1 : 0,
    transition: 'all 0.3s ease-in-out',
  };

  const overlayVisibleStyle = {
    ...modalOverlayStyle,
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
  };

  return (
    <>
      <div style={overlayVisibleStyle} onClick={handleClose} />
      <div style={modalVisibleStyle} className="success-modal">
        <FaCheckCircle style={successIconStyle} />
        <h3 style={{ margin: '10px 0', color: '#065f46' }}>
          Application submitted! Please wait for the checker’s approval.
        </h3>

        <button
          onClick={handleClose}
          style={{
            padding: '10px 20px',
            backgroundColor: '#065f46',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#047857')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#065f46')}
        >
          Close
        </button>
      </div>
    </>
  );
};






// Styles same as before
const containerStyle = {
  margin: '20px',
  padding: '20px',
  backgroundColor: '#f9fafb',
  fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
};
const headerStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' };
const logoStyle = { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' };
const textStyle = { margin: '2px 0', textAlign: 'center' };
const formTitleStyle = { margin: '10px 0', color: '#065f46', fontWeight: '700' };
const formStyle = { maxWidth: '600px', width: '100%', margin: '0 auto', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', backgroundColor: '#ffffff', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)' };
const fieldContainerStyle = { display: 'flex', flexDirection: 'column', marginBottom: '16px' };
const labelStyle = { marginBottom: '5px', fontWeight: '600', color: '#374151' };
const inputStyle = { padding: '8px', border: '1px solid #d1d5db', borderRadius: '5px' };
const submitButtonStyle = { width: '100%', padding: '12px', backgroundColor: '#065f46', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' };
const backButtonStyle = { width: '100%', padding: '12px', backgroundColor: 'white', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)', border: '1px solid #065f46 ', color: '#1f2937', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' };
const pendingMessageStyle = { color: '#d97706', marginTop: '20px', fontSize: '1.1em', fontWeight: 'bold', textAlign: 'center' };
const confirmModalStyle = { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '400px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', zIndex: 2000, textAlign: 'center' };
const successModalStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%) scale(1)',
  backgroundColor: '#fff',
  padding: '30px 20px',
  borderRadius: '10px',
  width: '90%',
  maxWidth: '400px',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
  zIndex: 2000,
  textAlign: 'center',
  opacity: 1,
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 999,
};

const successIconStyle = {
  fontSize: '50px',
  color: '#065f46',
  marginBottom: '10px',
};



export default ApplicationForm;
