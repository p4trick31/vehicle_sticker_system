import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const PaymentPage = () => {
    const [paymentMethod, setPaymentMethod] = useState('gcash');
    const [amount, setAmount] = useState(100); // Default amount is 100 pesos
    const [applicationId, setApplicationId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [referenceNumber, setReferenceNumber] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [loading, setLoading] = useState(false);  // New state for loading
    const [paymentStatus, setPaymentStatus] = useState(null); // State to store payment approval status
    const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false); // New state to track if payment is confirmed
    const { applicationPassId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserApplications = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/get-application-id/', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });

                if (response.data.length > 0) {
                    setApplicationId(response.data[0].id);
                } else {
                    alert('No applications found for this user.');
                }
            } catch (error) {
                console.error('Error fetching user applications:', error.message);
            }
        };

        fetchUserApplications();
    }, []);

    const handlePaymentSubmit = async () => {
        const selectedApplicationId = applicationPassId || applicationId;

        if (!referenceNumber || !date || !time) {
            alert('Please provide all required details.');
            return;
        }

        setLoading(true);  // Set loading to true when the payment is being processed

        try {
            const response = await axios.post(`http://localhost:8000/api/payment/process/${selectedApplicationId}/`, {
                payment_method: paymentMethod,
                amount: amount,
                reference_number: referenceNumber,
                date: date,
                time: time,
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.status === 200) {
                setPaymentStatus('pending');  // Set status to 'pending' initially
                setIsPaymentConfirmed(true);  // Payment confirmed, so hide form elements
                alert('Payment is being processed. Please wait for admin approval.');
            }
        } catch (error) {
            console.error('Error processing payment:', error.message);
            alert('Failed to process payment. Please try again.');
        }
    };

    // Simulate checking for payment approval (you may call a real API endpoint here)
    useEffect(() => {
        if (paymentStatus === 'pending') {
            const checkPaymentStatus = async () => {
                try {
                    const response = await axios.get(`http://localhost:8000/api/applications/${applicationId}/`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });

                    if (response.data.payment_status === 'paid') {
                        setPaymentStatus('approved');
                        alert('Payment accepted. Your request is approved.');
                        navigate(`/sticker-done/${applicationId}`);
                    } else if (response.data.payment_status === 'reject') {
                        setPaymentStatus('rejected');
                        alert('Payment rejected. Please contact support.');
                    }
                } catch (error) {
                    console.error('Error checking payment status:', error.message);
                }
            };

            setTimeout(checkPaymentStatus, 5000); // Check payment status after 5 seconds (simulating wait time)
        }
    }, [paymentStatus, applicationId]);

    return (
        <div style={containerStyle}>
            <h2>Payment for Application ID {applicationId}</h2>

            {!isPaymentConfirmed && (
                <div>
                    <div style={formGroupStyle}>
                        <label htmlFor="amount">Amount (PHP):</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            min="0"
                            style={inputStyle}
                        />
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        style={payButtonStyle}
                    >
                        Pay {amount} PHP with GCash
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        style={backButtonStyle}
                    >
                        Back
                    </button>
                </div>
            )}

            {showModal && !isPaymentConfirmed && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <h3>GCash Payment Details</h3>

                        <div style={formGroupStyle}>
                            <label htmlFor="referenceNumber">Reference Number:</label>
                            <input
                                type="text"
                                id="referenceNumber"
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        <div style={formGroupStyle}>
                            <label htmlFor="date">Date:</label>
                            <input
                                type="date"
                                id="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        <div style={formGroupStyle}>
                            <label htmlFor="time">Time:</label>
                            <input
                                type="time"
                                id="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)} 
                                style={inputStyle}
                            />
                        </div>

                        <button
                            onClick={handlePaymentSubmit}
                            style={payButtonStyle}
                            disabled={loading}  // Disable button while loading
                        >
                            {loading ? 'Processing Payment...' : 'Confirm Payment'}
                        </button>

                        <button
                            onClick={() => setShowModal(false)}
                            style={backButtonStyle}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {isPaymentConfirmed && paymentStatus === 'pending' && (
                <p>Please wait for admin approval of your payment request.</p>
            )}

            {paymentStatus === 'approved' && (
                <p>Your payment has been approved. Thank you!</p>
            )}

            {paymentStatus === 'rejected' && (
                <p>Your payment has been rejected. Please contact support for assistance.</p>
            )}
        </div>
    );
};

// Styles
const containerStyle = { padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center' };
const formGroupStyle = { marginBottom: '15px' };
const inputStyle = { padding: '10px', width: '80%', fontSize: '16px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc' };
const payButtonStyle = { padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', marginTop: '20px' };
const backButtonStyle = { marginTop: '20px', padding: '10px 20px', backgroundColor: 'white', color: 'black', border: '1px solid black', borderRadius: '5px', cursor: 'pointer', fontSize: '18px' };
const modalStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalContentStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '5px', textAlign: 'center', width: '80%', maxWidth: '500px' };

export default PaymentPage;
