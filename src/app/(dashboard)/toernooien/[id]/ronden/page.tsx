'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthActions } from '@/context/AuthContext';
import CompetitionSubNav from '@/components/CompetitionSubNav';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Poule, PoulePlayer } from '@/types/tournament';
import { formatDecimal } from '@/lib/formatUtils';
import Link from 'next/link';

interface CompetitionData {
  id: string;
  comp_nr: number;
  comp_naam: string;
  discipline: number;
  periode: number;
  t_gestart?: number;
  t_ronde?: number;
  ronde_status?: string;
}

export default function ToernooirondenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { orgNummer } = useAuthActions();
  const compNr = parseInt(id, 10);

  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [rounds, setRounds] = useState<number[]>([]);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [poules, setPoules] = useState<Poule[]>([]);
  const [poulePlayers, setPoulePlayers] = useState<Record<string, PoulePlayer[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [playerCount, setPlayerCount] = useState(0);
  const [startBlockedReasons, setStartBlockedReasons] = useState<string[]>([]);

  // --- Voorbereiding mode: poules for ronde 1 ---
  const [prepPoules, setPrepPoules] = useState<Poule[]>([]);
  const [prepPoulePlayers, setPrepPoulePlayers] = useState<Record<string, PoulePlayer[]>>({});
  const [isLoadingPrepPlayers, setIsLoadingPrepPlayers] = useState(false);

  const fetchData = useCallback(async () => {
    if (!orgNummer || isNaN(compNr)) return;
    setIsLoading(true);
    setError('');
    try {
      const [compRes, playersRes] = await Promise.all([
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`),
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/players`),
      ]);
      const compData = await compRes.json();
      setCompetition(compData);

      const playersData = playersRes.ok ? await playersRes.json() : { count: 0, players: [] };
      const fetchedPlayerCount = Number(playersData.count ?? playersData.players?.length ?? 0);
      setPlayerCount(fetchedPlayerCount);

      const isStarted = (Number(compData.t_gestart) || 0) === 1;

      if (!isStarted) {
        // Voorbereiding mode: fetch ronde 1 poules
        setRounds([]);
        setPoules([]);
        setPoulePlayers({});

        const poulesRes = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/poules?ronde_nr=1`);
        const poulesData = poulesRes.ok ? await poulesRes.json() : { poules: [] };
        const ronde1Poules = poulesData.poules || [];
        setPrepPoules(ronde1Poules);

        // Validate for start readiness
        const reasons: string[] = [];
        if (fetchedPlayerCount < 2) {
          reasons.push('Er zijn minimaal 2 spelers nodig.');
        }
        if (ronde1Poules.length > 0) {
          const pouleNrs = ronde1Poules.map((p: any) => Number(p.poule_nr)).filter((n: number) => !isNaN(n)).sort((a: number, b: number) => a - b);
          const maxPoule = pouleNrs[pouleNrs.length - 1] || 0;
          for (let nr = 1; nr <= maxPoule; nr++) {
            if (!pouleNrs.includes(nr)) {
              reasons.push(`Poule ${nr} ontbreekt. Gebruik aansluitende poulenummers.`);
              break;
            }
          }
        }

        // Fetch players per poule for prep view
        if (ronde1Poules.length > 0) {
          setIsLoadingPrepPlayers(true);
          try {
            const playerResults = await Promise.all(
              ronde1Poules.map(async (poule: { id: string }) => {
                const pRes = await fetch(
                  `/api/organizations/${orgNummer}/competitions/${compNr}/poules/${poule.id}/players`
                );
                const pData = await pRes.json();
                return { pouleId: poule.id, players: pData.players || [] };
              })
            );
            const playersMap: Record<string, PoulePlayer[]> = {};
            for (const { pouleId, players } of playerResults) {
              playersMap[pouleId] = players;
            }
            setPrepPoulePlayers(playersMap);

            // Check per poule min 2 spelers
            for (const poule of ronde1Poules) {
              const count = playersMap[poule.id]?.length ?? 0;
              if (count < 2) reasons.push(`Poule ${poule.poule_nr} heeft minder dan 2 spelers.`);
            }
          } finally {
            setIsLoadingPrepPlayers(false);
          }
        }
        setStartBlockedReasons(reasons);
        return;
      }

      // Gestart mode: fetch all poules
      setPrepPoules([]);
      setPrepPoulePlayers({});
      setStartBlockedReasons([]);

      const poulesRes = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/poules`);
      const poulesData = await poulesRes.json();

      const distinctRounds = Array.from(new Set(poulesData.poules.map((p: any) => p.ronde_nr))) as number[];
      distinctRounds.sort((a, b) => b - a);
      setRounds(distinctRounds);

      if (distinctRounds.length > 0) {
        const currentRound = (selectedRound !== null && distinctRounds.includes(selectedRound))
          ? selectedRound
          : distinctRounds[0];
        setSelectedRound(currentRound);

        const currentPoules = poulesData.poules.filter((p: any) => p.ronde_nr === currentRound);
        setPoules(currentPoules);
        setPoulePlayers({});

        setIsLoadingPlayers(true);
        try {
          const playerResults = await Promise.all(
            currentPoules.map(async (poule: { id: string }) => {
              const pRes = await fetch(
                `/api/organizations/${orgNummer}/competitions/${compNr}/poules/${poule.id}/players`
              );
              const pData = await pRes.json();
              return { pouleId: poule.id, players: pData.players || [] };
            })
          );
          const playersMap: Record<string, PoulePlayer[]> = {};
          for (const { pouleId, players } of playerResults) {
            playersMap[pouleId] = players;
          }
          setPoulePlayers(playersMap);
        } finally {
          setIsLoadingPlayers(false);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Fout bij ophalen toernooigegevens');
    } finally {
      setIsLoading(false);
    }
  }, [orgNummer, compNr, selectedRound]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Actions ---

  const handleStartToernooi = async () => {
    if (!orgNummer) return;
    setIsStarting(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(
        `/api/organizations/${orgNummer}/competitions/${compNr}/start`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } }
      );
      if (res.ok) {
        setSuccessMsg('Toernooi gestart! Ronde 1 is aangemaakt.');
        setShowStartConfirm(false);
        setSelectedRound(null);
        await fetchData();
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        const data = await res.json();
        setError(data.error || 'Fout bij starten toernooi.');
        setShowStartConfirm(false);
      }
    } catch {
      setError('Er is een fout opgetreden.');
      setShowStartConfirm(false);
    } finally {
      setIsStarting(false);
    }
  };

  const handleUndoRound = async () => {
    if (!orgNummer || !competition) return;
    const currentRound = Number(competition.t_ronde) || 0;
    if (currentRound < 1) return;

    setIsUndoing(true);
    setError('');
    setSuccessMsg('');
    try {
      let res: Response;
      if (currentRound === 1) {
        res = await fetch(
          `/api/organizations/${orgNummer}/competitions/${compNr}/start`,
          { method: 'DELETE', headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        res = await fetch(
          `/api/organizations/${orgNummer}/competitions/${compNr}/rounds/undo`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roundNr: currentRound }),
          }
        );
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Terugdraaien mislukt');
      }

      setSuccessMsg(`Aanmaak ronde ${currentRound} is teruggedraaid.`);
      setShowUndoConfirm(false);
      setSelectedRound(null);
      await fetchData();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Error undoing round:', err);
      setError(err instanceof Error ? err.message : 'Fout bij terugdraaien ronde');
      setShowUndoConfirm(false);
    } finally {
      setIsUndoing(false);
    }
  };

  // --- Render ---

  if (isLoading && !competition) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" label="Toernooi laden..." />
      </div>
    );
  }

  const isStarted = (Number(competition?.t_gestart) || 0) === 1;
  const currentRound = Number(competition?.t_ronde) || 0;
  const canStart = !isStarted && startBlockedReasons.length === 0 && playerCount >= 2;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {competition && (
        <CompetitionSubNav
          compNr={competition.comp_nr}
          compNaam={competition.comp_naam}
          periode={isStarted ? (selectedRound || competition.periode) : 0}
          tGestart={competition.t_gestart}
          playerCount={playerCount}
        />
      )}

      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Rondenbeheer</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              {isStarted
                ? `U werkt in ronde ${currentRound} voor ${competition?.comp_naam}`
                : `Voorbereiding poule-indeling voor ${competition?.comp_naam}`}
            </p>
          </div>
          {isStarted && (
            <div className="shrink-0">
              <button
                onClick={() => setShowUndoConfirm(true)}
                disabled={isUndoing}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Aanmaak ronde {currentRound} terugdraaien
              </button>
            </div>
          )}
        </div>
        {isStarted && (
          <div className="mt-4">
            <button
              onClick={() => router.push(`/toernooien/${id}/ronden/nieuw`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ronde {currentRound + 1} aanmaken
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-3 text-red-500 hover:text-red-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
          {successMsg}
        </div>
      )}

      {/* ========== MODUS A: VOORBEREIDING ========== */}
      {!isStarted && (
        <div className="space-y-6">
          {/* Start blocked warnings */}
          {startBlockedReasons.length > 0 && (
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-sm border border-amber-200 dark:border-amber-800">
              <p className="font-medium mb-2">Toernooi kan nog niet gestart worden:</p>
              <ul className="list-disc list-inside space-y-1">
                {startBlockedReasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Start button */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowStartConfirm(true)}
              disabled={!canStart}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start toernooi (Aanmaak ronde 1)
            </button>
            <Link
              href={`/toernooien/${compNr}/spelers`}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium rounded-lg transition-colors"
            >
              Terug naar Spelers
            </Link>
          </div>

          {/* Ronde 1 poule preview */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Voorlopige poule-indeling ronde 1
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Wijzig de indeling via het menu Spelers. Na start wordt deze indeling definitief.
              </p>
            </div>
            {prepPoules.length > 0 && (
              <button
                onClick={() => window.print()}
                className="print:hidden inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Afdrukken
              </button>
            )}
          </div>

          {prepPoules.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400">
                Nog geen poule-indeling beschikbaar. Wijs eerst spelers toe aan poules via het Spelers-menu.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {prepPoules.map((poule) => (
                <div key={poule.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{poule.poule_naam}</h2>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold rounded uppercase">
                        Voorlopig
                      </span>
                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 text-xs font-bold rounded uppercase">
                        {isLoadingPrepPlayers ? 'laden...' : `${prepPoulePlayers[poule.id]?.length ?? 0} Spelers`}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    {isLoadingPrepPlayers ? (
                      <TableSkeleton rows={4} cols={3} />
                    ) : (
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                          <tr>
                            <th className="pb-3 font-semibold">Speler</th>
                            <th className="pb-3 font-semibold text-right">Moy nieuw</th>
                            <th className="pb-3 font-semibold text-right">Car</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {prepPoulePlayers[poule.id]?.map((pp) => (
                            <tr key={pp.id}>
                              <td className="py-3 font-medium text-slate-900 dark:text-white">
                                {pp.naam || `Speler ${pp.spc_nummer}`}
                              </td>
                              <td className="py-3 text-right text-slate-600 dark:text-slate-400">
                                {formatDecimal(pp.moyenne_start)}
                              </td>
                              <td className="py-3 text-right text-slate-600 dark:text-slate-400">
                                {pp.caramboles_start}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========== MODUS B: TOERNOOI GESTART ========== */}
      {isStarted && (
        <div className="space-y-6">
          {/* Round selector tabs */}
          {rounds.length > 0 && (
            <>
              <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                {rounds.map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRound(r)}
                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      selectedRound === r
                        ? 'border-orange-600 text-orange-600 bg-orange-50/50 dark:bg-orange-900/20'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    Ronde {r}
                  </button>
                ))}
              </div>

              {/* Poules grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {poules.map((poule) => (
                  <div key={poule.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{poule.poule_naam}</h2>
                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 text-xs font-bold rounded uppercase">
                        {isLoadingPlayers ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
                            laden...
                          </span>
                        ) : (
                          `${poulePlayers[poule.id]?.length ?? 0} Spelers`
                        )}
                      </span>
                    </div>
                    <div className="p-6">
                      {isLoadingPlayers ? (
                        <TableSkeleton rows={4} cols={3} />
                      ) : (
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                            <tr>
                              <th className="pb-3 font-semibold">Speler</th>
                              <th className="pb-3 font-semibold text-right">Moy nieuw</th>
                              <th className="pb-3 font-semibold text-right">Car</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {poulePlayers[poule.id]?.map((pp) => (
                              <tr key={pp.id} className="group">
                                <td className="py-3 font-medium text-slate-900 dark:text-white">
                                  {pp.naam || `Speler ${pp.spc_nummer}`}
                                </td>
                                <td className="py-3 text-right text-slate-600 dark:text-slate-400">
                                  {formatDecimal(pp.moyenne_start)}
                                </td>
                                <td className="py-3 text-right text-slate-600 dark:text-slate-400">
                                  {pp.caramboles_start}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                          href={`/toernooien/${id}/stand?poule_nr=${poule.poule_nr}`}
                          className="px-4 py-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-sm font-semibold rounded-lg border border-orange-200 dark:border-orange-800 transition-colors"
                        >
                          Bekijk Stand
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {rounds.length === 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Geen ronden gevonden</h3>
              <p className="mt-2 text-slate-500 dark:text-slate-400">Er zijn nog geen poule-indelingen voor de huidige ronde.</p>
            </div>
          )}
        </div>
      )}

      {/* ========== DIALOGEN ========== */}

      {/* Start confirm dialog */}
      {showStartConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Start toernooi (Aanmaak ronde 1)
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Door het toernooi te starten worden:
            </p>
            <ul className="mb-4 text-sm text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1">
              <li>De wedstrijden voor ronde 1 automatisch aangemaakt (Round Robin per poule)</li>
              <li>De poule-indeling definitief gemaakt</li>
              <li>De spelerslijst op alleen-lezen gezet</li>
            </ul>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Zorg ervoor dat alle spelers en poule-indeling klaar zijn.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowStartConfirm(false)}
                disabled={isStarting}
                className="px-4 py-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
              >
                Annuleren
              </button>
              <button
                onClick={handleStartToernooi}
                disabled={isStarting}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                {isStarting ? 'Bezig...' : 'Ja, start toernooi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo confirm dialog */}
      {showUndoConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Aanmaak ronde {currentRound} terugdraaien
            </h3>
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                Let op! Dit heeft de volgende gevolgen:
              </p>
              <ul className="text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                <li>Alle uitslagen van ronde {currentRound} worden verwijderd</li>
                <li>De poule-indeling wordt weer voorlopig (aanpasbaar)</li>
                {currentRound === 1 && (
                  <li>De spelerslijst wordt weer bewerkbaar</li>
                )}
              </ul>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Weet u zeker dat u wilt doorgaan?
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowUndoConfirm(false)}
                disabled={isUndoing}
                className="px-4 py-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
              >
                Annuleren
              </button>
              <button
                onClick={handleUndoRound}
                disabled={isUndoing}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                {isUndoing ? 'Bezig...' : 'Ja, terugdraaien'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
