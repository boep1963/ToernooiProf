'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';

interface MemberData {
  id: string;
  spa_nummer: number;
  spa_vnaam: string;
  spa_tv: string;
  spa_anaam: string;
  spa_org: number;
  spa_moy_lib: number;
  spa_moy_band: number;
  spa_moy_3bkl: number;
  spa_moy_3bgr: number;
  spa_moy_kad: number;
}

export default function BewerkLid() {
  const router = useRouter();
  const params = useParams();
  const { orgNummer } = useAuth();
  const memberId = params.id as string;

  const [isLoadingMember, setIsLoadingMember] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [formData, setFormData] = useState({
    spa_vnaam: '',
    spa_tv: '',
    spa_anaam: '',
    spa_moy_lib: '',
    spa_moy_band: '',
    spa_moy_3bkl: '',
    spa_moy_3bgr: '',
    spa_moy_kad: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Warn about unsaved changes before navigation
  useUnsavedChangesWarning(isDirty && !success);

  const fetchMember = useCallback(async () => {
    if (!orgNummer || !memberId) return;
    setIsLoadingMember(true);
    setLoadError('');
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/members/${memberId}`);
      if (res.ok) {
        const data: MemberData = await res.json();
        setFormData({
          spa_vnaam: data.spa_vnaam || '',
          spa_tv: data.spa_tv || '',
          spa_anaam: data.spa_anaam || '',
          spa_moy_lib: data.spa_moy_lib ? String(data.spa_moy_lib) : '',
          spa_moy_band: data.spa_moy_band ? String(data.spa_moy_band) : '',
          spa_moy_3bkl: data.spa_moy_3bkl ? String(data.spa_moy_3bkl) : '',
          spa_moy_3bgr: data.spa_moy_3bgr ? String(data.spa_moy_3bgr) : '',
          spa_moy_kad: data.spa_moy_kad ? String(data.spa_moy_kad) : '',
        });
      } else if (res.status === 404) {
        setLoadError('Lid niet gevonden.');
      } else {
        setLoadError('Fout bij ophalen lid.');
      }
    } catch {
      setLoadError('Er is een fout opgetreden bij het laden van het lid.');
    } finally {
      setIsLoadingMember(false);
    }
  }, [orgNummer, memberId]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
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
    if (!formData.spa_vnaam.trim()) {
      errors.spa_vnaam = 'Voornaam is verplicht.';
    }
    if (!formData.spa_anaam.trim()) {
      errors.spa_anaam = 'Achternaam is verplicht.';
    }

    // Validate moyenne fields (must be numeric and non-negative if provided)
    const moyenneFields = [
      { key: 'spa_moy_lib', label: 'Libre moyenne' },
      { key: 'spa_moy_band', label: 'Bandstoten moyenne' },
      { key: 'spa_moy_3bkl', label: 'Driebanden klein moyenne' },
      { key: 'spa_moy_3bgr', label: 'Driebanden groot moyenne' },
      { key: 'spa_moy_kad', label: 'Kader moyenne' },
    ];

    for (const field of moyenneFields) {
      const value = formData[field.key as keyof typeof formData];
      if (value && value.trim() !== '') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          errors[field.key] = `${field.label} moet een geldig getal zijn.`;
        } else if (numValue < 0) {
          errors[field.key] = `${field.label} mag niet negatief zijn.`;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }
    setFieldErrors({});

    try {
      const payload = {
        spa_vnaam: formData.spa_vnaam.trim(),
        spa_tv: formData.spa_tv.trim(),
        spa_anaam: formData.spa_anaam.trim(),
        spa_moy_lib: formData.spa_moy_lib ? parseFloat(formData.spa_moy_lib) : 0,
        spa_moy_band: formData.spa_moy_band ? parseFloat(formData.spa_moy_band) : 0,
        spa_moy_3bkl: formData.spa_moy_3bkl ? parseFloat(formData.spa_moy_3bkl) : 0,
        spa_moy_3bgr: formData.spa_moy_3bgr ? parseFloat(formData.spa_moy_3bgr) : 0,
        spa_moy_kad: formData.spa_moy_kad ? parseFloat(formData.spa_moy_kad) : 0,
      };

      const res = await fetch(`/api/organizations/${orgNummer}/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const naam = [payload.spa_vnaam, payload.spa_tv, payload.spa_anaam].filter(Boolean).join(' ');
        setSuccess(`Lid "${naam}" is succesvol bijgewerkt!`);
        setTimeout(() => {
          router.replace('/leden');
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Fout bij bijwerken lid.');
      }
    } catch {
      setError('Er is een fout opgetreden. Probeer het later opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingMember) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
        <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 dark:text-slate-400">Lid laden...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <button
              type="button"
              onClick={() => router.push('/leden')}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              aria-label="Terug naar leden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Lid bewerken
            </h1>
          </div>
        </div>
        <div role="alert" className="p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <button
            type="button"
            onClick={() => router.push('/leden')}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            aria-label="Terug naar leden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Lid bewerken
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 ml-8">
          Wijzig de gegevens van het lid en sla de wijzigingen op.
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
        {/* Personal Info */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Persoonsgegevens
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="spa_vnaam" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Voornaam <span className="text-red-500">*</span>
              </label>
              <input
                id="spa_vnaam"
                name="spa_vnaam"
                type="text"
                value={formData.spa_vnaam}
                onChange={handleChange}
                placeholder="Bijv. Jan"
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.spa_vnaam}
                aria-describedby={fieldErrors.spa_vnaam ? 'spa_vnaam-error' : undefined}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors ${fieldErrors.spa_vnaam ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
              />
              {fieldErrors.spa_vnaam && (
                <p id="spa_vnaam-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.spa_vnaam}</p>
              )}
            </div>
            <div>
              <label htmlFor="spa_tv" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tussenvoegsel
              </label>
              <input
                id="spa_tv"
                name="spa_tv"
                type="text"
                value={formData.spa_tv}
                onChange={handleChange}
                placeholder="Bijv. van"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="spa_anaam" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Achternaam <span className="text-red-500">*</span>
              </label>
              <input
                id="spa_anaam"
                name="spa_anaam"
                type="text"
                value={formData.spa_anaam}
                onChange={handleChange}
                placeholder="Bijv. Berg"
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.spa_anaam}
                aria-describedby={fieldErrors.spa_anaam ? 'spa_anaam-error' : undefined}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors ${fieldErrors.spa_anaam ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
              />
              {fieldErrors.spa_anaam && (
                <p id="spa_anaam-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.spa_anaam}</p>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Voornaam en achternaam zijn verplicht.
          </p>
        </div>

        {/* Moyennes */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Moyennes per discipline
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Wijzig de moyennes voor de disciplines waarin het lid speelt. Laat leeg als niet van toepassing.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label htmlFor="spa_moy_lib" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Libre
              </label>
              <input
                id="spa_moy_lib"
                name="spa_moy_lib"
                type="number"
                step="0.001"
                min="0"
                value={formData.spa_moy_lib}
                onChange={handleChange}
                placeholder="0.000"
                aria-invalid={!!fieldErrors.spa_moy_lib}
                aria-describedby={fieldErrors.spa_moy_lib ? 'spa_moy_lib-error' : undefined}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors tabular-nums ${fieldErrors.spa_moy_lib ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
              />
              {fieldErrors.spa_moy_lib && (
                <p id="spa_moy_lib-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.spa_moy_lib}</p>
              )}
            </div>
            <div>
              <label htmlFor="spa_moy_band" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Bandstoten
              </label>
              <input
                id="spa_moy_band"
                name="spa_moy_band"
                type="number"
                step="0.001"
                min="0"
                value={formData.spa_moy_band}
                onChange={handleChange}
                placeholder="0.000"
                aria-invalid={!!fieldErrors.spa_moy_band}
                aria-describedby={fieldErrors.spa_moy_band ? 'spa_moy_band-error' : undefined}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors tabular-nums ${fieldErrors.spa_moy_band ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
              />
              {fieldErrors.spa_moy_band && (
                <p id="spa_moy_band-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.spa_moy_band}</p>
              )}
            </div>
            <div>
              <label htmlFor="spa_moy_3bkl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Driebanden klein
              </label>
              <input
                id="spa_moy_3bkl"
                name="spa_moy_3bkl"
                type="number"
                step="0.001"
                min="0"
                value={formData.spa_moy_3bkl}
                onChange={handleChange}
                placeholder="0.000"
                aria-invalid={!!fieldErrors.spa_moy_3bkl}
                aria-describedby={fieldErrors.spa_moy_3bkl ? 'spa_moy_3bkl-error' : undefined}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors tabular-nums ${fieldErrors.spa_moy_3bkl ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
              />
              {fieldErrors.spa_moy_3bkl && (
                <p id="spa_moy_3bkl-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.spa_moy_3bkl}</p>
              )}
            </div>
            <div>
              <label htmlFor="spa_moy_3bgr" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Driebanden groot
              </label>
              <input
                id="spa_moy_3bgr"
                name="spa_moy_3bgr"
                type="number"
                step="0.001"
                min="0"
                value={formData.spa_moy_3bgr}
                onChange={handleChange}
                placeholder="0.000"
                aria-invalid={!!fieldErrors.spa_moy_3bgr}
                aria-describedby={fieldErrors.spa_moy_3bgr ? 'spa_moy_3bgr-error' : undefined}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors tabular-nums ${fieldErrors.spa_moy_3bgr ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
              />
              {fieldErrors.spa_moy_3bgr && (
                <p id="spa_moy_3bgr-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.spa_moy_3bgr}</p>
              )}
            </div>
            <div>
              <label htmlFor="spa_moy_kad" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Kader
              </label>
              <input
                id="spa_moy_kad"
                name="spa_moy_kad"
                type="number"
                step="0.001"
                min="0"
                value={formData.spa_moy_kad}
                onChange={handleChange}
                placeholder="0.000"
                aria-invalid={!!fieldErrors.spa_moy_kad}
                aria-describedby={fieldErrors.spa_moy_kad ? 'spa_moy_kad-error' : undefined}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors tabular-nums ${fieldErrors.spa_moy_kad ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
              />
              {fieldErrors.spa_moy_kad && (
                <p id="spa_moy_kad-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.spa_moy_kad}</p>
              )}
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
            onClick={() => router.push('/leden')}
            className="px-6 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
          >
            Annuleren
          </button>
        </div>
      </form>
    </div>
  );
}
