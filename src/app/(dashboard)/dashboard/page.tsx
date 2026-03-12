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

interface OrgListItem {
  org_nummer: number;
  org_naam: string;
  org_code: string;
  org_wl_email: string;
}

interface OrgDetail extends OrgListItem {
  org_wl_naam?: string;
  org_logo?: string;
  aantal_tafels?: number;
  nieuwsbrief?: number;
}

export default function DashboardPage() {
  const { organization, orgNummer } = useAuth();
  const [showAdminOrgSearch, setShowAdminOrgSearch] = useState<boolean | null>(null);

  const [competitions, setCompetitions] = useState<CompetitionItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const [orgSearchTerm, setOrgSearchTerm] = useState('');
  const [orgSearchResults, setOrgSearchResults] = useState<OrgListItem[]>([]);
  const [orgSearchLoading, setOrgSearchLoading] = useState(false);
  const [lastOrgSearchTerm, setLastOrgSearchTerm] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<OrgDetail | null>(null);
  const [orgDetailLoading, setOrgDetailLoading] = useState(false);

  useEffect(() => {
    if (!orgNummer) {
      setShowAdminOrgSearch(false);
      return;
    }
    let cancelled = false;
    apiFetch('/api/admin/check', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setShowAdminOrgSearch(data.isSuperAdmin === true);
      })
      .catch(() => {
        if (!cancelled) setShowAdminOrgSearch(false);
      });
    return () => { cancelled = true; };
  }, [orgNummer]);

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

  const handleOrgSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgSearchTerm.trim()) return;
    setOrgSearchLoading(true);
    setSelectedOrg(null);
    const term = orgSearchTerm.trim();
    try {
      const res = await apiFetch(
        `/api/admin/organizations?search=${encodeURIComponent(term)}`
      );
      if (res.ok) {
        const data = await res.json();
        setOrgSearchResults(data.organizations ?? []);
        setLastOrgSearchTerm(term);
      } else {
        setOrgSearchResults([]);
        setLastOrgSearchTerm(term);
      }
    } catch {
      setOrgSearchResults([]);
      setLastOrgSearchTerm(term);
    } finally {
      setOrgSearchLoading(false);
    }
  };

  const handleShowOrgDetail = async (orgNr: number) => {
    setOrgDetailLoading(true);
    setSelectedOrg(null);
    try {
      const res = await apiFetch(`/api/admin/organizations/${orgNr}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrg(data);
      }
    } catch {
      setSelectedOrg(null);
    } finally {
      setOrgDetailLoading(false);
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

      {showAdminOrgSearch === true && (
        <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Organisatie opzoeken (beheerder)
          </h2>
          <form onSubmit={handleOrgSearch} className="flex flex-wrap items-center gap-3 mb-4">
            <input
              type="text"
              value={orgSearchTerm}
              onChange={(e) => setOrgSearchTerm(e.target.value)}
              placeholder="Organisatienummer, naam of e-mail"
              className="flex-1 min-w-[200px] px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
            <button
              type="submit"
              disabled={orgSearchLoading}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium rounded-lg text-sm transition-colors"
            >
              {orgSearchLoading ? 'Zoeken...' : 'Zoeken'}
            </button>
          </form>

          {!orgSearchLoading && lastOrgSearchTerm !== null && orgSearchResults.length === 0 && (
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Geen organisaties gevonden voor &quot;{lastOrgSearchTerm}&quot;.
            </p>
          )}

          {orgSearchResults.length > 0 && (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg mb-4">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">Nr</th>
                    <th className="text-left px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">Naam</th>
                    <th className="text-left px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">Code</th>
                    <th className="text-left px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">E-mail</th>
                    <th className="text-right px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {orgSearchResults.map((org) => (
                    <tr key={org.org_nummer} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-4 py-2 text-slate-900 dark:text-white tabular-nums">{org.org_nummer}</td>
                      <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{org.org_naam}</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{org.org_code}</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{org.org_wl_email}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleShowOrgDetail(org.org_nummer)}
                          disabled={orgDetailLoading}
                          className="text-orange-600 dark:text-orange-400 hover:underline font-medium text-sm"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {orgDetailLoading && (
            <p className="text-sm text-slate-500 dark:text-slate-400">Details laden...</p>
          )}

          {selectedOrg && !orgDetailLoading && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-700/30">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Organisatiedetails</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <dt className="text-slate-500 dark:text-slate-400">Organisatienummer</dt>
                <dd className="text-slate-900 dark:text-white">{selectedOrg.org_nummer}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Naam</dt>
                <dd className="text-slate-900 dark:text-white">{selectedOrg.org_naam}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Code</dt>
                <dd className="text-slate-900 dark:text-white">{selectedOrg.org_code || '–'}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Wedstrijdleider naam</dt>
                <dd className="text-slate-900 dark:text-white">{selectedOrg.org_wl_naam ?? '–'}</dd>
                <dt className="text-slate-500 dark:text-slate-400">E-mail</dt>
                <dd className="text-slate-900 dark:text-white">{selectedOrg.org_wl_email || '–'}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Aantal tafels</dt>
                <dd className="text-slate-900 dark:text-white">{selectedOrg.aantal_tafels ?? '–'}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Nieuwsbrief</dt>
                <dd className="text-slate-900 dark:text-white">{selectedOrg.nieuwsbrief ?? '–'}</dd>
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
