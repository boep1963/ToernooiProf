'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CompetitionProvider } from '@/context/CompetitionContext';
import ThemeToggle from '@/components/ThemeToggle';

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading, isVerified, organization, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/inloggen');
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/inloggen');
    } else if (!isLoading && isAuthenticated && !isVerified) {
      router.push('/verificatie');
    }
  }, [isAuthenticated, isLoading, isVerified, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Laden...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isVerified) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar with mobile menu toggle and theme toggle */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 lg:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Menu openen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Organization name and logo in header */}
          <div className="flex-1 flex items-center gap-3 ml-2 lg:ml-0">
            {organization?.org_logo && (
              <img
                src={organization.org_logo}
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
            )}
            {organization && (
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs" title={organization.org_naam}>
                {organization.org_naam}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors min-h-[44px]"
              aria-label="Uitloggen"
              title="Uitloggen"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Uitloggen</span>
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <CompetitionProvider>
        <AuthenticatedLayout>{children}</AuthenticatedLayout>
      </CompetitionProvider>
    </AuthProvider>
  );
}
