// components/hooks/schoolsindexpage/useAccessStatus.js
import { useState, useEffect } from 'react';

export function useAccessStatus(app, requestAccess) {
  const [accessStatus, setAccessStatus] = useState(null);

  useEffect(() => {
    const fetchAccessStatus = async () => {
      if (app?.currentUser) {
        try {
          const userEmail = app.currentUser.profile.email;
          const accessRequest = requestAccess.find(req => req.loggedInUserEmail === userEmail);
          setAccessStatus(accessRequest ? accessRequest.status : null);
        } catch (error) {
          console.error('Error fetching access status:', error);
        }
      }
    };

    fetchAccessStatus();
  }, [app?.currentUser, requestAccess]);

  return accessStatus;
}
