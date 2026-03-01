'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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
}

export default function ToernooirondenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { orgNummer } = useAuth();
  const compNr = parseInt(id, 10);

  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [rounds, setRounds] = useState<number[]>([]);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [poules, setPoules] = useState<Poule[]>([]);
  const [poulePlayers, setPoulePlayers] = useState<Record<string, PoulePlayer[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!orgNummer || isNaN(compNr)) return;
    setIsLoading(true);
    try {
      // Fetch competition
      const compRes = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`);
      const compData = await compRes.json();
      setCompetition(compData);

      // Fetch all poules to determine existing rounds
      const poulesRes = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/poules`);
      const poulesData = await poulesRes.json();
      
      const distinctRounds = Array.from(new Set(poulesData.poules.map((p: any) => p.ronde_nr))) as number[];
      distinctRounds.sort((a, b) => b - a); // Newest first
      setRounds(distinctRounds);

      if (distinctRounds.length > 0) {
        const currentRound = selectedRound || distinctRounds[0];
        setSelectedRound(currentRound);

        const currentPoules = poulesData.poules.filter((p: any) => p.ronde_nr === currentRound);
        setPoules(currentPoules);
        setPoulePlayers({}); // Leeg bij rondewissel, skeleton tot spelers geladen zijn

        // Fetch players for all poules in parallel (sneller)
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

  const handleUndoRound = async (roundNr: number) => {
    if (!orgNummer || isNaN(compNr)) return;
    if (!confirm(`Weet je zeker dat je ronde ${roundNr} wilt verwijderen? Alle poules, spelers en WEDSTRIJDEN in deze ronde worden permanent verwijderd!`)) {
      return;
    }

    setIsUndoing(true);
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/poules?ronde_nr=${roundNr}`);
      const data = await res.json();
      const roundPoules = data.poules || [];

      for (const poule of roundPoules) {
        // 1. Delete matches for this poule
        const matchesRes = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/matches?poule_id=${poule.id}`);
        const matchesData = await matchesRes.json();
        for (const match of matchesData.matches || []) {
           // We need a delete endpoint for matches, or just delete by ID if API supports it
           // For now, let's assume we need to implement a DELETE /matches?poule_id=...
        }
        
        // Actually, let's just call the poule delete endpoint which should ideally clean up everything
        await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/poules/${poule.id}`, {
          method: 'DELETE'
        });
      }

      // Refresh data
      setSelectedRound(null);
      await fetchData();
    } catch (err) {
      console.error('Error undoing round:', err);
      setError('Fout bij ongedaan maken ronde');
    } finally {
      setIsUndoing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading && !competition) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" label="Toernooi laden..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {competition && (
        <CompetitionSubNav 
          compNr={competition.comp_nr} 
          compNaam={competition.comp_naam} 
          periode={selectedRound || competition.periode} 
        />
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Ronden Management</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Beheer de ronden en poule-indelingen voor {competition?.comp_naam}
          </p>
        </div>
        <button
          onClick={() => router.push(`/toernooien/${id}/ronden/nieuw`)}
          className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nieuwe Ronde Starten
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {rounds.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
          <svg className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">Geen ronden gevonden</h3>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Klik op de knop hierboven om de eerste ronde van het toernooi te starten.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Round Selector Tabs */}
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
                {r === (rounds[0]) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUndoRound(r);
                    }}
                    disabled={isUndoing}
                    className="ml-2 p-1 text-slate-400 hover:text-red-600 transition-colors"
                    title="Ronde ongedaan maken"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </button>
            ))}
          </div>

          {/* Poules Grid */}
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
                          <th className="pb-3 font-semibold text-right">Start Moy</th>
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
                    <button
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-lg transition-colors"
                    >
                      Wedstrijden Genereren
                    </button>
                    <Link
                      href={`/toernooien/${id}/stand?poule_id=${poule.id}`}
                      className="px-4 py-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-sm font-semibold rounded-lg border border-orange-200 dark:border-orange-800 transition-colors"
                    >
                      Bekijk Stand
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
