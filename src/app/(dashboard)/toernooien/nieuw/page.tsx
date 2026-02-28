'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import { DISCIPLINES, MOYENNE_FORMULE_LABELS } from '@/types';
import Breadcrumb from '@/components/common/Breadcrumb';

const PUNTEN_SYSTEMEN: Record<number, string> = {
  1: 'WRV 2-1-0',
  2: '10-punten',
  3: 'Belgisch (12-punten)',
};

export default function NieuwToernooi() {
  const router = useRouter();
  const { orgNummer } = useAuth();

  const [formData, setFormData] = useState({
    t_naam: '',
    t_datum: '',         // sub-titel (vrije tekst)
    datum_start: '',     // dd-mm-yyyy
    datum_eind: '',      // dd-mm-yyyy
    discipline: 1,
    t_punten_sys: 1,
    t_car_sys: 1,        // 1=moyenne-formule, 2=vrije invoer
    t_moy_form: 3,
    t_min_car: 0,
    openbaar: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  useUnsavedChangesWarning(isDirty && !success);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    if (!isDirty) setIsDirty(true);
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
      const res = await fetch(`/api/organizations/${orgNummer}/competitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        const naam = data.competition?.t_naam ?? data.competition?.comp_naam ?? formData.t_naam;
        setSuccess(`Toernooi "${naam}" is succesvol aangemaakt!`);
        setTimeout(() => router.replace('/toernooien'), 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Fout bij aanmaken toernooi.');
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
        <Breadcrumb items={[
          { label: 'Toernooien', href: '/toernooien' },
          { label: 'Nieuw toernooi' },
        ]} />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Nieuw toernooi</h1>
        <p className="text-slate-600 dark:text-slate-400">Vul de gegevens in om een nieuw toernooi aan te maken.</p>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-3 text-red-500 hover:text-red-700 dark:hover:text-red-300" aria-label="Sluiten">
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
        {/* Algemene gegevens */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Algemene gegevens</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Toernooinaam */}
            <div>
              <label htmlFor="t_naam" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Toernooinaam <span className="text-red-500">*</span>
              </label>
              <input
                id="t_naam" name="t_naam" type="text"
                value={formData.t_naam} onChange={handleChange}
                placeholder="Bijv. Wintertoernooi 2026"
                required aria-required="true"
                aria-invalid={!!fieldErrors.t_naam}
                aria-describedby={fieldErrors.t_naam ? 't_naam-error' : undefined}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors ${fieldErrors.t_naam ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
              />
              {fieldErrors.t_naam && (
                <p id="t_naam-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-200">{fieldErrors.t_naam}</p>
              )}
            </div>

            {/* Sub-titel (vrije tekst, was "Datum") */}
            <div>
              <label htmlFor="t_datum" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Sub-titel
              </label>
              <input
                id="t_datum" name="t_datum" type="text"
                value={formData.t_datum} onChange={handleChange}
                placeholder="Bijv. Seizoen 2026 of Klasse A"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Vrije tekst, wordt getoond als ondertitel.</p>
            </div>

            {/* Datum start */}
            <div>
              <label htmlFor="datum_start" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Datum start
              </label>
              <input
                id="datum_start" name="datum_start" type="date"
                value={formData.datum_start} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Bepaalt of dit toernooi zichtbaar is op de SpecialSoftware-homepage.</p>
            </div>

            {/* Datum eind */}
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

            {/* Stand openbaar */}
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

        {/* Discipline, Puntentelling en Aantal te maken caramboles */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Discipline, Puntentelling en Aantal te maken caramboles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Discipline */}
            <div>
              <label htmlFor="discipline" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Discipline <span className="text-red-500">*</span>
              </label>
              <select
                id="discipline" name="discipline"
                value={formData.discipline} onChange={handleChange}
                required aria-required="true"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
              >
                {Object.entries(DISCIPLINES).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            {/* Puntensysteem */}
            <div>
              <label htmlFor="t_punten_sys" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Puntensysteem <span className="text-red-500">*</span>
              </label>
              <select
                id="t_punten_sys" name="t_punten_sys"
                value={formData.t_punten_sys} onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
              >
                {Object.entries(PUNTEN_SYSTEMEN).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            {/* Caramboles-systeem */}
            <div>
              <label htmlFor="t_car_sys" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Systeem caramboles
              </label>
              <select
                id="t_car_sys" name="t_car_sys"
                value={formData.t_car_sys} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
              >
                <option value={1}>Moyenne-formule (automatisch berekend)</option>
                <option value={2}>Vrije invoer (per speler opgeven)</option>
              </select>
            </div>

            {/* Moyenne-formule (alleen zichtbaar bij t_car_sys=1) */}
            {formData.t_car_sys === 1 && (
              <div>
                <label htmlFor="t_moy_form" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Moyenne-formule
                </label>
                <select
                  id="t_moy_form" name="t_moy_form"
                  value={formData.t_moy_form} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                >
                  {Object.entries(MOYENNE_FORMULE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Min caramboles */}
            {formData.t_car_sys === 1 && (
              <div>
                <label htmlFor="t_min_car" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Minimum aantal caramboles
                </label>
                <input
                  id="t_min_car" name="t_min_car" type="number"
                  min="0" max="99"
                  value={formData.t_min_car} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">0 = geen minimum</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            {isSubmitting ? 'Bezig met aanmaken...' : 'Toernooi aanmaken'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/toernooien')}
            className="px-6 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
          >
            Annuleren
          </button>
        </div>
      </form>
    </div>
  );
}
