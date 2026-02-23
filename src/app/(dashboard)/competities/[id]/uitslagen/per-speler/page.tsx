'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { DISCIPLINES } from '@/types';
import CompetitionSubNav from '@/components/CompetitionSubNav';
import { formatDate } from '@/lib/dateUtils';

interface CompetitionData {
  id: string;
  comp_nr: number;
  comp_naam: string;
  comp_datum: string;
  discipline: number;
  punten_sys: number;
  periode: number;
}

interface PlayerData {
  spc_nummer: number;
  spa_vnaam: string;
  spa_tv: string;
  spa_anaam: string;
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

interface PlayerResult {
  id: string;
  speeldatum: string;
  periode: number;
  opponent: string;
  opponentNr: number;
  playerCar: number;
  opponentCar: number;
  playerPnt: number;
  opponentPnt: number;
  playerMoy: string;
  opponentMoy: string;
  playerHS: number;
  opponentHS: number;
  brt: number;
  result: 'win' | 'draw' | 'loss';
}

interface PlayerStats {
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  totalCaramboles: number;
  totalBeurten: number;
  avgMoyenne: string;
  winPercentage: string;
}

const PUNTEN_SYSTEMEN: Record<number, string> = {
  1: 'WRV 2-1-0',
  2: '10-punten',
  3: 'Belgisch (12-punten)',
};

export default function PlayerResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { orgNummer, organization } = useAuth();
  const orgNaam = organization?.org_naam || '';

  const compNr = parseInt(params.id as string, 10);

  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [selectedPlayerNr, setSelectedPlayerNr] = useState<number | null>(null);
  const [playerResults, setPlayerResults] = useState<PlayerResult[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [error, setError] = useState('');

  // Add print styles on mount
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page {
          size: A4 portrait;
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
        /* Show print-only elements */
        .hidden.print\\:block {
          display: block !important;
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

  const formatPlayerName = (player: PlayerData) => {
    return `${player.spa_vnaam} ${player.spa_tv || ''} ${player.spa_anaam}`.replace(/\s+/g, ' ').trim();
  };

  const fetchInitialData = useCallback(async () => {
    if (!orgNummer || isNaN(compNr)) return;
    setIsLoading(true);
    setError('');

    try {
      // Fetch competition data
      const compRes = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`);
      if (!compRes.ok) {
        setError('Competitie niet gevonden.');
        setIsLoading(false);
        return;
      }
      const compData = await compRes.json();
      setCompetition(compData);

      // Fetch players
      const playersRes = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/players`);
      if (playersRes.ok) {
        const playersData = await playersRes.json();
        const playersList = playersData.players || [];
        // Sort players alphabetically by formatted name
        playersList.sort((a: PlayerData, b: PlayerData) => {
          const nameA = formatPlayerName(a);
          const nameB = formatPlayerName(b);
          return nameA.localeCompare(nameB, 'nl');
        });
        setPlayers(playersList);
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Er is een fout opgetreden bij het laden.');
    } finally {
      setIsLoading(false);
    }
  }, [orgNummer, compNr]);

  const fetchPlayerResults = useCallback(async (playerNr: number) => {
    if (!orgNummer || isNaN(compNr)) return;
    setIsLoadingResults(true);
    setError('');

    try {
      // Fetch all results for the competition (only played matches)
      const queryParams = new URLSearchParams();
      queryParams.set('gespeeld', '1');
      const resultsRes = await fetch(
        `/api/organizations/${orgNummer}/competitions/${compNr}/results?${queryParams.toString()}`
      );

      if (!resultsRes.ok) {
        setError('Fout bij ophalen uitslagen.');
        setIsLoadingResults(false);
        return;
      }

      const data = await resultsRes.json();
      const allResults = data.results || [];

      // Filter results where the selected player participated
      const filteredResults = allResults.filter((r: ResultData) =>
        r.sp_1_nr === playerNr || r.sp_2_nr === playerNr
      );

      // Build player lookup map for opponent names
      const playerLookup: Record<number, PlayerData> = {};
      players.forEach(player => {
        playerLookup[player.spc_nummer] = player;
      });

      // Transform results into player-centric view
      const transformedResults: PlayerResult[] = filteredResults.map((result: ResultData) => {
        const isPlayer1 = result.sp_1_nr === playerNr;

        const opponentNr = isPlayer1 ? result.sp_2_nr : result.sp_1_nr;
        const opponentData = playerLookup[opponentNr];
        const opponentName = isPlayer1
          ? (result.sp_2_naam || formatPlayerName(opponentData) || `Speler ${opponentNr}`)
          : (result.sp_1_naam || formatPlayerName(opponentData) || `Speler ${opponentNr}`);

        const playerCar = isPlayer1 ? result.sp_1_cargem : result.sp_2_cargem;
        const opponentCar = isPlayer1 ? result.sp_2_cargem : result.sp_1_cargem;
        const playerPnt = isPlayer1 ? result.sp_1_punt : result.sp_2_punt;
        const opponentPnt = isPlayer1 ? result.sp_2_punt : result.sp_1_punt;
        const playerHS = isPlayer1 ? result.sp_1_hs : result.sp_2_hs;
        const opponentHS = isPlayer1 ? result.sp_2_hs : result.sp_1_hs;

        const playerMoy = result.brt > 0 ? (playerCar / result.brt).toFixed(3) : '0.000';
        const opponentMoy = result.brt > 0 ? (opponentCar / result.brt).toFixed(3) : '0.000';

        let resultType: 'win' | 'draw' | 'loss';
        if (playerPnt > opponentPnt) resultType = 'win';
        else if (playerPnt === opponentPnt) resultType = 'draw';
        else resultType = 'loss';

        return {
          id: result.id,
          speeldatum: result.speeldatum,
          periode: result.periode,
          opponent: opponentName,
          opponentNr,
          playerCar,
          opponentCar,
          playerPnt,
          opponentPnt,
          playerMoy,
          opponentMoy,
          playerHS,
          opponentHS,
          brt: result.brt,
          result: resultType,
        };
      });

      // Sort by date descending (newest first)
      transformedResults.sort((a, b) => {
        const dateA = new Date(a.speeldatum).getTime();
        const dateB = new Date(b.speeldatum).getTime();
        return dateB - dateA;
      });

      setPlayerResults(transformedResults);

      // Calculate statistics
      const totalMatches = transformedResults.length;
      const wins = transformedResults.filter(r => r.result === 'win').length;
      const draws = transformedResults.filter(r => r.result === 'draw').length;
      const losses = transformedResults.filter(r => r.result === 'loss').length;

      const totalCaramboles = transformedResults.reduce((sum, r) => sum + r.playerCar, 0);
      const totalBeurten = transformedResults.reduce((sum, r) => sum + r.brt, 0);
      const avgMoyenne = totalBeurten > 0 ? (totalCaramboles / totalBeurten).toFixed(3) : '0.000';
      const winPercentage = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : '0.0';

      setPlayerStats({
        totalMatches,
        wins,
        draws,
        losses,
        totalCaramboles,
        totalBeurten,
        avgMoyenne,
        winPercentage,
      });

    } catch (err) {
      console.error('Error fetching player results:', err);
      setError('Er is een fout opgetreden bij het laden van de spelersresultaten.');
    } finally {
      setIsLoadingResults(false);
    }
  }, [orgNummer, compNr, players]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (selectedPlayerNr !== null) {
      fetchPlayerResults(selectedPlayerNr);
    }
  }, [selectedPlayerNr, fetchPlayerResults]);

  const handlePlayerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '') {
      setSelectedPlayerNr(null);
      setPlayerResults([]);
      setPlayerStats(null);
    } else {
      setSelectedPlayerNr(parseInt(value, 10));
    }
  };

  const handlePrint = () => {
    window.print();
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

  const selectedPlayer = players.find(p => p.spc_nummer === selectedPlayerNr);

  return (
    <div>
      <div className="print:hidden">
        <CompetitionSubNav compNr={compNr} compNaam={competition.comp_naam} periode={competition.periode || 1} />
      </div>

      {/* Print-only header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold mb-2">{orgNaam || 'ClubMatch'} - {competition.comp_naam}</h1>
        <h2 className="text-xl mb-2">Uitslagen per speler: {selectedPlayer && formatPlayerName(selectedPlayer)}</h2>
        <div className="text-sm mb-2">
          {DISCIPLINES[competition.discipline]}{PUNTEN_SYSTEMEN[competition.punten_sys] ? ` | ${PUNTEN_SYSTEMEN[competition.punten_sys]}` : ''}
        </div>
        <div className="text-sm text-gray-600">
          Afgedrukt: {new Date().toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })},{' '}
          {new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="border-b-2 border-gray-300 mt-3 mb-4"></div>
      </div>

      <div className="mb-4 print:hidden">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Uitslagen per speler - {competition.comp_naam}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {DISCIPLINES[competition.discipline]}{PUNTEN_SYSTEMEN[competition.punten_sys] ? ` | ${PUNTEN_SYSTEMEN[competition.punten_sys]}` : ''}
        </p>
      </div>

      {/* Player Selection */}
      <div className="mb-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 print:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <label htmlFor="player-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Selecteer een speler
            </label>
            <select
              id="player-select"
              value={selectedPlayerNr || ''}
              onChange={handlePlayerChange}
              className="w-full max-w-md px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
            >
              <option value="">-- Kies een speler --</option>
              {players.map((player) => (
                <option key={player.spc_nummer} value={player.spc_nummer}>
                  {formatPlayerName(player)}
                </option>
              ))}
            </select>
          </div>
          {selectedPlayerNr && playerResults.length > 0 && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors shadow-sm mt-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
          )}
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800 flex items-center justify-between print:hidden">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-3 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors" aria-label="Melding sluiten">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Loading state for results */}
      {isLoadingResults && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Resultaten laden...</p>
        </div>
      )}

      {/* Statistics Card */}
      {selectedPlayerNr && playerStats && !isLoadingResults && (
        <div className="mb-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl shadow-sm border border-green-200 dark:border-slate-600 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Statistieken: {selectedPlayer && formatPlayerName(selectedPlayer)}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="bg-white dark:bg-slate-800/80 rounded-lg p-4 text-center border border-slate-200 dark:border-slate-600">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{playerStats.totalMatches}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Partijen</div>
            </div>
            <div className="bg-white dark:bg-slate-800/80 rounded-lg p-4 text-center border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">{playerStats.wins}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Gewonnen</div>
            </div>
            <div className="bg-white dark:bg-slate-800/80 rounded-lg p-4 text-center border border-amber-200 dark:border-amber-800">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{playerStats.draws}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Remise</div>
            </div>
            <div className="bg-white dark:bg-slate-800/80 rounded-lg p-4 text-center border border-red-200 dark:border-red-800">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{playerStats.losses}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Verloren</div>
            </div>
            <div className="bg-white dark:bg-slate-800/80 rounded-lg p-4 text-center border border-slate-200 dark:border-slate-600">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{playerStats.totalCaramboles}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Totaal Car</div>
            </div>
            <div className="bg-white dark:bg-slate-800/80 rounded-lg p-4 text-center border border-slate-200 dark:border-slate-600">
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{playerStats.avgMoyenne}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Gem. Moy</div>
            </div>
            <div className="bg-white dark:bg-slate-800/80 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{playerStats.winPercentage}%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Win %</div>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {selectedPlayerNr && playerResults.length > 0 && !isLoadingResults && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Datum</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Per</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tegenstander</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Car Speler</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Car Teg</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Brt</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Moy Speler</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Moy Teg</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">HS Speler</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">HS Teg</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Punten</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resultaat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {playerResults.map((result) => (
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
                      {result.opponent}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {result.playerCar}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {result.opponentCar}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {result.brt}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm text-slate-600 dark:text-slate-400 tabular-nums font-mono">
                      {result.playerMoy}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm text-slate-600 dark:text-slate-400 tabular-nums font-mono">
                      {result.opponentMoy}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {result.playerHS}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {result.opponentHS}
                    </td>
                    <td className="px-2 py-2.5 text-center text-sm tabular-nums">
                      <span className="font-semibold">
                        {result.playerPnt} - {result.opponentPnt}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      {result.result === 'win' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                          Winst
                        </span>
                      )}
                      {result.result === 'draw' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          Remise
                        </span>
                      )}
                      {result.result === 'loss' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                          Verlies
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {playerResults.length} {playerResults.length === 1 ? 'partij' : 'partijen'} gevonden
            </p>
          </div>
        </div>
      )}

      {/* No results message */}
      {selectedPlayerNr && playerResults.length === 0 && !isLoadingResults && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Deze speler heeft nog geen gespeelde partijen in deze competitie.
          </p>
        </div>
      )}

      {/* No player selected message */}
      {!selectedPlayerNr && !isLoadingResults && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-700 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Selecteer een speler om hun uitslagen en statistieken te bekijken.
          </p>
        </div>
      )}
    </div>
  );
}
