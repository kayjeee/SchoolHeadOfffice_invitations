import { useState, useEffect } from 'react';
import { useApp } from '../redux/useApp';

export const useSelectedSchools = () => {
    const [selectedSchools, setSelectedSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const app = useApp();
  
    useEffect(() => {
      const fetchSelectedSchools = async () => {
        try {
          setLoading(true);
          setError(null);
  
          if (!app.currentUser) {
            setLoading(false); // No user is logged in
            return;
          }
  
          const userEmail = app.currentUser.profile.email;
  
          const response = await fetch('https://data.mongodb-api.com/app/tasktracker-uuloe/endpoint/getSelectedSchools', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${app.currentUser.accessToken}`,
            },
            body: JSON.stringify({ email: userEmail }),
          });
  
          if (!response.ok) {
            throw new Error('Failed to fetch selected schools');
          }
  
          const data = await response.json();
          setSelectedSchools(data.selectedSchools || []);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
  
      if (app && app.currentUser && app.currentUser.isLoggedIn) {
        fetchSelectedSchools();
      } else {
        setLoading(false); // No user logged in
      }
    }, [app]);
  
    return { selectedSchools, setSelectedSchools, loading, error };
  };
  