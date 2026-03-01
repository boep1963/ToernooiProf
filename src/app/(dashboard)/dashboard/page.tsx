'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardPage() {
  const { organization, orgNummer } = useAuth();

  // Stats state
  const [competitionCount, setCompetitionCount] = useState<number>(0);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch stats
  useEffect(() => {
    if (!orgNummer) return;

    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const compsRes = await fetch(`/api/organizations/${orgNummer}/competitions`);
        if (compsRes.ok) {
          const comps = await compsRes.json();
          // Competitions API returns raw array
          setCompetitionCount(Array.isArray(comps) ? comps.length : 0);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [orgNummer]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Dashboard
      </h1>

      {/* Welcome card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <p className="text-slate-600 dark:text-slate-400">
          Welkom bij ToernooiProf
          {organization?.org_naam ? `, ${organization.org_naam}` : ''}!
        </p>
        <p className="text-slate-500 dark:text-slate-500 mt-2 text-sm">
          Gebruik het menu aan de linkerkant om door de applicatie te navigeren.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Toernooien
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {statsLoading ? <Skeleton className="h-8 w-12 inline-block" /> : competitionCount}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-orange-600 dark:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
