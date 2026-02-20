'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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

export default function TabletControlPage() {
  const params = useParams();
  const router = useRouter();
  const tafelNr = params?.tafelNr as string;
  const { orgNummer } = useAuth();
  const [data, setData] = useState<ScoreboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tablet-specific state for current series input
  const [serieA, setSerieA] = useState(0);
  const [serieB, setSerieB] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Match assignment state
  const [availableMatches, setAvailableMatches] = useState<AvailableMatch[]>([]);
  const [showMatchSelector, setShowMatchSelector] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [starting, setStarting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!orgNummer || !tafelNr) return;

    try {
      const res = await fetch(`/api/organizations/${orgNummer}/scoreboards/${tafelNr}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();

      // Check if device is configured for tablet mode
      if (json.device_config?.soort !== 2) {
        router.push(`/scoreborden/${tafelNr}`);
        return;
      }

      setData(json);

      // Sync series state with server data if in match
      if (json.status === 1 && json.score_tablet) {
        setSerieA(json.score_tablet.serie_A || 0);
        setSerieB(json.score_tablet.serie_B || 0);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij laden');
    } finally {
      setLoading(false);
    }
  }, [orgNummer, tafelNr, router]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  const loadAvailableMatches = async () => {
    if (!orgNummer || !tafelNr) return;

    setLoadingMatches(true);
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/scoreboards/${tafelNr}/available-matches`);
      if (!res.ok) {
        throw new Error('Fout bij laden wedstrijden');
      }
      const matches = await res.json();
      setAvailableMatches(matches);
      setShowMatchSelector(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fout bij laden wedstrijden');
    } finally {
      setLoadingMatches(false);
    }
  };

  const assignMatch = async (uCode: string) => {
    if (!orgNummer || !tafelNr) return;

    setAssigning(true);
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/scoreboards/${tafelNr}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ u_code: uCode }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Fout bij toewijzen');
      }

      await fetchData();
      setShowMatchSelector(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fout bij toewijzen');
    } finally {
      setAssigning(false);
    }
  };

  const startMatch = async () => {
    if (!orgNummer || !tafelNr || !data?.table) return;

    setStarting(true);
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/scoreboards/${tafelNr}/start`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Fout bij starten');
      }

      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fout bij starten');
    } finally {
      setStarting(false);
    }
  };

  const submitScore = async (action: string, value?: number) => {
    if (!orgNummer || !tafelNr || !data?.table) return;

    setSubmitting(true);
    try {
      const turn = data.score?.turn || 1;
      const currentSerie = turn === 1 ? serieA : serieB;

      let newSerieA = serieA;
      let newSerieB = serieB;

      if (action === 'plus_1A') newSerieA = Math.min(serieA + 1, data.match.cartem_A);
      else if (action === 'min_1A') newSerieA = Math.max(0, serieA - 1);
      else if (action === 'plus_1B') newSerieB = Math.min(serieB + 1, data.match.cartem_B);
      else if (action === 'min_1B') newSerieB = Math.max(0, serieB - 1);
      else if (action === 'invoerA' && value !== undefined) newSerieA = value;
      else if (action === 'invoerB' && value !== undefined) newSerieB = value;

      const res = await fetch(`/api/organizations/${orgNummer}/scoreboards/${tafelNr}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          serie_A: newSerieA,
          serie_B: newSerieB,
        }),
      });

      if (!res.ok) {
        throw new Error('Fout bij score bijwerken');
      }

      const result = await res.json();

      // Update local state
      setSerieA(result.score_tablet?.serie_A || 0);
      setSerieB(result.score_tablet?.serie_B || 0);

      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fout bij score bijwerken');
    } finally {
      setSubmitting(false);
    }
  };

  const finishMatch = async () => {
    if (!orgNummer || !tafelNr || !data?.table) return;

    if (!confirm('Wedstrijd afronden?')) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/scoreboards/${tafelNr}/finish`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Fout bij afronden');
      }

      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fout bij afronden');
    } finally {
      setSubmitting(false);
    }
  };

  const resetMatch = async () => {
    if (!orgNummer || !tafelNr || !data?.table) return;

    if (!confirm('Wedstrijd resetten?')) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/scoreboards/${tafelNr}/reset`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Fout bij resetten');
      }

      await fetchData();
      setShowMatchSelector(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fout bij resetten');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Laden...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-red-500 text-xl">Fout: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Geen data beschikbaar</div>
      </div>
    );
  }

  const turn = data.score?.turn || 1;
  const isPlayerATurn = turn === 1;
  const carA = data.score?.car_A_gem || 0;
  const carB = data.score?.car_B_gem || 0;
  const brt = data.score?.brt || 0;
  const maxBeurten = data.competition?.max_beurten || 0;
  const alert = data.score?.alert || 0;

  // Waiting state (status=0)
  if (data.status === 0) {
    return (
      <div className="min-h-screen bg-gray-900 dark:bg-gray-950 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800 dark:bg-gray-900 rounded-lg p-6 mb-4">
            <h1 className="text-2xl font-bold text-white mb-2">
              Tablet Bediening - Tafel {tafelNr}
            </h1>
            <p className="text-gray-400 mb-4">Wachten op partij</p>
            <Link
              href="/scoreborden"
              className="inline-block bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              ← Terug naar scoreborden
            </Link>
          </div>

          {!showMatchSelector ? (
            <button
              onClick={loadAvailableMatches}
              disabled={loadingMatches}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-xl font-bold py-6 px-4 rounded-lg transition-colors"
            >
              {loadingMatches ? 'Laden...' : 'Wedstrijd toewijzen'}
            </button>
          ) : (
            <div className="bg-gray-800 dark:bg-gray-900 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Beschikbare wedstrijden</h2>
                <button
                  onClick={() => setShowMatchSelector(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕ Sluiten
                </button>
              </div>

              {availableMatches.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Geen beschikbare wedstrijden</p>
              ) : (
                <div className="space-y-2">
                  {availableMatches.map((match) => (
                    <button
                      key={match.id}
                      onClick={() => assignMatch(match.uitslag_code)}
                      disabled={assigning}
                      className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-left p-4 rounded transition-colors"
                    >
                      <div className="text-white font-medium mb-1">{match.comp_naam}</div>
                      <div className="text-gray-300">
                        {match.naam_A} ({match.cartem_A}) vs {match.naam_B} ({match.cartem_B})
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Assigned state (status=2) - ready to start
  if (data.status === 2 && data.match) {
    return (
      <div className="min-h-screen bg-gray-900 dark:bg-gray-950 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800 dark:bg-gray-900 rounded-lg p-6 mb-4">
            <h1 className="text-2xl font-bold text-white mb-4">
              Tablet Bediening - Tafel {tafelNr}
            </h1>
            <div className="text-gray-300 mb-2">
              {data.competition?.comp_naam}
            </div>
            <div className="text-xl text-white mb-4">
              {data.match.naam_A} ({data.match.cartem_A}) vs {data.match.naam_B} ({data.match.cartem_B})
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={startMatch}
                disabled={starting}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-xl font-bold py-6 px-4 rounded-lg transition-colors"
              >
                {starting ? 'Starten...' : 'Start partij'}
              </button>
              <button
                onClick={resetMatch}
                className="bg-red-600 hover:bg-red-700 text-white text-xl font-bold py-6 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Playing state (status=1)
  if (data.status === 1 && data.match) {
    const restA = data.match.cartem_A - carA - serieA;
    const restB = data.match.cartem_B - carB - serieB;
    const discipline = data.competition?.discipline || 1;
    const enNog = (discipline === 3 || discipline === 4) ? 3 : 5;

    return (
      <div className="min-h-screen bg-gray-900 dark:bg-gray-950 p-2">
        <div className="max-w-4xl mx-auto">
          <div className="bg-green-900 dark:bg-green-950 rounded-lg p-4">
            {/* Header with player names */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className={`text-center ${isPlayerATurn ? 'text-white' : 'text-gray-400'}`}>
                <div className="text-xl font-bold">{data.match.naam_A}</div>
                <div className="text-lg">({data.match.cartem_A})</div>
              </div>
              <div className="text-center">
                <button
                  onClick={resetMatch}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
              <div className={`text-center ${!isPlayerATurn ? 'text-white' : 'text-gray-400'}`}>
                <div className="text-xl font-bold">{data.match.naam_B}</div>
                <div className="text-lg">({data.match.cartem_B})</div>
              </div>
            </div>

            {/* Current scores */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center text-6xl font-bold text-white">{carA}</div>
              <div className="text-center">
                {brt === 0 && carA === 0 && carB === 0 && serieA === 0 && serieB === 0 && (
                  <button
                    onClick={() => alert('Wissel spelers functionaliteit nog niet geïmplementeerd')}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                  >
                    Wissel spelers
                  </button>
                )}
              </div>
              <div className="text-center text-6xl font-bold text-white">{carB}</div>
            </div>

            {/* En nog + Series + Beurten */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                {restA <= enNog && isPlayerATurn && (
                  <>
                    <div className="text-gray-300 text-sm">En nog:</div>
                    <div className="text-4xl font-bold text-yellow-400">{restA}</div>
                  </>
                )}
              </div>
              <div className="text-center">
                <div className="text-8xl font-bold text-white">{brt}</div>
                <div className="text-gray-300 text-sm mt-1">
                  {alert > 0 ? 'LAATSTE BEURT!' : maxBeurten > 0 ? `Max ${maxBeurten} beurten` : 'Geen beurten-limiet'}
                </div>
              </div>
              <div className="text-center">
                {restB <= enNog && !isPlayerATurn && (
                  <>
                    <div className="text-gray-300 text-sm">En nog:</div>
                    <div className="text-4xl font-bold text-yellow-400">{restB}</div>
                  </>
                )}
              </div>
            </div>

            {/* Current series */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-white">{isPlayerATurn ? serieA : 0}</div>
                <div className="text-gray-300 text-sm">Huidige serie</div>
              </div>
              <div></div>
              <div className="text-center">
                <div className="text-5xl font-bold text-white">{!isPlayerATurn ? serieB : 0}</div>
                <div className="text-gray-300 text-sm">Huidige serie</div>
              </div>
            </div>

            {/* Control buttons for Player A */}
            {isPlayerATurn && (
              <div className="grid grid-cols-5 gap-3 mb-4">
                <button
                  onClick={() => submitScore('min_1A')}
                  disabled={submitting || serieA === 0}
                  className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white text-2xl font-bold py-4 rounded"
                >
                  - 1
                </button>
                <button
                  onClick={() => {
                    const input = prompt('Voer aantal caramboles in:');
                    if (input !== null) {
                      const val = parseInt(input);
                      if (!isNaN(val) && val >= 0) submitScore('invoerA', val);
                    }
                  }}
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 text-white text-xl font-bold py-4 rounded"
                >
                  Invoer
                </button>
                <button
                  onClick={() => submitScore('plus_1A')}
                  disabled={submitting || (serieA + carA >= data.match.cartem_A)}
                  className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white text-2xl font-bold py-4 rounded"
                >
                  + 1
                </button>
                <div className="text-center">
                  {brt > 0 && serieA === 0 && (
                    <button
                      onClick={finishMatch}
                      disabled={submitting}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-800 text-white text-lg font-bold py-4 px-2 rounded"
                    >
                      Klaar
                    </button>
                  )}
                </div>
                <div className="text-center">
                  {brt > 0 && (
                    <button
                      onClick={() => alert('Herstel functionaliteit nog niet geïmplementeerd')}
                      disabled={submitting}
                      className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-800 text-white text-sm font-bold py-4 px-2 rounded"
                    >
                      Herstel
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Control buttons for Player B */}
            {!isPlayerATurn && (
              <div className="grid grid-cols-5 gap-3 mb-4">
                <div className="text-center">
                  {brt > 0 && (
                    <button
                      onClick={() => alert('Herstel functionaliteit nog niet geïmplementeerd')}
                      disabled={submitting}
                      className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-800 text-white text-sm font-bold py-4 px-2 rounded"
                    >
                      Herstel
                    </button>
                  )}
                </div>
                <div className="text-center">
                  {brt > 0 && serieB === 0 && (
                    <button
                      onClick={finishMatch}
                      disabled={submitting}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-800 text-white text-lg font-bold py-4 px-2 rounded"
                    >
                      Klaar
                    </button>
                  )}
                </div>
                <button
                  onClick={() => submitScore('min_1B')}
                  disabled={submitting || serieB === 0}
                  className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white text-2xl font-bold py-4 rounded"
                >
                  - 1
                </button>
                <button
                  onClick={() => {
                    const input = prompt('Voer aantal caramboles in:');
                    if (input !== null) {
                      const val = parseInt(input);
                      if (!isNaN(val) && val >= 0) submitScore('invoerB', val);
                    }
                  }}
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 text-white text-xl font-bold py-4 rounded"
                >
                  Invoer
                </button>
                <button
                  onClick={() => submitScore('plus_1B')}
                  disabled={submitting || (serieB + carB >= data.match.cartem_B)}
                  className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white text-2xl font-bold py-4 rounded"
                >
                  + 1
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-white text-xl">Onbekende status</div>
    </div>
  );
}
