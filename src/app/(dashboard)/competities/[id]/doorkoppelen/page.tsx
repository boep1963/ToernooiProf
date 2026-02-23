'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import CompetitionSubNav from '@/components/CompetitionSubNav';
import { DISCIPLINES } from '@/types';

interface PlayerMoyenne {
  spc_nummer: number;
  playerName: string;
  startMoyenne: number;
  periode1Moy: number;
  periode2Moy: number;
  periode3Moy: number;
  periode4Moy: number;
  periode5Moy: number;
  totalMoy: number;
}

interface CompetitionData {
  comp_nr: number;
  comp_naam: string;
  discipline: number;
  periode: number;
}

export default function DoorkoppelenPage() {
  const params = useParams();
  const router = useRouter();
  const { orgNummer } = useAuth();
  const compNr = parseInt(params.id as string, 10);

  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [players, setPlayers] = useState<PlayerMoyenne[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<number>>(new Set());
  const [selectedPeriod, setSelectedPeriod] = useState<number>(6); // Default to total
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!orgNummer || isNaN(compNr)) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError('');

      try {
        // Fetch competition details
        const compRes = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`);
        if (!compRes.ok) throw new Error('Competitie niet gevonden');
        const compData = await compRes.json();
        setCompetition(compData);

        // Fetch player moyennes
        const playersRes = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/doorkoppelen`);
        if (!playersRes.ok) throw new Error('Kon spelergegevens niet ophalen');
        const playersData = await playersRes.json();
        setPlayers(playersData);
      } catch (err: any) {
        setError(err.message || 'Er is een fout opgetreden');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [orgNummer, compNr]);

  const handlePlayerSelect = (spc_nummer: number) => {
    const newSelected = new Set(selectedPlayers);
    if (newSelected.has(spc_nummer)) {
      newSelected.delete(spc_nummer);
    } else {
      newSelected.add(spc_nummer);
    }
    setSelectedPlayers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPlayers.size === players.length) {
      setSelectedPlayers(new Set());
    } else {
      setSelectedPlayers(new Set(players.map(p => p.spc_nummer)));
    }
  };

  const handleSubmit = async () => {
    if (selectedPlayers.size === 0) {
      setError('Selecteer minimaal één speler');
      return;
    }

    if (!competition) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/doorkoppelen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerIds: Array.from(selectedPlayers),
          period: selectedPeriod,
          discipline: competition.discipline,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Er is een fout opgetreden');
      }

      const result = await res.json();
      setSuccess(`${result.updated} speler(s) succesvol bijgewerkt`);
      setSelectedPlayers(new Set());

      // Refresh data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <CompetitionSubNav compNr={compNr} compNaam="Competitie" />
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Gegevens laden...</p>
        </div>
      </div>
    );
  }

  if (error && !competition) {
    return (
      <div>
        <CompetitionSubNav compNr={compNr} compNaam="Competitie" />
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <p className="text-red-600 dark:text-red-200 mb-4">{error}</p>
          <Link
            href="/competities"
            className="inline-block px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors"
          >
            Naar competitieoverzicht
          </Link>
        </div>
      </div>
    );
  }

  const getPeriodMoyenne = (player: PlayerMoyenne, period: number) => {
    switch (period) {
      case 1: return player.periode1Moy;
      case 2: return player.periode2Moy;
      case 3: return player.periode3Moy;
      case 4: return player.periode4Moy;
      case 5: return player.periode5Moy;
      case 6: return player.totalMoy;
      default: return 0;
    }
  };

  return (
    <div>
      <CompetitionSubNav compNr={compNr} compNaam={competition?.comp_naam || 'Competitie'} periode={competition?.periode || 1} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Moyennes Doorkoppelen
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Koppel behaalde moyennes door naar het ledenbestand
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-semibold mb-2">Wat is doorkoppelen?</p>
            <p className="mb-3">
              <strong>Doorkoppelen past het moyenne van leden aan op basis van hun gespeelde moyenne in deze competitie.</strong>
            </p>
            <p>
              Selecteer spelers en een periode. Het moyenne uit die periode wordt overgenomen als het nieuwe
              {' '}{DISCIPLINES[competition?.discipline || 1]} moyenne van de speler in het ledenbestand.
              Dit is handig bij het afsluiten van een competitie, zodat het bijgewerkte moyenne automatisch
              als startwaarde wordt gebruikt voor de volgende competitie.
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <p className="text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && competition && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Period Selection */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Selecteer Periode
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              disabled={!competition || competition.periode < period}
              className={`px-4 py-3 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedPeriod === period
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="text-center">
                <div className="text-xs font-semibold mb-1">Periode</div>
                <div className="text-lg font-bold">{period}</div>
              </div>
            </button>
          ))}
          <button
            onClick={() => setSelectedPeriod(6)}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              selectedPeriod === 6
                ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="text-center">
              <div className="text-xs font-semibold mb-1">Totaal</div>
              <div className="text-lg font-bold">Alles</div>
            </div>
          </button>
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Spelers ({players.length})
          </h2>
          <button
            onClick={handleSelectAll}
            className="text-sm text-green-600 dark:text-green-400 hover:underline"
          >
            {selectedPlayers.size === players.length ? 'Deselecteer alles' : 'Selecteer alles'}
          </button>
        </div>

        {players.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            Geen spelers gevonden
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedPlayers.size === players.length && players.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Speler
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider bg-yellow-50 dark:bg-yellow-900/20">
                    Start-moy
                  </th>
                  {[1, 2, 3, 4, 5].map((period) => (
                    <th
                      key={period}
                      className={`px-4 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider ${
                        selectedPeriod === period ? 'bg-green-50 dark:bg-green-900/20' : ''
                      } ${competition && competition.periode < period ? 'opacity-50' : ''}`}
                    >
                      P{period}
                    </th>
                  ))}
                  <th className={`px-4 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider ${
                    selectedPeriod === 6 ? 'bg-green-50 dark:bg-green-900/20' : ''
                  }`}>
                    Totaal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {players.map((player) => (
                  <tr
                    key={player.spc_nummer}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                      selectedPlayers.has(player.spc_nummer) ? 'bg-green-50 dark:bg-green-900/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedPlayers.has(player.spc_nummer)}
                        onChange={() => handlePlayerSelect(player.spc_nummer)}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium">
                      {player.playerName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-slate-700 dark:text-slate-300 bg-yellow-50 dark:bg-yellow-900/10">
                      {player.startMoyenne.toFixed(3)}
                    </td>
                    {[1, 2, 3, 4, 5].map((period) => (
                      <td
                        key={period}
                        className={`px-4 py-3 whitespace-nowrap text-sm text-center text-slate-700 dark:text-slate-300 ${
                          selectedPeriod === period ? 'bg-green-50 dark:bg-green-900/10 font-semibold' : ''
                        } ${competition && competition.periode < period ? 'opacity-50' : ''}`}
                      >
                        {getPeriodMoyenne(player, period).toFixed(3)}
                      </td>
                    ))}
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-center text-slate-700 dark:text-slate-300 ${
                      selectedPeriod === 6 ? 'bg-green-50 dark:bg-green-900/10 font-semibold' : ''
                    }`}>
                      {player.totalMoy.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.push(`/competities/${compNr}`)}
          className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
        >
          Annuleren
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || selectedPlayers.size === 0}
          className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Bezig met verwerken...
            </>
          ) : (
            <>
              Doorkoppelen ({selectedPlayers.size} speler{selectedPlayers.size !== 1 ? 's' : ''})
            </>
          )}
        </button>
      </div>
    </div>
  );
}
