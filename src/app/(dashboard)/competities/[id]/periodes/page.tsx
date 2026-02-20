'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DISCIPLINES, MOYENNE_MULTIPLIERS } from '@/types';
import { calculateCaramboles } from '@/lib/billiards';
import CompetitionSubNav from '@/components/CompetitionSubNav';

interface CompetitionData {
  id: string;
  comp_nr: number;
  comp_naam: string;
  comp_datum: string;
  discipline: number;
  periode: number;
  moy_form: number;
  min_car: number;
  punten_sys: number;
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

interface PlayerPeriodInfo {
  spc_nummer: number;
  naam: string;
  partijen: number;
  moy_start: number;
  car_start: number;
  moy_behaald: number;
  moy_nieuw: number;
  car_nieuw: number;
  update_moyenne: boolean;
}

interface ResultData {
  sp_1_nr: number;
  sp_1_naam?: string;
  sp_1_cargem: number;
  sp_2_nr: number;
  sp_2_naam?: string;
  sp_2_cargem: number;
  brt: number;
  periode: number;
}

export default function CompetitiePeriodesPage() {
  const params = useParams();
  const router = useRouter();
  const { orgNummer } = useAuth();

  const compNr = parseInt(params.id as string, 10);

  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [playerInfos, setPlayerInfos] = useState<PlayerPeriodInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [periodStats, setPeriodStats] = useState<{results: number, matches: number} | null>(null);
  const [loadingPeriodStats, setLoadingPeriodStats] = useState(false);

  const fetchData = useCallback(async () => {
    if (!orgNummer || isNaN(compNr)) return;
    setIsLoading(true);
    setError('');
    try {
      const [compRes, playersRes, resultsRes] = await Promise.all([
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`),
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/players`),
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/results`),
      ]);

      if (!compRes.ok) {
        setError('Competitie niet gevonden.');
        setIsLoading(false);
        return;
      }

      const compData: CompetitionData = await compRes.json();
      setCompetition(compData);

      let playersData: PlayerData[] = [];
      if (playersRes.ok) {
        const pData = await playersRes.json();
        playersData = pData.players || [];
        setPlayers(playersData);
      }

      let resultsData: ResultData[] = [];
      if (resultsRes.ok) {
        const rData = await resultsRes.json();
        resultsData = rData.results || [];
      }

      // Calculate period transition info for each player
      const currentPeriode = compData.periode;
      const moyKey = `spc_moyenne_${currentPeriode}` as keyof PlayerData;
      const carKey = `spc_car_${currentPeriode}` as keyof PlayerData;
      const moyForm = compData.moy_form;
      const minCar = compData.min_car;

      const infos: PlayerPeriodInfo[] = playersData.map((player) => {
        const naam = [player.spa_vnaam, player.spa_tv, player.spa_anaam].filter(Boolean).join(' ');
        const moyStart = Number(player[moyKey]) || 0;
        const carStart = Number(player[carKey]) || 0;

        // Calculate achieved moyenne from results in current period
        let totalCar = 0;
        let totalBrt = 0;
        let partijen = 0;

        for (const result of resultsData) {
          if (result.periode !== currentPeriode) continue;

          if (result.sp_1_nr === player.spc_nummer) {
            totalCar += Number(result.sp_1_cargem) || 0;
            totalBrt += Number(result.brt) || 0;
            partijen++;
          } else if (result.sp_2_nr === player.spc_nummer) {
            totalCar += Number(result.sp_2_cargem) || 0;
            totalBrt += Number(result.brt) || 0;
            partijen++;
          }
        }

        let moyBehaald: number;
        let moyNieuw: number;
        let carNieuw: number;

        if (totalBrt > 0) {
          moyBehaald = totalCar / totalBrt;
          moyNieuw = parseFloat(moyBehaald.toFixed(3));
          carNieuw = calculateCaramboles(moyNieuw, moyForm, minCar);
        } else {
          // No results: keep the start moyenne
          moyBehaald = moyStart;
          moyNieuw = moyStart;
          carNieuw = carStart;
        }

        return {
          spc_nummer: player.spc_nummer,
          naam,
          partijen,
          moy_start: moyStart,
          car_start: carStart,
          moy_behaald: moyBehaald,
          moy_nieuw: moyNieuw,
          car_nieuw: carNieuw,
          update_moyenne: false, // Default: not checked (matches PHP behavior since 1-3-2025)
        };
      });

      // Sort by name
      infos.sort((a, b) => a.naam.localeCompare(b.naam));
      setPlayerInfos(infos);
    } catch {
      setError('Er is een fout opgetreden bij het laden.');
    } finally {
      setIsLoading(false);
    }
  }, [orgNummer, compNr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const togglePlayerUpdate = (index: number) => {
    setPlayerInfos((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], update_moyenne: !updated[index].update_moyenne };
      return updated;
    });
  };

  const updatePlayerMoyenne = (index: number, newMoy: string) => {
    if (!competition) return;
    const moyValue = parseFloat(newMoy);
    if (isNaN(moyValue)) return;

    const carValue = calculateCaramboles(moyValue, competition.moy_form, competition.min_car);

    setPlayerInfos((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        moy_nieuw: moyValue,
        car_nieuw: carValue,
      };
      return updated;
    });
  };

  const handleCreatePeriod = async () => {
    if (!orgNummer || !competition) return;
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const playerUpdates = playerInfos.map((info) => ({
        spc_nummer: info.spc_nummer,
        update_moyenne: info.update_moyenne,
        new_moyenne: info.moy_nieuw,
        new_caramboles: info.car_nieuw,
      }));

      const res = await fetch(
        `/api/organizations/${orgNummer}/competitions/${compNr}/periods`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ players: playerUpdates }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setSuccess(data.message || `Periode ${competition.periode + 1} is succesvol aangemaakt!`);
        setShowCreateForm(false);
        // Refresh data
        await fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Fout bij aanmaken periode.');
      }
    } catch {
      setError('Er is een fout opgetreden.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchPeriodStats = async () => {
    if (!orgNummer || !competition) return;
    setLoadingPeriodStats(true);
    try {
      const [resultsRes, matchesRes] = await Promise.all([
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/results`),
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/matches`),
      ]);

      let results = 0, matches = 0;

      if (resultsRes.ok) {
        const data = await resultsRes.json();
        const allResults = data.results || [];
        // Count results in current period
        results = allResults.filter((r: any) => r.periode === competition.periode).length;
      }
      if (matchesRes.ok) {
        const data = await matchesRes.json();
        const allMatches = data.matches || [];
        // Count matches in current period
        matches = allMatches.filter((m: any) => m.periode === competition.periode).length;
      }

      setPeriodStats({ results, matches });
    } catch {
      setPeriodStats({ results: 0, matches: 0 });
    } finally {
      setLoadingPeriodStats(false);
    }
  };

  const handleDeletePeriod = async () => {
    if (!orgNummer || !competition || competition.periode <= 1) return;
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(
        `/api/organizations/${orgNummer}/competitions/${compNr}/periods/${competition.periode}`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        const data = await res.json();
        setSuccess(data.message || `Periode ${competition.periode} is succesvol verwijderd.`);
        setShowDeleteConfirm(false);
        setPeriodStats(null);
        // Refresh data
        await fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Fout bij verwijderen periode.');
      }
    } catch {
      setError('Er is een fout opgetreden.');
    } finally {
      setIsSubmitting(false);
    }
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

  const canCreatePeriod = competition.periode < 5;
  const canDeletePeriod = competition.periode > 1;
  const multiplier = MOYENNE_MULTIPLIERS[competition.moy_form] || 25;

  return (
    <div>
      <CompetitionSubNav compNr={compNr} compNaam={competition.comp_naam} />

      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Periodes - {competition.comp_naam}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {DISCIPLINES[competition.discipline]} | Formule: x{multiplier} | Min. caramboles: {competition.min_car}
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800 flex items-center justify-between">
          <span>{error}</span>
          <div className="flex items-center gap-2 ml-3">
            <button onClick={fetchData} className="text-xs px-2.5 py-1 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300 rounded-md transition-colors font-medium">
              Opnieuw proberen
            </button>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors" aria-label="Melding sluiten">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
      {success && (
        <div role="status" className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm border border-green-200 dark:border-green-800 flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="ml-3 text-green-500 hover:text-green-700 dark:hover:text-green-300 transition-colors" aria-label="Melding sluiten">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Current Period Info */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Huidige periode</h2>
            <div className="flex items-center gap-4 mt-2">
              {/* Period indicators */}
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((p) => (
                  <div
                    key={p}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                      p === competition.periode
                        ? 'bg-green-700 text-white shadow-md'
                        : p < competition.periode
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {p}
                  </div>
                ))}
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Periode {competition.periode} van 5
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {canDeletePeriod && !showCreateForm && (
              <button
                onClick={() => {
                  setShowDeleteConfirm(true);
                  fetchPeriodStats();
                }}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                Periode verwijderen
              </button>
            )}
            {canCreatePeriod && !showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nieuwe periode
              </button>
            )}
            {!canCreatePeriod && !showCreateForm && (
              <span className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-medium rounded-lg text-sm">
                Maximum bereikt (5)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-200 mb-2">
            Periode {competition.periode} verwijderen?
          </h3>
          <div className="mb-4">
            <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
              ⚠️ De volgende gegevens worden definitief verwijderd:
            </p>
            {loadingPeriodStats ? (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-300">
                <div className="w-4 h-4 border-2 border-red-700 dark:border-red-300 border-t-transparent rounded-full animate-spin"></div>
                Gegevens laden...
              </div>
            ) : periodStats ? (
              <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                <li><strong>{periodStats.results} uitslag{periodStats.results !== 1 ? 'en' : ''}</strong> van periode {competition.periode}</li>
                <li><strong>{periodStats.matches} wedstrijd{periodStats.matches !== 1 ? 'en' : ''}</strong> uit de planning</li>
              </ul>
            ) : null}
            <p className="text-sm text-red-600 dark:text-red-200 mt-3">
              De competitie keert terug naar periode {competition.periode - 1}.
            </p>
            {!loadingPeriodStats && periodStats && periodStats.results > 0 && (
              <p className="mt-2 text-sm font-semibold text-red-700 dark:text-red-400">
                Dit heeft consequenties voor de stand en statistieken van alle betrokken spelers.
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDeletePeriod}
              disabled={isSubmitting || loadingPeriodStats}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? 'Bezig...' : 'Ja, verwijderen'}
            </button>
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setPeriodStats(null);
              }}
              className="px-4 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      {/* Create New Period Form */}
      {showCreateForm && (
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Van Periode {competition.periode} naar Periode {competition.periode + 1}
          </h2>

          {/* Explanation */}
          <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <strong>Wat gebeurt er als u een nieuwe periode aanmaakt:</strong>
            </p>
            <ul className="text-sm text-amber-700 dark:text-amber-400 mt-2 space-y-1 list-disc list-inside">
              <li>De wedstrijdplanning wordt &quot;schoongemaakt&quot;, zodat iedereen weer tegen iedereen kan spelen.</li>
              <li>U kunt per speler aangeven of het moyenne moet worden aangepast op basis van de resultaten in de huidige periode.</li>
              <li>Vink de spelers aan waarvoor u het moyenne wilt aanpassen.</li>
            </ul>
          </div>

          {/* Players Table */}
          {playerInfos.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Er zijn geen spelers in deze competitie.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20">Aanpassen</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Speler</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20">Partijen</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24">Moy start</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24">Car start</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-32">Moy nieuw</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24">Car nieuw</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {playerInfos.map((info, idx) => (
                    <tr
                      key={info.spc_nummer}
                      className={`transition-colors ${
                        info.update_moyenne
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                      }`}
                    >
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={info.update_moyenne}
                          onChange={() => togglePlayerUpdate(idx)}
                          className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-green-700 focus:ring-green-500 cursor-pointer"
                          aria-label={`Moyenne aanpassen voor ${info.naam}`}
                        />
                      </td>
                      <td className="px-3 py-2 text-sm font-medium text-slate-900 dark:text-white">
                        {info.naam}
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 text-center tabular-nums">
                        {info.partijen}
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 text-right tabular-nums">
                        {info.moy_start.toFixed(3)}
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 text-right tabular-nums">
                        {info.car_start}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          value={info.moy_nieuw.toFixed(3)}
                          onChange={(e) => updatePlayerMoyenne(idx, e.target.value)}
                          step="0.001"
                          min="0.200"
                          className="w-24 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm text-right tabular-nums focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                      </td>
                      <td className="px-3 py-2 text-sm font-medium text-green-700 dark:text-green-400 text-right tabular-nums">
                        {info.car_nieuw}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Info note */}
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Met een klik op Akkoord wordt er een nieuwe periode aangemaakt en worden de moyennes van de aangevinkte spelers verwerkt in de nieuwe periode.
              Niet-aangevinkte spelers behouden hun huidige moyenne.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleCreatePeriod}
              disabled={isSubmitting || playerInfos.length === 0}
              className="px-6 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              {isSubmitting ? 'Bezig met verwerken...' : 'Akkoord - Nieuwe periode aanmaken'}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      {/* Period History */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Overzicht periodes</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((p) => {
            const isActive = p === competition.periode;
            const isPast = p < competition.periode;
            const isFuture = p > competition.periode;

            return (
              <div
                key={p}
                className={`p-4 rounded-lg border text-center transition-colors ${
                  isActive
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                    : isPast
                    ? 'bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700'
                    : 'bg-slate-50/50 dark:bg-slate-700/10 border-slate-200/50 dark:border-slate-700/50 opacity-50'
                }`}
              >
                <p className={`text-2xl font-bold ${
                  isActive ? 'text-green-700 dark:text-green-400' :
                  isPast ? 'text-slate-600 dark:text-slate-400' :
                  'text-slate-300 dark:text-slate-600'
                }`}>
                  {p}
                </p>
                <p className={`text-xs mt-1 ${
                  isActive ? 'text-green-600 dark:text-green-500 font-semibold' :
                  isPast ? 'text-slate-500 dark:text-slate-400' :
                  'text-slate-300 dark:text-slate-600'
                }`}>
                  {isActive ? 'Actief' : isPast ? 'Afgerond' : 'Beschikbaar'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
