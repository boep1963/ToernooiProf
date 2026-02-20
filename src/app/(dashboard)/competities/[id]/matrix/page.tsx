'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DISCIPLINES } from '@/types';
import { formatPlayerName } from '@/lib/billiards';
import CompetitionSubNav from '@/components/CompetitionSubNav';

interface CompetitionData {
  id: string;
  comp_nr: number;
  comp_naam: string;
  comp_datum: string;
  discipline: number;
  punten_sys: number;
  periode: number;
  sorteren: number;
}

interface PlayerData {
  id: string;
  spc_nummer: number;
  spa_vnaam: string;
  spa_tv: string;
  spa_anaam: string;
  spc_car_1?: number;
  spc_car_2?: number;
  spc_car_3?: number;
  spc_car_4?: number;
  spc_car_5?: number;
}

interface MatchData {
  id: string;
  nummer_A: number;
  naam_A: string;
  nummer_B: number;
  naam_B: string;
  gespeeld: number;
  periode: number;
}

interface ResultData {
  uitslag_code: string;
  sp_1_nr: number;
  sp_1_naam?: string;
  sp_1_punt: number;
  sp_1_cartem?: number;
  sp_1_cargem?: number;
  sp_2_nr: number;
  sp_2_naam?: string;
  sp_2_punt: number;
  sp_2_cartem?: number;
  sp_2_cargem?: number;
}

export default function CompetitieMatrixPage() {
  const params = useParams();
  const router = useRouter();
  const { orgNummer } = useAuth();

  const compNr = parseInt(params.id as string, 10);

  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [results, setResults] = useState<ResultData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPeriode, setIsLoadingPeriode] = useState(false);
  const [error, setError] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState<number | null>(null);
  const latestPeriodeRef = useRef<number | null>(null);
  const [showDagplanning, setShowDagplanning] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<number>>(new Set());

  const formatName = (vnaam: string, tv: string, anaam: string): string => {
    return formatPlayerName(vnaam, tv, anaam, competition?.sorteren || 1);
  };

  // Retry function for error recovery
  const handleRetry = () => {
    setError('');
    setSelectedPeriode(null);
    setCompetition(null);
    setPlayers([]);
    setMatches([]);
    setResults([]);
    // Setting selectedPeriode to null will trigger the first useEffect to reload everything
  };

  // Phase 1: Load competition data and initialize periode
  useEffect(() => {
    if (!orgNummer || isNaN(compNr)) return;

    const loadCompetition = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [compRes, playersRes] = await Promise.all([
          fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`),
          fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/players`),
        ]);

        if (!compRes.ok) {
          setError('Competitie niet gevonden.');
          setIsLoading(false);
          return;
        }

        const compData = await compRes.json();
        setCompetition(compData);

        // Initialize selectedPeriode to periode 1 (most data-rich periode)
        setSelectedPeriode(1);

        if (playersRes.ok) {
          const playersData = await playersRes.json();
          setPlayers(playersData.players || []);
        }
      } catch {
        setError('Er is een fout opgetreden bij het laden.');
        setIsLoading(false);
      }
    };

    loadCompetition();
  }, [orgNummer, compNr]);

  // Phase 2: Load matches and results once periode is determined
  useEffect(() => {
    if (!orgNummer || isNaN(compNr) || selectedPeriode === null) return;

    // Track the latest requested periode to prevent race conditions
    latestPeriodeRef.current = selectedPeriode;

    const loadMatchesAndResults = async () => {
      setIsLoadingPeriode(true);
      try {
        const [matchesRes, resultsRes] = await Promise.all([
          fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/matches?periode=${selectedPeriode}`),
          fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/results?periode=${selectedPeriode}`),
        ]);

        // If user switched to a different periode while loading, discard stale results
        if (latestPeriodeRef.current !== selectedPeriode) return;

        if (matchesRes.ok) {
          const matchesData = await matchesRes.json();
          setMatches(matchesData.matches || []);
        }

        if (resultsRes.ok) {
          const resultsData = await resultsRes.json();
          setResults(resultsData.results || []);
        }
      } catch {
        // Only show error if this is still the current request
        if (latestPeriodeRef.current === selectedPeriode) {
          setError('Er is een fout opgetreden bij het laden van wedstrijden.');
        }
      } finally {
        // Only clear loading if this is still the current request
        if (latestPeriodeRef.current === selectedPeriode) {
          setIsLoading(false);
          setIsLoadingPeriode(false);
        }
      }
    };

    loadMatchesAndResults();
  }, [orgNummer, compNr, selectedPeriode]);

  // Build matrix data
  const getMatchResult = (playerANr: number, playerBNr: number): { played: boolean; pointsA: number; pointsB: number } | null => {
    // Find the match between these two players
    const match = matches.find(
      (m) =>
        (m.nummer_A === playerANr && m.nummer_B === playerBNr) ||
        (m.nummer_A === playerBNr && m.nummer_B === playerANr)
    );

    // Find the result
    const result = results.find(
      (r) =>
        (r.sp_1_nr === playerANr && r.sp_2_nr === playerBNr) ||
        (r.sp_1_nr === playerBNr && r.sp_2_nr === playerANr)
    );

    // Feature #187: Fall back to results when no match exists (for imported/legacy data)
    if (!match) {
      // If no match but result exists, use result data directly
      if (!result) return null;

      // Determine points for player A and B from result
      let pointsA: number;
      let pointsB: number;

      if (result.sp_1_nr === playerANr) {
        pointsA = result.sp_1_punt;
        pointsB = result.sp_2_punt;
      } else {
        pointsA = result.sp_2_punt;
        pointsB = result.sp_1_punt;
      }

      return { played: true, pointsA, pointsB };
    }

    // Match exists - check if it's been played
    if (!result) return { played: false, pointsA: 0, pointsB: 0 };

    // Determine points for player A and B
    let pointsA: number;
    let pointsB: number;

    if (result.sp_1_nr === playerANr) {
      pointsA = result.sp_1_punt;
      pointsB = result.sp_2_punt;
    } else {
      pointsA = result.sp_2_punt;
      pointsB = result.sp_1_punt;
    }

    return { played: true, pointsA, pointsB };
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
        <button
          onClick={() => router.push('/competities')}
          className="mt-4 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors"
        >
          Terug naar competities
        </button>
      </div>
    );
  }

  // Sort players by number
  const sortedPlayers = [...players].sort((a, b) => a.spc_nummer - b.spc_nummer);

  // Get caramboles field key based on discipline
  const getCarambolesKey = (discipline: number): keyof PlayerData => {
    const keys: Record<number, keyof PlayerData> = {
      1: 'spc_car_1',
      2: 'spc_car_2',
      3: 'spc_car_3',
      4: 'spc_car_4',
      5: 'spc_car_5',
    };
    return keys[discipline] || 'spc_car_1';
  };

  const carKey = getCarambolesKey(competition.discipline);

  // Function to get player name with caramboles
  const getPlayerNameWithCar = (player: PlayerData): string => {
    const name = formatName(player.spa_vnaam, player.spa_tv, player.spa_anaam);
    const car = player[carKey] || 0;
    return `${name} (${car})`;
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <CompetitionSubNav compNr={compNr} compNaam={competition.comp_naam} />

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Matrix - {competition.comp_naam}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {DISCIPLINES[competition.discipline]} | Wie speelt tegen wie | Periode {selectedPeriode}
            {isLoadingPeriode && <span className="ml-2 text-green-600 dark:text-green-400">⟳ Laden...</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => setShowDagplanning(true)}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Dagplanning
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Printen
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800 flex items-center justify-between">
          <span>{error}</span>
          <div className="flex items-center gap-2 ml-3">
            <button onClick={handleRetry} className="text-xs px-2.5 py-1 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300 rounded-md transition-colors font-medium flex-shrink-0">
              Opnieuw proberen
            </button>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors flex-shrink-0" aria-label="Melding sluiten">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {players.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Er zijn nog geen spelers. Voeg eerst spelers toe.
          </p>
          <button
            onClick={() => router.push(`/competities/${compNr}/spelers`)}
            className="mt-4 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors text-sm"
          >
            Naar spelers
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative">
          {isLoadingPeriode && (
            <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 z-20 flex items-center justify-center backdrop-blur-[1px]">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Periode laden...</p>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50 dark:bg-slate-700/50 z-10 min-w-[180px]">
                    Speler
                  </th>
                  {sortedPlayers.map((player) => (
                    <th
                      key={player.spc_nummer}
                      className="text-center px-2 py-8 text-xs font-semibold text-slate-500 dark:text-slate-400 min-w-[40px] h-32 align-bottom"
                      title={getPlayerNameWithCar(player)}
                    >
                      <div className="flex justify-center items-end h-full">
                        <span style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }} className="whitespace-nowrap">
                          {player.spa_vnaam?.charAt(0)}.{player.spa_tv ? ` ${player.spa_tv}` : ''} {player.spa_anaam}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider align-bottom">
                    <div style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }} className="mx-auto">
                      Totaal punten
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {sortedPlayers.map((playerRow) => {
                  let totalPoints = 0;

                  return (
                    <tr key={playerRow.spc_nummer} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-3 py-2 text-sm font-medium text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700">
                        <div className="truncate max-w-[170px]">
                          {getPlayerNameWithCar(playerRow)}
                        </div>
                      </td>
                      {sortedPlayers.map((playerCol) => {
                        if (playerRow.spc_nummer === playerCol.spc_nummer) {
                          return (
                            <td
                              key={playerCol.spc_nummer}
                              className="text-center px-2 py-2 bg-slate-100 dark:bg-slate-700"
                            >
                              <span className="text-slate-400 dark:text-slate-500 text-xs">-</span>
                            </td>
                          );
                        }

                        const matchResult = getMatchResult(playerRow.spc_nummer, playerCol.spc_nummer);

                        if (!matchResult) {
                          return (
                            <td key={playerCol.spc_nummer} className="text-center px-2 py-2">
                              <span className="text-slate-300 dark:text-slate-600 text-xs">-</span>
                            </td>
                          );
                        }

                        if (!matchResult.played) {
                          return (
                            <td key={playerCol.spc_nummer} className="text-center px-2 py-2">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded text-xs bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500">
                                ?
                              </span>
                            </td>
                          );
                        }

                        totalPoints += matchResult.pointsA;

                        const isWin = matchResult.pointsA > matchResult.pointsB;
                        const isDraw = matchResult.pointsA === matchResult.pointsB && matchResult.pointsA > 0;

                        return (
                          <td key={playerCol.spc_nummer} className="text-center px-2 py-2">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${
                                isWin
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  : isDraw
                                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200'
                              }`}
                            >
                              {matchResult.pointsA}
                            </span>
                          </td>
                        );
                      })}
                      <td className="text-center px-3 py-2 text-sm font-bold text-green-700 dark:text-green-400 tabular-nums border-l border-slate-200 dark:border-slate-700">
                        {totalPoints}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800" />
                  Gewonnen
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-4 rounded bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800" />
                  Gelijk
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-4 rounded bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800" />
                  Verloren
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-4 rounded bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-center text-[10px] leading-4">?</span>
                  Nog niet gespeeld
                </span>
              </div>

              {/* Periode selector */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-600 print:hidden">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Periode:</span>
                <div className="flex gap-1">
                  {Array.from({ length: competition.periode }, (_, i) => i + 1).map((periodeNr) => (
                    <button
                      key={periodeNr}
                      onClick={() => setSelectedPeriode(periodeNr)}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        selectedPeriode === periodeNr
                          ? 'bg-slate-800 dark:bg-slate-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                      }`}
                    >
                      Periode {periodeNr}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dagplanning Modal */}
      {showDagplanning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDagplanning(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Dagplanning
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Vink aan welke spelers aanwezig zijn
                </p>
              </div>
              <button
                onClick={() => setShowDagplanning(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Sluiten"
              >
                <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-2">
                {sortedPlayers.map((player) => {
                  const isSelected = selectedPlayers.has(player.spc_nummer);
                  return (
                    <label
                      key={player.spc_nummer}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newSelected = new Set(selectedPlayers);
                          if (e.target.checked) {
                            newSelected.add(player.spc_nummer);
                          } else {
                            newSelected.delete(player.spc_nummer);
                          }
                          setSelectedPlayers(newSelected);
                        }}
                        className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-0 dark:bg-slate-700 cursor-pointer"
                      />
                      <span className="text-slate-900 dark:text-white font-medium flex-1">
                        {getPlayerNameWithCar(player)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedPlayers.size} van {players.length} spelers geselecteerd
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPlayers(new Set())}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    Wis selectie
                  </button>
                  <button
                    onClick={() => setSelectedPlayers(new Set(players.map(p => p.spc_nummer)))}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    Selecteer alles
                  </button>
                  <button
                    onClick={() => setShowDagplanning(false)}
                    className="px-4 py-2 text-sm font-medium bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors"
                  >
                    Sluiten
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
