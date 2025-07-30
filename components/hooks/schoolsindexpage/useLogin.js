// components/hooks/schoolsindexpage/useLogin.js
import { useState, useEffect } from 'react';
import { Credentials } from 'realm-web';

export function useLogin(app, requestAccess) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [accessStatus, setAccessStatus] = useState(null);

  const handleLogin = async (email, password) => {
    try {
      const credentials = Credentials.emailPassword(email, password);
      await app.logIn(credentials);
      setIsLoggedIn(true);
      await checkAccessStatus();
      return true;
    } catch (error) {
      console.error('Login failed:', error.message);
      return false;
    }
  };

  const checkAccessStatus = async () => {
    try {
      if (app?.currentUser) {
        const userEmail = app.currentUser.profile.email;
        const accessRequest = requestAccess.find(req => req.loggedInUserEmail === userEmail);
        setAccessStatus(accessRequest ? accessRequest.status : null);
      }
    } catch (error) {
      console.error('Error checking access status:', error);
    }
  };

  const openLoginModal = () => setShowModal(true);
  const closeLoginModal = () => setShowModal(false);

  return {
    isLoggedIn,
    showModal,
    accessStatus,
    handleLogin,
    openLoginModal,
    closeLoginModal,
    checkAccessStatus
  };
}
