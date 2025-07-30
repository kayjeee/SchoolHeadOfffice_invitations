// app/context/SchoolContext.js
import { createContext, useContext, useState } from 'react';
// The useApp import is removed as it's not directly related to Auth0 user management
// and this context focuses on school data.

export const SchoolContext = createContext();

export const useSchoolContext = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchoolContext must be used within a SchoolProvider');
  }
  return context;
};

export const SchoolProvider = ({ children, school }) => {
  const [currentSchool, setCurrentSchool] = useState(school);

  const updateSchool = (newSchool) => {
    setCurrentSchool(newSchool);
  };

  return (
    <SchoolContext.Provider value={{
      school: currentSchool,
      updateSchool
    }}>
      {children}
    </SchoolContext.Provider>
  );
};
