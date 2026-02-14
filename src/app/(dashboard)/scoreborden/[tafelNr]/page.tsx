'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import OrganizationLogo from '@/components/common/OrganizationLogo';

interface ScoreboardData {
  tafel_nr: number;
  org_nummer: number;
  org_naam: string;
  org_logo?: string;
  device_config: {
    soort: number; // 1=mouse, 2=tablet
  };
  table: {
    status: number; // 0=waiting, 1=started, 2=result
    u_code: string;
    comp_nr: number;
  } | null;
  match: {
    naam_A: string;
    naam_B: string;
    cartem_A: number;
    cartem_B: number;
    nummer_A: number;
    nummer_B: number;
    periode: number;
    uitslag_code: string;
  } | null;
  score: {
    car_A_gem: number;
    car_B_gem: number;
    hs_A: number;
    hs_B: number;
    brt: number;
    turn: number;
    alert: number;
  } | null;
  score_tablet?: {
    serie_A: number;
    serie_B: number;
  } | null;
  competition: {
    comp_naam: string;
    discipline: number;
    max_beurten: number;
    vast_beurten: number;
  } | null;
  status: number;
}

const DISCIPLINE_NAMES: Record<number, string> = {
  1: 'Libre',
  2: 'Bandstoten',
  3: 'Driebanden klein',
  4: 'Driebanden groot',
  5: 'Kader',
};

interface AvailableMatch {
  id: string;
  comp_nr: number;
  comp_naam: string;
  uitslag_code: string;
  naam_A: string;
  naam_B: string;
  cartem_A: number;
  cartem_B: number;
  gespeeld: number;
}

interface SlideshowImage {
  id: string;
  volg_nr: number;
  image_data: string;
}

export default function ScoreboardPage() {
  const params = useParams();
  const tafelNr = params?.tafelNr as string;
  const { orgNummer } = useAuth();
  const [data, setData] = useState<ScoreboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Tablet-specific state for current series input
  const [serieA, setSerieA] = useState(0);
  const [serieB, setSerieB] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Match assignment state
  const [availableMatches, setAvailableMatches] = useState<AvailableMatch[]>([]);
  const [showMatchSelector, setShowMatchSelector] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [starting, setStarting] = useState(false);

  // Slideshow state
  const [slideshowImages, setSlideshowImages] = useState<SlideshowImage[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slideshowTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    if (!orgNummer || !tafelNr) return;

    try {
      const res = await fetch(`/api/organizations/${orgNummer}/scoreboards/${tafelNr}`);
      if (!res.ok) throw new Error('Fout bij ophalen data');
      const result = await res.json();
      setData(result);
      // Sync tablet series from server data
      if (result.score_tablet) {
        setSerieA(result.score_tablet.serie_A || 0);
        setSerieB(result.score_tablet.serie_B || 0);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching scoreboard:', err);
      setError('Kan scorebord niet laden');
    } finally {
      setLoading(false);
    }
  }, [orgNummer, tafelNr]);

  useEffect(() => {
    fetchData();
    // Poll for updates every 3 seconds
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        // Fullscreen not supported or denied
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Slideshow: fetch advertisement images
  useEffect(() => {
    if (!orgNummer) return;
    const fetchSlideshow = async () => {
      try {
        const res = await fetch(`/api/organizations/${orgNummer}/advertisements/images`);
        if (res.ok) {
          const images = await res.json();
          setSlideshowImages(images);
        }
      } catch (err) {
        console.error('Error loading slideshow images:', err);
      }
    };
    fetchSlideshow();
    // Refresh slideshow images every 5 minutes
    const refreshInterval = setInterval(fetchSlideshow, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [orgNummer]);

  // Slideshow: auto-rotate every 8 seconds
  useEffect(() => {
    if (slideshowImages.length <= 1) {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current);
        slideshowTimerRef.current = null;
      }
      return;
    }
    slideshowTimerRef.current = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slideshowImages.length);
    }, 8000);
    return () => {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current);
        slideshowTimerRef.current = null;
      }
    };
  }, [slideshowImages.length]);

  // Tablet score input handlers
  const handleSerieIncrement = useCallback((player: 'A' | 'B') => {
    if (!data?.match) return;
    const match = data.match;
    const score = data.score;

    if (player === 'A') {
      const currentTotal = (score?.car_A_gem || 0) + serieA + 1;
      if (currentTotal <= match.cartem_A) {
        setSerieA(prev => prev + 1);
      }
    } else {
      const currentTotal = (score?.car_B_gem || 0) + serieB + 1;
      if (currentTotal <= match.cartem_B) {
        setSerieB(prev => prev + 1);
      }
    }
  }, [data, serieA, serieB]);

  const handleSerieDecrement = useCallback((player: 'A' | 'B') => {
    if (player === 'A') {
      setSerieA(prev => Math.max(0, prev - 1));
    } else {
      setSerieB(prev => Math.max(0, prev - 1));
    }
  }, []);

  const handleSubmitScore = useCallback(async () => {
    if (!orgNummer || !tafelNr || !data?.match || submitting) return;

    setSubmitting(true);
    try {
      const turn = data.score?.turn || 1;
      const serie = turn === 1 ? serieA : serieB;

      const res = await fetch(`/api/organizations/${orgNummer}/scoreboards/${tafelNr}/tablet-input`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player: turn === 1 ? 'A' : 'B',
          serie: serie,
        }),
      });

      if (!res.ok) throw new Error('Fout bij invoer');

      // Reset current series and refresh data
      if (turn === 1) setSerieA(0);
      else setSerieB(0);

      await fetchData();
    } catch (err) {
      console.error('Error submitting score:', err);
    } finally {
      setSubmitting(false);
    }
  }, [orgNummer, tafelNr, data, serieA, serieB, submitting, fetchData]);

  const handleResetSerie = useCallback(() => {
    if (!data?.score) return;
    const turn = data.score.turn || 1;
    if (turn === 1) setSerieA(0);
    else setSerieB(0);
  }, [data]);

  // Load available matches from competitions
  const loadAvailableMatches = useCallback(async () => {
    if (!orgNummer) return;
    try {
      // Get competitions
      const compRes = await fetch(`/api/organizations/${orgNummer}/competitions`);
      if (!compRes.ok) return;
      const competitions = await compRes.json();

      const allMatches: AvailableMatch[] = [];

      for (const comp of competitions) {
        const matchRes = await fetch(`/api/organizations/${orgNummer}/competitions/${comp.comp_nr}/matches`);
        if (!matchRes.ok) continue;
        const matchData = await matchRes.json();

        for (const match of (matchData.matches || [])) {
          if (match.gespeeld === 0) { // Only unplayed matches
            allMatches.push({
              id: match.id,
              comp_nr: comp.comp_nr,
              comp_naam: comp.comp_naam,
              uitslag_code: match.uitslag_code,
              naam_A: match.naam_A,
              naam_B: match.naam_B,
              cartem_A: match.cartem_A,
              cartem_B: match.cartem_B,
              gespeeld: match.gespeeld,
            });
          }
        }
      }

      setAvailableMatches(allMatches);
    } catch (err) {
      console.error('Error loading matches:', err);
    }
  }, [orgNummer]);

  // Assign match to this table
  const handleAssignMatch = useCallback(async (match: AvailableMatch) => {
    if (!orgNummer || assigning) return;
    setAssigning(true);
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/scoreboards/${tafelNr}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign',
          comp_nr: match.comp_nr,
          uitslag_code: match.uitslag_code,
        }),
      });

      if (res.ok) {
        setShowMatchSelector(false);
        await fetchData(); // Refresh scoreboard data
      }
    } catch (err) {
      console.error('Error assigning match:', err);
    } finally {
      setAssigning(false);
    }
  }, [orgNummer, tafelNr, assigning, fetchData]);

  // Start the match on this table
  const handleStartMatch = useCallback(async () => {
    if (!orgNummer || starting) return;
    setStarting(true);
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/scoreboards/${tafelNr}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });

      if (res.ok) {
        await fetchData(); // Refresh to get updated status
      }
    } catch (err) {
      console.error('Error starting match:', err);
    } finally {
      setStarting(false);
    }
  }, [orgNummer, tafelNr, starting, fetchData]);

  // Clear the table
  const handleClearTable = useCallback(async () => {
    if (!orgNummer) return;
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/scoreboards/${tafelNr}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error clearing table:', err);
    }
  }, [orgNummer, tafelNr, fetchData]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#003300]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Scorebord laden...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#003300]">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error || 'Geen data beschikbaar'}</p>
          <Link href="/scoreborden" className="text-green-400 hover:text-green-300 underline text-lg">
            Terug naar overzicht
          </Link>
        </div>
      </div>
    );
  }

  const isTablet = data.device_config?.soort === 2;
  const hasMatch = data.match !== null;
  const score = data.score;
  const match = data.match;
  const competition = data.competition;

  // Calculate remaining caramboles
  const restA = match ? match.cartem_A - (score?.car_A_gem || 0) : 0;
  const restB = match ? match.cartem_B - (score?.car_B_gem || 0) : 0;

  // Determine who's turn it is
  const turn = score?.turn || 1; // 1=player A, 2=player B

  // Determine if it's the last turn
  const beurten = score?.brt || 0;
  const maxBeurten = competition?.max_beurten || 0;
  const isLastTurn = maxBeurten > 0 && beurten >= maxBeurten - 1;

  // "En nog" threshold: 3 for Driebanden, 5 for others
  const discipline = competition?.discipline || 1;
  const enNogThreshold = (discipline === 3 || discipline === 4) ? 3 : 5;

  // Render tablet layout
  if (isTablet) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#003300] text-white font-sans overflow-auto scoreboard-tablet">
        {/* Fullscreen toggle button */}
        <button
          onClick={toggleFullscreen}
          className="fixed top-3 right-3 z-[110] bg-green-700 hover:bg-green-600 active:bg-green-500 text-white p-4 rounded-xl transition-colors shadow-lg min-w-[48px] min-h-[48px]"
          title={isFullscreen ? 'Verlaat volledig scherm' : 'Volledig scherm'}
        >
          {isFullscreen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          )}
        </button>

        {/* Tablet Header - player names */}
        <div className="bg-[#002200] border-b-2 border-green-600 px-4 py-3">
          <div className="flex items-center justify-between max-w-[1200px] mx-auto">
            {/* Player A name */}
            <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold truncate flex-1 text-left ${turn === 1 ? 'text-white' : 'text-gray-400'}`}>
              {hasMatch && match ? match.naam_A : 'Speler A'}
            </h2>
            {/* Center info with logo */}
            <div className="text-center px-4 flex-shrink-0 flex flex-col items-center gap-1">
              {data.org_logo && (
                <OrganizationLogo
                  src={data.org_logo}
                  alt="Logo"
                  className="h-8 w-auto object-contain mb-1"
                />
              )}
              <p className="text-green-400 text-sm font-semibold">Tafel {tafelNr}</p>
              <p className="text-green-600 text-xs">{data.org_naam}</p>
            </div>
            {/* Player B name */}
            <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold truncate flex-1 text-right ${turn === 2 ? 'text-white' : 'text-gray-400'}`}>
              {hasMatch && match ? match.naam_B : 'Speler B'}
            </h2>
          </div>
        </div>

        {!hasMatch ? (
          /* Waiting state - tablet: with slideshow */
          <div className="relative" style={{ minHeight: 'calc(100vh - 70px)' }}>
            {/* Slideshow background - tablet */}
            {slideshowImages.length > 0 && !showMatchSelector && (
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                {slideshowImages.map((slide, index) => (
                  <div
                    key={slide.id}
                    className="absolute inset-0 flex items-center justify-center transition-opacity duration-1000"
                    style={{ opacity: index === currentSlideIndex ? 1 : 0 }}
                  >
                    <img
                      src={slide.image_data}
                      alt={`Advertentie ${slide.volg_nr}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))}
                {slideshowImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-10">
                    {slideshowImages.map((_, index) => (
                      <span
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentSlideIndex ? 'bg-green-400 scale-125' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="relative z-10 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 70px)' }}>
              <div className="text-center px-4 max-w-2xl w-full">
                {showMatchSelector ? (
                  <div className="bg-[#002200] rounded-2xl border-2 border-green-600 p-6 text-left">
                    <h3 className="text-2xl font-bold text-green-400 mb-4">Wedstrijd selecteren</h3>
                    {availableMatches.length === 0 ? (
                      <p className="text-green-300">Geen beschikbare wedstrijden gevonden. Genereer eerst een planning.</p>
                    ) : (
                      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {availableMatches.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => handleAssignMatch(m)}
                            disabled={assigning}
                            className="w-full text-left bg-[#003300] hover:bg-green-800/50 active:bg-green-700/50 border border-green-700 rounded-xl p-4 transition-colors disabled:opacity-50 touch-manipulation min-h-[48px]"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-white font-semibold">
                                  {m.naam_A} vs {m.naam_B}
                                </p>
                                <p className="text-green-400 text-sm">
                                  {m.comp_naam} | {m.uitslag_code}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-green-300 text-sm tabular-nums">
                                  {m.cartem_A} - {m.cartem_B}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => setShowMatchSelector(false)}
                      className="mt-4 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white px-6 py-3 rounded-xl transition-colors touch-manipulation min-h-[48px]"
                    >
                      Annuleren
                    </button>
                  </div>
                ) : slideshowImages.length === 0 ? (
                  <>
                    <div className="mb-6">
                      <svg className="w-20 h-20 md:w-28 md:h-28 mx-auto text-green-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Wachten op partij</h2>
                    <p className="text-lg md:text-xl text-green-400 mb-2">Tafel {tafelNr}</p>
                    <p className="text-green-500">Selecteer een wedstrijd om het scorebord te starten</p>
                    <div className="mt-6 inline-flex items-center gap-3 bg-green-900/40 rounded-full px-6 py-3">
                      <span className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
                      <span className="text-yellow-400 text-lg font-medium">Wachtend</span>
                    </div>
                    <div className="mt-6">
                      <button
                        onClick={() => { loadAvailableMatches(); setShowMatchSelector(true); }}
                        className="bg-green-700 hover:bg-green-600 active:bg-green-500 text-white px-6 py-3 rounded-xl text-lg font-semibold transition-colors shadow-lg touch-manipulation min-h-[48px]"
                      >
                        Wedstrijd toewijzen
                      </button>
                    </div>
                  </>
                ) : (
                  /* Slideshow active - minimal overlay */
                  <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-20">
                    <button
                      onClick={() => { loadAvailableMatches(); setShowMatchSelector(true); }}
                      className="bg-green-700/90 hover:bg-green-600 active:bg-green-500 text-white px-6 py-3 rounded-xl text-base font-semibold transition-colors shadow-lg backdrop-blur-sm touch-manipulation min-h-[48px]"
                    >
                      Wedstrijd toewijzen
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Tablet active match layout */
          <div className="max-w-[1200px] mx-auto px-3 sm:px-4 py-3 sm:py-4">
            {/* Start match button for tablet - shown when assigned but not started */}
            {data.status === 0 && (
              <div className="flex items-center justify-center mb-4">
                <div className="bg-[#002200] rounded-2xl border-2 border-green-600 p-4 sm:p-6 text-center w-full max-w-md">
                  <p className="text-green-300 text-base sm:text-lg mb-2">Wedstrijd toegewezen</p>
                  <p className="text-white text-xl sm:text-2xl font-bold mb-1">
                    {match?.naam_A} vs {match?.naam_B}
                  </p>
                  <p className="text-green-400 text-sm mb-4">
                    Doel: {match?.cartem_A} - {match?.cartem_B}
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={handleStartMatch}
                      disabled={starting}
                      className="bg-green-600 hover:bg-green-500 active:bg-green-400 disabled:bg-green-800 text-white px-8 py-4 rounded-xl text-xl font-bold transition-colors shadow-lg touch-manipulation min-h-[48px]"
                    >
                      {starting ? 'Starten...' : 'Start partij'}
                    </button>
                    <button
                      onClick={handleClearTable}
                      className="bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white px-6 py-4 rounded-xl text-lg transition-colors touch-manipulation min-h-[48px]"
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Score boxes row */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-start mb-3 sm:mb-4">
              {/* Player A score */}
              <div className="flex flex-col items-center">
                <div className="bg-red-600 rounded-2xl w-full aspect-[4/3] flex items-center justify-center shadow-2xl border-2 border-white/20 max-w-[300px]">
                  <span className="text-5xl sm:text-6xl md:text-[7rem] font-bold leading-none tabular-nums">
                    {score?.car_A_gem || 0}
                  </span>
                </div>
                <p className="text-green-400 text-xs sm:text-sm mt-1">
                  Te maken: {match?.cartem_A}
                </p>
              </div>

              {/* Center - turns counter */}
              <div className="flex flex-col items-center gap-2 px-2 pt-1">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${data.status === 1 ? 'bg-green-400 animate-pulse' : data.status === 2 ? 'bg-blue-400' : 'bg-yellow-400'}`} />
                  <span className={`text-xs ${data.status === 1 ? 'text-green-400' : data.status === 2 ? 'text-blue-400' : 'text-yellow-400'}`}>
                    {data.status === 1 ? 'Bezig' : data.status === 2 ? 'Afgelopen' : 'Wachtend'}
                  </span>
                </div>
                <p className="text-green-300 text-xs">Beurten</p>
                <div className="bg-red-600 rounded-2xl w-24 h-20 sm:w-32 sm:h-24 md:w-40 md:h-32 flex items-center justify-center shadow-2xl border-2 border-white/20">
                  <span className="text-4xl sm:text-5xl md:text-7xl font-bold tabular-nums">
                    {beurten}
                  </span>
                </div>
                {maxBeurten > 0 && (
                  <p className="text-green-500 text-xs">Max {maxBeurten}</p>
                )}
              </div>

              {/* Player B score */}
              <div className="flex flex-col items-center">
                <div className="bg-red-600 rounded-2xl w-full aspect-[4/3] flex items-center justify-center shadow-2xl border-2 border-white/20 max-w-[300px]">
                  <span className="text-5xl sm:text-6xl md:text-[7rem] font-bold leading-none tabular-nums">
                    {score?.car_B_gem || 0}
                  </span>
                </div>
                <p className="text-green-400 text-xs sm:text-sm mt-1">
                  Te maken: {match?.cartem_B}
                </p>
              </div>
            </div>

            {/* "En nog" indicators and Highest Series row */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-start mb-3 sm:mb-4">
              {/* Player A - En nog + HS */}
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                {restA <= enNogThreshold && restA > 0 ? (
                  <div className="bg-yellow-500 text-red-700 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center border-3 border-white shadow-lg flex-shrink-0">
                    <span className="text-[9px] sm:text-xs font-bold leading-none">En nog</span>
                    <span className="text-2xl sm:text-3xl font-bold leading-none">{restA}</span>
                  </div>
                ) : <div className="w-16 sm:w-20" />}
                <div className="text-center">
                  <p className="text-green-300 text-xs font-bold">HS</p>
                  <div className="bg-[#002200] border-2 border-green-600 rounded-lg w-16 h-12 sm:w-20 sm:h-16 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl font-bold tabular-nums">{score?.hs_A || 0}</span>
                  </div>
                </div>
              </div>

              {/* Center - turn indicator */}
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center text-green-400">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={turn === 1 ? "M10 19l-7-7m0 0l7-7m-7 7h18" : "M14 5l7 7m0 0l-7 7m7-7H3"} />
                  </svg>
                  <span className="text-xs sm:text-sm font-bold truncate max-w-[100px]">
                    {turn === 1 ? match?.naam_A : match?.naam_B}
                  </span>
                </div>
                <p className="text-green-500 text-[10px] sm:text-xs">aan de beurt</p>
              </div>

              {/* Player B - En nog + HS */}
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <div className="text-center">
                  <p className="text-green-300 text-xs font-bold">HS</p>
                  <div className="bg-[#002200] border-2 border-green-600 rounded-lg w-16 h-12 sm:w-20 sm:h-16 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl font-bold tabular-nums">{score?.hs_B || 0}</span>
                  </div>
                </div>
                {restB <= enNogThreshold && restB > 0 ? (
                  <div className="bg-yellow-500 text-red-700 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center border-3 border-white shadow-lg flex-shrink-0">
                    <span className="text-[9px] sm:text-xs font-bold leading-none">En nog</span>
                    <span className="text-2xl sm:text-3xl font-bold leading-none">{restB}</span>
                  </div>
                ) : <div className="w-16 sm:w-20" />}
              </div>
            </div>

            {/* Current series display */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-center mb-3 sm:mb-4">
              {/* Player A current series */}
              <div className="text-center">
                <p className="text-green-300 text-xs sm:text-sm font-bold mb-1">Huidige serie</p>
                <div className="bg-black border-2 border-white rounded-xl w-20 h-16 sm:w-28 sm:h-20 md:w-32 md:h-24 flex items-center justify-center mx-auto">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums">
                    {turn === 1 ? serieA : 0}
                  </span>
                </div>
              </div>

              {/* Center spacer */}
              <div className="w-24 sm:w-32 md:w-40" />

              {/* Player B current series */}
              <div className="text-center">
                <p className="text-green-300 text-xs sm:text-sm font-bold mb-1">Huidige serie</p>
                <div className="bg-black border-2 border-white rounded-xl w-20 h-16 sm:w-28 sm:h-20 md:w-32 md:h-24 flex items-center justify-center mx-auto">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums">
                    {turn === 2 ? serieB : 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Tablet control buttons */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-start">
              {/* Player A controls */}
              <div className={`flex flex-col items-center gap-3 sm:gap-4 ${turn !== 1 ? 'opacity-30 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Decrement button */}
                  <button
                    onClick={() => handleSerieDecrement('A')}
                    disabled={turn !== 1 || serieA <= 0}
                    className="bg-black hover:bg-gray-800 active:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-white border-2 border-white rounded-xl min-w-[60px] min-h-[60px] sm:min-w-[80px] sm:min-h-[80px] md:min-w-[100px] md:min-h-[100px] flex items-center justify-center transition-colors touch-manipulation select-none"
                    aria-label="Min 1 voor speler A"
                  >
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold">- 1</span>
                  </button>

                  {/* Submit/Invoer button */}
                  <button
                    onClick={handleSubmitScore}
                    disabled={turn !== 1 || submitting}
                    className="bg-green-700 hover:bg-green-600 active:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed text-white border-2 border-green-400 rounded-xl min-w-[80px] min-h-[80px] sm:min-w-[110px] sm:min-h-[110px] md:min-w-[120px] md:min-h-[130px] flex flex-col items-center justify-center transition-colors shadow-lg touch-manipulation select-none"
                    aria-label="Invoer score speler A"
                  >
                    {submitting ? (
                      <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm sm:text-base md:text-lg font-bold">Invoer</span>
                      </>
                    )}
                  </button>

                  {/* Increment button */}
                  <button
                    onClick={() => handleSerieIncrement('A')}
                    disabled={turn !== 1}
                    className="bg-black hover:bg-gray-800 active:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-white border-2 border-white rounded-xl min-w-[60px] min-h-[60px] sm:min-w-[80px] sm:min-h-[80px] md:min-w-[100px] md:min-h-[100px] flex items-center justify-center transition-colors touch-manipulation select-none"
                    aria-label="Plus 1 voor speler A"
                  >
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold">+ 1</span>
                  </button>
                </div>

                {/* Klaar and Herstel row */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    onClick={handleSubmitScore}
                    disabled={turn !== 1 || submitting}
                    className="bg-green-800 hover:bg-green-700 active:bg-green-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl min-w-[60px] min-h-[48px] sm:min-w-[80px] sm:min-h-[56px] px-4 py-2 flex items-center justify-center gap-2 transition-colors touch-manipulation select-none border border-green-500"
                    aria-label="Beurt bevestigen speler A"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base font-semibold">Klaar</span>
                  </button>
                  <button
                    onClick={handleResetSerie}
                    disabled={turn !== 1}
                    className="bg-gray-700 hover:bg-gray-600 active:bg-gray-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl min-w-[60px] min-h-[48px] sm:min-w-[80px] sm:min-h-[56px] px-4 py-2 flex items-center justify-center gap-2 transition-colors touch-manipulation select-none border border-gray-500"
                    aria-label="Serie herstellen speler A"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm sm:text-base font-semibold">Herstel</span>
                  </button>
                </div>
              </div>

              {/* Center - last turn warning */}
              <div className="flex flex-col items-center justify-center w-24 sm:w-32 md:w-40 pt-4">
                {isLastTurn && (
                  <div className="bg-red-600 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-center animate-pulse">
                    <p className="text-yellow-400 text-xs sm:text-sm md:text-base font-bold leading-tight">LAATSTE</p>
                    <p className="text-yellow-400 text-xs sm:text-sm md:text-base font-bold leading-tight">BEURT!</p>
                  </div>
                )}
              </div>

              {/* Player B controls */}
              <div className={`flex flex-col items-center gap-3 sm:gap-4 ${turn !== 2 ? 'opacity-30 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Decrement button */}
                  <button
                    onClick={() => handleSerieDecrement('B')}
                    disabled={turn !== 2 || serieB <= 0}
                    className="bg-black hover:bg-gray-800 active:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-white border-2 border-white rounded-xl min-w-[60px] min-h-[60px] sm:min-w-[80px] sm:min-h-[80px] md:min-w-[100px] md:min-h-[100px] flex items-center justify-center transition-colors touch-manipulation select-none"
                    aria-label="Min 1 voor speler B"
                  >
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold">- 1</span>
                  </button>

                  {/* Submit/Invoer button */}
                  <button
                    onClick={handleSubmitScore}
                    disabled={turn !== 2 || submitting}
                    className="bg-green-700 hover:bg-green-600 active:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed text-white border-2 border-green-400 rounded-xl min-w-[80px] min-h-[80px] sm:min-w-[110px] sm:min-h-[110px] md:min-w-[120px] md:min-h-[130px] flex flex-col items-center justify-center transition-colors shadow-lg touch-manipulation select-none"
                    aria-label="Invoer score speler B"
                  >
                    {submitting ? (
                      <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm sm:text-base md:text-lg font-bold">Invoer</span>
                      </>
                    )}
                  </button>

                  {/* Increment button */}
                  <button
                    onClick={() => handleSerieIncrement('B')}
                    disabled={turn !== 2}
                    className="bg-black hover:bg-gray-800 active:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-white border-2 border-white rounded-xl min-w-[60px] min-h-[60px] sm:min-w-[80px] sm:min-h-[80px] md:min-w-[100px] md:min-h-[100px] flex items-center justify-center transition-colors touch-manipulation select-none"
                    aria-label="Plus 1 voor speler B"
                  >
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold">+ 1</span>
                  </button>
                </div>

                {/* Klaar and Herstel row */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    onClick={handleSubmitScore}
                    disabled={turn !== 2 || submitting}
                    className="bg-green-800 hover:bg-green-700 active:bg-green-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl min-w-[60px] min-h-[48px] sm:min-w-[80px] sm:min-h-[56px] px-4 py-2 flex items-center justify-center gap-2 transition-colors touch-manipulation select-none border border-green-500"
                    aria-label="Beurt bevestigen speler B"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base font-semibold">Klaar</span>
                  </button>
                  <button
                    onClick={handleResetSerie}
                    disabled={turn !== 2}
                    className="bg-gray-700 hover:bg-gray-600 active:bg-gray-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl min-w-[60px] min-h-[48px] sm:min-w-[80px] sm:min-h-[56px] px-4 py-2 flex items-center justify-center gap-2 transition-colors touch-manipulation select-none border border-gray-500"
                    aria-label="Serie herstellen speler B"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm sm:text-base font-semibold">Herstel</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Last turn warning banner */}
            {isLastTurn && (
              <div className="mt-4 bg-red-700/80 border-2 border-yellow-400 rounded-xl p-3 text-center animate-pulse">
                <p className="text-yellow-400 text-lg sm:text-xl md:text-2xl font-bold">LAATSTE BEURT!</p>
              </div>
            )}

            {/* Max turns info */}
            {!isLastTurn && maxBeurten > 0 && (
              <div className="mt-3 text-center">
                <p className="text-green-500 text-sm">Max {maxBeurten} beurten</p>
              </div>
            )}
          </div>
        )}

        {/* Back to overview link - tablet sized */}
        <div className="fixed bottom-3 left-3 z-[110]">
          <Link
            href="/scoreborden"
            className="bg-gray-800/80 hover:bg-gray-700 active:bg-gray-600 text-white px-5 py-3 rounded-xl text-sm transition-colors inline-flex items-center gap-2 backdrop-blur-sm min-h-[48px] touch-manipulation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Terug
          </Link>
        </div>
      </div>
    );
  }

  // Mouse/display-only layout (original)
  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#003300] text-white font-sans overflow-auto scoreboard-mouse`}
    >
      {/* Fullscreen toggle button */}
      <button
        onClick={toggleFullscreen}
        className="fixed top-4 right-4 z-[110] bg-green-700 hover:bg-green-600 text-white p-3 rounded-lg transition-colors shadow-lg"
        title={isFullscreen ? 'Verlaat volledig scherm' : 'Volledig scherm'}
      >
        {isFullscreen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
        )}
      </button>

      {/* Header with organization and table info */}
      <div className="bg-[#002200] border-b-2 border-green-600 px-6 py-3">
        <div className="flex items-center justify-between max-w-[1860px] mx-auto">
          <div className="flex items-center gap-4">
            {/* Organization logo */}
            {data.org_logo ? (
              <div className="h-10 flex items-center">
                <OrganizationLogo
                  src={data.org_logo}
                  alt="Logo"
                  className="h-10 w-auto object-contain"
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-green-800 rounded-lg flex items-center justify-center text-green-400 font-bold text-lg flex-shrink-0 border border-green-600">
                {data.org_naam?.charAt(0) || 'C'}
              </div>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-green-400">
              Tafel {tafelNr}
            </h1>
            {competition && (
              <span className="text-lg text-green-300 hidden sm:inline">
                {competition.comp_naam} — {DISCIPLINE_NAMES[competition.discipline] || ''}
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-green-300 text-sm font-semibold">{data.org_naam}</p>
            <p className="text-green-500 text-xs">
              🖱️ Muis modus
            </p>
          </div>
        </div>
      </div>

      {/* Main scoreboard area */}
      {!hasMatch ? (
        /* Waiting state - no match assigned: show slideshow + controls */
        <div className="relative" style={{ minHeight: 'calc(100vh - 70px)' }}>
          {/* Slideshow background */}
          {slideshowImages.length > 0 && !showMatchSelector && (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              {slideshowImages.map((slide, index) => (
                <div
                  key={slide.id}
                  className="absolute inset-0 flex items-center justify-center transition-opacity duration-1000"
                  style={{ opacity: index === currentSlideIndex ? 1 : 0 }}
                >
                  <img
                    src={slide.image_data}
                    alt={`Advertentie ${slide.volg_nr}`}
                    className="max-w-full max-h-full object-contain"
                    style={{ maxWidth: '1900px', maxHeight: '950px' }}
                  />
                </div>
              ))}
              {/* Slide indicator dots */}
              {slideshowImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-10">
                  {slideshowImages.map((_, index) => (
                    <span
                      key={index}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        index === currentSlideIndex
                          ? 'bg-green-400 scale-125'
                          : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Overlay content */}
          <div className={`relative z-10 flex items-center justify-center ${slideshowImages.length > 0 && !showMatchSelector ? '' : ''}`} style={{ minHeight: 'calc(100vh - 70px)' }}>
            <div className="text-center px-4 max-w-2xl w-full">
              {/* Match selector */}
              {showMatchSelector ? (
                <div className="bg-[#002200] rounded-2xl border-2 border-green-600 p-6 text-left">
                  <h3 className="text-2xl font-bold text-green-400 mb-4">Wedstrijd selecteren</h3>
                  {availableMatches.length === 0 ? (
                    <p className="text-green-300">Geen beschikbare wedstrijden gevonden. Genereer eerst een planning.</p>
                  ) : (
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                      {availableMatches.map((match) => (
                        <button
                          key={match.id}
                          onClick={() => handleAssignMatch(match)}
                          disabled={assigning}
                          className="w-full text-left bg-[#003300] hover:bg-green-800/50 border border-green-700 rounded-xl p-4 transition-colors disabled:opacity-50"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-white font-semibold">
                                {match?.naam_A} vs {match?.naam_B}
                              </p>
                              <p className="text-green-400 text-sm">
                                {match.comp_naam} | {match.uitslag_code}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-green-300 text-sm tabular-nums">
                                {match.cartem_A} - {match.cartem_B}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setShowMatchSelector(false)}
                    className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-colors"
                  >
                    Annuleren
                  </button>
                </div>
              ) : slideshowImages.length === 0 ? (
                /* No slideshow - show traditional waiting screen */
                <>
                  <div className="mb-8">
                    <svg className="w-24 h-24 md:w-32 md:h-32 mx-auto text-green-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-bold mb-4 text-white">Wachten op partij</h2>
                  <p className="text-xl md:text-2xl text-green-400 mb-2">Tafel {tafelNr}</p>
                  <p className="text-green-500 text-lg">
                    Selecteer een wedstrijd om het scorebord te starten
                  </p>
                  {/* Match status indicator */}
                  <div className="mt-8 inline-flex items-center gap-3 bg-green-900/40 rounded-full px-8 py-4">
                    <span className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
                    <span className="text-yellow-400 text-xl font-medium">Wachtend</span>
                  </div>
                  {/* Assign match button */}
                  <div className="mt-8">
                    <button
                      onClick={() => { loadAvailableMatches(); setShowMatchSelector(true); }}
                      className="bg-green-700 hover:bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors shadow-lg"
                    >
                      Wedstrijd toewijzen
                    </button>
                  </div>
                </>
              ) : (
                /* Slideshow is playing - show minimal overlay with controls */
                <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-20">
                  <button
                    onClick={() => { loadAvailableMatches(); setShowMatchSelector(true); }}
                    className="bg-green-700/90 hover:bg-green-600 text-white px-6 py-3 rounded-xl text-base font-semibold transition-colors shadow-lg backdrop-blur-sm"
                  >
                    Wedstrijd toewijzen
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Active match scoreboard - mouse mode */
        <div className="max-w-[1860px] mx-auto px-4 md:px-6 py-4 md:py-6">
          {/* Start match button - shown when match is assigned but not started */}
          {data.status === 0 && (
            <div className="flex items-center justify-center mb-6">
              <div className="bg-[#002200] rounded-2xl border-2 border-green-600 p-6 text-center">
                <p className="text-green-300 text-lg mb-2">Wedstrijd toegewezen</p>
                <p className="text-white text-2xl font-bold mb-1">
                  {match?.naam_A} vs {match?.naam_B}
                </p>
                <p className="text-green-400 text-sm mb-4">
                  Doel: {match?.cartem_A} - {match?.cartem_B}
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={handleStartMatch}
                    disabled={starting}
                    className="bg-green-600 hover:bg-green-500 active:bg-green-400 disabled:bg-green-800 text-white px-8 py-4 rounded-xl text-xl font-bold transition-colors shadow-lg"
                  >
                    {starting ? 'Starten...' : 'Start partij'}
                  </button>
                  <button
                    onClick={handleClearTable}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-xl text-lg transition-colors"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Player names row */}
          <div className="grid grid-cols-2 gap-4 mb-4 md:mb-6">
            <div className={`text-left px-4 md:px-6 py-3 md:py-4 rounded-lg transition-opacity duration-300 ${turn === 1 ? 'opacity-100' : 'opacity-50'}`}>
              <h2 className={`text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold truncate ${turn === 1 ? 'text-white' : 'text-gray-400'}`}>
                {match?.naam_A}
              </h2>
              <p className="text-green-400 text-base md:text-lg mt-1">
                Te maken: {match?.cartem_A}
              </p>
            </div>
            <div className={`text-right px-4 md:px-6 py-3 md:py-4 rounded-lg transition-opacity duration-300 ${turn === 2 ? 'opacity-100' : 'opacity-50'}`}>
              <h2 className={`text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold truncate ${turn === 2 ? 'text-white' : 'text-gray-400'}`}>
                {match?.naam_B}
              </h2>
              <p className="text-green-400 text-base md:text-lg mt-1">
                Te maken: {match?.cartem_B}
              </p>
            </div>
          </div>

          {/* Score display */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 md:gap-6 items-start mb-4 md:mb-6">
            {/* Player A score */}
            <div className="flex flex-col items-center">
              <div className="bg-red-600 rounded-2xl w-full max-w-[400px] aspect-[4/3] flex items-center justify-center shadow-2xl">
                <span className="text-7xl sm:text-[8rem] md:text-[12rem] lg:text-[16rem] font-bold leading-none tabular-nums">
                  {score?.car_A_gem || 0}
                </span>
              </div>
              {/* Highest series */}
              <div className="mt-3 text-center">
                <p className="text-green-300 text-lg font-bold">HS</p>
                <div className="bg-[#002200] border-2 border-green-600 rounded-xl w-24 h-20 md:w-28 md:h-24 flex items-center justify-center">
                  <span className="text-3xl md:text-4xl font-bold tabular-nums">{score?.hs_A || 0}</span>
                </div>
              </div>
              {/* Rest indicator */}
              {restA <= enNogThreshold && restA > 0 && (
                <div className="mt-3 bg-yellow-500 text-red-700 rounded-full w-28 h-28 md:w-32 md:h-32 flex flex-col items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-xs md:text-sm font-bold">En nog:</span>
                  <span className="text-4xl md:text-5xl font-bold">{restA}</span>
                </div>
              )}
            </div>

            {/* Center column - turns and status */}
            <div className="flex flex-col items-center gap-3 md:gap-4 px-2 md:px-6 pt-2">
              {/* Match status indicator */}
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${data.status === 1 ? 'bg-green-400 animate-pulse' : data.status === 2 ? 'bg-blue-400' : 'bg-yellow-400'}`} />
                <span className={`text-sm ${data.status === 1 ? 'text-green-400' : data.status === 2 ? 'text-blue-400' : 'text-yellow-400'}`}>
                  {data.status === 1 ? 'Bezig' : data.status === 2 ? 'Afgelopen' : 'Wachtend'}
                </span>
              </div>

              {/* Turn info */}
              <div className="text-center">
                {isLastTurn ? (
                  <p className="text-yellow-400 text-lg md:text-2xl font-bold animate-pulse">Laatste beurt!</p>
                ) : maxBeurten > 0 ? (
                  <p className="text-green-300 text-sm md:text-lg">Max {maxBeurten} beurten</p>
                ) : (
                  <p className="text-green-300 text-sm md:text-lg">Beurten</p>
                )}
              </div>

              {/* Turns counter */}
              <div className="bg-red-600 rounded-2xl w-36 h-28 md:w-56 md:h-44 flex items-center justify-center shadow-2xl">
                <span className="text-5xl md:text-8xl font-bold tabular-nums">
                  {beurten}
                </span>
              </div>

              {/* Turn indicator */}
              <div className="mt-2 md:mt-4 text-center">
                <div className="flex items-center gap-2 text-green-400">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={turn === 1 ? "M10 19l-7-7m0 0l7-7m-7 7h18" : "M14 5l7 7m0 0l-7 7m7-7H3"} />
                  </svg>
                  <span className="text-sm md:text-lg font-bold">
                    {turn === 1 ? match?.naam_A : match?.naam_B}
                  </span>
                </div>
                <p className="text-green-500 text-xs md:text-sm mt-1">aan de beurt</p>
              </div>
            </div>

            {/* Player B score */}
            <div className="flex flex-col items-center">
              <div className="bg-red-600 rounded-2xl w-full max-w-[400px] aspect-[4/3] flex items-center justify-center shadow-2xl">
                <span className="text-7xl sm:text-[8rem] md:text-[12rem] lg:text-[16rem] font-bold leading-none tabular-nums">
                  {score?.car_B_gem || 0}
                </span>
              </div>
              {/* Highest series */}
              <div className="mt-3 text-center">
                <p className="text-green-300 text-lg font-bold">HS</p>
                <div className="bg-[#002200] border-2 border-green-600 rounded-xl w-24 h-20 md:w-28 md:h-24 flex items-center justify-center">
                  <span className="text-3xl md:text-4xl font-bold tabular-nums">{score?.hs_B || 0}</span>
                </div>
              </div>
              {/* Rest indicator */}
              {restB <= enNogThreshold && restB > 0 && (
                <div className="mt-3 bg-yellow-500 text-red-700 rounded-full w-28 h-28 md:w-32 md:h-32 flex flex-col items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-xs md:text-sm font-bold">En nog:</span>
                  <span className="text-4xl md:text-5xl font-bold">{restB}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Back to overview link */}
      <div className="fixed bottom-4 left-4 z-[110]">
        <Link
          href="/scoreborden"
          className="bg-gray-800/80 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors inline-flex items-center gap-2 backdrop-blur-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Terug
        </Link>
      </div>
    </div>
  );
}
