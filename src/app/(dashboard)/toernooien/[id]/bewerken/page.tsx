'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { DISCIPLINES, MOYENNE_FORMULE_LABELS } from '@/types';
import CompetitionSubNav from '@/components/CompetitionSubNav';

const PUNTEN_SYSTEMEN: Record<number, string> = {
  1: 'WRV 2-1-0',
  2: '10-punten',
  3: 'Belgisch (12-punten)',
};

const CAR_SYSTEMEN: Record<number, string> = {
  1: 'Moyenne-formule (automatisch berekend)',
  2: 'Vrije invoer (per speler opgeven)',
};

interface TournamentData {
  id: string;
  t_nummer: number;
  comp_nr?: number;
  t_naam: string;
  comp_naam?: string;
  t_datum: string;
  comp_datum?: string;
  datum_start: string;
  datum_eind: string;
  discipline: number;
  t_car_sys: number;
  t_moy_form: number;
  moy_form?: number;
  t_punten_sys: number;
  punten_sys?: number;
  t_min_car: number;
  min_car?: number;
  t_max_beurten: number;
  t_gestart: number;
  t_ronde: number;
  periode?: number;
  openbaar: number;
}

export default function ToernooiBewerkenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { orgNummer } = useAuth();
  const compNr = parseInt(id, 10);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [tournament, setTournament] = useState<TournamentData | null>(null);

  const [formData, setFormData] = useState({
    t_naam: '',
    t_datum: '',
    datum_start: '',
    datum_eind: '',
    openbaar: 0,
  });

  const fetchTournament = useCallback(async () => {
    if (!orgNummer || isNaN(compNr)) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`);
      if (res.ok) {
        const data: TournamentData = await res.json();
        setTournament(data);
        setFormData({
          t_naam: data.t_naam ?? data.comp_naam ?? '',
          t_datum: data.t_datum ?? data.comp_datum ?? '',
          datum_start: data.datum_start ?? '',
          datum_eind: data.datum_eind ?? '',
          openbaar: Number(data.openbaar) || 0,
        });
      } else {
        setError('Toernooi niet gevonden.');
      }
    } catch {
      setError('Er is een fout opgetreden bij het laden.');
    } finally {
      setIsLoading(false);
    }
  }, [orgNummer, compNr]);

  useEffect(() => { fetchTournament(); }, [fetchTournament]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!orgNummer) {
      setError('Sessie verlopen. Log opnieuw in.');
      setIsSubmitting(false);
      return;
    }

    const errors: Record<string, string> = {};
    if (!formData.t_naam.trim()) errors.t_naam = 'Toernooinaam is verplicht.';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }
    setFieldErrors({});

    try {
      const res = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(`Toernooi "${formData.t_naam}" is succesvol bijgewerkt!`);
        setTimeout(() => router.replace(`/toernooien/${compNr}`), 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Fout bij bijwerken toernooi.');
      }
    } catch {
      setError('Er is een fout opgetreden. Probeer het later opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 dark:text-slate-400">Toernooi laden...</p>
      </div>
    );
  }

  if (error && !tournament) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
        <p className="text-slate-600 dark:text-slate-400">{error}</p>
        <Link href="/toernooien" className="mt-4 inline-block px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
          Naar toernooioverzicht
        </Link>
      </div>
    );
  }

  const compNaam = tournament?.t_naam ?? tournament?.comp_naam ?? '';
  const periode = tournament?.t_ronde ?? tournament?.periode ?? 0;

  return (
    <div>
      {tournament && (
        <CompetitionSubNav compNr={compNr} compNaam={compNaam} periode={periode} />
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Toernooi bewerken</h1>
        <p className="text-slate-600 dark:text-slate-400">Wijzig de instellingen van het toernooi.</p>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-3 text-red-500 hover:text-red-700" aria-label="Sluiten">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {success && (
        <div role="status" className="mb-4 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm border border-orange-200 dark:border-orange-800 flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="ml-3 text-orange-500" aria-label="Sluiten">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Editable fields */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Algemene gegevens</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="t_naam" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Toernooinaam <span className="text-red-500">*</span>
              </label>
              <input
                id="t_naam" name="t_naam" type="text"
                value={formData.t_naam} onChange={handleChange}
                required aria-required="true"
                aria-invalid={!!fieldErrors.t_naam}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors ${fieldErrors.t_naam ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
              />
              {fieldErrors.t_naam && (
                <p role="alert" className="mt-1 text-sm text-red-600 dark:text-red-200">{fieldErrors.t_naam}</p>
              )}
            </div>

            <div>
              <label htmlFor="t_datum" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Sub-titel
              </label>
              <input
                id="t_datum" name="t_datum" type="text"
                value={formData.t_datum} onChange={handleChange}
                placeholder="Bijv. Seizoen 2026 of Klasse A"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="datum_start" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Datum start
              </label>
              <input
                id="datum_start" name="datum_start" type="date"
                value={formData.datum_start} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="datum_eind" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Datum eind
              </label>
              <input
                id="datum_eind" name="datum_eind" type="date"
                value={formData.datum_eind} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="openbaar" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Stand openbaar
              </label>
              <select
                id="openbaar" name="openbaar"
                value={formData.openbaar} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
              >
                <option value={0}>Nee</option>
                <option value={1}>Ja</option>
              </select>
            </div>
          </div>
        </div>

        {/* Read-only fields set at creation */}
        {tournament && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Discipline & Spelinstellingen
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300">
                Alleen-lezen
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Deze instellingen zijn vastgelegd bij het aanmaken en kunnen niet worden gewijzigd.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                ['Discipline', DISCIPLINES[tournament.discipline] || 'Onbekend'],
                ['Puntensysteem', PUNTEN_SYSTEMEN[tournament.t_punten_sys ?? tournament.punten_sys ?? 1] || 'Onbekend'],
                ['Caramboles-systeem', CAR_SYSTEMEN[tournament.t_car_sys] || 'Onbekend'],
                ['Moyenne-formule', tournament.t_car_sys === 1
                  ? (MOYENNE_FORMULE_LABELS[tournament.t_moy_form ?? tournament.moy_form ?? 3] || 'Onbekend')
                  : 'N.v.t.'],
                ['Min. caramboles', String(tournament.t_min_car ?? tournament.min_car ?? 0)],
                ['Max. beurten', tournament.t_max_beurten === 0 ? 'Geen limiet' : String(tournament.t_max_beurten)],
              ].map(([label, value]) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</label>
                  <div className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            {isSubmitting ? 'Bezig met opslaan...' : 'Wijzigingen opslaan'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/toernooien/${compNr}`)}
            className="px-6 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
          >
            Annuleren
          </button>
        </div>
      </form>
    </div>
  );
}
