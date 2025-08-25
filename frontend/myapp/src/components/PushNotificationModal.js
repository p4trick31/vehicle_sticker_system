import React, { useEffect, useState } from 'react';
import { FaBell } from 'react-icons/fa';

export default function PushNotificationModal() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
  const ensureSubscription = async () => {
    try {
      const register = await navigator.serviceWorker.ready;
      let subscription = await register.pushManager.getSubscription();

      if (!subscription) {
        console.log("No subscription found, subscribing again...");
        await subscribe(); // Call your subscribe() function
      } else {
        console.log("Subscription exists:", subscription.endpoint);
        setIsSubscribed(true);
      }
    } catch (err) {
      console.error("Failed to ensure subscription:", err);
    }
  };

  // Only run if user is logged in
  const token = localStorage.getItem("token");
  if (token) ensureSubscription();
}, []);


  useEffect(() => {
  const checkSubscription = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // 🔒 Don't show if user already dismissed it in a past login
      const dismissed = localStorage.getItem("subscriptionDismissed") === "true";
      if (dismissed) return;

      // 🔒 Don't show again in the same login session
      const seenThisSession = sessionStorage.getItem("seenSubscriptionModal") === "true";
      if (seenThisSession) return;

      const res = await fetch("http://localhost:8000/api/get-user-subscription-status/", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("Subscription status:", data);

      if (!data.is_subscribed) {
        // Not subscribed, show modal after short delay
        const timer = setTimeout(() => {
          setShowModal(true);
          setTimeout(() => setVisible(true), 50); // Fade-in logic
          sessionStorage.setItem("seenSubscriptionModal", "true"); // ✅ Mark it seen this session
        }, 1000);

        return () => clearTimeout(timer);
      }
    } catch (err) {
      console.error("Failed to check subscription status:", err);
    }
  };

  checkSubscription();
}, []);



  const handleConfirm = async () => {
    setShowModal(false);
    await subscribe();
  };

  const handleCancel = () => {
    setShowModal(false);
    setVisible(false);
    localStorage.setItem("subscriptionDismissed", "true"); // 👈 Track user choice
};

  const subscribe = async () => {
    try {
      console.log("Starting subscription process...");

      const register = await navigator.serviceWorker.ready;
      console.log("Service worker ready:", register);

      // Clear old subscription if exists
      const existingSubscription = await register.pushManager.getSubscription();
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
        console.log("Old subscription unsubscribed!");
      }

      const response = await fetch('http://localhost:8000/api/webpush/vapid_public_key');
      const vapidPublicKey = await response.text();
      console.log("Fetched VAPID public key:", vapidPublicKey);

      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      console.log("Converted VAPID key:", convertedVapidKey);


      const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      console.log("Subscription created:", subscription);
      console.log("Subscription endpoint:", subscription.endpoint);

      const subscriptionJson = subscription.toJSON();
      console.log("Subscription JSON:", subscriptionJson);

      const token = localStorage.getItem("token");
      console.log("Token from localStorage:", token);

      const res = await fetch("http://localhost:8000/api/webpush/save_information/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ subscription: subscriptionJson }),
      });

      if (!res.ok) {
        console.error("Failed to save subscription:", await res.text());
        return;
      }

      console.log("Successfully subscribed and saved to backend!");
      setIsSubscribed(true);

      // ✅ Mark as subscribed so modal never shows again
      localStorage.setItem("notificationsSubscribed", "true");

    } catch (err) {
      console.error("Failed to subscribe:", err);
    }
  };

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  }

  useEffect(() => {
  const checkAndSubscribe = async () => {
    const register = await navigator.serviceWorker.ready;
    const subscription = await register.pushManager.getSubscription();

    if (!subscription) {
      console.log("Re-subscribing user...");
      await subscribe(); // your subscribe() function
    } else {
      console.log("Subscription already active:", subscription.endpoint);
      setIsSubscribed(true);
    }
  };

  if (localStorage.getItem("token")) checkAndSubscribe();
}, []);


  return (
    <>
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.6s ease'
        }}>
          <div style={{
            background: '#fff',
            padding: '30px',
            borderRadius: '10px',
            textAlign: 'center',
            maxWidth: '300px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            borderTop: '6px solid #facc15'
          }}>
            <FaBell size={48} color="#facc15" style={{ marginBottom: '15px' }} />
            <h2 style={{ color: '#065f46', marginBottom: '10px' }}>Important Notification!</h2>
            <p style={{ marginBottom: '20px' }}>
              Stay updated about your <strong>vehicle sticker application</strong> status.
              Enable notifications to receive important updates.
            </p>

            <button onClick={handleCancel} style={{
              margin: '10px',
              backgroundColor: '#ffffff',
              color: '#065f46',
              padding: '10px 20px',
              border: '1px solid #065f46',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}>
              No, Thanks
            </button>
            <button onClick={handleConfirm} style={{
              margin: '10px',
              backgroundColor: '#065f46',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}>
              Yes, Enable
            </button>
          </div>
        </div>
      )}
    </>
  );
} 