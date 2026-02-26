'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const PROGRAMMA_OPTIES = ['ClubMatch', 'ToernooiProf'];

const ONDERWERP_OPTIES = [
  { value: 'vraag', label: 'Vraag' },
  { value: 'klacht', label: 'Klacht' },
  { value: 'suggestie', label: 'Suggestie' },
];

export default function ContactPage() {
  const { organization } = useAuth();
  const [programma, setProgramma] = useState('');
  const [onderwerp, setOnderwerp] = useState('vraag');
  const [bericht, setBericht] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (success && successRef.current) {
      successRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate programma (required)
    if (!programma) {
      setError('Selecteer een programma.');
      return;
    }

    // Validate onderwerp (subject)
    if (!onderwerp) {
      setError('Selecteer een onderwerp.');
      return;
    }

    // Validate bericht (message)
    if (!bericht || !bericht.trim()) {
      setError('Vul een bericht in.');
      return;
    }

    if (bericht.length > 1000) {
      setError('Bericht mag maximaal 1000 tekens zijn.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programma, onderwerp, bericht }),
      });

      if (res.ok) {
        setSuccess('Uw bericht is succesvol verzonden. Wij nemen zo snel mogelijk contact met u op.');
        setBericht('');
        setProgramma('');
        setOnderwerp('vraag');
      } else {
        const data = await res.json();
        setError(data.error || 'Fout bij verzenden bericht.');
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Contact
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Neem contact met ons op voor vragen, suggesties of ondersteuning.
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
        <div ref={successRef} role="status" className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm border border-green-200 dark:border-green-800 flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="ml-3 text-green-500 hover:text-green-700 dark:hover:text-green-300 transition-colors" aria-label="Melding sluiten">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Sender info card (read-only) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Afzendergegevens
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Vereniging
              </label>
              <div className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 text-sm">
                {organization?.org_naam || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Contactpersoon
              </label>
              <div className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 text-sm">
                {organization?.org_wl_naam || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                E-mailadres
              </label>
              <div className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 text-sm">
                {organization?.org_wl_email || '-'}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                Antwoord wordt naar dit adres verzonden.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Inlogcode
              </label>
              <div className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 text-sm font-mono">
                {organization?.org_code || '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Contact form card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Contactformulier
          </h2>

          <div className="space-y-4">
            {/* Programma dropdown (required) */}
            <div>
              <label htmlFor="programma" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Programma <span className="text-red-500">*</span>
              </label>
              <select
                id="programma"
                value={programma}
                onChange={(e) => setProgramma(e.target.value)}
                required
                aria-required="true"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
              >
                <option value="">-- Kies een programma --</option>
                {PROGRAMMA_OPTIES.map((optie) => (
                  <option key={optie} value={optie}>{optie}</option>
                ))}
              </select>
            </div>

            {/* Subject dropdown */}
            <div>
              <label htmlFor="onderwerp" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Onderwerp <span className="text-red-500">*</span>
              </label>
              <select
                id="onderwerp"
                value={onderwerp}
                onChange={(e) => setOnderwerp(e.target.value)}
                required
                aria-required="true"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
              >
                {ONDERWERP_OPTIES.map((optie) => (
                  <option key={optie.value} value={optie.value}>{optie.label}</option>
                ))}
              </select>
            </div>

            {/* Message textarea */}
            <div>
              <label htmlFor="bericht" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Bericht <span className="text-red-500">*</span>
              </label>
              <textarea
                id="bericht"
                value={bericht}
                onChange={(e) => setBericht(e.target.value)}
                maxLength={1000}
                rows={6}
                placeholder="Typ hier uw bericht..."
                required
                aria-required="true"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors resize-y"
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Maximaal 1000 tekens
                </p>
                <p className={`text-xs ${bericht.length > 900 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-500'}`}>
                  {bericht.length}/1000
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !programma || !onderwerp || !bericht.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verzenden...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Verstuur bericht
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
