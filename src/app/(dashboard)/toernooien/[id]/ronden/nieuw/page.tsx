'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import CompetitionSubNav from '@/components/CompetitionSubNav';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatPlayerName } from '@/lib/billiards';
import { formatDecimal } from '@/lib/formatUtils';

interface CompetitionData {
  id: string;
  comp_nr: number;
  comp_naam: string;
  discipline: number;
  periode: number;
  sorteren: number;
}

interface PlayerData {
  id: string;
  spc_nummer: number;
  spa_vnaam: string;
  spa_tv: string;
  spa_anaam: string;
  spc_moyenne_1: number;
  spc_moyenne_2: number;
  spc_moyenne_3: number;
  spc_moyenne_4: number;
  spc_moyenne_5: number;
  spc_car_1: number;
  spc_car_2: number;
  spc_car_3: number;
  spc_car_4: number;
  spc_car_5: number;
}

interface SelectedPlayer extends PlayerData {
  poule_nr: number; // 1=A, 2=B, etc.
  moy_start: number;
  car_start: number;
}

export default function NieuweRondePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { orgNummer } = useAuth();
  const compNr = parseInt(id, 10);

  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [allPlayers, setAllPlayers] = useState<PlayerData[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Record<number, SelectedPlayer>>({}); // spc_nummer -> data
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [nextRondeNr, setNextRondeNr] = useState(1);

  const fetchData = useCallback(async () => {
    if (!orgNummer || isNaN(compNr)) return;
    setIsLoading(true);
    try {
      const [compRes, playersRes, poulesRes] = await Promise.all([
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`),
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/players`),
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/poules`),
      ]);
      
      const compData = await compRes.json();
      const playersData = await playersRes.json();
      const poulesData = await poulesRes.json();

      setCompetition(compData);
      // Map ToernooiProf format (sp_nummer, sp_naam, sp_startmoy, sp_startcar) naar ClubMatch/UI format
      const rawPlayers = playersData.players || [];
      const mapped = rawPlayers.map((p: any) => {
        const parts = (p.sp_naam || '').trim().split(/\s+/);
        return {
          id: p.id,
          spc_nummer: p.sp_nummer ?? p.spc_nummer,
          spa_vnaam: p.spa_vnaam ?? (parts[0] || ''),
          spa_tv: p.spa_tv ?? '',
          spa_anaam: p.spa_anaam ?? (parts.slice(1).join(' ') || ''),
          spc_moyenne_1: p.sp_startmoy ?? p.spc_moyenne_1 ?? 0,
          spc_moyenne_2: p.spc_moyenne_2 ?? 0,
          spc_moyenne_3: p.spc_moyenne_3 ?? 0,
          spc_moyenne_4: p.spc_moyenne_4 ?? 0,
          spc_moyenne_5: p.spc_moyenne_5 ?? 0,
          spc_car_1: p.sp_startcar ?? p.spc_car_1 ?? 0,
          spc_car_2: p.spc_car_2 ?? 0,
          spc_car_3: p.spc_car_3 ?? 0,
          spc_car_4: p.spc_car_4 ?? 0,
          spc_car_5: p.spc_car_5 ?? 0,
        };
      });
      setAllPlayers(mapped);
      
      // Determine next round number
      const existingRounds = poulesData.poules.map((p: any) => p.ronde_nr);
      const maxRound = existingRounds.length > 0 ? Math.max(...existingRounds) : 0;
      setNextRondeNr(maxRound + 1);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Fout bij ophalen gegevens');
    } finally {
      setIsLoading(false);
    }
  }, [orgNummer, compNr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const togglePlayer = (player: PlayerData) => {
    setSelectedPlayers(prev => {
      const newMap = { ...prev };
      if (newMap[player.spc_nummer]) {
        delete newMap[player.spc_nummer];
      } else {
        // Default to Poule 1 (A) and current moyenne
        const periode = competition?.periode || 1;
        const moyKey = `spc_moyenne_${periode}` as keyof PlayerData;
        const carKey = `spc_car_${periode}` as keyof PlayerData;
        
        newMap[player.spc_nummer] = {
          ...player,
          poule_nr: 1,
          moy_start: Number(player[moyKey]) || 0,
          car_start: Number(player[carKey]) || 0
        };
      }
      return newMap;
    });
  };

  const updatePlayerPoule = (spc_nummer: number, poule_nr: number) => {
    setSelectedPlayers(prev => ({
      ...prev,
      [spc_nummer]: { ...prev[spc_nummer], poule_nr }
    }));
  };

  const handleCreateRonde = async () => {
    if (Object.keys(selectedPlayers).length < 2) {
      setError('Selecteer minimaal 2 spelers');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 1. Group players by poule
      const playersByPoule: Record<number, SelectedPlayer[]> = {};
      Object.values(selectedPlayers).forEach(p => {
        if (!playersByPoule[p.poule_nr]) playersByPoule[p.poule_nr] = [];
        playersByPoule[p.poule_nr].push(p);
      });

      // 2. Create Poules and add Players
      for (const [pouleNrStr, pList] of Object.entries(playersByPoule)) {
        const pouleNr = parseInt(pouleNrStr, 10);
        
        // Create Poule
        const pouleRes = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/poules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ronde_nr: nextRondeNr,
            poule_nr: pouleNr,
            poule_naam: `Poule ${String.fromCharCode(64 + pouleNr)}`
          })
        });
        
        if (!pouleRes.ok) throw new Error('Fout bij aanmaken poule');
        const poule = await pouleRes.json();

        // Add Players to Poule
        for (const p of pList) {
          await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/poules/${poule.id}/players`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              spc_nummer: p.spc_nummer,
              ronde_nr: nextRondeNr,
              moyenne_start: p.moy_start,
              caramboles_start: p.car_start
            })
          });
        }

        // 3. Generate matches for this poule
        await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/matches`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             poule_id: poule.id,
             force: true
          })
        });
      }

      router.push(`/toernooien/${compNr}/ronden`);
    } catch (err) {
      console.error('Error creating round:', err);
      setError('Er is een fout opgetreden bij het aanmaken van de ronde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" label="Spelers en poules laden..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {competition && (
        <CompetitionSubNav 
          compNr={competition.comp_nr} 
          compNaam={competition.comp_naam} 
          periode={nextRondeNr} 
        />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Nieuwe Ronde {nextRondeNr}</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Stap {step} van 2: {step === 1 ? 'Selecteer deelnemers' : 'Deel in poules'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {step === 1 ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Select</th>
                      <th className="px-6 py-4 font-semibold">Naam</th>
                      <th className="px-6 py-4 font-semibold text-right">Moyenne</th>
                      <th className="px-6 py-4 font-semibold text-right">Car</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {allPlayers.map((player) => {
                      const isSelected = !!selectedPlayers[player.spc_nummer];
                      return (
                        <tr 
                          key={player.id} 
                          onClick={() => togglePlayer(player)}
                          className={`cursor-pointer transition-colors ${isSelected ? 'bg-orange-50 dark:bg-orange-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              className="w-5 h-5 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                            />
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                            {formatPlayerName(player.spa_vnaam, player.spa_tv, player.spa_anaam, competition?.sorteren)}
                          </td>
                          <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400 font-mono">
                            {formatDecimal(player.spc_moyenne_1)}
                          </td>
                          <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400 font-mono">
                            {player.spc_car_1}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
             </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <button
               onClick={() => router.back()}
               className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Annuleren
            </button>
            <button
               onClick={() => setStep(2)}
               disabled={Object.keys(selectedPlayers).length < 2}
               className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-sm transition-colors"
            >
              Volgende: Poule-indeling
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {Object.values(selectedPlayers).map(player => (
               <div key={player.spc_nummer} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {formatPlayerName(player.spa_vnaam, player.spa_tv, player.spa_anaam, competition?.sorteren)}
                    </div>
                    <div className="text-xs text-slate-500">
                      Moy: {formatDecimal(player.moy_start)} | Car: {player.car_start}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold uppercase text-slate-400">Poule:</label>
                    <select
                      value={player.poule_nr}
                      onChange={(e) => updatePlayerPoule(player.spc_nummer, parseInt(e.target.value, 10))}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 text-sm font-bold"
                    >
                      <option value={1}>Poule A</option>
                      <option value={2}>Poule B</option>
                      <option value={3}>Poule C</option>
                      <option value={4}>Poule D</option>
                    </select>
                  </div>
               </div>
             ))}
          </div>

          <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            <button
               onClick={() => setStep(1)}
               className="px-6 py-2 text-slate-600 dark:text-slate-400 font-semibold hover:underline"
            >
              Terug naar selectie
            </button>
            <div className="flex gap-4">
              <button
                onClick={handleCreateRonde}
                disabled={isSubmitting}
                className="px-8 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Aanmaken...
                  </span>
                ) : 'Ronde Starten & Wedstrijden Genereren'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
