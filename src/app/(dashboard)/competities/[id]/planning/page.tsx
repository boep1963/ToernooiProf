'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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

export default function CompetiteDagplanningPage() {
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
          size: A4 portrait;
        }
        nav, header, aside, .sidebar {
          display: none !important;
        }
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
  const [results, setResults] = useState<ResultData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState<number | null>(null);
  const latestPeriodeRef = useRef<number | null>(null);

  // Dagplanning state
  const [selectedPlayers, setSelectedPlayers] = useState<Set<number>>(new Set());
  const [matchesPerPlayer, setMatchesPerPlayer] = useState<1 | 2>(1);
  const [generatedPairings, setGeneratedPairings] = useState<Array<{ player1: PlayerData; player2: PlayerData | null; ronde: number }>>([]);
  const [showPairings, setShowPairings] = useState(false);
  const [success, setSuccess] = useState('');
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const formatName = (vnaam: string, tv: string, anaam: string): string => {
    return formatPlayerName(vnaam, tv, anaam, competition?.sorteren || 1);
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
        setSelectedPeriode(compData.periode || 1);

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

    latestPeriodeRef.current = selectedPeriode;

    const loadMatchesAndResults = async () => {
      try {
        const [matchesRes, resultsRes] = await Promise.all([
          fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/matches?periode=${selectedPeriode}`),
          fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/results?periode=${selectedPeriode}`),
        ]);

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
        if (latestPeriodeRef.current === selectedPeriode) {
          setError('Er is een fout opgetreden bij het laden van wedstrijden.');
        }
      } finally {
        if (latestPeriodeRef.current === selectedPeriode) {
          setIsLoading(false);
        }
      }
    };

    loadMatchesAndResults();
  }, [orgNummer, compNr, selectedPeriode]);

  // Check if dagplanning has active data that would be lost on navigation
  const hasDagplanningData = showPairings && generatedPairings.length > 0;

  // Browser beforeunload warning (handles browser close, refresh, external navigation)
  useEffect(() => {
    if (!hasDagplanningData) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasDagplanningData]);

  // Intercept clicks on links within the app to show custom warning
  useEffect(() => {
    if (!hasDagplanningData) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

      // Only intercept internal navigation links (not the current page)
      const currentPath = `/competities/${compNr}/planning`;
      if (href === currentPath) return;

      // Check if it's an internal link
      if (href.startsWith('/') || href.startsWith(window.location.origin)) {
        e.preventDefault();
        e.stopPropagation();
        setPendingNavigation(href);
        setShowLeaveWarning(true);
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [hasDagplanningData, compNr]);

  // Handle confirmed leave - clear data and navigate
  const handleConfirmLeave = useCallback(() => {
    // Clear all dagplanning state
    setShowPairings(false);
    setGeneratedPairings([]);
    setSelectedPlayers(new Set());
    setShowLeaveWarning(false);

    // Navigate to the pending destination or competition overview
    const destination = pendingNavigation || `/competities`;
    setPendingNavigation(null);

    // Use setTimeout to allow state to clear before navigation
    setTimeout(() => {
      router.push(destination);
    }, 0);
  }, [pendingNavigation, router]);

  // Handle cancel leave
  const handleCancelLeave = useCallback(() => {
    setShowLeaveWarning(false);
    setPendingNavigation(null);
  }, []);

  // Handle "Afsluiten" button - show warning and navigate to competition overview
  const handleAfsluiten = useCallback(() => {
    if (hasDagplanningData) {
      setPendingNavigation(`/competities`);
      setShowLeaveWarning(true);
    } else {
      router.push(`/competities`);
    }
  }, [hasDagplanningData, router]);

  // Sort players according to competition sort setting (voornaam or achternaam)
  const sortedPlayers = [...players].sort((a, b) => {
    const nameA = formatName(a.spa_vnaam, a.spa_tv, a.spa_anaam);
    const nameB = formatName(b.spa_vnaam, b.spa_tv, b.spa_anaam);
    return nameA.localeCompare(nameB, 'nl');
  });

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

  const carKey = competition ? getCarambolesKey(competition.discipline) : 'spc_car_1';

  // Function to get player name with caramboles
  const getPlayerNameWithCar = (player: PlayerData): string => {
    const name = formatName(player.spa_vnaam, player.spa_tv, player.spa_anaam);
    const car = player[carKey] || 0;
    return `${name} (${car})`;
  };

  // Generate pairings for dagplanning - supports 1 or 2 matches per player
  const generateDagplanningPairings = () => {
    if (selectedPlayers.size < 2) {
      return [];
    }

    const selectedPlayerObjects = sortedPlayers.filter(p => selectedPlayers.has(p.spc_nummer));
    const numPlayers = selectedPlayerObjects.length;

    // Track who has already played against whom in this period (from existing results and matches)
    const alreadyPlayed: Map<number, Set<number>> = new Map();

    results.forEach(result => {
      if (!alreadyPlayed.has(result.sp_1_nr)) {
        alreadyPlayed.set(result.sp_1_nr, new Set());
      }
      if (!alreadyPlayed.has(result.sp_2_nr)) {
        alreadyPlayed.set(result.sp_2_nr, new Set());
      }
      alreadyPlayed.get(result.sp_1_nr)!.add(result.sp_2_nr);
      alreadyPlayed.get(result.sp_2_nr)!.add(result.sp_1_nr);
    });

    // Also include already-scheduled (but not yet played) matches
    matches.forEach(match => {
      if (!alreadyPlayed.has(match.nummer_A)) {
        alreadyPlayed.set(match.nummer_A, new Set());
      }
      if (!alreadyPlayed.has(match.nummer_B)) {
        alreadyPlayed.set(match.nummer_B, new Set());
      }
      alreadyPlayed.get(match.nummer_A)!.add(match.nummer_B);
      alreadyPlayed.get(match.nummer_B)!.add(match.nummer_A);
    });

    // Matrix tracking which players have been paired in THIS planning session
    const sessionPaired: Map<number, Set<number>> = new Map();
    selectedPlayerObjects.forEach(p => {
      sessionPaired.set(p.spc_nummer, new Set());
    });

    const maxKoppels = Math.floor(numPlayers / 2);

    // Helper: Generate optimal pairings for a single round
    // Uses optimization: tries multiple starting positions to find the arrangement with most pairings
    const generateRoundPairings = (
      playersForRound: PlayerData[],
      roundPlayedInThisRound: Set<number>,
    ): Array<{ player1: PlayerData; player2: PlayerData }> => {
      let bestPairings: Array<{ player1: PlayerData; player2: PlayerData }> = [];

      // Sort players by number of existing matches (most matches first, like PHP rsort)
      const sortedForRound = [...playersForRound].sort((a, b) => {
        const aCount = alreadyPlayed.get(a.spc_nummer)?.size || 0;
        const bCount = alreadyPlayed.get(b.spc_nummer)?.size || 0;
        return bCount - aCount; // Descending - players with most matches first
      });

      // Try different starting positions to optimize the number of pairings found
      for (let startOffset = 0; startOffset < sortedForRound.length; startOffset++) {
        const tempPairings: Array<{ player1: PlayerData; player2: PlayerData }> = [];
        const tempRoundPlayed = new Set<number>();

        for (let i = startOffset; i < sortedForRound.length; i++) {
          const p1 = sortedForRound[i];
          if (tempRoundPlayed.has(p1.spc_nummer) || roundPlayedInThisRound.has(p1.spc_nummer)) continue;

          let bestOpponent: PlayerData | null = null;
          let bestScore = -1;

          // Search from the end (least matches) for the best opponent
          for (let j = sortedForRound.length - 1; j >= 0; j--) {
            const p2 = sortedForRound[j];
            if (p1.spc_nummer === p2.spc_nummer) continue;
            if (tempRoundPlayed.has(p2.spc_nummer) || roundPlayedInThisRound.has(p2.spc_nummer)) continue;

            // Check: not already played in this period AND not already paired in this session
            const alreadyPlayedAgainst = alreadyPlayed.get(p1.spc_nummer)?.has(p2.spc_nummer) || false;
            const sessionPairedAlready = sessionPaired.get(p1.spc_nummer)?.has(p2.spc_nummer) || false;

            let score = 0;
            if (!alreadyPlayedAgainst && !sessionPairedAlready) {
              // Prefer opponents not yet played against
              score = 100;
            } else if (!sessionPairedAlready) {
              // Fallback: already played in period but not paired in this session
              score = 10;
            } else {
              // Already paired in this planning session - skip
              continue;
            }

            const p2MatchCount = alreadyPlayed.get(p2.spc_nummer)?.size || 0;
            score += (50 - p2MatchCount);

            if (score > bestScore) {
              bestScore = score;
              bestOpponent = p2;
            }
          }

          if (bestOpponent) {
            tempPairings.push({ player1: p1, player2: bestOpponent });
            tempRoundPlayed.add(p1.spc_nummer);
            tempRoundPlayed.add(bestOpponent.spc_nummer);
          }

          if (tempPairings.length >= maxKoppels) break;
        }

        if (tempPairings.length > bestPairings.length) {
          bestPairings = tempPairings;
        }

        if (bestPairings.length >= maxKoppels) break;
      }

      return bestPairings;
    };

    const allPairings: Array<{ player1: PlayerData; player2: PlayerData | null; ronde: number }> = [];

    // === ROUND 1 ===
    const round1Played = new Set<number>();
    const round1Pairings = generateRoundPairings(selectedPlayerObjects, round1Played);

    round1Pairings.forEach(p => {
      allPairings.push({ ...p, ronde: 1 });
      round1Played.add(p.player1.spc_nummer);
      round1Played.add(p.player2.spc_nummer);
      // Track in session matrix
      sessionPaired.get(p.player1.spc_nummer)?.add(p.player2.spc_nummer);
      sessionPaired.get(p.player2.spc_nummer)?.add(p.player1.spc_nummer);
    });

    // Find rest player from round 1 (if odd number)
    const restPlayerRound1 = numPlayers % 2 === 1
      ? selectedPlayerObjects.find(p => !round1Played.has(p.spc_nummer))
      : null;

    if (matchesPerPlayer === 1) {
      // For 1 match: if odd, show rest player as bye
      if (restPlayerRound1) {
        allPairings.push({ player1: restPlayerRound1, player2: null, ronde: 1 });
      }
    } else if (matchesPerPlayer === 2) {
      // === ROUND 2 ===
      // If fewer than 3 selected players, can't do 2 rounds
      if (numPlayers < 3) {
        // Fall back to 1 round only
        if (restPlayerRound1) {
          allPairings.push({ player1: restPlayerRound1, player2: null, ronde: 1 });
        }
      } else {
        const isOdd = numPlayers % 2 !== 0;
        let restPlayerRound2Chosen: PlayerData | null = null;

        // If odd number of players: pre-assign a round 3 match between rest players
        if (isOdd && restPlayerRound1) {
          // Find a valid opponent for restPlayerRound1 to sit out round 2 and play round 3
          const sortedByMostMatches = [...selectedPlayerObjects].sort((a, b) => {
            const aCount = alreadyPlayed.get(a.spc_nummer)?.size || 0;
            const bCount = alreadyPlayed.get(b.spc_nummer)?.size || 0;
            return bCount - aCount;
          });

          let bestCandidateScore = -1;
          for (const candidate of sortedByMostMatches) {
            if (candidate.spc_nummer === restPlayerRound1.spc_nummer) continue;

            const alreadyPlayedAgainst = alreadyPlayed.get(restPlayerRound1.spc_nummer)?.has(candidate.spc_nummer) || false;
            const sessionPairedAlready = sessionPaired.get(restPlayerRound1.spc_nummer)?.has(candidate.spc_nummer) || false;

            let candidateScore = 0;
            if (!alreadyPlayedAgainst && !sessionPairedAlready) {
              candidateScore = 100;
            } else if (!sessionPairedAlready) {
              candidateScore = 10;
            } else {
              continue;
            }

            if (candidateScore > bestCandidateScore) {
              bestCandidateScore = candidateScore;
              restPlayerRound2Chosen = candidate;
              if (candidateScore >= 100) break; // Found ideal match
            }
          }

          if (restPlayerRound2Chosen) {
            // Record this pairing in the session matrix
            sessionPaired.get(restPlayerRound1.spc_nummer)?.add(restPlayerRound2Chosen.spc_nummer);
            sessionPaired.get(restPlayerRound2Chosen.spc_nummer)?.add(restPlayerRound1.spc_nummer);
          }
        }

        // Generate round 2 pairings, excluding the rest player for round 2
        const round2Played = new Set<number>();
        if (restPlayerRound2Chosen) {
          round2Played.add(restPlayerRound2Chosen.spc_nummer);
        }

        const round2Pairings = generateRoundPairings(selectedPlayerObjects, round2Played);

        round2Pairings.forEach(p => {
          allPairings.push({ ...p, ronde: 2 });
          round2Played.add(p.player1.spc_nummer);
          round2Played.add(p.player2.spc_nummer);
          sessionPaired.get(p.player1.spc_nummer)?.add(p.player2.spc_nummer);
          sessionPaired.get(p.player2.spc_nummer)?.add(p.player1.spc_nummer);
        });

        // Add round 3 pairing (rest players match) if applicable
        if (isOdd && restPlayerRound1 && restPlayerRound2Chosen) {
          allPairings.push({ player1: restPlayerRound1, player2: restPlayerRound2Chosen, ronde: 3 });
        }

        // Find players not scheduled in round 2 (excluding rest player intended for round 3)
        const unscheduledRound2 = selectedPlayerObjects.filter(p =>
          !round2Played.has(p.spc_nummer) &&
          p.spc_nummer !== restPlayerRound1?.spc_nummer
        );
        unscheduledRound2.forEach(p => {
          allPairings.push({ player1: p, player2: null, ronde: 2 });
        });

        // Find players not scheduled in round 1 (besides the one going to round 3)
        if (restPlayerRound1 && (!restPlayerRound2Chosen || !isOdd)) {
          allPairings.push({ player1: restPlayerRound1, player2: null, ronde: 1 });
        }
      }
    }

    return allPairings;
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
      <div className="print:hidden">
        <CompetitionSubNav compNr={compNr} compNaam={competition.comp_naam} periode={competition.periode || 1} />
      </div>

      {/* Print header - only visible when printing */}
      <div className="hidden print:block mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">
          Dagplanning - {competition.comp_naam}
        </h1>
        <div className="text-sm text-gray-700 space-y-1">
          <p><strong>Discipline:</strong> {DISCIPLINES[competition.discipline]}</p>
          <p><strong>Periode:</strong> {selectedPeriode}</p>
          <p><strong>Afgedrukt:</strong> {new Date().toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <hr className="mt-4 border-gray-300" />

        {showPairings && generatedPairings.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-3">Partijindeling</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-400">
                  <th className="text-left py-2 px-3 text-sm font-semibold">Rn</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold">#</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold">Speler A</th>
                  <th className="text-center py-2 px-3 text-sm font-semibold">vs</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold">Speler B</th>
                </tr>
              </thead>
              <tbody>
                {generatedPairings.map((pairing, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-2 px-3 text-sm">{pairing.ronde}</td>
                      <td className="py-2 px-3 text-sm">{index + 1}</td>
                      <td className="py-2 px-3 text-sm font-medium">{getPlayerNameWithCar(pairing.player1)}</td>
                      <td className="py-2 px-3 text-sm text-center">{pairing.player2 ? 'vs' : ''}</td>
                      <td className="py-2 px-3 text-sm font-medium">
                        {pairing.player2 ? getPlayerNameWithCar(pairing.player2) : <em>vrij (bye)</em>}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mb-4 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Dagplanning - {competition.comp_naam}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {DISCIPLINES[competition.discipline]} | Periode {selectedPeriode}
            </p>
          </div>
          <button
            onClick={() => setShowHelpModal(true)}
            className="px-4 py-2 text-sm font-medium border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex items-center gap-2"
            title="Bekijk tips voor dagplanning"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tips
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800 flex items-center justify-between print:hidden">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors" aria-label="Melding sluiten">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
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

      {/* Periode selector */}
      {competition.periode > 1 && (
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 px-4 py-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Periode:</span>
            <div className="flex gap-1">
              {Array.from({ length: competition.periode }, (_, i) => i + 1).map((periodeNr) => (
                <button
                  key={periodeNr}
                  onClick={() => {
                    setSelectedPeriode(periodeNr);
                    // Reset dagplanning state when switching periods
                    setShowPairings(false);
                    setSelectedPlayers(new Set());
                    setMatchesPerPlayer(1);
                    setGeneratedPairings([]);
                  }}
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
      )}

      {players.length < 2 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center print:hidden">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Voeg minimaal 2 spelers toe om een dagplanning te maken.
          </p>
          <button
            onClick={() => router.push(`/competities/${compNr}/spelers`)}
            className="mt-4 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors text-sm"
          >
            Naar spelers
          </button>
        </div>
      ) : !showPairings ? (
        /* Step 1: Select present players */
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Stap 1: Selecteer aanwezige spelers
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Vink aan welke spelers vandaag aanwezig zijn
            </p>
          </div>

          <div className="p-6 space-y-2">
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

          {/* Matches per player choice */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-6">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Aantal partijen per speler:
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="matchesPerPlayer"
                  value="1"
                  checked={matchesPerPlayer === 1}
                  onChange={() => setMatchesPerPlayer(1)}
                  className="w-4 h-4 text-green-700 focus:ring-green-500 dark:bg-slate-700"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">1 partij</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="matchesPerPlayer"
                  value="2"
                  checked={matchesPerPlayer === 2}
                  onChange={() => setMatchesPerPlayer(2)}
                  className="w-4 h-4 text-green-700 focus:ring-green-500 dark:bg-slate-700"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">2 partijen</span>
              </label>
            </div>
          </div>

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
                  onClick={() => {
                    if (selectedPlayers.size < 2) {
                      alert('Selecteer minimaal 2 spelers om een partijindeling te genereren.');
                      return;
                    }
                    const pairings = generateDagplanningPairings();
                    setGeneratedPairings(pairings);
                    setShowPairings(true);
                  }}
                  disabled={selectedPlayers.size < 2}
                  className="px-4 py-2 text-sm font-medium bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Genereer partijindeling
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Step 2: Generated pairings */
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Stap 2: Partijindeling voor vandaag
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Voorgestelde partijindeling op basis van wie al tegen wie gespeeld heeft
              {matchesPerPlayer === 2 && ' (2 partijen per speler)'}
            </p>
          </div>

          <div className="p-6 space-y-3">
            {/* Group pairings by round */}
            {(() => {
              const rounds = new Map<number, typeof generatedPairings>();
              generatedPairings.forEach(p => {
                if (!rounds.has(p.ronde)) rounds.set(p.ronde, []);
                rounds.get(p.ronde)!.push(p);
              });
              const roundNumbers = [...rounds.keys()].sort((a, b) => a - b);
              const hasMultipleRounds = roundNumbers.length > 1;

              return roundNumbers.map(roundNr => (
                <div key={roundNr}>
                  {hasMultipleRounds && (
                    <div className="mt-2 mb-2">
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        Ronde {roundNr}
                        {roundNr === 3 && ' (rustspelers)'}
                      </h3>
                    </div>
                  )}
                  <div className="space-y-2">
                    {rounds.get(roundNr)!.map((pairing, index) => {
                      const isBye = !pairing.player2;

                      return (
                        <div
                          key={`${roundNr}-${index}`}
                          className={`flex items-center gap-3 p-4 rounded-lg border ${
                            isBye
                              ? 'border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20'
                              : roundNr === 3
                                ? 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/30'
                          }`}
                        >
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            isBye
                              ? 'bg-amber-100 dark:bg-amber-900/30'
                              : roundNr === 3
                                ? 'bg-blue-100 dark:bg-blue-900/30'
                                : 'bg-green-100 dark:bg-green-900/30'
                          }`}>
                            <span className={`font-bold text-sm ${
                              isBye
                                ? 'text-amber-700 dark:text-amber-400'
                                : roundNr === 3
                                  ? 'text-blue-700 dark:text-blue-400'
                                  : 'text-green-700 dark:text-green-400'
                            }`}>{index + 1}</span>
                          </div>
                          <div className="flex-1 text-base text-slate-900 dark:text-white">
                            <span className="font-semibold">{getPlayerNameWithCar(pairing.player1)}</span>
                            {isBye ? (
                              <span className="text-amber-600 dark:text-amber-400 ml-3 text-sm italic">vrij (bye)</span>
                            ) : (
                              <>
                                <span className="text-slate-500 dark:text-slate-400 mx-3">vs</span>
                                <span className="font-semibold">{getPlayerNameWithCar(pairing.player2!)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>

          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setShowPairings(false);
                  setGeneratedPairings([]);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Terug naar selectie
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Printen
                </button>
                <button
                  onClick={handleAfsluiten}
                  className="px-4 py-2 text-sm font-medium border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Afsluiten
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation warning modal */}
      {showLeaveWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Dagplanning verlaten?
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Als u deze pagina verlaat, vervalt de aangemaakte dagplanning. Print, zo nodig, de planning eerst uit!
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 italic">
              NB: U kunt altijd, op elk moment, een nieuwe dagplanning maken.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelLeave}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Eerst printen
              </button>
              <button
                onClick={handleConfirmLeave}
                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Pagina verlaten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help modal with tips */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-lg w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Tips voor Dagplanning
              </h3>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Tip 1: Even aantal spelers</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Als u een even aantal spelers aanvinkt, kies dan <strong>1 partij per speler</strong> en maak na de laatste partij opnieuw een dagplanning met 1 partij per speler.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Tip 2: Oneven aantal spelers</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Als u een oneven aantal spelers aanvinkt, kies dan <strong>2 partijen per speler</strong> omdat dan zo mogelijk de 2 rustspelers per ronde tegen elkaar worden ingedeeld.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Begrepen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
