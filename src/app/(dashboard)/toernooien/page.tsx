'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTournament } from '@/context/TournamentContext';
import { DISCIPLINES } from '@/types';
import { formatDate, parseDutchDate } from '@/lib/dateUtils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface CompetitionItem {
  id: string;
  comp_nr: number;
  comp_naam: string;
  comp_datum: string;
  datum_start?: string;
  discipline: number;
}


export default function ToernooienPage() {
  const { orgNummer } = useAuth();
  const { activeTournament, setActiveTournament } = useTournament();
  const [competitions, setCompetitions] = useState<CompetitionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteStats, setDeleteStats] = useState<{players: number, results: number, matches: number} | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

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

  const fetchDeleteStats = async (compNr: number) => {
    if (!orgNummer) return;
    setLoadingStats(true);
    try {
      const playersRes = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/players`);
      let players = 0;
      if (playersRes.ok) {
        const data = await playersRes.json();
        players = data.count ?? data.players?.length ?? 0;
      }
      setDeleteStats({ players, results: 0, matches: 0 });
    } catch {
      setDeleteStats({ players: 0, results: 0, matches: 0 });
    } finally {
      setLoadingStats(false);
    }
  };

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
        if (activeTournament?.compNr === compNr) {
          setActiveTournament(null);
        }
        setDeleteConfirm(null);
        setDeleteStats(null);
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

  const hasValidActiveTournament = !!activeTournament &&
    competitions.some(comp => comp.comp_nr === activeTournament.compNr);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Toernooien
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Beheer uw toernooien
          </p>
        </div>
        <Link
          href="/toernooien/nieuw"
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nieuw toernooi
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
        <div role="status" className="mb-4 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm border border-orange-200 dark:border-orange-800 flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="ml-3 text-orange-500 hover:text-orange-700 dark:hover:text-orange-300 transition-colors" aria-label="Melding sluiten">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Active Tournament banner */}
      {hasValidActiveTournament && !isLoading && competitions.length > 0 && (
        <div className="mb-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-orange-800 dark:text-orange-300 uppercase tracking-wider">Laatst bekeken</p>
              <p className="text-sm font-medium text-orange-900 dark:text-orange-200">{activeTournament.compNaam}</p>
            </div>
          </div>
          <Link
            href={`/toernooien/${activeTournament!.compNr}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Doorgaan
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
          <LoadingSpinner size="lg" label="Toernooien laden..." />
        </div>
      ) : competitions.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-3">
            Er zijn nog geen toernooien aangemaakt.
          </p>
          <Link
            href="/toernooien/nieuw"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Eerste toernooi aanmaken
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
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {competitions.map((comp) => {
                  const isActive = activeTournament?.compNr === comp.comp_nr;
                  return (
                  <tr key={comp.id} className={`transition-colors ${isActive ? 'bg-orange-50/50 dark:bg-orange-900/10 border-l-2 border-l-orange-600 dark:border-l-orange-400' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 tabular-nums">{comp.comp_nr}</td>
                    <td className="px-4 py-3">
                      <Link href={`/toernooien/${comp.comp_nr}`} className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline">
                        {comp.comp_naam}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{formatDate(comp.datum_start || comp.comp_datum)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{DISCIPLINES[comp.discipline] || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setDeleteConfirm(comp.comp_nr);
                          fetchDeleteStats(comp.comp_nr);
                        }}
                        className="text-xs px-2.5 py-1.5 text-red-600 dark:text-red-200 border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors font-medium"
                      >
                        Verwijderen
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Competition Confirmation Dialog */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Toernooi verwijderen
            </h3>
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                ⚠️ Waarschuwing: Dit kan niet ongedaan gemaakt worden!
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                Bij het verwijderen van <strong>{competitions.find(c => c.comp_nr === deleteConfirm)?.comp_naam || `toernooi #${deleteConfirm}`}</strong> worden ook verwijderd:
              </p>
              {loadingStats ? (
                <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                  <div className="w-4 h-4 border-2 border-red-700 dark:border-red-300 border-t-transparent rounded-full animate-spin"></div>
                  Gegevens laden...
                </div>
              ) : deleteStats ? (
                <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                  <li><strong>{deleteStats.players} speler(s)</strong> inclusief alle uitslagen en poule-indeeling</li>
                  <li>Alle wedstrijden en uitslagen</li>
                  <li>Alle ronde-instellingen</li>
                </ul>
              ) : null}
              {!loadingStats && deleteStats && (deleteStats.results > 0 || deleteStats.players > 0) && (
                <p className="mt-3 text-sm font-semibold text-red-700 dark:text-red-400">
                  Alle gegevens van dit toernooi worden permanent verwijderd.
                </p>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Weet u zeker dat u dit toernooi wilt verwijderen?
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteConfirm(null);
                  setDeleteStats(null);
                }}
                disabled={deleteLoading}
                className="px-4 py-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
              >
                Annuleren
              </button>
              <button
                onClick={() => deleteConfirm !== null && handleDelete(deleteConfirm)}
                disabled={deleteLoading || loadingStats}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                {deleteLoading ? 'Bezig...' : 'Ja, verwijder toernooi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
