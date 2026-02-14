'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import { DISCIPLINES, MOYENNE_MULTIPLIERS } from '@/types';

const PUNTEN_SYSTEMEN: Record<number, string> = {
  1: 'WRV 2-1-0',
  2: '10-punten',
  3: 'Belgisch (12-punten)',
};

export default function NieuweCompetitie() {
  const router = useRouter();
  const { orgNummer } = useAuth();

  const [formData, setFormData] = useState({
    comp_naam: '',
    comp_datum: new Date().toISOString().split('T')[0],
    discipline: 1,
    punten_sys: 1,
    moy_form: 3,
    min_car: 0,
    max_beurten: 0,
    vast_beurten: 0,
    sorteren: 1,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Warn about unsaved changes before navigation
  useUnsavedChangesWarning(isDirty && !success);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    // Mark form as dirty when user starts typing
    if (!isDirty) {
      setIsDirty(true);
    }
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
      const res = await fetch(`/api/organizations/${orgNummer}/competitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`Competitie "${data.competition.comp_naam}" is succesvol aangemaakt!`);
        setTimeout(() => {
          router.replace('/competities');
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Fout bij aanmaken competitie.');
      }
    } catch {
      setError('Er is een fout opgetreden. Probeer het later opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <button
            type="button"
            onClick={() => router.push('/competities')}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            aria-label="Terug naar competities"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Nieuwe competitie
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 ml-8">
          Vul de gegevens in om een nieuwe competitie aan te maken.
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800 flex items-center justify-between">
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
                <p id="comp_naam-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.comp_naam}</p>
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
                <p id="comp_datum-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.comp_datum}</p>
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
                Moyenne formule
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
                Minimale caramboles
              </label>
              <input
                id="min_car"
                name="min_car"
                type="number"
                min="0"
                max="999"
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
                min="0"
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
            {isSubmitting ? 'Bezig met aanmaken...' : 'Competitie aanmaken'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/competities')}
            className="px-6 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
          >
            Annuleren
          </button>
        </div>
      </form>
    </div>
  );
}
