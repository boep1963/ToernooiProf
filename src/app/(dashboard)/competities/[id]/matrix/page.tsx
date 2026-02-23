'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  id: string;
  uitslag_code: string;
  sp_1_nr: number;
  sp_1_naam?: string;
  sp_1_punt: number;
  sp_1_cartem?: number;
  sp_1_cargem?: number;
  sp_1_hs?: number;
  sp_2_nr: number;
  sp_2_naam?: string;
  sp_2_punt: number;
  sp_2_cartem?: number;
  sp_2_cargem?: number;
  sp_2_hs?: number;
  brt?: number;
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
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<{ playerANr: number; playerBNr: number; playerAName: string; playerBName: string; resultId?: string; result?: ResultData } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    sp_1_cartem: '',
    sp_1_cargem: '',
    sp_1_hs: '',
    sp_2_cartem: '',
    sp_2_cargem: '',
    sp_2_hs: '',
    brt: '',
  });
  const [showVerification, setShowVerification] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

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

        // Initialize selectedPeriode to competition's current periode
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
        <Link
          href="/competities"
          className="mt-4 inline-block px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors"
        >
          Naar competitieoverzicht
        </Link>
      </div>
    );
  }

  // Sort players by name according to competition sorteren setting
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

  const carKey = getCarambolesKey(competition.discipline);

  // Function to get player name with caramboles
  const getPlayerNameWithCar = (player: PlayerData): string => {
    const name = formatName(player.spa_vnaam, player.spa_tv, player.spa_anaam);
    const car = player[carKey] || 0;
    return `${name} (${car})`;
  };

  // Calculate verification data
  const calculateVerificationData = () => {
    const cargem1 = Number(formData.sp_1_cargem) || 0;
    const cargem2 = Number(formData.sp_2_cargem) || 0;
    const brt = Number(formData.brt) || 1;

    // Calculate moyenne (3 decimals, truncated not rounded)
    const moyenne1 = Math.floor((cargem1 / brt) * 1000) / 1000;
    const moyenne2 = Math.floor((cargem2 / brt) * 1000) / 1000;

    // Calculate points based on competition's point system
    const cartem1 = Number(formData.sp_1_cartem) || 0;
    const cartem2 = Number(formData.sp_2_cartem) || 0;

    let points1 = 0;
    let points2 = 0;
    let result = '';

    if (competition) {
      // Determine winner based on caramboles made vs target
      const won1 = cargem1 >= cartem1;
      const won2 = cargem2 >= cartem2;

      if (won1 && !won2) {
        // Player 1 wins
        if (competition.punten_sys === 1) { // WRV 2-1-0
          points1 = 2;
          points2 = 0;
        } else if (competition.punten_sys === 2) { // WRV 3-2-1-0
          points1 = 3;
          points2 = 0;
        }
        result = `${selectedMatch?.playerAName} wint`;
      } else if (!won1 && won2) {
        // Player 2 wins
        if (competition.punten_sys === 1) { // WRV 2-1-0
          points1 = 0;
          points2 = 2;
        } else if (competition.punten_sys === 2) { // WRV 3-2-1-0
          points1 = 0;
          points2 = 3;
        }
        result = `${selectedMatch?.playerBName} wint`;
      } else if (won1 && won2) {
        // Both won - check who made more caramboles
        if (cargem1 > cargem2) {
          if (competition.punten_sys === 1) { // WRV 2-1-0
            points1 = 2;
            points2 = 1;
          } else if (competition.punten_sys === 2) { // WRV 3-2-1-0
            points1 = 3;
            points2 = 2;
          }
          result = `${selectedMatch?.playerAName} wint`;
        } else if (cargem2 > cargem1) {
          if (competition.punten_sys === 1) { // WRV 2-1-0
            points1 = 1;
            points2 = 2;
          } else if (competition.punten_sys === 2) { // WRV 3-2-1-0
            points1 = 2;
            points2 = 3;
          }
          result = `${selectedMatch?.playerBName} wint`;
        } else {
          // Exact draw
          if (competition.punten_sys === 1) { // WRV 2-1-0
            points1 = 1;
            points2 = 1;
          } else if (competition.punten_sys === 2) { // WRV 3-2-1-0
            points1 = 1;
            points2 = 1;
          }
          result = 'Remise';
        }
      } else {
        // Neither won - check who made more caramboles
        if (cargem1 > cargem2) {
          if (competition.punten_sys === 1) { // WRV 2-1-0
            points1 = 1;
            points2 = 0;
          } else if (competition.punten_sys === 2) { // WRV 3-2-1-0
            points1 = 2;
            points2 = 1;
          }
          result = `${selectedMatch?.playerAName} wint`;
        } else if (cargem2 > cargem1) {
          if (competition.punten_sys === 1) { // WRV 2-1-0
            points1 = 0;
            points2 = 1;
          } else if (competition.punten_sys === 2) { // WRV 3-2-1-0
            points1 = 1;
            points2 = 2;
          }
          result = `${selectedMatch?.playerBName} wint`;
        } else {
          // Exact draw
          if (competition.punten_sys === 1) { // WRV 2-1-0
            points1 = 1;
            points2 = 1;
          } else if (competition.punten_sys === 2) { // WRV 3-2-1-0
            points1 = 1;
            points2 = 1;
          }
          result = 'Remise';
        }
      }
    }

    return { moyenne1, moyenne2, points1, points2, result };
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle Matrix cell click
  const handleCellClick = (playerANr: number, playerBNr: number) => {
    const playerA = players.find(p => p.spc_nummer === playerANr);
    const playerB = players.find(p => p.spc_nummer === playerBNr);

    if (!playerA || !playerB) return;

    const playerAName = formatName(playerA.spa_vnaam, playerA.spa_tv, playerA.spa_anaam);
    const playerBName = formatName(playerB.spa_vnaam, playerB.spa_tv, playerB.spa_anaam);

    // Find existing result
    const result = results.find(
      (r) =>
        (r.sp_1_nr === playerANr && r.sp_2_nr === playerBNr) ||
        (r.sp_1_nr === playerBNr && r.sp_2_nr === playerANr)
    );

    if (result) {
      // Pre-fill form with existing result
      const isPlayerAFirst = result.sp_1_nr === playerANr;
      setFormData({
        sp_1_cartem: String(isPlayerAFirst ? result.sp_1_cartem : result.sp_2_cartem),
        sp_1_cargem: String(isPlayerAFirst ? result.sp_1_cargem : result.sp_2_cargem),
        sp_1_hs: String(isPlayerAFirst ? (result.sp_1_hs || 0) : (result.sp_2_hs || 0)),
        sp_2_cartem: String(isPlayerAFirst ? result.sp_2_cartem : result.sp_1_cartem),
        sp_2_cargem: String(isPlayerAFirst ? result.sp_2_cargem : result.sp_1_cargem),
        sp_2_hs: String(isPlayerAFirst ? (result.sp_2_hs || 0) : (result.sp_1_hs || 0)),
        brt: String(result.brt || 1),
      });
      setSelectedMatch({ playerANr, playerBNr, playerAName, playerBName, resultId: result.id, result });
    } else {
      // New result - clear form
      setFormData({
        sp_1_cartem: String(playerA[carKey] || 0),
        sp_1_cargem: '',
        sp_1_hs: '',
        sp_2_cartem: String(playerB[carKey] || 0),
        sp_2_cargem: '',
        sp_2_hs: '',
        brt: '',
      });
      setSelectedMatch({ playerANr, playerBNr, playerAName, playerBName });
    }

    setShowVerification(false);
    setShowResultModal(true);
  };

  // Handle form submission
  const handleSubmitResult = async () => {
    if (!selectedMatch || !selectedPeriode) return;

    setIsSubmitting(true);
    setError('');

    try {
      const uitslag_code = `${selectedPeriode}_${String(selectedMatch.playerANr).padStart(3, '0')}_${String(selectedMatch.playerBNr).padStart(3, '0')}`;

      const resultData = {
        uitslag_code,
        sp_1_nr: selectedMatch.playerANr,
        sp_1_cartem: Number(formData.sp_1_cartem),
        sp_1_cargem: Number(formData.sp_1_cargem),
        sp_1_hs: Number(formData.sp_1_hs),
        sp_2_nr: selectedMatch.playerBNr,
        sp_2_cartem: Number(formData.sp_2_cartem),
        sp_2_cargem: Number(formData.sp_2_cargem),
        sp_2_hs: Number(formData.sp_2_hs),
        brt: Number(formData.brt),
      };

      const response = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Fout bij opslaan uitslag');
        return;
      }

      // Reload results
      const resultsRes = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/results?periode=${selectedPeriode}`);
      if (resultsRes.ok) {
        const resultsData = await resultsRes.json();
        setResults(resultsData.results || []);
      }

      setShowResultModal(false);
      setSelectedMatch(null);
    } catch (err) {
      setError('Fout bij opslaan uitslag');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show delete warning modal
  const handleDeleteClick = () => {
    if (!selectedMatch?.resultId) return;
    setShowDeleteWarning(true);
  };

  // Handle result deletion confirmation
  const handleConfirmDelete = async () => {
    if (!selectedMatch?.resultId) return;

    setShowDeleteWarning(false);
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/results/${selectedMatch.resultId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Fout bij verwijderen uitslag');
        return;
      }

      // Reload results
      const resultsRes = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/results?periode=${selectedPeriode}`);
      if (resultsRes.ok) {
        const resultsData = await resultsRes.json();
        setResults(resultsData.results || []);
      }

      setShowResultModal(false);
      setSelectedMatch(null);
    } catch (err) {
      setError('Fout bij verwijderen uitslag');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <CompetitionSubNav compNr={compNr} compNaam={competition.comp_naam} periode={competition.periode || 1} />

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Matrix - {competition.comp_naam}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {DISCIPLINES[competition.discipline]} | Wie speelt tegen wie | Periode {selectedPeriode}
            {isLoadingPeriode && <span className="ml-2 text-green-600 dark:text-green-400">&#x27F3; Laden...</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
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
                      Totaal aantal partijen
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {sortedPlayers.map((playerRow) => {
                  let totalMatches = 0;

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
                              <button
                                onClick={() => handleCellClick(playerRow.spc_nummer, playerCol.spc_nummer)}
                                className="inline-flex items-center justify-center w-6 h-6 rounded text-xs bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                                title="Klik om uitslag in te voeren"
                              >
                                -
                              </button>
                            </td>
                          );
                        }

                        if (!matchResult.played) {
                          return (
                            <td key={playerCol.spc_nummer} className="text-center px-2 py-2">
                              <button
                                onClick={() => handleCellClick(playerRow.spc_nummer, playerCol.spc_nummer)}
                                className="inline-flex items-center justify-center w-6 h-6 rounded text-xs bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors cursor-pointer"
                                title="Klik om uitslag in te voeren"
                              >
                                -
                              </button>
                            </td>
                          );
                        }

                        totalMatches += 1;

                        const isWin = matchResult.pointsA > matchResult.pointsB;
                        const isDraw = matchResult.pointsA === matchResult.pointsB && matchResult.pointsA > 0;

                        return (
                          <td key={playerCol.spc_nummer} className="text-center px-2 py-2">
                            <button
                              onClick={() => handleCellClick(playerRow.spc_nummer, playerCol.spc_nummer)}
                              className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity ${
                                isWin
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  : isDraw
                                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200'
                              }`}
                              title="Klik om uitslag te wijzigen"
                            >
                              {matchResult.pointsA}
                            </button>
                          </td>
                        );
                      })}
                      <td className="text-center px-3 py-2 text-sm font-bold text-green-700 dark:text-green-400 tabular-nums border-l border-slate-200 dark:border-slate-700">
                        {totalMatches}
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
                  <span className="inline-block w-4 h-4 rounded bg-slate-300 dark:bg-slate-600 border border-slate-400 dark:border-slate-500 text-center text-[10px] leading-4 text-slate-500 dark:text-slate-400">-</span>
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

      {/* Result Entry/Edit Modal */}
      {showResultModal && selectedMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedMatch.resultId ? 'Uitslag wijzigen' : 'Uitslag invoeren'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {selectedMatch.playerAName} vs {selectedMatch.playerBName}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Player 1 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">{selectedMatch.playerAName}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Te maken
                    </label>
                    <input
                      type="number"
                      value={formData.sp_1_cartem}
                      onChange={(e) => setFormData({ ...formData, sp_1_cartem: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Gemaakt
                    </label>
                    <input
                      type="number"
                      value={formData.sp_1_cargem}
                      onChange={(e) => setFormData({ ...formData, sp_1_cargem: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Hoogste serie
                    </label>
                    <input
                      type="number"
                      value={formData.sp_1_hs}
                      onChange={(e) => setFormData({ ...formData, sp_1_hs: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Player 2 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">{selectedMatch.playerBName}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Te maken
                    </label>
                    <input
                      type="number"
                      value={formData.sp_2_cartem}
                      onChange={(e) => setFormData({ ...formData, sp_2_cartem: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Gemaakt
                    </label>
                    <input
                      type="number"
                      value={formData.sp_2_cargem}
                      onChange={(e) => setFormData({ ...formData, sp_2_cargem: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Hoogste serie
                    </label>
                    <input
                      type="number"
                      value={formData.sp_2_hs}
                      onChange={(e) => setFormData({ ...formData, sp_2_hs: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Beurten */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Aantal beurten
                </label>
                <input
                  type="number"
                  value={formData.brt}
                  onChange={(e) => setFormData({ ...formData, brt: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  min="1"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm">
                  {error}
                </div>
              )}

              {/* Verification Info */}
              {showVerification && formData.sp_1_cargem && formData.sp_2_cargem && formData.brt && (() => {
                const verification = calculateVerificationData();
                return (
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Controle</h4>
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-200">{selectedMatch?.playerAName}</p>
                          <p className="text-blue-700 dark:text-blue-300">Moyenne: {verification.moyenne1.toFixed(3)}</p>
                          <p className="text-blue-700 dark:text-blue-300">Punten: {verification.points1}</p>
                        </div>
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-200">{selectedMatch?.playerBName}</p>
                          <p className="text-blue-700 dark:text-blue-300">Moyenne: {verification.moyenne2.toFixed(3)}</p>
                          <p className="text-blue-700 dark:text-blue-300">Punten: {verification.points2}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                        <p className="font-semibold text-blue-900 dark:text-blue-100">{verification.result}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div>
                {selectedMatch.resultId && (
                  <button
                    onClick={handleDeleteClick}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    Partij verwijderen
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowResultModal(false);
                    setSelectedMatch(null);
                    setError('');
                    setShowVerification(false);
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  Annuleren
                </button>
                <button
                  onClick={() => setShowVerification(true)}
                  disabled={!formData.sp_1_cargem || !formData.sp_2_cargem || !formData.brt}
                  className="px-4 py-2 border border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Controle
                </button>
                <button
                  onClick={handleSubmitResult}
                  disabled={isSubmitting || !formData.sp_1_cargem || !formData.sp_2_cargem || !formData.brt}
                  className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Bezig...' : (selectedMatch.resultId ? 'Wijzigen' : 'Opslaan')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Warning Modal */}
      {showDeleteWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Uitslag verwijderen
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Een uitslag verwijderen kan niet meer ongedaan gemaakt worden!
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Weet u zeker dat u deze uitslag wilt verwijderen?
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteWarning(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                Annuleren
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
