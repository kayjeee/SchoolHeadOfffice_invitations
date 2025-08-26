import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { School } from '../shared/types/School';
import { useUser } from '@auth0/nextjs-auth0/client';

interface AppThemeContextType {
  primaryColor: string;
  currentSchool: School | null;
  schools: School[];
  setPrimaryColor: (color: string) => void;
  setCurrentSchool: (school: School | null) => void;
  refreshSchools: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AppThemeContext = createContext<AppThemeContextType | undefined>(undefined);

// Add your Rails API base URL here
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

const MODULE_TAG = 'APP_THEME_CONTEXT';
const DEFAULT_PRIMARY = 'gold';

// NASA-style logger (simplified version)
const nasaLog = (severity: string, module: string, message: string, context?: object) => {
  const timestamp = new Date().toISOString();
  console.log(`[${severity}] [${timestamp}] [${module}] :: ${message}`, context || '');
};

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user: auth0User } = useUser();
  const [primaryColor, setPrimaryColor] = useState<string>(DEFAULT_PRIMARY);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Fetch user data from Rails API using Auth0 ID
  const fetchUserData = useCallback(async (auth0Id: string) => {
    try {
      nasaLog('INFO', MODULE_TAG, 'Fetching user data from Rails API', {
        auth0Id,
        endpoint: `${API_BASE_URL}/api/v1/users/${encodeURIComponent(auth0Id)}`,
      });

      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/${encodeURIComponent(auth0Id)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.data?.user) {
        throw new Error('Invalid user data structure received');
      }

      return data.data.user;
    } catch (err: any) {
      nasaLog('ERROR', MODULE_TAG, 'Failed to fetch user data', {
        auth0Id,
        errorMessage: err.message,
      });
      throw err;
    }
  }, []);

  // Fetch school data from Rails API
  const fetchSchoolData = useCallback(async (schoolId: string): Promise<School | null> => {
    try {
      nasaLog('DEBUG', MODULE_TAG, 'Fetching school data', {
        schoolId,
        endpoint: `${API_BASE_URL}/api/v1/schools/${schoolId}`,
      });

      const response = await fetch(
        `${API_BASE_URL}/api/v1/schools/${schoolId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.school) {
        throw new Error('Invalid school data structure received');
      }

      return data.school;
    } catch (err: any) {
      nasaLog('ERROR', MODULE_TAG, 'Failed to fetch school data', {
        schoolId,
        errorMessage: err.message,
      });
      return null;
    }
  }, []);

  // Main function to fetch user schools from Rails API
  const fetchUserSchools = useCallback(async () => {
    nasaLog('INFO', MODULE_TAG, 'Starting school fetch process', {
      auth0Id: auth0User?.sub || 'none',
      triggerCount: refreshTrigger,
    });

    setLoading(true);
    setError(null);

    try {
      if (!auth0User?.sub) {
        nasaLog('WARN', MODULE_TAG, 'Skipping school fetch - no authenticated user');
        setSchools([]);
        setCurrentSchool(null);
        setLoading(false);
        return;
      }

      // Fetch user data first
      const userData = await fetchUserData(auth0User.sub);

      if (!userData) {
        throw new Error('Failed to fetch user data');
      }

      const schoolIds = userData.school_ids || [];

      if (schoolIds.length === 0) {
        nasaLog('WARN', MODULE_TAG, 'User has no school_ids', {
          userId: userData._id,
        });
        setSchools([]);
        setCurrentSchool(null);
        setLoading(false);
        return;
      }

      // Fetch all schools in parallel
      const schoolPromises = schoolIds.map((schoolId: string) =>
        fetchSchoolData(schoolId)
      );
      const schoolResults = await Promise.all(schoolPromises);

      // Filter out null results (failed fetches)
      const validSchools = schoolResults.filter(
        (school): school is School => school !== null
      );

      if (validSchools.length === 0) {
        throw new Error('No valid schools could be fetched');
      }

      setSchools(validSchools);

      // Select current school
      const lastSchoolId = localStorage.getItem('lastSelectedSchool');
      let selected: School | null = null;

      if (lastSchoolId) {
        selected = validSchools.find((s) => s._id === lastSchoolId) || null;
      }

      if (!selected && validSchools.length > 0) {
        selected = validSchools[0];
      }

      if (selected) {
        setCurrentSchool(selected);
        localStorage.setItem('lastSelectedSchool', selected._id);
        
        // Update primary color based on school theme
        if (selected.theme) {
          setPrimaryColor(selected.theme);
        }
      } else {
        setCurrentSchool(null);
      }
    } catch (err: any) {
      nasaLog('ERROR', MODULE_TAG, 'Failed to fetch schools', {
        errorMessage: err.message,
      });
      setError(`Failed to load school information: ${err.message}`);
      setSchools([]);
      setCurrentSchool(null);
    } finally {
      setLoading(false);
    }
  }, [auth0User?.sub, refreshTrigger, fetchUserData, fetchSchoolData]);

  const refreshSchools = useCallback(() => {
    nasaLog('INFO', MODULE_TAG, 'Manual refresh triggered');
    setRefreshTrigger((prev) => prev + 1);
    return Promise.resolve();
  }, []);

  // Watch for user to be defined before fetching schools
  useEffect(() => {
    if (auth0User?.sub) {
      fetchUserSchools();
    }
  }, [auth0User?.sub, fetchUserSchools]);

  // Update primary color when current school changes
  useEffect(() => {
    if (currentSchool?.theme) {
      setPrimaryColor(currentSchool.theme);
    }
  }, [currentSchool]);

  const handleSetCurrentSchool = useCallback((school: School | null) => {
    setCurrentSchool(school);
    if (school) {
      localStorage.setItem('lastSelectedSchool', school._id);
      if (school.theme) {
        setPrimaryColor(school.theme);
      }
    }
  }, []);

  const value = useMemo(() => ({
    primaryColor,
    currentSchool,
    schools,
    setPrimaryColor,
    setCurrentSchool: handleSetCurrentSchool,
    refreshSchools,
    loading,
    error,
  }), [primaryColor, currentSchool, schools, loading, error, handleSetCurrentSchool, refreshSchools]);

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(AppThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within an AppThemeProvider');
  }
  return context;
};