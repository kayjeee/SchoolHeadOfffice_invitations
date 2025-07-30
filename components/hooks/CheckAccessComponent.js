import { useEffect, useState } from 'react';
import { Credentials } from 'realm-web'; // Assuming you are using realm-web for authentication

const CheckAccessComponent = ({ app, openLoginModal, openPendingModal, openRequestAccessModal, onTabChange }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessStatus, setAccessStatus] = useState(null);

  // Effect hook to check login status and access status when the app state changes
  useEffect(() => {
    setIsLoggedIn(app?.currentUser !== null); // Check if the current user is logged in
    if (app?.currentUser) {
      checkAccessStatus(); // Fetch access status if logged in
    }
  }, [app?.currentUser]);

  // Function to check the access status of the user
  const checkAccessStatus = async () => {
    try {
      const userAccess = await getUserAccessFromDB(app?.currentUser); // Replace with actual DB fetch
      setAccessStatus(userAccess);
    } catch (error) {
      console.error('Failed to check access status:', error);
    }
  };

  // Handle login action using Realm Web's email/password credentials
  const handleLogin = async (email, password) => {
    try {
      const credentials = Credentials.emailPassword(email, password);
      await app.logIn(credentials); // Login using email and password
      setIsLoggedIn(true); // Set login state to true
      checkAccessStatus(); // Check the user's access status after login
    } catch (error) {
      console.error('Login failed:', error.message);
    }
  };

  // Handle tab clicks and check access status before allowing tab changes
  const handleTabClick = async (tab) => {
    if (!isLoggedIn) {
      openLoginModal(); // Open login modal if user is not logged in
    } else {
      await checkAccessStatus(); // Check access status before proceeding
      if (accessStatus === 'Accepted') {
        onTabChange(tab); // Propagate tab change to parent component
      } else if (accessStatus === 'Pending') {
        openPendingModal(); // Show pending access modal if the request is pending
      } else {
        openRequestAccessModal(); // Show request access modal if access is not granted
      }
    }
  };

  return {
    handleLogin, // Export login handler
    handleTabClick, // Export tab click handler
    isLoggedIn, // Export login state
  };
};

export default CheckAccessComponent;
