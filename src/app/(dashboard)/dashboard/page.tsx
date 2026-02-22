'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { organization, orgNummer } = useAuth();

  // Stats state
  const [memberCount, setMemberCount] = useState<number>(0);
  const [competitionCount, setCompetitionCount] = useState<number>(0);
  const [matchCount, setMatchCount] = useState<number>(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    members: Array<{ id: string; nummer: number; naam: string }>;
    competitions: Array<{ id: string; nummer: number; naam: string }>;
  } | null>(null);
  const [searching, setSearching] = useState(false);

  // Fetch stats
  useEffect(() => {
    if (!orgNummer) return;

    const fetchStats = async () => {
      try {
        const [membersRes, compsRes, matchesRes] = await Promise.all([
          fetch(`/api/organizations/${orgNummer}/members`),
          fetch(`/api/organizations/${orgNummer}/competitions`),
          fetch(`/api/organizations/${orgNummer}/matches/count`),
        ]);

        if (membersRes.ok) {
          const membersData = await membersRes.json();
          // Members API returns { members: [...], count: N, org_nummer: X }
          setMemberCount(membersData.count || 0);
        }
        if (compsRes.ok) {
          const comps = await compsRes.json();
          // Competitions API returns raw array
          setCompetitionCount(Array.isArray(comps) ? comps.length : 0);
        }
        if (matchesRes.ok) {
          const matchesData = await matchesRes.json();
          // Matches count API returns { count: N }
          setMatchCount(matchesData.count || 0);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [orgNummer]);

  // Handle search
  const handleSearch = async () => {
    if (!orgNummer || !searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `/api/organizations/${orgNummer}/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      } else {
        setSearchResults(null);
      }
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults(null);
    } finally {
      setSearching(false);
    }
  };

  // Handle search on Enter key
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Dashboard
      </h1>

      {/* Welcome card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <p className="text-slate-600 dark:text-slate-400">
          Welkom bij ClubMatch
          {organization?.org_naam ? `, ${organization.org_naam}` : ''}!
        </p>
        <p className="text-slate-500 dark:text-slate-500 mt-2 text-sm">
          Gebruik het menu aan de linkerkant om door de applicatie te navigeren.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Competities
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {competitionCount}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400"
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

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Leden
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {memberCount}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick search */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Snelzoeken
        </h2>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Zoek een lid of competitie..."
            className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="px-4 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-green-700/50 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            {searching ? 'Zoeken...' : 'Zoeken'}
          </button>
        </div>

        {/* Search results */}
        {searchResults && (
          <div className="space-y-4">
            {/* Members results */}
            {searchResults.members.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Leden ({searchResults.members.length})
                </h3>
                <div className="space-y-1">
                  {searchResults.members.map((member) => (
                    <a
                      key={member.id}
                      href={`/leden/${member.nummer}/bewerken`}
                      className="block px-3 py-2 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <span className="text-sm text-slate-900 dark:text-white font-medium">
                        {member.naam}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                        (#{member.nummer})
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Competitions results */}
            {searchResults.competitions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Competities ({searchResults.competitions.length})
                </h3>
                <div className="space-y-1">
                  {searchResults.competitions.map((comp) => (
                    <a
                      key={comp.id}
                      href={`/competities/${comp.nummer}`}
                      className="block px-3 py-2 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <span className="text-sm text-slate-900 dark:text-white font-medium">
                        {comp.naam}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                        (#{comp.nummer})
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {searchResults.members.length === 0 && searchResults.competitions.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Geen resultaten gevonden voor &quot;{searchQuery}&quot;
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
