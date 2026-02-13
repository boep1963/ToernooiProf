'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface ActiveCompetition {
  compNr: number;
  compNaam: string;
}

interface CompetitionContextType {
  activeCompetition: ActiveCompetition | null;
  setActiveCompetition: (comp: ActiveCompetition | null) => void;
}

const CompetitionContext = createContext<CompetitionContextType | undefined>(undefined);

const STORAGE_KEY = 'clubmatch-active-competition';

export function CompetitionProvider({ children }: { children: React.ReactNode }) {
  const [activeCompetition, setActiveCompetitionState] = useState<ActiveCompetition | null>(null);

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.compNr === 'number' && typeof parsed.compNaam === 'string') {
          setActiveCompetitionState(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const setActiveCompetition = useCallback((comp: ActiveCompetition | null) => {
    setActiveCompetitionState(comp);
    try {
      if (comp) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(comp));
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  return (
    <CompetitionContext.Provider value={{ activeCompetition, setActiveCompetition }}>
      {children}
    </CompetitionContext.Provider>
  );
}

export function useCompetition(): CompetitionContextType {
  const context = useContext(CompetitionContext);
  if (!context) {
    throw new Error('useCompetition must be used within a CompetitionProvider');
  }
  return context;
}
