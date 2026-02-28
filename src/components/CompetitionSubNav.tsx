'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTournament } from '@/context/TournamentContext';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';

interface CompetitionSubNavProps {
  compNr: number;
  compNaam: string;
  periode?: number;
}

const navItems = [
  { label: 'Overzicht', segment: '', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z' },
  { label: 'Spelers', segment: '/spelers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { label: 'Uitslagbeheer', segment: '/planning', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { label: 'Stand', segment: '/stand', icon: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { label: 'Uitslagen per speler', segment: '/uitslagen/per-speler', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { label: 'Ronden', segment: '/ronden', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
  { label: 'Controle', segment: '/controle', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', adminOnly: true },
];

export default function CompetitionSubNav({ compNr, compNaam, periode }: CompetitionSubNavProps) {
  const pathname = usePathname();
  const { isSuperAdmin } = useSuperAdmin();
  const basePath = `/toernooien/${compNr}`;
  const { setActiveTournament } = useTournament();

  const visibleNavItems = navItems.filter(
    (item) => !('adminOnly' in item && item.adminOnly) || isSuperAdmin
  );

  // Set this tournament as active whenever a sub-page is viewed
  useEffect(() => {
    setActiveTournament({ compNr, compNaam });
  }, [compNr, compNaam, setActiveTournament]);

  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3" aria-label="Breadcrumb">
        <Link
          href="/toernooien"
          className="hover:text-orange-600 dark:hover:text-orange-400 hover:underline transition-colors"
        >
          Toernooien
        </Link>
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link
          href={basePath}
          className="hover:text-orange-600 dark:hover:text-orange-400 hover:underline transition-colors font-medium text-slate-700 dark:text-slate-300"
        >
          {compNaam}
        </Link>
        {periode !== undefined && (
          <>
            <span className="text-slate-400 dark:text-slate-500 mx-1">—</span>
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
               Ronde {periode}
             </span>
          </>
        )}
      </nav>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <nav className="flex min-w-max" aria-label="Toernooi navigatie">
            {visibleNavItems.map((item) => {
              const href = `${basePath}${item.segment}`;
              // Determine if this item is active, ensuring the most specific match wins.
              // A parent route (e.g. /uitslagen) should NOT be active if a child route
              // (e.g. /uitslagen/overzicht) is a better match for the current pathname.
              let isActive: boolean;
              if (item.segment === '') {
                isActive = pathname === basePath;
              } else if (pathname === href) {
                isActive = true;
              } else if (pathname.startsWith(href + '/')) {
                // Only mark active if no other nav item has a longer segment that also matches
                const hasMoreSpecificMatch = visibleNavItems.some(
                  (other) =>
                    other.segment !== item.segment &&
                    other.segment.length > item.segment.length &&
                    (pathname === `${basePath}${other.segment}` ||
                      pathname.startsWith(`${basePath}${other.segment}/`))
                );
                isActive = !hasMoreSpecificMatch;
              } else {
                isActive = false;
              }

              return (
                <Link
                  key={item.label}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-orange-600 text-orange-600 dark:text-orange-400 dark:border-orange-400 bg-orange-50/50 dark:bg-orange-900/20'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
