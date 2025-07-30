import { useState, useEffect } from 'react';
import { useApp } from '../../useApp'; // assuming you have a custom hook for getting the app context

// Custom hook for fetching pending requests
export const fetchPendingRequest = (schoolId) => {
  const app = useApp(); // get the app context (realm app instance)
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const result = await app.currentUser.functions.fetchPendingRequests(schoolId);
        setPendingRequests(result);
      } catch (error) {
        console.error('Error fetching pending requests:', error.message);
      } finally {
        setLoading(false);
      }
    };

    if (schoolId) {
      fetchRequests();
    }
  }, [schoolId, app]);

  return { loading, pendingRequests };
};
