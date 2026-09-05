// components/context/SchoolContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { School } from '@/context/ThemeContext';
import { Term } from '@/lib/api/school-api';

interface SchoolContextType {
  currentSchool: School | null;
  setCurrentSchool: (school: School | null) => void;
  schoolsList: School[];
  setSchoolsList: (schools: School[]) => void;
  selectedAcademicYear: string;
  setSelectedAcademicYear: (year: string) => void;
  currentTerm: Term | null;
  setCurrentTerm: (term: Term | null) => void;
  termsList: Term[];
  setTermsList: (terms: Term[]) => void;
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
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(() => new Date().getFullYear().toString());
  const [currentTerm, setCurrentTerm] = useState<Term | null>(null);
  const [termsList, setTermsList] = useState<Term[]>([]);

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
      setSchoolsList,
      selectedAcademicYear,
      setSelectedAcademicYear,
      currentTerm,
      setCurrentTerm,
      termsList,
      setTermsList
    }}>
      {children}
    </SchoolContext.Provider>
  );
};
