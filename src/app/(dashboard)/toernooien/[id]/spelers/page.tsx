'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { DISCIPLINES, MOYENNE_MULTIPLIERS, CAR_SYSTEMEN } from '@/types';
import { calculateCaramboles } from '@/lib/billiards';
import CompetitionSubNav from '@/components/CompetitionSubNav';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDecimal } from '@/lib/formatUtils';

interface TournamentData {
  id: string;
  t_nummer: number;
  comp_nr?: number;
  t_naam: string;
  comp_naam?: string;
  discipline: number;
  t_car_sys: number;
  t_moy_form: number;
  moy_form?: number;
  t_min_car: number;
  min_car?: number;
  t_ronde: number;
  periode?: number;
  openbaar: number;
}

interface SpelerData {
  id: string;
  sp_nummer: number;
  sp_naam: string;
  sp_startmoy: number;
  sp_startcar: number;
}

export default function ToernooiSpelersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { orgNummer } = useAuth();
  const compNr = parseInt(id, 10);

  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [spelers, setSpelers] = useState<SpelerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [spelerToRemove, setSpelerToRemove] = useState<SpelerData | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  // Add form state
  const [newNaam, setNewNaam] = useState('');
  const [newMoy, setNewMoy] = useState('');
  const [newCar, setNewCar] = useState('');
  const [newPouleNr, setNewPouleNr] = useState(1);

  const fetchData = useCallback(async () => {
    if (!orgNummer || isNaN(compNr)) return;
    setIsLoading(true);
    setError('');
    try {
      const [compRes, spelersRes] = await Promise.all([
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`),
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/players`),
      ]);

      if (!compRes.ok) {
        setError('Toernooi niet gevonden.');
        setIsLoading(false);
        return;
      }

      const compData = await compRes.json();
      setTournament(compData);

      if (spelersRes.ok) {
        const data = await spelersRes.json();
        setSpelers(data.players || []);
      }
    } catch {
      setError('Er is een fout opgetreden bij het laden.');
    } finally {
      setIsLoading(false);
    }
  }, [orgNummer, compNr]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const tCarSys = tournament?.t_car_sys ?? tournament?.t_moy_form !== undefined ? 1 : 1;
  const tMoyForm = tournament?.t_moy_form ?? tournament?.moy_form ?? 3;
  const tMinCar = tournament?.t_min_car ?? tournament?.min_car ?? 0;
  const multiplier = MOYENNE_MULTIPLIERS[tMoyForm] || 25;
  const compNaam = tournament?.t_naam ?? tournament?.comp_naam ?? '';
  const periode = tournament?.t_ronde ?? tournament?.periode ?? 0;

  const previewCar = (): number => {
    if (!tournament) return 0;
    const carSys = tournament.t_car_sys ?? 1;
    if (carSys === 2) return parseInt(newCar) || 0;
    return calculateCaramboles(parseFloat(newMoy) || 0, tMoyForm, tMinCar);
  };

  const handleAddSpeler = async () => {
    if (!orgNummer || !newNaam.trim()) return;
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(
        `/api/organizations/${orgNummer}/competitions/${compNr}/players`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sp_naam: newNaam.trim(),
            sp_startmoy: Math.max(parseFloat(newMoy) || 0, 0.1),
            sp_startcar: Math.max(parseInt(newCar) || 0, 3),
            poule_nr: newPouleNr,
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setSpelers(prev => [...prev, data]);
        setShowAddForm(false);
        setNewNaam('');
        setNewMoy('');
        setNewCar('');
        setNewPouleNr(1);
        setSuccess(`${data.sp_naam} is succesvol toegevoegd!`);
        setTimeout(() => setSuccess(''), 4000);
      } else {
        const data = await res.json();
        setError(data.error || 'Fout bij toevoegen speler.');
      }
    } catch {
      setError('Er is een fout opgetreden.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSpeler = async () => {
    if (!orgNummer || !spelerToRemove) return;
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch(
        `/api/organizations/${orgNummer}/competitions/${compNr}/players`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sp_nummer: spelerToRemove.sp_nummer }),
        }
      );
      if (res.ok) {
        setSpelers(prev => prev.filter(s => s.sp_nummer !== spelerToRemove.sp_nummer));
        setSuccess(`${spelerToRemove.sp_naam} verwijderd.`);
        setTimeout(() => setSuccess(''), 4000);
        setShowRemoveDialog(false);
        setSpelerToRemove(null);
      } else {
        const data = await res.json();
        setError(data.error || 'Fout bij verwijderen speler.');
      }
    } catch {
      setError('Er is een fout opgetreden.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedSpelers = [...spelers].sort((a, b) =>
    (a.sp_naam || '').localeCompare(b.sp_naam || '', 'nl')
  );

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
        <LoadingSpinner size="lg" label="Spelers laden..." />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
        <p className="text-slate-600 dark:text-slate-400">Toernooi niet gevonden.</p>
        <Link href="/toernooien" className="mt-4 inline-block px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
          Naar toernooioverzicht
        </Link>
      </div>
    );
  }

  return (
    <div>
      <CompetitionSubNav compNr={compNr} compNaam={compNaam} periode={periode} />

      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Spelers – {compNaam}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {DISCIPLINES[tournament.discipline]}
          {tournament.t_car_sys === 1
            ? ` | Formule: Car = Moyenne × ${multiplier} | Min. caramboles: ${tMinCar}`
            : ` | ${CAR_SYSTEMEN[2]}`}
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800 flex items-center justify-between">
          <span>{error}</span>
          <div className="flex items-center gap-2 ml-3">
            <button onClick={fetchData} className="text-xs px-2.5 py-1 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 text-red-700 dark:text-red-300 rounded-md font-medium">
              Opnieuw
            </button>
            <button onClick={() => setError('')} aria-label="Sluiten" className="text-red-500 hover:text-red-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {success && (
        <div role="status" className="mb-4 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm border border-orange-200 dark:border-orange-800 flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} aria-label="Sluiten" className="ml-3 text-orange-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Add player form */}
      {showAddForm && (
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Speler toevoegen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Naam <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newNaam}
                onChange={e => setNewNaam(e.target.value)}
                placeholder="Voor- en achternaam"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Startmoyenne
              </label>
              <input
                type="number"
                step="0.001"
                min="0.1"
                value={newMoy}
                onChange={e => setNewMoy(e.target.value)}
                placeholder="Min. 0.100"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
              />
            </div>
            {tournament.t_car_sys === 2 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Aantal te maken caramboles <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="3"
                  value={newCar}
                  onChange={e => setNewCar(e.target.value)}
                  placeholder="Min. 3, bijv. 25"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Start-poule
              </label>
              <select
                value={newPouleNr}
                onChange={e => setNewPouleNr(parseInt(e.target.value, 10))}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(nr => (
                  <option key={nr} value={nr}>Poule {String.fromCharCode(64 + nr)}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Wordt gebruikt bij start toernooi (ronde 1)</p>
            </div>
          </div>

          {tournament.t_car_sys === 1 && newMoy && (
            <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 text-sm">
              <span className="text-slate-500 dark:text-slate-400">Berekende caramboles: </span>
              <span className="ml-2 font-bold text-orange-600 dark:text-orange-400">
                {formatDecimal(parseFloat(newMoy) || 0)} × {multiplier} = {previewCar()}
                {tMinCar > 0 && previewCar() < tMinCar && ` (minimum: ${tMinCar})`}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleAddSpeler}
              disabled={!newNaam.trim() || isSubmitting || (parseFloat(newMoy) || 0) < 0.1 || (tournament.t_car_sys === 2 && (parseInt(newCar) || 0) < 3)}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              {isSubmitting ? 'Bezig...' : 'Toevoegen'}
            </button>
            <button
              onClick={() => { setShowAddForm(false); setNewNaam(''); setNewMoy(''); setNewCar(''); setNewPouleNr(1); }}
              className="px-4 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      {/* Add button */}
      {!showAddForm && (
        <div className="mb-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Speler toevoegen
          </button>
        </div>
      )}

      {/* Players table */}
      {spelers.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Er zijn nog geen spelers toegevoegd aan dit toernooi.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nr</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Naam</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Moyenne</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Caramboles</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {sortedSpelers.map(speler => (
                  <tr key={speler.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 tabular-nums">
                      {speler.sp_nummer}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {speler.sp_naam}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 text-right tabular-nums">
                      {formatDecimal(speler.sp_startmoy)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-orange-600 dark:text-orange-400 text-right tabular-nums">
                      {speler.sp_startcar}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setSpelerToRemove(speler); setShowRemoveDialog(true); }}
                        className="text-xs px-2.5 py-1.5 text-red-600 dark:text-red-200 border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors font-medium"
                      >
                        Verwijderen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {spelers.length} {spelers.length === 1 ? 'speler' : 'spelers'}
            </p>
          </div>
        </div>
      )}

      {/* Remove confirmation dialog */}
      {showRemoveDialog && spelerToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Speler verwijderen
            </h3>
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                ⚠️ Dit kan niet ongedaan gemaakt worden!
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                Bij het verwijderen van <strong>{spelerToRemove.sp_naam}</strong> worden ook alle uitslagen en poule-indeeling van deze speler verwijderd.
              </p>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Weet u zeker dat u wilt doorgaan?</p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => { setShowRemoveDialog(false); setSpelerToRemove(null); }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
              >
                Annuleren
              </button>
              <button
                onClick={handleRemoveSpeler}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                {isSubmitting ? 'Bezig...' : 'Ja, verwijder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
