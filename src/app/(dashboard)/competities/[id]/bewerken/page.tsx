'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DISCIPLINES, MOYENNE_MULTIPLIERS } from '@/types';
import CompetitionSubNav from '@/components/CompetitionSubNav';
import { toInputDate, fromInputDate } from '@/lib/dateUtils';

const PUNTEN_SYSTEMEN: Record<number, string> = {
  1: 'WRV 2-1-0',
  2: '10-punten',
  3: 'Belgisch (12-punten)',
};

interface CompetitionData {
  id: string;
  comp_nr: number;
  comp_naam: string;
  comp_datum: string;
  discipline: number;
  periode: number;
  punten_sys: number;
  moy_form: number;
  min_car: number;
  max_beurten: number;
  vast_beurten: number;
  sorteren: number;
}

export default function CompetitieBewerkenPage() {
  const router = useRouter();
  const params = useParams();
  const { orgNummer } = useAuth();
  const compNr = parseInt(params.id as string, 10);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [competition, setCompetition] = useState<CompetitionData | null>(null);

  const [formData, setFormData] = useState({
    comp_naam: '',
    comp_datum: '',
    discipline: 1,
    punten_sys: 1,
    moy_form: 3,
    min_car: 10,
    max_beurten: 30,
    vast_beurten: 0,
    sorteren: 1,
  });

  const fetchCompetition = useCallback(async () => {
    if (!orgNummer || isNaN(compNr)) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`);
      if (res.ok) {
        const data: CompetitionData = await res.json();
        setCompetition(data);
        setFormData({
          comp_naam: data.comp_naam || '',
          comp_datum: toInputDate(data.comp_datum || ''),
          discipline: data.discipline || 1,
          punten_sys: data.punten_sys || 1,
          moy_form: data.moy_form || 3,
          min_car: data.min_car || 10,
          max_beurten: data.max_beurten || 30,
          vast_beurten: data.vast_beurten || 0,
          sorteren: data.sorteren || 1,
        });
      } else {
        setError('Competitie niet gevonden.');
      }
    } catch {
      setError('Er is een fout opgetreden bij het laden.');
    } finally {
      setIsLoading(false);
    }
  }, [orgNummer, compNr]);

  useEffect(() => {
    fetchCompetition();
  }, [fetchCompetition]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
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

    // Validate required fields
    const errors: Record<string, string> = {};
    if (!formData.comp_naam.trim()) {
      errors.comp_naam = 'Competitienaam is verplicht.';
    }
    if (!formData.comp_datum) {
      errors.comp_datum = 'Datum is verplicht.';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }
    setFieldErrors({});

    try {
      // Convert date back to DD-MM-YYYY for Firestore storage
      const submitData = {
        ...formData,
        comp_datum: fromInputDate(formData.comp_datum),
      };
      const res = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (res.ok) {
        setSuccess(`Competitie "${formData.comp_naam}" is succesvol bijgewerkt!`);
        setTimeout(() => {
          router.replace(`/competities/${compNr}`);
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Fout bij bijwerken competitie.');
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
        <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 dark:text-slate-400">Competitie laden...</p>
      </div>
    );
  }

  if (error && !competition) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
        <p className="text-slate-600 dark:text-slate-400">{error}</p>
        <button
          onClick={() => router.push('/competities')}
          className="mt-4 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors"
        >
          Terug naar competities
        </button>
      </div>
    );
  }

  return (
    <div>
      {competition && (
        <CompetitionSubNav compNr={compNr} compNaam={competition.comp_naam} />
      )}

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <button
            type="button"
            onClick={() => router.push(`/competities/${compNr}`)}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            aria-label="Terug naar competitie"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Competitie bewerken
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 ml-8">
          Wijzig de instellingen van de competitie.
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-3 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors" aria-label="Melding sluiten">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
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

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Algemene gegevens
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="comp_naam" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Competitienaam <span className="text-red-500">*</span>
              </label>
              <input
                id="comp_naam"
                name="comp_naam"
                type="text"
                value={formData.comp_naam}
                onChange={handleChange}
                placeholder="Bijv. Wintercompetitie 2026"
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.comp_naam}
                aria-describedby={fieldErrors.comp_naam ? 'comp_naam-error' : undefined}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors ${fieldErrors.comp_naam ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
              />
              {fieldErrors.comp_naam && (
                <p id="comp_naam-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-200">{fieldErrors.comp_naam}</p>
              )}
            </div>
            <div>
              <label htmlFor="comp_datum" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Datum <span className="text-red-500">*</span>
              </label>
              <input
                id="comp_datum"
                name="comp_datum"
                type="date"
                value={formData.comp_datum}
                onChange={handleChange}
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.comp_datum}
                aria-describedby={fieldErrors.comp_datum ? 'comp_datum-error' : undefined}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors ${fieldErrors.comp_datum ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
              />
              {fieldErrors.comp_datum && (
                <p id="comp_datum-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-200">{fieldErrors.comp_datum}</p>
              )}
            </div>
          </div>
        </div>

        {/* Discipline & Scoring */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Discipline & Puntentelling
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="discipline" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Discipline <span className="text-red-500">*</span>
              </label>
              <select
                id="discipline"
                name="discipline"
                value={formData.discipline}
                onChange={handleChange}
                required
                aria-required="true"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
              >
                {Object.entries(DISCIPLINES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="punten_sys" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Puntensysteem <span className="text-red-500">*</span>
              </label>
              <select
                id="punten_sys"
                name="punten_sys"
                value={formData.punten_sys}
                onChange={handleChange}
                required
                aria-required="true"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
              >
                {Object.entries(PUNTEN_SYSTEMEN).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="moy_form" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Moyenne-formule
              </label>
              <select
                id="moy_form"
                name="moy_form"
                value={formData.moy_form}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
              >
                {Object.entries(MOYENNE_MULTIPLIERS).map(([value, multiplier]) => (
                  <option key={value} value={value}>x{multiplier}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Game Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Spelinstellingen
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="min_car" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Minimaal aantal te maken caramboles
              </label>
              <input
                id="min_car"
                name="min_car"
                type="number"
                min="1"
                max="10"
                value={formData.min_car}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="max_beurten" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Maximale beurten
              </label>
              <input
                id="max_beurten"
                name="max_beurten"
                type="number"
                min="1"
                max="999"
                value={formData.max_beurten}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="vast_beurten" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Vaste beurten
              </label>
              <select
                id="vast_beurten"
                name="vast_beurten"
                value={formData.vast_beurten}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
              >
                <option value={0}>Nee</option>
                <option value={1}>Ja</option>
              </select>
            </div>
            <div>
              <label htmlFor="sorteren" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Naam sortering
              </label>
              <select
                id="sorteren"
                name="sorteren"
                value={formData.sorteren}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
              >
                <option value={1}>Voornaam eerst</option>
                <option value={2}>Achternaam eerst</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            {isSubmitting ? 'Bezig met opslaan...' : 'Wijzigingen opslaan'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/competities/${compNr}`)}
            className="px-6 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
          >
            Annuleren
          </button>
        </div>
      </form>
    </div>
  );
}
