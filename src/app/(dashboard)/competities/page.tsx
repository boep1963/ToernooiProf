'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCompetition } from '@/context/CompetitionContext';
import { DISCIPLINES } from '@/types';
import { formatDate, parseDutchDate } from '@/lib/dateUtils';

interface CompetitionItem {
  id: string;
  comp_nr: number;
  comp_naam: string;
  comp_datum: string;
  discipline: number;
  punten_sys: number;
}

const PUNTEN_SYSTEMEN: Record<number, string> = {
  1: 'WRV 2-1-0',
  2: '10-punten',
  3: 'Belgisch',
};

export default function CompetitiesPage() {
  const { orgNummer } = useAuth();
  const { activeCompetition } = useCompetition();
  const [competitions, setCompetitions] = useState<CompetitionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCompetitions = useCallback(async () => {
    if (!orgNummer) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/competitions`);
      if (res.ok) {
        const data = await res.json();
        // Sort competitions by date (newest first)
        const sorted = data.sort((a: CompetitionItem, b: CompetitionItem) => {
          const dateA = parseDutchDate(a.comp_datum);
          const dateB = parseDutchDate(b.comp_datum);
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return dateB.getTime() - dateA.getTime();
        });
        setCompetitions(sorted);
      } else {
        setError('Fout bij ophalen competities.');
      }
    } catch {
      setError('Er is een fout opgetreden.');
    } finally {
      setIsLoading(false);
    }
  }, [orgNummer]);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  const handleDelete = async (compNr: number) => {
    if (!orgNummer) return;
    setDeleteLoading(true);
    setError('');
    setSuccess('');
    try {
      const deletedComp = competitions.find(c => c.comp_nr === compNr);
      const res = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const naam = deletedComp?.comp_naam || `#${compNr}`;
        setCompetitions(prev => prev.filter(c => c.comp_nr !== compNr));
        setDeleteConfirm(null);
        setSuccess(`Competitie "${naam}" is succesvol verwijderd.`);
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError('Fout bij verwijderen competitie.');
      }
    } catch {
      setError('Er is een fout opgetreden bij het verwijderen.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Competities
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Beheer uw biljartcompetities
          </p>
        </div>
        <Link
          href="/competities/nieuw"
          className="flex items-center gap-2 px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nieuwe competitie
        </Link>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800 flex items-center justify-between">
          <span>{error}</span>
          <div className="flex items-center gap-2 ml-3">
            <button onClick={fetchCompetitions} className="text-xs px-2.5 py-1 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300 rounded-md transition-colors font-medium">
              Opnieuw proberen
            </button>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors" aria-label="Melding sluiten">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {success && (
        <div role="status" className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm border border-green-200 dark:border-green-800 flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="ml-3 text-green-500 hover:text-green-700 dark:hover:text-green-300 transition-colors" aria-label="Melding sluiten">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Active competition banner */}
      {activeCompetition && !isLoading && competitions.length > 0 && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-700 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-green-800 dark:text-green-300 uppercase tracking-wider">Laatst bekeken</p>
              <p className="text-sm font-medium text-green-900 dark:text-green-200">{activeCompetition.compNaam}</p>
            </div>
          </div>
          <Link
            href={`/competities/${activeCompetition.compNr}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Doorgaan
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Competities laden...</p>
        </div>
      ) : competitions.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-3">
            Er zijn nog geen competities aangemaakt.
          </p>
          <Link
            href="/competities/nieuw"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Eerste competitie aanmaken
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nr</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Naam</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Datum</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Discipline</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Puntensysteem</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {competitions.map((comp) => {
                  const isActive = activeCompetition?.compNr === comp.comp_nr;
                  return (
                  <tr key={comp.id} className={`transition-colors ${isActive ? 'bg-green-50/50 dark:bg-green-900/10 border-l-2 border-l-green-700 dark:border-l-green-400' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 tabular-nums">{comp.comp_nr}</td>
                    <td className="px-4 py-3">
                      <Link href={`/competities/${comp.comp_nr}`} className="text-sm font-medium text-green-700 dark:text-green-400 hover:underline">
                        {comp.comp_naam}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{formatDate(comp.comp_datum)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{DISCIPLINES[comp.discipline] || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{PUNTEN_SYSTEMEN[comp.punten_sys] || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      {deleteConfirm === comp.comp_nr ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(comp.comp_nr)}
                            disabled={deleteLoading}
                            className="text-xs px-2.5 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md transition-colors"
                          >
                            {deleteLoading ? 'Bezig...' : 'Bevestigen'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-xs px-2.5 py-1.5 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded-md transition-colors"
                          >
                            Annuleren
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(comp.comp_nr)}
                          className="text-xs px-2.5 py-1.5 text-red-600 dark:text-red-200 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                        >
                          Verwijderen
                        </button>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
