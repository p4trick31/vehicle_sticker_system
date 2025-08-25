
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import logo from '../logo.jpg';
import { refreshAccessToken } from '../utils/tokenUtils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FaArrowLeft, FaSave } from 'react-icons/fa';



const ViewFormPage = () => {
    const { id } = useParams();  // Use useParams to get the 'id' param
    const [selectedForm, setSelectedForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);  // current vehicle photo index

  const formRef = useRef();

const handleDownloadPDF = () => {
  const input = formRef.current;

  html2canvas(input, {
    scale: 2,          // High-res rendering
    useCORS: true,     // Allows cross-origin images
  }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', [215.9, 330.2]); // Long bond paper: 8.5 x 13 in
    const pdfWidth = 215.9;
    const pdfHeight = 330.2;

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    if (heightLeft <= pdfHeight) {
      // Single page
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Optional: Add bold native text (adjust X/Y)
       pdf.setFont('Times', 'bold');
       pdf.setFontSize(16);
       pdf.setTextColor('#FFFFFF');
       pdf.text('.', 10, 20); // Example
    } else {
      // Multi-page logic
      while (heightLeft > 0) {
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);

        if (position === 0) {
          // Optional: Add bold native text on first page
           pdf.setFont('Times', 'bold');
           pdf.setFontSize(16);
           //pdf.text('Bold Native Text', 10, 20);
        }

        heightLeft -= pdfHeight;
        position -= pdfHeight;

        if (heightLeft > 0) {
          pdf.addPage([215.9, 330.2]); // Add long bond page
        }
      }
    }

    pdf.save('vehicle-pass.pdf');
  });
};


const fieldStyle = {
  display: 'inline-block',
  borderBottom: '1.5px solid black',
  minWidth: '200px',
  paddingLeft: '8px',
  marginLeft: '6px'
};
const adressStyle = {
  display: 'inline-block',
  borderBottom: '1.5px solid black',
  minWidth: '120px',
  paddingLeft: '8px',
  marginLeft: '6px'
};
const or_regiStyle = {
    display: 'inline-block',
    borderBottom: '1.5px solid black',
    minWidth: '100px',
    paddingLeft: '8px',
    marginLeft: '6px',

}
const com_Style = {
    display: 'inline-block',
    borderBottom: '1.5px solid black',
    minWidth: '170px',
    paddingLeft: '8px',
    marginLeft: '6px',
   
}
useEffect(() => {
  const fetchForm = async () => {
    try {
      const newToken = await refreshAccessToken();
      const response = await axios.get(`http://localhost:8000/api/form-view/${id}/`, {
        headers: { Authorization: `Bearer ${newToken}` }
      });

      let data = response.data.data;

      // Normalize picture_id
      data.name = data.name || data.full_name || null;
      data.date = data.date || data.created_at|| null;
      data.model_make = data.model_make || data.vehicle_model|| null;
      data.contact = data.contact || data.contact_number|| null;

      setSelectedForm(data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          try {
            const retryResponse = await axios.get(`http://localhost:8000/api/form-view/${id}/`, {
              headers: { Authorization: `Bearer ${newToken}` }
            });

            let retryData = retryResponse.data.data;
            retryData.name = retryData.name || retryData.full_name || null;
            retryData.date = retryData.date || retryData.created_at || null;
            retryData.makem_model = retryData.make_model || retryData.vehicle_model|| null;
            retryData.contact= retryData.contact || retryData.contact_number || null;
            setSelectedForm(retryData);
          } catch (retryErr) {
            console.error('Retry failed:', retryErr);
            setError('Failed to fetch form after retry.');
          }
        } else {
          setError('Session expired. Please log in again.');
        }
      } else {
        console.error('Error fetching form:', err);
        setError('Form not found or server error.');
      }
    } finally {
      setLoading(false);
    }
  };

  fetchForm();
}, [id]);



    const handleImageClick = () => {
  setCurrentPhotoIndex(0); // Reset to the first image
  setIsModalOpen(true);
};


    const handleCloseModal = () => {
        setIsModalOpen(false);
    };



    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
   

    return (
      <>
          <div className="no-print" style={{ marginBottom: '20px', display: 'flex', margin: '20px', gap: '50px'}}>
            
      <button
        onClick={() => navigate(-1)}
        style={{
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
      <button
  onClick={handleDownloadPDF}
  style={{
  
    top: '50%',
    left: '50%',
    padding: '5px',
    backgroundColor: '#ffffff',
    border: '1px solid #065f46',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#065f46',
    gap: '10px',
    fontWeight: 'bold'
  }}
  title="Download as PDF"
>
  <FaSave size={25} /> Download as PDF
</button>


      
    </div>
         <div ref={formRef}
  style={{
    width: '816px',
    height: '1248px',
    margin: '0 auto',
    background: 'white',
    padding: '40px',
    boxSizing: 'border-box',
    fontFamily: 'Times New Roman, serif',
  }}>
        
            <div style={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  width: '100%',
  background: 'white'
}}>

            <div className='logo'>
  <img src={logo} alt='Logo' style={{ width: '100px', height: '100px', objectFit: 'cover', display: 'flex', position: 'absolute', marginLeft: '-320px', marginTop: '20px' }} />
</div>
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
  <h5 style={{
    margin: '2px',
    fontSize: '12px',
    fontStyle: 'italic',
    fontFamily: 'Times New Roman, serif'
  }}>
    Republic of the Philippines
  </h5>

  <h4 style={{
    margin: '2px',
    fontSize: '13px',
    fontFamily: 'Times New Roman, serif'
  }}>
    DR. EMILIO B. ESPINOSA, SR. MEMORIAL
  </h4>

  <h4 style={{
    margin: '2px',
    fontSize: '13px',
    fontFamily: 'Times New Roman, serif'
  }}>
    STATE COLLEGE OF AGRICULTURE AND TECHNOLOGY
  </h4>

  <h5 style={{
    margin: '2px',
    fontSize: '12px',
    fontFamily: 'Times New Roman, serif'
  }}>
    (Masbate State College)
  </h5>

  <h4 style={{
    margin: '2px',
    fontSize: '13px',
    color: 'green',
    fontFamily: 'Times New Roman, serif'
  }}>
    PRODUCTION AND COMMERCIALIZATION
  </h4>

  <h5 style={{
    margin: '2px',
    fontSize: '12px',
    fontFamily: 'Times New Roman, serif'
  }}>
    Mandaon, Masbate
  </h5>

  <h5 style={{
    margin: '2px',
    fontSize: '11px',
    color: 'lightblue',
    fontFamily: 'Times New Roman, serif'
  }}>
    www.debesmscat.edu.ph
  </h5>

  <h3 style={{
    margin: '10px 0 2px',
    fontSize: '15px',
    fontFamily: 'Times New Roman, serif'
  }}>
    APPLICATION FORM
  </h3>

  <h5 style={{
    margin: '0',
    fontSize: '12px',
    fontFamily: 'Times New Roman, serif'
  }}>
    (DEBESMSCAT Vehicle Pass)
  </h5>
</div>


                {/* Uploaded Photos Section */}
                <div
    style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'absolute',
        marginTop: '20px',
    }}
>
   {selectedForm.picture_id ? (
  <img
    src={
      selectedForm.picture_id.startsWith('http')
        ? selectedForm.picture_id
        : `http://localhost:8000${selectedForm.picture_id}`
    }
    alt="Uploaded Photos"
    style={{
      width: '150px',
      height: '150px',
      borderRadius: '2px',
      marginLeft: '520px',
      marginBottom: '100px',
      border: '1px solid #333 ',
    }}
  />
) : (
  <span>No photos uploaded.</span>
)}

</div>
<br />
<hr />


              <div style={{ display: 'grid', gap: '12px', fontSize: '14px', width: '700px' }}>
  {/* Application No. and Date */}
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <div style={{ flex: 1 }}>
      <strong>Application No.:</strong>
      <span style={fieldStyle}>2025</span>
    </div>
    <div style={{ flex: 1 }}>
      <strong>Date:</strong>
      <span style={fieldStyle}>
  {new Date(selectedForm.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}
</span>
    </div>
  </div>

  {/* Name and Contact No. */}
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <div style={{ flex: 1 }}>
      <strong>Name:</strong>
      <span style={fieldStyle}>{selectedForm.name}</span>
    </div>
    <div style={{ flex: 1 }}>
      <strong>Contact No.:</strong>
      <span style={com_Style}>{selectedForm.contact}</span>
    </div>
  </div>

  {/* Address, Birthday, and Age */}
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '3px' }}>
    <div style={{ flex: 1 }}>
      <strong>Address:</strong>
      <span style={adressStyle}>{selectedForm.address}</span>
    </div>
    <div style={{ flex: 1 }}>
      <strong>Birthday:</strong>
      <span style={adressStyle}>
  {selectedForm.birthday
    ? new Date(selectedForm.birthday).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A'}
</span>
    </div>
    <div style={{ flex: 1 }}>
      <strong>Age:</strong>
      <span style={adressStyle}>{selectedForm.age ?? 'N/A'}</span>
    </div>
  </div>

  {/* Registration and OR/Date */}
  <div style={{ display: 'flex', justifyContent: 'flex-start', minWidth: '500px' }}>
    <div style={{ flex: 1 }}>
      <strong>Vehicle Certificate of Registration No.:</strong>
      <span style={or_regiStyle}>{selectedForm.vehicle_register}</span>
    </div>
    <div style={{ flex: 1 }}>
      <strong>O.R. No./Date:</strong>
      <span style={com_Style}>{selectedForm.or_no}</span>
    </div>
  </div>

  {/* Vehicle Type and Plate No. */}
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <div style={{ flex: 1 }}>
      <strong>Vehicle Type:</strong>
      <span style={fieldStyle}>{selectedForm.vehicle_type}</span>
    </div>
    <div style={{ flex: 1 }}>
      <strong>Plate No:</strong>
      <span style={fieldStyle}>{selectedForm.plate_number}</span>
    </div>
  </div>

  {/* Color and Make/Model */}
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <div style={{ flex: 1 }}>
      <strong>Color:</strong>
      <span style={fieldStyle}>{selectedForm.color}</span>
    </div>
    <div style={{ flex: 1 }}>
      <strong>Make/Model:</strong>
      <span style={com_Style}>{selectedForm.model_make}</span>
    </div>
  </div>

  {/* Chassis No. and Engine No. */}
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <div style={{ flex: 1 }}>
      <strong>Chassis No.:</strong>
      <span style={fieldStyle}>{selectedForm.chassis_no}</span>
    </div>
    <div style={{ flex: 1 }}>
      <strong>Engine No.:</strong>
      <span style={fieldStyle}>{selectedForm.engine_no}</span>
    </div>
  </div>
</div>

               
                {/* Note Section */}
<p style={{
  fontFamily: 'Times New Roman, serif',
  fontSize: '18px',
  color: 'black',
  fontWeight: '700',
  marginBottom: '5px',
  textAlign: 'left',
  alignSelf: 'flex-start',
  marginLeft: '20px'  // Optional, for flexbox containers
}}>
  Note:
</p>

<ul style={{ fontFamily: 'Times New Roman, serif', fontSize: '16px', color: 'black', width: '670px' }}>
  <li style={{ marginTop: '3px' }}>Please print legibly.</li>
  <li style={{ marginTop: '3px' }}>Attach photocopy of Vehicle's Certificate of Registration and Driver's License.</li>
  <li style={{ marginTop: '3px' }}>
    (Bring the original copy of Vehicle's Certificate of Registration, Driver's License, and this filled-up form for verification.)
  </li>
  <li style={{ marginTop: '3px' }}>
    If student, please attach a photocopy of student ID/Assessment Form from the Registrar’s Office.
  </li>
  <li style={{ marginTop: '3px' }}>Incomplete documents will not be processed.</li>
  <li style={{ marginTop: '3px' }}>Pay the corresponding fee to the cashier. Ask for Official Receipt.</li>
  <li style={{ marginTop: '3px' }}>
    Sticker will be placed in a noticeable area of the vehicle by authorized DEBESMSCAT personnel only.
  </li>
  <li style={{ marginTop: '3px' }}>
    Falsification and unauthorized use of DEBESMSCAT Vehicle Pass Sticker or this application form will be dealt with accordingly.
  </li>
</ul>

{/* Certification */}
<p style={{ fontFamily: 'Times New Roman, serif', fontSize: '16px', color: 'black', marginTop: '15px', width: '700px' }}>
  <strong>I CERTIFY</strong> that the information accomplished by the undersigned is true and correct pursuant to the provision of pertinent laws and regulations.
</p>

{/* Signature Block */}
<div style={{ width: '100%' }}>
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginRight: '40px',
    marginTop: '30px',
    marginLeft: 'auto',  // 👈 This pushes the div to the right
    width: 'fit-content' // 👈 Makes sure it doesn't stretch full width
  }}>
  {/* Applicant Section */}

  <div style={{ textAlign: 'center' }}>
  <div style={{ borderBottom: '1px solid black', width: '300px', paddingBottom: '3px' }}>
  <strong>{selectedForm?.name ? selectedForm.name.toUpperCase() : 'N/A'}</strong>
</div>

    <p style={{ fontSize: '16px', marginTop: '3px' }}>Applicant's Signature over Printed Name</p>
  </div>

  {/* Inspector Section */}
  <div style={{ textAlign: 'center' }}>
    <p style={{ fontSize: '16px' }}>Checked and Inspected by:</p>
{selectedForm.signature && (
  <img
    src={
      selectedForm.signature.startsWith('http')
        ? selectedForm.signature
        : `http://localhost:8000${selectedForm.signature}`
    }
    alt="Checker's Signature"
    style={{
      display: 'flex',
      position: 'absolute',
      width: '100px',
      marginLeft: '100px',
      marginTop: '-40px',
    }}
  />
)}


    <div style={{ borderBottom: '1px solid black', width: '300px', paddingBottom: '3px' }}>
      <strong>RICHARD J. SALES</strong>
    </div>
    <p style={{ fontSize: '16px', marginTop: '3px' }}>Chief, Security Service</p>
  </div>

  {/* Approval Section */}
  <div style={{ textAlign: 'center' }}>
    <p style={{ fontSize: '16px' }}>Approved by:</p>
    {selectedForm.signature2 && (
  <img
    src={
      selectedForm.signature2.startsWith('http')
        ? selectedForm.signature2
        : `http://localhost:8000${selectedForm.signature2}`
    }
    alt="Approver's Signature"
    style={{
      display: 'flex',
      position: 'absolute',
      width: '100px',
      marginLeft: '100px',
      marginTop: '-40px',
    }}
  />
)}
    <div style={{ borderBottom: '1px solid black', width: '300px', paddingBottom: '3px' }}>
      <strong>NONALYN D. TOMBOCON</strong>
    </div>
    <p style={{ fontSize: '16px', marginTop: '3px' }}>Director, Production & Commercialization</p>
  </div>
  </div>





             </div>
            </div>
      

                {/* Back Button */}
                


 
           
            
            <style>{`
  @media print {
    body {
      -webkit-print-color-adjust: exact;
    }

    @page {
      size: 8.5in 13in;
      margin: 0;
    }

    .no-print {
      display: none !important;
    }
  }
`}</style>


        </div>
      </>
    );
};

export default ViewFormPage;
