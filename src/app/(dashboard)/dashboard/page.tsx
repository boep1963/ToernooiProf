'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/Skeleton';
import { apiFetch } from '@/lib/api';
import { getLastOpenedTournament } from '@/lib/lastOpenedTournament';

interface CompetitionItem {
  comp_nr: number;
  comp_naam?: string;
  t_naam?: string;
  comp_datum?: string;
  [key: string]: unknown;
}

export default function DashboardPage() {
  const { organization, orgNummer } = useAuth();

  const [competitions, setCompetitions] = useState<CompetitionItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!orgNummer) return;

    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const compsRes = await apiFetch(`/api/organizations/${orgNummer}/competitions`);
        if (compsRes.ok) {
          const comps = await compsRes.json();
          setCompetitions(Array.isArray(comps) ? comps : []);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [orgNummer]);

  const competitionCount = competitions.length;
  const lastOpenedCompNr = orgNummer != null ? getLastOpenedTournament(orgNummer) : null;
  const lastOpenedCompetition =
    lastOpenedCompNr != null
      ? competitions.find((c) => Number(c.comp_nr) === lastOpenedCompNr)
      : null;

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Toernooien
              </p>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {statsLoading ? <Skeleton className="h-8 w-12 inline-block" /> : competitionCount}
              </div>
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

        {lastOpenedCompetition && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Laatst geopend toernooi
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1 truncate">
                  {lastOpenedCompetition.comp_naam ?? lastOpenedCompetition.t_naam ?? `Toernooi ${lastOpenedCompetition.comp_nr}`}
                </p>
              </div>
              <Link
                href={`/toernooien/${lastOpenedCompetition.comp_nr}`}
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
              >
                Openen
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
