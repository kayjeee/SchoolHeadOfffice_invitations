import { useState } from 'react';

export const useFetchSchools = (app) => {
  const [schools, setSchools] = useState([]);
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAllSchools = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://data.mongodb-api.com/app/tasktracker-uuloe/endpoint/getAllSchools');
      if (!response.ok) throw new Error('Failed to fetch schools');
      const data = await response.json();
      setSchools(data.result || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedSchools = async () => {
    try {
      setLoading(true);
      const userEmail = app.currentUser.profile.email;
      const response = await fetch('https://data.mongodb-api.com/app/tasktracker-uuloe/endpoint/getSelectedSchools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${app.currentUser.accessToken}`,
        },
        body: JSON.stringify({ email: userEmail }),
      });
      if (!response.ok) throw new Error('Failed to fetch selected schools');
      const data = await response.json();
      setSelectedSchools(data.selectedSchools || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { schools, selectedSchools, fetchAllSchools, fetchSelectedSchools, loading, error };
};
