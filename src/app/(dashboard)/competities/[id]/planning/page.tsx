'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { DISCIPLINES } from '@/types';
import CompetitionSubNav from '@/components/CompetitionSubNav';

interface CompetitionData {
  id: string;
  comp_nr: number;
  comp_naam: string;
  comp_datum: string;
  discipline: number;
  punten_sys: number;
  moy_form: number;
  min_car: number;
  sorteren: number;
  periode: number;
}

interface PlayerData {
  id: string;
  spc_nummer: number;
  spa_vnaam: string;
  spa_tv: string;
  spa_anaam: string;
}

interface MatchData {
  id: string;
  org_nummer: number;
  comp_nr: number;
  nummer_A: number;
  naam_A: string;
  cartem_A: number;
  nummer_B: number;
  naam_B: string;
  cartem_B: number;
  periode: number;
  uitslag_code: string;
  gespeeld: number;
  ronde: number;
  tafel: string;
}

export default function CompetitePlanningPage() {
  const params = useParams();
  const router = useRouter();
  const { orgNummer } = useAuth();

  // Add print styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body {
          background: white !important;
          color: black !important;
        }
        .print\\:hidden {
          display: none !important;
        }
        @page {
          margin: 1.5cm;
          size: A4 landscape;
        }
        /* Hide navigation and other UI elements */
        nav, header, aside, .sidebar {
          display: none !important;
        }
        /* Ensure tables don't break across pages */
        table {
          page-break-inside: auto;
        }
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        thead {
          display: table-header-group;
        }
        /* Optimize for print */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const compNr = parseInt(params.id as string, 10);

  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = useCallback(async () => {
    if (!orgNummer || isNaN(compNr)) return;
    setIsLoading(true);
    setError('');
    try {
      const [compRes, playersRes, matchesRes] = await Promise.all([
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`),
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/players`),
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/matches`),
      ]);

      if (!compRes.ok) {
        setError('Competitie niet gevonden.');
        setIsLoading(false);
        return;
      }

      const compData = await compRes.json();
      setCompetition(compData);

      if (playersRes.ok) {
        const playersData = await playersRes.json();
        setPlayers(playersData.players || []);
      }

      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        setMatches(matchesData.matches || []);
      }
    } catch {
      setError('Er is een fout opgetreden bij het laden.');
    } finally {
      setIsLoading(false);
    }
  }, [orgNummer, compNr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerateMatches = async (force: boolean = false) => {
    if (!orgNummer || !competition) return;
    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(
        `/api/organizations/${orgNummer}/competitions/${compNr}/matches`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ force }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMatches(data.matches || []);
        setSuccess(data.message || 'Wedstrijden succesvol gegenereerd!');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        if (res.status === 409 && !force) {
          // Matches already exist, ask to regenerate
          if (window.confirm('Er bestaan al wedstrijden. Wil je deze opnieuw genereren? Bestaande wedstrijden worden verwijderd.')) {
            handleGenerateMatches(true);
            return;
          }
        } else {
          setError(data.error || 'Fout bij genereren wedstrijden.');
        }
      }
    } catch {
      setError('Er is een fout opgetreden.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Group matches by round
  const matchesByRound = matches.reduce<Record<number, MatchData[]>>((acc, match) => {
    const round = match.ronde || 1;
    if (!acc[round]) acc[round] = [];
    acc[round].push(match);
    return acc;
  }, {});

  const roundNumbers = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  // Count unique pairings to verify each player plays every other exactly once
  const totalPairings = matches.length;
  const expectedPairings = players.length > 1
    ? (players.length * (players.length - 1)) / 2
    : 0;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
        <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 dark:text-slate-400">Laden...</p>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
        <p className="text-slate-600 dark:text-slate-400">Competitie niet gevonden.</p>
        <Link
          href="/competities"
          className="mt-4 inline-block px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors"
        >
          Naar competitieoverzicht
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="print:hidden">
        <CompetitionSubNav compNr={compNr} compNaam={competition.comp_naam} />
      </div>

      {/* Print header - only visible when printing */}
      <div className="hidden print:block mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">
          Wedstrijdplanning - {competition.comp_naam}
        </h1>
        <div className="text-sm text-gray-700 space-y-1">
          <p><strong>Discipline:</strong> {DISCIPLINES[competition.discipline]}</p>
          <p><strong>Aantal spelers:</strong> {players.length}</p>
          <p><strong>Aantal wedstrijden:</strong> {totalPairings}</p>
          <p><strong>Afgedrukt:</strong> {new Date().toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <hr className="mt-4 border-gray-300" />
      </div>

      <div className="mb-4 print:hidden">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Planning - {competition.comp_naam}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {DISCIPLINES[competition.discipline]} | {players.length} spelers
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800 flex items-center justify-between print:hidden">
          <span>{error}</span>
          <div className="flex items-center gap-2 ml-3">
            <button onClick={fetchData} className="text-xs px-2.5 py-1 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300 rounded-md transition-colors font-medium">
              Opnieuw proberen
            </button>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors" aria-label="Melding sluiten">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {success && (
        <div role="status" className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm border border-green-200 dark:border-green-800 flex items-center justify-between print:hidden">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="ml-3 text-green-500 hover:text-green-700 dark:hover:text-green-300 transition-colors" aria-label="Melding sluiten">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Stats bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6 print:hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Spelers</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{players.length}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Wedstrijden</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {totalPairings}
              {expectedPairings > 0 && totalPairings > 0 && totalPairings === expectedPairings && (
                <span className="ml-2 text-xs font-normal text-green-600 dark:text-green-400">
                  (volledig)
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Rondes</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{roundNumbers.length}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Gespeeld</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {matches.filter((m) => m.gespeeld === 1).length} / {totalPairings}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        {players.length >= 2 && (
          <button
            onClick={() => handleGenerateMatches(matches.length > 0)}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isGenerating ? 'Bezig met genereren...' : matches.length > 0 ? 'Opnieuw genereren' : 'Wedstrijden genereren'}
          </button>
        )}

        {matches.length > 0 && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg transition-colors shadow-sm print:hidden"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Afdrukken
          </button>
        )}
      </div>

      {players.length < 2 && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Voeg minimaal 2 spelers toe om wedstrijden te genereren.
        </p>
      )}

      {players.length < 2 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center print:hidden">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Voeg minimaal 2 spelers toe om wedstrijden te genereren.
          </p>
          <button
            onClick={() => router.push(`/competities/${compNr}/spelers`)}
            className="mt-4 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors text-sm"
          >
            Naar spelers
          </button>
        </div>
      )}

      {/* Matches by Round */}
      {roundNumbers.length > 0 && (
        <div className="space-y-4">
          {roundNumbers.map((roundNr) => (
            <div key={roundNr} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Ronde {roundNr}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Code</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Speler A</th>
                      <th className="text-center px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Car.</th>
                      <th className="text-center px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">vs</th>
                      <th className="text-center px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Car.</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Speler B</th>
                      <th className="text-center px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tafel</th>
                      <th className="text-center px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {matchesByRound[roundNr].map((match) => (
                      <tr key={match.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-2.5 text-xs text-slate-400 dark:text-slate-500 font-mono tabular-nums">
                          {match.uitslag_code}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {match.naam_A}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="text-sm text-green-700 dark:text-green-400 font-medium tabular-nums">
                            {match.cartem_A}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="text-xs text-slate-400 dark:text-slate-500">vs</span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="text-sm text-green-700 dark:text-green-400 font-medium tabular-nums">
                            {match.cartem_B}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {match.naam_B}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {match.tafel || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {match.gespeeld === 1 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                              Gespeeld
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                              Wachtend
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state when no matches exist and enough players */}
      {matches.length === 0 && players.length >= 2 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center print:hidden">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-2">
            Er zijn nog geen wedstrijden gegenereerd.
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Klik op &quot;Wedstrijden genereren&quot; om het schema aan te maken.
          </p>
        </div>
      )}
    </div>
  );
}
