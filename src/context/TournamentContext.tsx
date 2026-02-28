'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface ActiveTournament {
  compNr: number;
  compNaam: string;
}

interface TournamentContextType {
  activeTournament: ActiveTournament | null;
  setActiveTournament: (comp: ActiveTournament | null) => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

const STORAGE_KEY = 'toernooiprof-active-tournament';

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const [activeTournament, setActiveTournamentState] = useState<ActiveTournament | null>(null);

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.compNr === 'number' && typeof parsed.compNaam === 'string') {
          setActiveTournamentState(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const setActiveTournament = useCallback((comp: ActiveTournament | null) => {
    setActiveTournamentState(comp);
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
    <TournamentContext.Provider value={{ activeTournament, setActiveTournament }}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament(): TournamentContextType {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
}

