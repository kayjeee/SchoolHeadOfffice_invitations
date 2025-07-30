import { useState, useEffect } from 'react';

export const useCheckAccessStatus = (app, requestAccess) => {
  const [accessStatus, setAccessStatus] = useState(null);

  const checkAccessStatus = async () => {
    try {
      if (app && app.currentUser) {
        const userEmail = app.currentUser.profile.email; // Get the logged-in user's email
        const accessRequest = requestAccess.find((req) => req.loggedInUserEmail === userEmail); // Find matching access request
        if (accessRequest) {
          setAccessStatus(accessRequest.status); // Set access status based on request data
        } else {
          setAccessStatus(null); // No access request found
        }
      }
    } catch (error) {
      console.error('Error checking access status:', error);
    }
  };

  useEffect(() => {
    if (app?.currentUser) {
      checkAccessStatus(); // Call the function on component mount if the user is logged in
    }
  }, [app?.currentUser]);

  return accessStatus;
};
