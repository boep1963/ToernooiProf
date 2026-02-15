'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Theme;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Priority: 1) initialTheme (from Firestore), 2) localStorage, 3) system preference
    let resolvedTheme: Theme = 'light';

    if (initialTheme === 'dark' || initialTheme === 'light') {
      // Use theme from Firestore (passed via AuthContext)
      resolvedTheme = initialTheme;
    } else {
      // Fall back to localStorage
      const saved = localStorage.getItem('clubmatch-theme') as Theme;
      if (saved === 'dark' || saved === 'light') {
        resolvedTheme = saved;
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Fall back to system preference
        resolvedTheme = 'dark';
      }
    }

    setTheme(resolvedTheme);
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    setIsInitialized(true);
  }, [initialTheme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';

    // Optimistic update for instant UI response
    setTheme(newTheme);
    localStorage.setItem('clubmatch-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');

    // Persist to Firestore in background
    try {
      await fetch('/api/organizations/theme', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: newTheme }),
      });
    } catch (error) {
      console.error('[THEME] Failed to persist theme to Firestore:', error);
      // Don't revert UI - localStorage still works as fallback
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
