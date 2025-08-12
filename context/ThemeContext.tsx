import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { useUser } from "@auth0/nextjs-auth0/client";

const MODULE_TAG = 'THEME_CONTEXT';
const DEFAULT_PRIMARY = 'white';
const DEFAULT_SECONDARY = 'white';

// Add your Rails API base URL here
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

/**
 * Enhanced NASA-style logger with high visibility terminal output
 * Includes both structured JSON logging and human-readable console output
 */
const nasaLog = (severity: string, module: string, message: string, context?: object) => {
  const timestamp = new Date().toISOString();
  
  // Structured log entry for systems
  const logEntry = {
    timestamp,
    severity,
    module,
    message,
    ...context
  };

  // High-visibility console logging for terminal
  const colors = {
    EMERG: '\x1b[41m\x1b[37m',   // Red background, white text
    ALERT: '\x1b[45m\x1b[37m',   // Magenta background, white text
    CRIT: '\x1b[41m\x1b[33m',    // Red background, yellow text
    ERROR: '\x1b[31m',           // Red text
    WARN: '\x1b[33m',            // Yellow text
    NOTICE: '\x1b[36m',          // Cyan text
    INFO: '\x1b[32m',            // Green text
    DEBUG: '\x1b[34m',           // Blue text
  };
  
  const reset = '\x1b[0m';
  const bold = '\x1b[1m';
  const color = colors[severity as keyof typeof colors] || '\x1b[37m';
  
  // Enhanced terminal output with colors and formatting
  console.log(`${color}${bold}[${severity}]${reset} ${color}[${timestamp}]${reset} ${bold}[${module}]${reset} :: ${message}`);
  
  if (context && Object.keys(context).length > 0) {
    console.log(`${color}📊 Context:${reset}`, JSON.stringify(context, null, 2));
  }
  
  // Separator line for better readability
  console.log(`${color}${'─'.repeat(80)}${reset}`);
  
  // Also output structured JSON for log aggregation systems
  console.log(JSON.stringify(logEntry));
};

// Define your types
export interface School {
  _id: string;
  schoolName: string;
  theme?: string;
}

interface User {
  _id: string;
  auth0_id: string;
  email: string;
  name: string;
  roles: string[];
  school_ids: string[];
}

interface ThemeContextType {
  primaryColor: string;
  secondaryColor: string;
  currentSchool: School | null;
  schools: School[];
  setCurrentSchool: (school: School) => void;
  refreshSchools: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const defaultTheme = {
  primaryColor: DEFAULT_PRIMARY,
  secondaryColor: DEFAULT_SECONDARY,
};

const ThemeContext = createContext<ThemeContextType>({
  ...defaultTheme,
  currentSchool: null,
  schools: [],
  setCurrentSchool: () => {},
  refreshSchools: async () => {},
  loading: false,
  error: null,
});

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { user: auth0User } = useUser();
  const [schools, setSchools] = useState<School[]>([]);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // High-visibility startup logging
  useEffect(() => {
    nasaLog('INFO', MODULE_TAG, '🚀 THEME PROVIDER INITIALIZING', {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      apiBaseUrl: API_BASE_URL,
    });
  }, []);

  // Debug log to verify user context in ThemeProvider
  useEffect(() => {
    nasaLog('DEBUG', MODULE_TAG, '👤 ThemeProvider received auth context', {
      hasUser: !!auth0User,
      userId: auth0User?.sub || 'none',
      email: auth0User?.email || 'none',
      userObject: auth0User ? 'present' : 'absent',
    });
  }, [auth0User]);

  const refreshSchools = useCallback(() => {
    nasaLog('INFO', MODULE_TAG, '🔄 Manual refresh triggered', {
      previousTrigger: refreshTrigger,
      newTrigger: refreshTrigger + 1,
    });
    setRefreshTrigger((prev) => prev + 1);
    return Promise.resolve();
  }, [refreshTrigger]);

  /**
   * Fetch user data from Rails API using Auth0 ID
   */
  const fetchUserData = useCallback(async (auth0Id: string): Promise<User | null> => {
    const startTime = Date.now();
    
    try {
      nasaLog('INFO', MODULE_TAG, '🔍 Fetching user data from Rails API', {
        auth0Id,
        endpoint: `${API_BASE_URL}/api/v1/users/${encodeURIComponent(auth0Id)}`,
        startTime: new Date(startTime).toISOString(),
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

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      nasaLog('DEBUG', MODULE_TAG, '📦 Raw API response received', {
        responseStatus: response.status,
        responseHeaders: Object.fromEntries(response.headers.entries()),
        responseData: data,
        duration: `${duration}ms`,
      });
      
      if (!data.success || !data.data?.user) {
        throw new Error('Invalid user data structure received');
      }

      const userData = data.data.user;
      
      nasaLog('INFO', MODULE_TAG, '✅ Successfully fetched user data', {
        userId: userData._id,
        email: userData.email,
        name: userData.name,
        roles: userData.roles,
        schoolCount: userData.school_ids?.length || 0,
        schoolIds: userData.school_ids,
        duration: `${duration}ms`,
      });

      return userData;
    } catch (err: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      nasaLog('ERROR', MODULE_TAG, '❌ Failed to fetch user data', {
        auth0Id,
        errorMessage: err.message,
        errorType: err.constructor.name,
        errorStack: err.stack,
        duration: `${duration}ms`,
      });
      throw err;
    }
  }, []);

  /**
   * Fetch school data from Rails API
   */
  const fetchSchoolData = useCallback(async (schoolId: string): Promise<School | null> => {
    const startTime = Date.now();
    
    try {
      nasaLog('DEBUG', MODULE_TAG, '🏫 Fetching school data', {
        schoolId,
        endpoint: `${API_BASE_URL}/api/v1/schools/${schoolId}`,
        startTime: new Date(startTime).toISOString(),
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

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      nasaLog('DEBUG', MODULE_TAG, '📦 School API response received', {
        schoolId,
        responseStatus: response.status,
        responseData: data,
        duration: `${duration}ms`,
      });
      
      if (!data.school) {
        throw new Error('Invalid school data structure received');
      }

      nasaLog('DEBUG', MODULE_TAG, '✅ Successfully fetched school data', {
        schoolId: data.school._id,
        schoolName: data.school.schoolName,
        hasTheme: !!data.school.theme,
        theme: data.school.theme || 'none',
        duration: `${duration}ms`,
      });

      return data.school;
    } catch (err: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      nasaLog('ERROR', MODULE_TAG, '❌ Failed to fetch school data', {
        schoolId,
        errorMessage: err.message,
        errorType: err.constructor.name,
        errorStack: err.stack,
        duration: `${duration}ms`,
      });
      return null;
    }
  }, []);

  /**
   * Main function to fetch user schools from Rails API
   */
  const fetchUserSchools = useCallback(async () => {
    const processStartTime = Date.now();
    
    nasaLog('INFO', MODULE_TAG, '🎯 Starting comprehensive school fetch process', {
      auth0Id: auth0User?.sub || 'none',
      triggerCount: refreshTrigger,
      processStartTime: new Date(processStartTime).toISOString(),
    });

    setLoading(true);
    setError(null);

    try {
      if (!auth0User?.sub) {
        nasaLog('WARN', MODULE_TAG, '⚠️ Skipping school fetch - no authenticated user', {
          userState: 'null',
          auth0User: auth0User ? 'present but no sub' : 'absent',
        });
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
        nasaLog('WARN', MODULE_TAG, '⚠️ User has no school_ids', { 
          userId: userData._id,
          email: userData.email,
          name: userData.name,
          roles: userData.roles,
        });
        setSchools([]);
        setCurrentSchool(null);
        setLoading(false);
        return;
      }

      // Fetch all schools in parallel
      nasaLog('INFO', MODULE_TAG, '🔄 Fetching multiple schools in parallel', {
        schoolIds,
        schoolCount: schoolIds.length,
        strategy: 'Promise.all',
      });

      const schoolPromises = schoolIds.map(schoolId => fetchSchoolData(schoolId));
      const schoolResults = await Promise.all(schoolPromises);
      
      // Filter out null results (failed fetches)
      const validSchools = schoolResults.filter((school): school is School => school !== null);
      
      if (validSchools.length === 0) {
        throw new Error('No valid schools could be fetched');
      }

      setSchools(validSchools);

      const processDuration = Date.now() - processStartTime;
      
      nasaLog('INFO', MODULE_TAG, '🎉 Successfully completed school fetch process', {
        requestedCount: schoolIds.length,
        successfulCount: validSchools.length,
        failedCount: schoolIds.length - validSchools.length,
        totalDuration: `${processDuration}ms`,
        schoolsData: validSchools.map(s => ({
          id: s._id,
          name: s.schoolName,
          hasTheme: !!s.theme,
        })),
      });

      selectCurrentSchool(validSchools);
    } catch (err: any) {
      const processDuration = Date.now() - processStartTime;
      
      nasaLog('CRIT', MODULE_TAG, '💥 CRITICAL FAILURE in school fetching process', {
        errorMessage: err.message,
        errorType: err.constructor.name,
        errorStack: err.stack,
        auth0Id: auth0User?.sub,
        totalDuration: `${processDuration}ms`,
      });
      setError(`Failed to load school information: ${err.message}`);
      setSchools([]);
      setCurrentSchool(null);
    } finally {
      setLoading(false);
    }
  }, [auth0User?.sub, refreshTrigger, fetchUserData, fetchSchoolData]);

  // Watch for user to be defined before fetching schools
  useEffect(() => {
    if (auth0User?.sub) {
      nasaLog('INFO', MODULE_TAG, '👤 User available, triggering school fetch', {
        auth0Id: auth0User.sub,
        email: auth0User.email,
        name: auth0User.name,
        userDataAvailable: true,
      });
      fetchUserSchools();
    } else {
      nasaLog('DEBUG', MODULE_TAG, '⏳ Waiting for user authentication', {
        auth0User: auth0User ? 'present but incomplete' : 'absent',
      });
    }
  }, [auth0User?.sub, fetchUserSchools]);

  const selectCurrentSchool = useCallback((schools: School[]) => {
    nasaLog('INFO', MODULE_TAG, '🎯 Selecting current school from available options', {
      availableSchools: schools.length,
      schoolOptions: schools.map(s => ({ id: s._id, name: s.schoolName })),
    });
    
    const lastSchoolId = localStorage.getItem('lastSelectedSchool');
    let selected: School | null = null;

    if (lastSchoolId) {
      selected = schools.find((s) => s._id === lastSchoolId) || null;
      
      if (selected) {
        nasaLog('INFO', MODULE_TAG, '✅ Restored school from localStorage', {
          schoolId: selected._id,
          schoolName: selected.schoolName,
          lastSchoolId,
          restorationSuccess: true,
        });
      } else {
        nasaLog('WARN', MODULE_TAG, '⚠️ School from localStorage not found in current schools', {
          lastSchoolId,
          availableSchools: schools.map(s => ({ id: s._id, name: s.schoolName })),
          restorationSuccess: false,
        });
      }
    }

    if (!selected && schools.length > 0) {
      selected = schools[0];
      nasaLog('INFO', MODULE_TAG, '🎯 Selected first available school as default', {
        schoolId: selected._id,
        schoolName: selected.schoolName,
        selectionMethod: 'first_available',
      });
    }

    if (selected) {
      setCurrentSchool(selected);
      localStorage.setItem('lastSelectedSchool', selected._id);
      
      nasaLog('INFO', MODULE_TAG, '🏆 CURRENT SCHOOL SET SUCCESSFULLY', {
        schoolId: selected._id,
        schoolName: selected.schoolName,
        theme: selected.theme || 'default',
        savedToLocalStorage: true,
      });
    } else {
      nasaLog('ERROR', MODULE_TAG, '❌ No school could be selected', {
        availableSchools: schools.length,
        reason: 'no_valid_schools',
      });
      setCurrentSchool(null);
    }
  }, []);

  const theme = useMemo(() => {
    if (!currentSchool) {
      nasaLog('DEBUG', MODULE_TAG, '🎨 Using default theme - no current school selected', {
        defaultPrimary: DEFAULT_PRIMARY,
        defaultSecondary: DEFAULT_SECONDARY,
        availableSchools: schools.length,
        themeSource: 'system_default',
      });
      return defaultTheme;
    }

    const primary = currentSchool.theme || DEFAULT_PRIMARY;
    const secondary = DEFAULT_SECONDARY;

    nasaLog('INFO', MODULE_TAG, '🎨 THEME CALCULATED FROM CURRENT SCHOOL', {
      schoolId: currentSchool._id,
      schoolName: currentSchool.schoolName,
      primaryColor: primary,
      secondaryColor: secondary,
      themeSource: currentSchool.theme ? 'school_custom' : 'school_default',
      hasCustomTheme: !!currentSchool.theme,
    });

    return {
      primaryColor: primary,
      secondaryColor: secondary,
    };
  }, [currentSchool, schools.length]);

  const handleSetCurrentSchool = useCallback((school: School) => {
    nasaLog('INFO', MODULE_TAG, '🔄 MANUALLY SETTING CURRENT SCHOOL', {
      previousSchoolId: currentSchool?._id || 'none',
      previousSchoolName: currentSchool?.schoolName || 'none',
      newSchoolId: school._id,
      newSchoolName: school.schoolName,
      newTheme: school.theme || 'default',
      changeSource: 'manual_selection',
    });
    
    setCurrentSchool(school);
    localStorage.setItem('lastSelectedSchool', school._id);
  }, [currentSchool]);

  // Log state changes
  useEffect(() => {
    nasaLog('DEBUG', MODULE_TAG, '📊 STATE UPDATE - Loading state changed', {
      loading,
      schoolCount: schools.length,
      hasCurrentSchool: !!currentSchool,
      hasError: !!error,
    });
  }, [loading, schools.length, currentSchool, error]);

  return (
    <ThemeContext.Provider
      value={{
        ...theme,
        currentSchool,
        schools,
        setCurrentSchool: handleSetCurrentSchool,
        refreshSchools,
        loading,
        error,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextType => useContext(ThemeContext);
