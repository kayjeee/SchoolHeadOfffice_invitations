import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { School } from '../shared/types/School';
import { useUser } from '@auth0/nextjs-auth0/client';

// Color type definitions
interface ColorObject {
  mode: string;
  value: string;
}

type ColorInput = string | ColorObject;

interface ProcessedColor {
  mode: string;
  value: string;
  originalInput: ColorInput;
}

interface AppThemeContextType {
  primaryColor: ProcessedColor;
  currentSchool: School | null;
  schools: School[];
  setPrimaryColor: (color: ColorInput) => void;
  setCurrentSchool: (school: School | null) => void;
  refreshSchools: () => Promise<void>;
  loading: boolean;
  error: string | null;
  // Helper methods for color usage
  getPrimaryColorValue: () => string;
  getPrimaryColorMode: () => string;
}

const AppThemeContext = createContext<AppThemeContextType | undefined>(undefined);

// Add your Rails API base URL here
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://sho-backend-v2.onrender.com';

const MODULE_TAG = 'APP_THEME_CONTEXT';
const DEFAULT_PRIMARY = 'gold';

// Predefined color mappings for simple color names
const COLOR_MAPPINGS: Record<string, string> = {
  gold: '#FFD700',
  green: '#20B486',
  blue: '#3B82F6',
  red: '#EF4444',
  purple: '#8B5CF6',
  orange: '#F97316',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6',
  cyan: '#06B6D4',
  emerald: '#10B981',
  lime: '#84CC16',
  yellow: '#EAB308',
  amber: '#F59E0B',
  rose: '#F43F5E',
  slate: '#64748B',
  gray: '#6B7280',
  zinc: '#71717A',
  neutral: '#737373',
  stone: '#78716C',
};

// NASA-style logger (simplified version)
const nasaLog = (severity: string, module: string, message: string, context?: object) => {
  const timestamp = new Date().toISOString();
  console.log(`[${severity}] [${timestamp}] [${module}] :: ${message}`, context || '');
};

// Helper function to process color input
const processColorInput = (input: ColorInput): ProcessedColor => {
  if (typeof input === 'string') {
    // Handle simple string input like "green"
    const colorValue = COLOR_MAPPINGS[input.toLowerCase()] || input;
    return {
      mode: input.toLowerCase(),
      value: colorValue,
      originalInput: input,
    };
  } else if (typeof input === 'object' && input !== null && 'mode' in input && 'value' in input) {
    // Handle object input like {"mode": "green", "value": "#20B486"}
    return {
      mode: input.mode,
      value: input.value,
      originalInput: input,
    };
  } else {
    // Fallback to default
    nasaLog('WARN', MODULE_TAG, 'Invalid color input, falling back to default', { input });
    return {
      mode: DEFAULT_PRIMARY,
      value: COLOR_MAPPINGS[DEFAULT_PRIMARY],
      originalInput: DEFAULT_PRIMARY,
    };
  }
};

// Helper function to parse color from string (for handling stored values)
const parseColorFromString = (colorString: string): ColorInput => {
  try {
    // Try to parse as JSON object first
    if (colorString.startsWith('{') || colorString.startsWith('"{"')) {
      const cleaned = colorString.replace(/^"|"$/g, '').replace(/=>/g, ':');
      const parsed = JSON.parse(cleaned);
      if (parsed.mode && parsed.value) {
        return parsed as ColorObject;
      }
    }
  } catch (e) {
    // If JSON parsing fails, treat as simple string
  }
  
  // Return as simple string
  return colorString;
};

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user: auth0User } = useUser();
  const [primaryColorState, setPrimaryColorState] = useState<ProcessedColor>(
    processColorInput(DEFAULT_PRIMARY)
  );
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Enhanced setPrimaryColor function that accepts both formats
  const setPrimaryColor = useCallback((color: ColorInput) => {
    nasaLog('INFO', MODULE_TAG, 'Setting primary color', { 
      input: color,
      type: typeof color 
    });
    
    const processedColor = processColorInput(color);
    setPrimaryColorState(processedColor);
    
    // Store the original input format for persistence here
    try {
      const storageValue = typeof color === 'object' ? JSON.stringify(color) : color;
      localStorage.setItem('primaryColor', storageValue);
    } catch (e) {
      nasaLog('WARN', MODULE_TAG, 'Failed to store color in localStorage', { error: e });
    }
  }, []);

  // Helper functions for easier color access
  const getPrimaryColorValue = useCallback(() => primaryColorState.value, [primaryColorState.value]);
  const getPrimaryColorMode = useCallback(() => primaryColorState.mode, [primaryColorState.mode]);

  // Load stored color on mount
  useEffect(() => {
    const storedColor = localStorage.getItem('primaryColor');
    if (storedColor) {
      try {
        const parsedColor = parseColorFromString(storedColor);
        setPrimaryColor(parsedColor);
        nasaLog('INFO', MODULE_TAG, 'Loaded stored color', { storedColor, parsedColor });
      } catch (e) {
        nasaLog('WARN', MODULE_TAG, 'Failed to parse stored color, using default', { 
          storedColor, 
          error: e 
        });
      }
    }
  }, [setPrimaryColor]);

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
        
        // Update primary color based on school theme (handle both formats)
        if (selected.theme) {
          const parsedTheme = parseColorFromString(selected.theme);
          setPrimaryColor(parsedTheme);
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
  }, [auth0User?.sub, refreshTrigger, fetchUserData, fetchSchoolData, setPrimaryColor]);

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

  const handleSetCurrentSchool = useCallback((school: School | null) => {
    setCurrentSchool(school);
    if (school) {
      localStorage.setItem('lastSelectedSchool', school._id);
      if (school.theme) {
        const parsedTheme = parseColorFromString(school.theme);
        setPrimaryColor(parsedTheme);
      }
    }
  }, [setPrimaryColor]);

  const value = useMemo(() => ({
    primaryColor: primaryColorState,
    currentSchool,
    schools,
    setPrimaryColor,
    setCurrentSchool: handleSetCurrentSchool,
    refreshSchools,
    loading,
    error,
    getPrimaryColorValue,
    getPrimaryColorMode,
  }), [
    primaryColorState,
    currentSchool,
    schools,
    setPrimaryColor,
    handleSetCurrentSchool,
    refreshSchools,
    loading,
    error,
    getPrimaryColorValue,
    getPrimaryColorMode,
  ]);

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