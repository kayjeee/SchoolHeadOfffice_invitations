'use client';

import React, { createContext, useContext, useState } from 'react';

interface GodmodeContextType {
  godMode: boolean;
  setGodMode: (value: boolean) => void;
}

const GodmodeContext = createContext<GodmodeContextType | undefined>(undefined);

export function GodmodeProvider({ children }: { children: React.ReactNode }) {
  const [godMode, setGodMode] = useState(false);

  return (
    <GodmodeContext.Provider value={{ godMode, setGodMode }}>
      {children}
    </GodmodeContext.Provider>
  );
}

export function useGodmode() {
  const context = useContext(GodmodeContext);
  if (context === undefined) {
    throw new Error('useGodmode must be used within a GodmodeProvider');
  }
  return context;
}
