// components/context/SchoolContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { School } from '@/context/ThemeContext';

interface SchoolContextType {
  currentSchool: School | null;
  setCurrentSchool: (school: School | null) => void;
  schoolsList: School[];
  setSchoolsList: (schools: School[]) => void;
}

export const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const useSchoolContext = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchoolContext must be used within a SchoolProvider');
  }
  return context;
};

interface SchoolProviderProps {
  children: ReactNode;
  initialSchool?: School | null;
  initialSchools?: School[];
}

export const SchoolProvider = ({ children, initialSchool = null, initialSchools = [] }: SchoolProviderProps) => {
  const [currentSchool, setCurrentSchool] = useState<School | null>(initialSchool);
  const [schoolsList, setSchoolsList] = useState<School[]>(initialSchools);

  // Sync initial values if they change (e.g. after async fetch in layout)
  useEffect(() => {
    if (initialSchool) setCurrentSchool(initialSchool);
  }, [initialSchool]);

  useEffect(() => {
    if (initialSchools && initialSchools.length > 0) {
      setSchoolsList(initialSchools);
    }
  }, [initialSchools]);

  return (
    <SchoolContext.Provider value={{
      currentSchool,
      setCurrentSchool,
      schoolsList,
      setSchoolsList
    }}>
      {children}
    </SchoolContext.Provider>
  );
};
