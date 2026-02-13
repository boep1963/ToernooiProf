'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ScoreboardData {
  tafel_nr: number;
  org_nummer: number;
  org_naam: string;
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

export default function ScoreboardPage() {
  const params = useParams();
  const tafelNr = params?.tafelNr as string;
  const { orgNummer } = useAuth();
  const [data, setData] = useState<ScoreboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!orgNummer || !tafelNr) return;

    try {
      const res = await fetch(`/api/organizations/${orgNummer}/scoreboards/${tafelNr}`);
      if (!res.ok) throw new Error('Fout bij ophalen data');
      const result = await res.json();
      setData(result);
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
          <a href="/scoreborden" className="text-green-400 hover:text-green-300 underline text-lg">
            Terug naar overzicht
          </a>
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

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#003300] text-white font-sans overflow-auto ${isTablet ? 'scoreboard-tablet' : 'scoreboard-mouse'}`}
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
            <p className="text-green-300 text-sm">{data.org_naam}</p>
            <p className="text-green-500 text-xs">
              {isTablet ? '📱 Tablet modus' : '🖱️ Muis modus'}
            </p>
          </div>
        </div>
      </div>

      {/* Main scoreboard area */}
      {!hasMatch ? (
        /* Waiting state - no match assigned */
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 70px)' }}>
          <div className="text-center px-4">
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
          </div>
        </div>
      ) : (
        /* Active match scoreboard */
        <div className="max-w-[1860px] mx-auto px-4 md:px-6 py-4 md:py-6">
          {/* Player names row */}
          <div className="grid grid-cols-2 gap-4 mb-4 md:mb-6">
            <div className={`text-left px-4 md:px-6 py-3 md:py-4 rounded-lg transition-opacity duration-300 ${turn === 1 ? 'opacity-100' : 'opacity-50'}`}>
              <h2 className={`text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold truncate ${turn === 1 ? 'text-white' : 'text-gray-400'}`}>
                {match.naam_A}
              </h2>
              <p className="text-green-400 text-base md:text-lg mt-1">
                Te maken: {match.cartem_A}
              </p>
            </div>
            <div className={`text-right px-4 md:px-6 py-3 md:py-4 rounded-lg transition-opacity duration-300 ${turn === 2 ? 'opacity-100' : 'opacity-50'}`}>
              <h2 className={`text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold truncate ${turn === 2 ? 'text-white' : 'text-gray-400'}`}>
                {match.naam_B}
              </h2>
              <p className="text-green-400 text-base md:text-lg mt-1">
                Te maken: {match.cartem_B}
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
              {restA <= 5 && restA > 0 && (
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
                    {turn === 1 ? match.naam_A : match.naam_B}
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
              {restB <= 5 && restB > 0 && (
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
        <a
          href="/scoreborden"
          className="bg-gray-800/80 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors inline-flex items-center gap-2 backdrop-blur-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Terug
        </a>
      </div>
    </div>
  );
}
