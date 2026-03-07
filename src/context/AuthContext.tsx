'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { Organization } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isVerified: boolean;
  organization: Organization | null;
  orgNummer: number | null;
}

interface AuthStateContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isVerified: boolean;
  organization: Organization | null;
}

interface AuthActionsContextType {
  orgNummer: number | null;
  login: (orgNummer: number) => Promise<void>;
  logout: () => Promise<void>;
  refreshOrganization: () => Promise<void>;
}

interface AuthContextType extends AuthStateContextType, AuthActionsContextType {}

const AuthStateContext = createContext<AuthStateContextType | undefined>(undefined);
const AuthActionsContext = createContext<AuthActionsContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    isVerified: false,
    organization: null,
    orgNummer: null,
  });

  const orgNummerRef = useRef<number | null>(null);
  orgNummerRef.current = state.orgNummer;

  useEffect(() => {
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

  const login = useCallback(async (orgNummer: number) => {
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
  }, []);

  const logout = useCallback(async () => {
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
  }, []);

  const refreshOrganization = useCallback(async () => {
    const currentOrgNr = orgNummerRef.current;
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
  }, []);

  const stateValue = useMemo(
    () => ({
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      isVerified: state.isVerified,
      organization: state.organization,
    }),
    [state.isAuthenticated, state.isLoading, state.isVerified, state.organization]
  );

  const actionsValue = useMemo(
    () => ({ orgNummer: state.orgNummer, login, logout, refreshOrganization }),
    [state.orgNummer, login, logout, refreshOrganization]
  );

  return (
    <AuthStateContext.Provider value={stateValue}>
      <AuthActionsContext.Provider value={actionsValue}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}

export function useAuthState(): AuthStateContextType {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  return context;
}

export function useAuthActions(): AuthActionsContextType {
  const context = useContext(AuthActionsContext);
  if (!context) {
    throw new Error('useAuthActions must be used within an AuthProvider');
  }
  return context;
}

export function useAuth(): AuthContextType {
  const state = useAuthState();
  const actions = useAuthActions();
  return useMemo(() => ({ ...state, ...actions }), [state, actions]);
}
