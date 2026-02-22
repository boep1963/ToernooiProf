'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { DISCIPLINES } from '@/types';
import CompetitionSubNav from '@/components/CompetitionSubNav';
import { formatDate, toInputDate, fromInputDate } from '@/lib/dateUtils';

interface CompetitionData {
  id: string;
  comp_nr: number;
  comp_naam: string;
  comp_datum: string;
  discipline: number;
  punten_sys: number;
  periode: number;
}

interface MatchData {
  id: string;
  uitslag_code: string;
  naam_A: string;
  naam_B: string;
}

interface ResultData {
  id: string;
  uitslag_code: string;
  speeldatum: string;
  periode: number;
  sp_1_nr: number;
  sp_1_naam?: string;
  sp_1_cargem: number;
  sp_1_hs: number;
  sp_1_punt: number;
  sp_2_nr: number;
  sp_2_naam?: string;
  sp_2_cargem: number;
  sp_2_hs: number;
  sp_2_punt: number;
  brt: number;
  gespeeld: number;
}

interface EnrichedResult extends ResultData {
  naam_A: string;
  naam_B: string;
  moy_1: string;
  moy_2: string;
}

interface PlayerData {
  spc_nummer: number;
  spa_vnaam: string;
  spa_tv: string;
  spa_anaam: string;
}

const PUNTEN_SYSTEMEN: Record<number, string> = {
  1: 'WRV 2-1-0',
  2: '10-punten',
  3: 'Belgisch (12-punten)',
};

export default function ResultsOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const { orgNummer } = useAuth();

  const compNr = parseInt(params.id as string, 10);

  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [results, setResults] = useState<EnrichedResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resultToDelete, setResultToDelete] = useState<EnrichedResult | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Date range filters (input values)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState('');

  // Applied date filters (only updated when user clicks "Toepassen")
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');

  // Add print styles on mount
  useEffect(() => {
    // Add print media styles dynamically
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page {
          size: A4 landscape;
          margin: 1.5cm;
        }
        body {
          background: white !important;
          color: black !important;
        }
        /* Hide navigation and UI elements */
        nav, aside, header, footer, .print\\:hidden {
          display: none !important;
        }
        /* Show only the main content */
        main {
          margin: 0 !important;
          padding: 0 !important;
        }
        /* Table styling */
        table {
          page-break-inside: auto;
          border-collapse: collapse;
          width: 100%;
        }
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        thead {
          display: table-header-group;
        }
        /* Preserve colors in print */
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

  const fetchData = useCallback(async () => {
    if (!orgNummer || isNaN(compNr)) return;
    setIsLoading(true);
    setError('');
    setDateError('');

    try {
      // Validate date range (use applied dates, not input dates)
      if (appliedStartDate && appliedEndDate) {
        const start = new Date(appliedStartDate);
        const end = new Date(appliedEndDate);
        if (end < start) {
          setDateError('Einddatum kan niet voor de startdatum liggen.');
          setIsLoading(false);
          return;
        }
      }

      // Fetch competition data
      const compRes = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`);
      if (!compRes.ok) {
        setError('Competitie niet gevonden.');
        setIsLoading(false);
        return;
      }
      const compData = await compRes.json();
      setCompetition(compData);

      // Fetch competition_players to build player name lookup map
      const playersRes = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/players`);
      let playerLookup: Record<number, PlayerData> = {};
      if (playersRes.ok) {
        const playersData = await playersRes.json();
        const players = playersData.players || [];
        // Build lookup map by player number
        players.forEach((player: PlayerData) => {
          playerLookup[player.spc_nummer] = player;
        });
      }

      // Fetch matches for secondary enrichment (optional)
      const matchesRes = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/matches`);
      let matchesData: MatchData[] = [];
      if (matchesRes.ok) {
        const data = await matchesRes.json();
        matchesData = data.matches || [];
        setMatches(matchesData);
      }

      // Build query params for results (use applied dates, not input dates)
      const queryParams = new URLSearchParams();
      queryParams.set('gespeeld', '1'); // Only show played matches
      if (appliedStartDate) {
        queryParams.set('startDate', appliedStartDate);
      }
      if (appliedEndDate) {
        queryParams.set('endDate', appliedEndDate);
      }

      // Fetch results with filters
      const resultsRes = await fetch(
        `/api/organizations/${orgNummer}/competitions/${compNr}/results?${queryParams.toString()}`
      );

      if (resultsRes.ok) {
        const data = await resultsRes.json();
        const resultsData = data.results || [];

        // Enrich results with player names and calculated moyenne
        const enriched: EnrichedResult[] = resultsData.map((result: ResultData) => {
          // Use denormalized names from result (feature #183) for performance
          let naam_A = result.sp_1_naam || '';
          let naam_B = result.sp_2_naam || '';

          // Fallback to competition_players lookup if names not denormalized yet
          if (!naam_A || !naam_B) {
            const player1 = playerLookup[result.sp_1_nr];
            const player2 = playerLookup[result.sp_2_nr];

            // Format names: 'voornaam tussenvoegsel achternaam'.trim()
            if (!naam_A) {
              naam_A = `${player1?.spa_vnaam || ''} ${player1?.spa_tv || ''} ${player1?.spa_anaam || ''}`.trim();
            }
            if (!naam_B) {
              naam_B = `${player2?.spa_vnaam || ''} ${player2?.spa_tv || ''} ${player2?.spa_anaam || ''}`.trim();
            }
          }

          // Final fallback to 'Speler {nummer}' if still not found
          if (!naam_A) naam_A = `Speler ${result.sp_1_nr}`;
          if (!naam_B) naam_B = `Speler ${result.sp_2_nr}`;

          // Calculate moyenne (caramboles / beurten) to 3 decimal places
          const moy_1 = result.brt > 0 ? (result.sp_1_cargem / result.brt).toFixed(3) : '0.000';
          const moy_2 = result.brt > 0 ? (result.sp_2_cargem / result.brt).toFixed(3) : '0.000';

          return {
            ...result,
            naam_A,
            naam_B,
            moy_1,
            moy_2,
          };
        });

        // Sort by speeldatum descending (newest first)
        enriched.sort((a, b) => {
          const dateA = new Date(a.speeldatum).getTime();
          const dateB = new Date(b.speeldatum).getTime();
          return dateB - dateA;
        });

        setResults(enriched);
      } else {
        setError('Fout bij ophalen uitslagen.');
      }
    } catch (err) {
      console.error('Error fetching results overview:', err);
      setError('Er is een fout opgetreden bij het laden.');
    } finally {
      setIsLoading(false);
    }
  }, [orgNummer, compNr, appliedStartDate, appliedEndDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate date range before applying
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        setDateError('Einddatum kan niet voor de startdatum liggen.');
        return;
      }
    }
    // Apply the date filters (this will trigger fetchData via useEffect)
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setDateError('');
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setDateError('');
  };

  const handleDeleteResult = async () => {
    if (!orgNummer || !resultToDelete) return;
    setIsDeleting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(
        `/api/organizations/${orgNummer}/competitions/${compNr}/results/${resultToDelete.id}`,
        {
          method: 'DELETE',
        }
      );

      if (res.ok) {
        // Remove from local state
        setResults((prev) => prev.filter((r) => r.id !== resultToDelete.id));
        setSuccess(`Uitslag succesvol verwijderd!`);
        setTimeout(() => setSuccess(''), 4000);
        setShowDeleteDialog(false);
        setResultToDelete(null);
      } else {
        const data = await res.json();
        setError(data.error || 'Fout bij verwijderen uitslag.');
      }
    } catch {
      setError('Er is een fout opgetreden.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditResult = (result: EnrichedResult) => {
    // Navigate to the uitslagen page with the result ID in the URL hash
    router.push(`/competities/${compNr}/uitslagen?edit=${result.id}`);
  };

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
      <CompetitionSubNav compNr={compNr} compNaam={competition.comp_naam} />

      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Overzicht uitslagen - {competition.comp_naam}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {DISCIPLINES[competition.discipline]} | {PUNTEN_SYSTEMEN[competition.punten_sys] || 'Onbekend'}
          </p>
        </div>
        {results.length > 0 && (
          <button
            onClick={() => window.print()}
            className="print:hidden px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Afdrukken
          </button>
        )}
      </div>

      {/* Print-only header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold mb-2">{competition.comp_naam}</h1>
        <div className="text-sm mb-2">
          {DISCIPLINES[competition.discipline]} | {PUNTEN_SYSTEMEN[competition.punten_sys] || 'Onbekend'}
        </div>
        {(appliedStartDate || appliedEndDate) && (
          <div className="text-sm mb-2">
            <strong>Periode:</strong>{' '}
            {appliedStartDate && formatDate(appliedStartDate)}
            {appliedStartDate && appliedEndDate && ' t/m '}
            {appliedEndDate && formatDate(appliedEndDate)}
          </div>
        )}
        <div className="text-sm text-gray-600">
          Afgedrukt: {new Date().toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })},{' '}
          {new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="border-b-2 border-gray-300 mt-3 mb-4"></div>
      </div>

      {/* Date Range Filter */}
      <div className="print:hidden mb-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Filters
        </h2>
        <form onSubmit={handleFilterSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Startdatum
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors text-sm"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Einddatum
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors text-sm"
              />
            </div>
          </div>

          {dateError && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {dateError}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              Toepassen
            </button>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
              >
                Wissen
              </button>
            )}
          </div>
        </form>
      </div>

      {error && (
        <div role="alert" className="print:hidden mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-3 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors" aria-label="Melding sluiten">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {success && (
        <div role="status" className="print:hidden mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm border border-green-200 dark:border-green-800 flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="ml-3 text-green-500 hover:text-green-700 dark:hover:text-green-300 transition-colors" aria-label="Melding sluiten">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Results Table */}
      {results.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Geen uitslagen om te tonen!
          </p>
          {(startDate || endDate) && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">
              Probeer de filters aan te passen of te wissen.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Datum</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Periode</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Speler 1</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Car</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Brt</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Moy</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">HS</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pnt</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-8">vs</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Speler 2</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Car</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Brt</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Moy</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">HS</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pnt</th>
                  <th className="print:hidden text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {results.map((result) => (
                  <tr
                    key={result.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(result.speeldatum)}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {result.periode}
                    </td>
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white">
                      {result.naam_A}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {result.sp_1_cargem}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {result.brt}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm text-slate-600 dark:text-slate-400 tabular-nums font-mono">
                      {result.moy_1}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {result.sp_1_hs}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm tabular-nums font-bold">
                      <span className={result.sp_1_punt > result.sp_2_punt ? 'text-green-700 dark:text-green-400' : result.sp_1_punt === result.sp_2_punt ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}>
                        {result.sp_1_punt}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-center text-xs text-slate-400 dark:text-slate-500">
                      vs
                    </td>
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white">
                      {result.naam_B}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {result.sp_2_cargem}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {result.brt}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm text-slate-600 dark:text-slate-400 tabular-nums font-mono">
                      {result.moy_2}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {result.sp_2_hs}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm tabular-nums font-bold">
                      <span className={result.sp_2_punt > result.sp_1_punt ? 'text-green-700 dark:text-green-400' : result.sp_2_punt === result.sp_1_punt ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}>
                        {result.sp_2_punt}
                      </span>
                    </td>
                    <td className="print:hidden px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEditResult(result)}
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium transition-colors"
                        >
                          Wijzigen
                        </button>
                        <button
                          onClick={() => { setResultToDelete(result); setShowDeleteDialog(true); }}
                          className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:underline font-medium transition-colors"
                        >
                          Verwijderen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {results.length} {results.length === 1 ? 'uitslag' : 'uitslagen'} gevonden
            </p>
          </div>
        </div>
      )}

      {/* Delete Result Confirmation Dialog */}
      {showDeleteDialog && resultToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Uitslag verwijderen
            </h3>
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                ⚠️ Waarschuwing: Dit kan niet ongedaan gemaakt worden!
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                Bij het verwijderen van deze uitslag:
              </p>
              <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                <li>Wordt de uitslag permanent verwijderd uit de database</li>
                <li>Wordt de stand automatisch aangepast voor <strong>beide spelers</strong></li>
                <li>Verliezen beide spelers hun punten, caramboles en beurtentelling van deze partij</li>
              </ul>
              <p className="mt-3 text-sm font-semibold text-red-700 dark:text-red-400">
                Dit heeft consequenties voor de rangschikking in de stand.
              </p>
            </div>
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">
                <strong>Wedstrijd:</strong> {resultToDelete.naam_A} vs {resultToDelete.naam_B}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">
                <strong>Datum:</strong> {formatDate(resultToDelete.speeldatum)}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Score:</strong> {resultToDelete.sp_1_cargem} - {resultToDelete.sp_2_cargem} ({resultToDelete.sp_1_punt} - {resultToDelete.sp_2_punt} punten)
              </p>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Weet u zeker dat u deze uitslag wilt verwijderen?
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => { setShowDeleteDialog(false); setResultToDelete(null); }}
                disabled={isDeleting}
                className="px-4 py-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
              >
                Annuleren
              </button>
              <button
                onClick={handleDeleteResult}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                {isDeleting ? 'Bezig...' : 'Ja, verwijder uitslag'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
