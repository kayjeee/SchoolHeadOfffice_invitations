// components/hooks/useFetchSchools.js
import { useState, useEffect } from 'react';

export const useFetchSchools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('https://data.mongodb-api.com/app/tasktracker-uuloe/endpoint/getAllSchools', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch schools');
        }

        const data = await response.json();
        setSchools(data.result || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  return { schools, loading, error };
};
