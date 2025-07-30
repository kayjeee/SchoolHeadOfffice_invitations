import { useState, useEffect } from 'react';
import { useApp } from '../../useApp'; // assuming you have a custom hook for getting the app context

export const useFetchSchools = () => {
  const app = useApp(); // get the app context (realm app instance)
  const [schoolList, setSchoolList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true);
        const currentUser = app.currentUser;
        const userEmail = currentUser.profile.email;
        
        if (!userEmail) {
          throw new Error('User email is null.');
        }

        const result = await currentUser.functions.getschoolbasedonuser_email(userEmail);
        setSchoolList(result);
      } catch (error) {
        console.error('Error fetching schools:', error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (app && app.currentUser) {
      fetchSchools();
    }
  }, [app]);

  return { schoolList, loading, error };
};
