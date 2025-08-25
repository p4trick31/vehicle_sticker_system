import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import './App.css'; // You can style as needed
import LoginForm  from './UserLogin'
import SignupForm from './SignupForm';
import Modal from './LoginModal'
import ClientModal from './ClientLoginModal';
import UserInterface from './applicant/UserInterface'; 
import PendingRenewalPage from './applicant/PendingRenewal'; // adjust the path if needed
import FormInput from './applicant/FormInput';
import RequestForm from './stakeholder/RequestForm';
import RoadMap from './applicant/RoadMap';
import Client1 from './applicant/Client1';
import Client2 from './applicant/Client2';
import ClientLogin from './ClientLogin'; 
import AdminDashboard from './AdminDashboard';
import AdminLoginModal from './AdminLogin';
import StickerDone from './applicant/StickerDone';
import AnalyticsDashboard from './admin/AnalyticsDashboard';
import ViewFormPage from './stakeholder/ViewForm';
import RenewalForm  from './applicant/RenewalForm';
import ForgotPassword from './ForgotPassword';
import TemporarySticker from './applicant/TemporarySticker';
import { FaUserShield, FaUserPlus, FaUsers, FaBars, FaTimes, FaSyncAlt  } from 'react-icons/fa';
import debesLogo from './pic/DEBES.jpg';
// In your routing setu







const App = () => {
  const [popup, setPopup] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [isClientModalOpen, setClientModalOpen] = useState(false); 
  const [isLogin, setIsLogin] = useState(true); // To toggle between Login and Signup



  const [isAdminModalOpen, setAdminModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClientHovered, setIsClientHovered] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);



  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('isAuthenticated') === 'true'
  );
  const [authRole, setAuthRole] = useState(() => localStorage.getItem('authRole') || '');



  const openAdminModal = () => {
    setAdminModalOpen(true);
};
  const toggleNav = () => {
  setIsNavOpen(!isNavOpen);
};
  
const closeAdminModal = () => {
    setAdminModalOpen(false);
    window.location.reload();
};
  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    window.location.reload();
    
  };
  const openClientModal = () => {
    setClientModalOpen(true);
  }; // Open client modal
  const closeClientModal = () => {
    setClientModalOpen(false);
    window.location.reload();
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };
 
  const openPopup = (popupId) => {
    setPopup(popupId);
  };

  const closePopup = () => {
    setPopup('');
    
  };
  const handleLoginSuccess = (role = 'user' ) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('authRole', role);
    setIsAuthenticated(true);
    setAuthRole(role);
    closeModal();
    closeClientModal();
    closeAdminModal();
  };
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authRole');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    sessionStorage.clear();
    setIsAuthenticated(false);
    setAuthRole('');

    window.location.reload();
  };
 const navLinkStyle = {
  textDecoration: 'none',
  color: '#333',
  padding: '6px 0',
  transition: 'color 0.2s',
};

useEffect(() => {
    if (window.location.href === "http://localhost:3000") {
      window.onpopstate = () => {
        window.location.reload();
      };
    }
  }, []);

const navLinkHoverStyle = {
  color: 'goldenrod',
};

useEffect(() => {
  function handleClickOutside(event) {
    const navContainer = document.getElementById("nav-container");
    if (navContainer && !navContainer.contains(event.target)) {
      setIsNavOpen(false);
    }
  }

  if (isNavOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  } else {
    document.removeEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [isNavOpen]);



function useFadeInOnScroll() {
  useEffect(() => {
    const sections = document.querySelectorAll(".fade-in-section");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);
}

 useFadeInOnScroll();


  return (
    
    <div>
        <Routes>
          <Route
          path="/"
          element={
            <>
              { isAuthenticated ? (
      authRole === 'admin' ? <Navigate to="/admindashboard" />
      : authRole === 'client' ? <Navigate to="/client/request-form" />
      : authRole === 'user' ? <Navigate to="/dashboard" />
      : <Navigate to="/" />
    ): (
                <div id="mainBox">
                   <div
                      className="head"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        position: 'relative',
                        gap: '10px',
                      }}
                    >
                      {/* Menu button on the left */}
                      <button
                        onClick={toggleNav}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'goldenrod',
                          fontSize: '28px',
                          cursor: 'pointer',
                        }}
                      >
                        <FaBars />
                      </button>

                      <h3>Registration Vehicle Gate Pass Sticker System</h3>
                    </div>

                    {/* Nav container */}
                          <div id="nav-container"
                            style={{
                              position: 'fixed', // fixed to side
                              top: '0',
                              left: '0',
                              height: '100%',
                              backgroundColor: isNavOpen ? '#ffffff' : 'transparent',
                              borderRight: isNavOpen ? '1px solid #ddd' : 'none',
                              boxShadow: isNavOpen ? '2px 0 10px rgba(0,0,0,0.1)' : 'none',
                              overflow: 'hidden',
                              width: isNavOpen ? '220px' : '0',
                              transition: 'width 0.4s ease, background-color 0.4s ease, border 0.4s ease, box-shadow 0.4s ease',
                              zIndex: 1000,
                            }}
                          >
                            <nav
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                padding: isNavOpen ? '20px' : '0',
                                opacity: isNavOpen ? 1 : 0,
                                transition: 'opacity 0.3s ease',
                              }}
                            >
                              <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px', // space between icon and text
                                alignSelf: 'flex-start',
                                marginBottom: '10px',
                              }}
                            >
                              <button
                                onClick={() => window.location.reload()}
                                style={{
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  color: '#333',
                                  fontSize: '20px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                title="Refresh"
                              >
                                <FaSyncAlt />
                              </button>

                              <span
                                style={{
                                  fontSize: '12px', // slightly larger for minimal but readable
                                  color: '#555',
                                  margin: 0,
                                  lineHeight: 1.2,
                                }}
                              >
                                If page looks empty, <br /> please refresh.
                              </span>
                            </div>

                              {/* Close button */}
                              <button
                                onClick={toggleNav}
                                style={{
                                  alignSelf: 'flex-end',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  color: '#333',
                                  fontSize: '24px',
                                  cursor: 'pointer',
                                  marginBottom: '10px',
                                }}
                              >
                                <FaTimes />
                              </button>

                              {/* Nav links */}
                              {[
                                { label: 'About', onClick: null, href: '#About' },
                                { label: 'Inquiry', onClick: null, href: '#Inquiry' },
                                { label: 'FAQ\'s', onClick: null, href: '#FAQs' },
                                { label: 'Contact', onClick: null, href: '#Contacts' },

                              ].map((item, index) => (
                                <a
                                  key={index}
                                  href={item.href}
                                  style={{
                                    textDecoration: 'none',
                                    color: '#333',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    transition: 'background-color 0.2s, color 0.2s',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f0c93d';
                                    e.currentTarget.style.color = '#fff';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#333';
                                  }}
                                >
                                  {item.label}
                                </a>

                              ))}

                              {/* Admin button */}
                              <button
                                onClick={openAdminModal}
                                style={{
                                  border: 'none',
                                  borderRadius: '50%',
                                  backgroundColor: 'goldenrod',
                                  color: 'white',
                                  width: '40px',
                                  height: '40px',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  marginTop: '10px',
                                  alignSelf: 'flex-start',
                                }}
                              >
                                <FaUserShield />
                              </button>
                            </nav>
                          </div>

                          <div className="section fade-in-section">
                            <div className="left-section fade-in-section">
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img src={debesLogo} alt="Logo" style={{ width: '80px', marginRight: '10px' }} />
                                <div
                                  style={{
                                    textAlign: 'left',
                                    color: 'black', // white text for dark background, adjust if needed
                                    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                                    lineHeight: '1.4',
                                    fontSize: '20px',
                                    opacity: 1,
                                    marginTop: '10px',
                                  }}
                                >
                                  <p style={{ margin: '4px 0', fontWeight: 500 }}>Republic of the Philippines</p>
                                  <p style={{ margin: '1px 0' }}>Dr. Emilio B. Espinosa Sr. Memorial</p>
                                  <p style={{ margin: '1px 0' }}>State College of Agriculture and Technology</p>
                                  <p style={{ margin: '1px 0', fontSize: '15px', opacity: 0.8 }}>
                                    www.debesmscat.edu.ph | Cabitan, Mandaon, Masbate
                                  </p>
                                </div>

                              </div>
                              <h1>Vehicle Sticker System</h1>
                              <p>
                                Registering for your vehicle sticker online is quick and convenient. Just fill out the form, upload the documents, and track your application easily.
                              </p>
                            </div>

                            <div className="right-section fade-in-section">
                              <h3>Want to register?</h3>
                              <p>Read instructions below and get started.</p>
                              <div className="btn_field fade-in-section" >
                                <button
                                  onClick={openModal}
                                  style={{
                                    border: 'none',
                                    borderRadius: '6px',
                                    marginRight: '10px',
                                    height: '50px',
                                    width: '150px',
                                    backgroundColor: isHovered ? '#facc15' : '#d4af37',
                                    color: '#fff',
                                    fontSize: '15px',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    transition: 'background-color 0.2s',
                                    cursor: 'pointer',
                                  }}
                                  onMouseEnter={() => setIsHovered(true)}
                                  onMouseLeave={() => setIsHovered(false)}
                                >
                                  <FaUserPlus style={{ fontSize: '18px', marginRight: '6px' }} />
                                  Register
                                </button>

                                <button
                                  onClick={openClientModal}
                                  style={{
                                    border: 'none',
                                    borderRadius: '6px',
                                    height: '50px',
                                    width: '150px',
                                    backgroundColor: isClientHovered ? '#d4af37' : '#f0c93d',
                                    color: '#fff',
                                    fontSize: '15px',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    transition: 'background-color 0.2s',
                                    cursor: 'pointer',
                                  }}
                                  onMouseEnter={() => setIsClientHovered(true)}
                                  onMouseLeave={() => setIsClientHovered(false)}
                                >
                                  <FaUsers style={{ fontSize: '18px', marginRight: '6px' }} />
                                  Client
                                </button>
                              </div>

                              <div className="border fade-in-section">
                                <h4>Notes:</h4>
                                <ul>
                                  <li>Incomplete requirements will not be processed.</li>
                                  <li>Only clear scotch tape allowed to protect the sticker.</li>
                                  <li>Tampering or unauthorized transfer leads to revocation.</li>
                                  <li>Follow campus rules and regulations.</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        



                          <div id="About" className="section about-section fade-in-section">
                      <div className="main-about">
                        <div className="about-left fade-in-section">
                          <div className="about-box fade-in-section">
                            <h3>Our Story</h3>
                            <p>Welcome to the Vehicle Sticker Application Portal. Here you can apply for, track, and manage your vehicle stickers with ease.</p>
                          </div>
                          <div className="about-box fade-in-section">
                            <h3>Application Form</h3>
                            <p>Fill out the online form with your vehicle details, owner information, and required documents.</p>
                          </div>
                          <div className="about-box fade-in-section">
                            <h3>Requirements</h3>
                            <p>To apply for a vehicle sticker, you must provide:</p>
                            <ul>
                              <li>Proof of vehicle ownership (registration document)</li>
                              <li>Valid identification (driver's license or ID card)</li>
                              <li>Proof of insurance</li>
                            </ul>
                          </div>
                        
                        </div>

                        <div className="about-right fade-in-section">
                          <div className="about-box fade-in-section">
                            <h3>Approval Process</h3>
                            <p>The approval process typically includes:</p>
                            <ul>
                              <li>Submission of the application</li>
                              <li>Verification of documents</li>
                              <li>Approval notification via email or SMS</li>
                              <li>Payment of fees</li>
                            </ul>
                          </div>
                        

                          <div className="terms-box fade-in-section">
                            <h3>Terms and Conditions</h3>
                            <p>By applying for a vehicle sticker, you agree to comply with all relevant laws and regulations. Please read our full terms:</p>
                            <ul>
                              <li>Incomplete requirements will not be processed.</li>
                              <li>Only CLEAR scotch tape is allowed for protecting the sticker.</li>
                              <li>Tampering or unauthorized transfer leads to revocation.</li>
                              <li>Follow campus rules and regulations strictly.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
            

                    <div id="Inquiry" className="section inquiry-section fade-in-section">
                      <div className="faq-box fade-in-section">
                      <h2>Inquiries</h2>
                      <p>For specific questions or concerns regarding your application, please email or contact us using the information below. We are here to help you during office hours.</p>
                      <p>Email: admission_debesmscat.edu.ph</p>
                      <p>Phone: 00993296513</p>
                      </div>
                    </div>

                    <div id="FAQs" className="section faq-section fade-in-section">
                      
                      <div className="faq-box fade-in-section">
                            <h2>Frequently Asked Questions</h2>
                      <p>Need more details? Check our FAQs section or contact us directly for personalized assistance.</p>
                            <h4>How long does it take to receive my sticker?</h4>
                            <p>Processing usually takes 5-7 business days.</p>
                            <h4>How much are the required fees?</h4>
                            <ul>
                              <li>Motorcycle/Tricycle (Service Delivery) - ₱100</li>
                              <li>Private Car/ALV/SUV/Pick-up - ₱250</li>
                              <li>Delivery Trucks/Vans - ₱500</li>
                              <li>PUV/PUJ/PUB - ₱1,000</li>
                            </ul>
                          </div>
                                 <div className="faq-box fade-in-section">
                      <h2>Contact Us</h2>
                      <p>Visit us at: Cabitan, Mandaon, Masbate</p>
                      <p>Email: admission_debesmscat.edu.ph</p>
                      <p>Facebook: DEBESMSCAT_Masbate</p>
                      </div>
                    </div>

                    <footer className="footer">
                      <div className="footer-content">
                        <p className="footer-title">DEBESMSCAT Business Affairs and Security Service</p>
                        <p>Cabitan, Mandaon, Masbate</p>
                        <p>Office hours: 8:30 AM – 11:30 AM / 1:00 PM – 5:00 PM</p>
                        <p>Phone: 00993296513</p>
                        <p className="footer-copy">&copy; 2025 DEBESMSCAT. All rights reserved.</p>
                      </div>
                    </footer>
                                      
                    </div>
                  )}
                 
                      



                    {isModalOpen && (
                      
                      <Modal title={isLogin ? '' : ''} onClose={closeModal}>
                        
                        {isLogin ? (
                          <LoginForm onLoginSuccess={handleLoginSuccess} />
                        ) : (
                          <SignupForm />
                        )}
                        {/* Toggle between Login and Signup */}
                      <div
                          style={{
                            // smaller, fits on mobile
                            width: '90%',
                            maxWidth: '300px',
                            margin: '1rem auto 0 auto',
                            textAlign: 'center',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                          }}
                        >
                          <span
                            style={{
                              marginRight: '6px',
                              color: '#065f46',
                              fontSize: '19px',
                              flexShrink: 1,
                            }}
                          >
                            {isLogin ? 'Don’t have an account?' : 'Already have an account?'}
                          </span>
                          <button
                            onClick={toggleForm}
                            style={{
                              backgroundColor: '#facc15',
                              padding: '5px auto',
                              margin: '10px auto',
                              color: '#1f2937',
                              border: 'none',
                              borderRadius: '5px',
                              padding: '4px 10px',
                              fontWeight: '800',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              transition: 'background-color 0.3s',
                              flexShrink: 0,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eab308')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#facc15')}
                          >
                            {isLogin ? 'Sign Up' : 'Login'}
                          </button>
                        </div>
                      </Modal>
                    )}





                <ClientModal 
  isOpen={isClientModalOpen} 
  onClose={closeClientModal} 
  onLoginSuccess={(role) => handleLoginSuccess(role)}
/>

<AdminLoginModal
  isOpen={isAdminModalOpen}
  onClose={closeAdminModal}
  onLoginSuccess={(role) => handleLoginSuccess(role)}
/>
                             </>
        }
        />

                        




                        


                        
                            <Route path="/login" element={<LoginForm />} />
                            <Route path="/signup" element={<SignupForm />} />
                       <Route
          path="/dashboard"
          element={isAuthenticated && authRole === 'user' ? <UserInterface onLogout={handleLogout} /> : <Navigate to="/" />}
        />



                            <Route path="/dashboard-client" element={<ClientLogin />} />
                            <Route path="/admin" element={<AdminDashboard onLogout={handleLogout}/>} />
                            <Route path="/form-view" element={<ViewFormPage />} />
                            <Route path="/form-view/:id" element={<ViewFormPage />} />
                            <Route path="/temporary-sticker/:id" element={<TemporarySticker />} />
                             <Route path="/forgot-password" element={<ForgotPassword />} /> {/* ✅ New Route */}
                           
                            <Route
          path="/admindashboard"
          element={isAuthenticated && authRole === 'admin' ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/" />}
        />
<Route
  path="/client/request-form"
  element={
    isAuthenticated && authRole === 'client' ? (
      <RequestForm onLogout={handleLogout} />
    ) : (
      <Navigate to="/" />
    )
  }
/>

<Route
  path="/client/login"
  element={
    isAuthenticated && authRole === 'client' ? (
      <Navigate to="/client/request-form" replace />
    ) : (
      <ClientLogin onLoginSuccess={() => handleLoginSuccess('client')} />
    )
  }
/>




                            <Route path="/sticker-done/:applicationId" element={<StickerDone />} />
                            <Route path="/sticker-done" element={<StickerDone />} />
                            <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />

        
                            <Route path="/input" element={<FormInput />} />
                            <Route path="/input/:id" element={<FormInput />} />
                            <Route path="/steps" element={<RoadMap />} />
                            <Route path="/steps/:id" element={<RoadMap />} />
                            <Route path="/person1" element={<Client1 />} />
                            <Route path="/person2" element={<Client2 />} />
                             <Route path="/renewal-form" element={<RenewalForm />} />
                             <Route path="/pending-renewal" element={<PendingRenewalPage />} />

                       
                            <Route path="*" element={<Navigate to="/" />} />

        
      </Routes>
         
          

     </div>
    
  
  );
};

// Popup component
const Popup = ({ title, children, onClose }) => {
  return (
    <div className="popup-container">
      <div className="popup">
        <div className="popup-header">
          <h2>{title}</h2>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="popup-body">{children}</div>
      </div>
    </div>
    
  );
};

  

export default App;
