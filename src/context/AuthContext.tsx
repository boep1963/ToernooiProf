'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Organization } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isVerified: boolean;
  organization: Organization | null;
  orgNummer: number | null;
}

interface AuthContextType extends AuthState {
  login: (orgNummer: number) => Promise<void>;
  logout: () => Promise<void>;
  refreshOrganization: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    isVerified: false,
    organization: null,
    orgNummer: null,
  });

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setState({
            isAuthenticated: true,
            isLoading: false,
            isVerified: data.verified === true,
            organization: data.organization,
            orgNummer: data.orgNummer,
          });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    checkSession();
  }, []);

  const login = async (orgNummer: number) => {
    // Fetch organization data after successful login
    try {
      const res = await fetch(`/api/organizations/${orgNummer}`);
      if (res.ok) {
        const organization = await res.json();
        setState({
          isAuthenticated: true,
          isLoading: false,
          isVerified: true,
          organization,
          orgNummer,
        });
      }
    } catch (error) {
      console.error('Error loading organization:', error);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Continue with local logout even if API fails
    }
    setState({
      isAuthenticated: false,
      isLoading: false,
      isVerified: false,
      organization: null,
      orgNummer: null,
    });
  };

  const refreshOrganization = async () => {
    const currentOrgNr = state.orgNummer;
    if (!currentOrgNr) return;
    try {
      const res = await fetch(`/api/organizations/${currentOrgNr}`);
      if (res.ok) {
        const organization = await res.json();
        setState((prev) => (prev.orgNummer === currentOrgNr ? { ...prev, organization } : prev));
      }
    } catch (error) {
      console.error('Error refreshing organization:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshOrganization }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
