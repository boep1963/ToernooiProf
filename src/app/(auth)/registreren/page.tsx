'use client';

import React, { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

export default function RegisterPage() {
  const [orgNaam, setOrgNaam] = useState('');
  const [contactPersoon, setContactPersoon] = useState('');
  const [email, setEmail] = useState('');
  const [aantalTafels, setAantalTafels] = useState('4');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);
    setIsLoading(true);

    // Client-side validation
    const errors: string[] = [];
    if (orgNaam.trim().length < 5 || orgNaam.trim().length > 30) {
      errors.push('Naam organisatie moet minimaal 5 en maximaal 30 tekens bevatten.');
    }
    if (contactPersoon.trim().length < 5 || contactPersoon.trim().length > 30) {
      errors.push('Naam contactpersoon moet minimaal 5 en maximaal 30 tekens bevatten.');
    }
    if (email.trim().length < 5 || email.trim().length > 50) {
      errors.push('E-mailadres moet minimaal 5 en maximaal 50 tekens bevatten.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && !emailRegex.test(email.trim())) {
      errors.push('E-mailadres heeft geen geldig formaat.');
    }

    if (errors.length > 0) {
      setFieldErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_naam: orgNaam.trim(),
          org_wl_naam: contactPersoon.trim(),
          org_wl_email: email.trim(),
          aantal_tafels: Number(aantalTafels),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect to verification page with email
        window.location.href = `/verificatie?email=${encodeURIComponent(email.trim())}`;
        return;
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          setFieldErrors(data.errors);
        } else {
          setError(data.error || 'Er is een fout opgetreden bij het registreren.');
        }
      }
    } catch {
      setError('Er is een fout opgetreden. Probeer het later opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 relative">
      {/* Theme toggle in top-right corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 rounded-xl bg-green-700 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">CM</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            ClubMatch
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Account aanmaken
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 p-8 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            U kunt hier gratis een account aanmaken, waarna u ClubMatch Online onbeperkt kunt gebruiken. Vul de gegevens hieronder in en klik op &quot;Registreren&quot;.
          </p>

          {/* Error messages */}
          {error && (
            <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-3 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors flex-shrink-0" aria-label="Melding sluiten">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          {fieldErrors.length > 0 && (
            <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800 flex items-start justify-between">
              <ul className="list-disc pl-4 space-y-1">
                {fieldErrors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
              <button onClick={() => setFieldErrors([])} className="ml-3 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors flex-shrink-0 mt-0.5" aria-label="Melding sluiten">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="orgNaam" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Naam organisatie (of clubnaam)
              </label>
              <input
                id="orgNaam"
                type="text"
                value={orgNaam}
                onChange={(e) => setOrgNaam(e.target.value)}
                placeholder="Bijv. Biljartclub De Stoter"
                required
                minLength={5}
                maxLength={30}
                aria-required="true"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">5 - 30 tekens, wordt getoond in het programma</p>
            </div>

            <div>
              <label htmlFor="contactPersoon" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Naam contactpersoon
              </label>
              <input
                id="contactPersoon"
                type="text"
                value={contactPersoon}
                onChange={(e) => setContactPersoon(e.target.value)}
                placeholder="Bijv. Jan de Vries"
                required
                minLength={5}
                maxLength={30}
                aria-required="true"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">5 - 30 tekens, wordt gebruikt voor contact</p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                E-mailadres
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="uw@email.nl"
                required
                maxLength={50}
                aria-required="true"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Max 50 tekens, wordt gebruikt voor contact</p>
            </div>

            <div>
              <label htmlFor="aantalTafels" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Aantal biljarttafels
              </label>
              <select
                id="aantalTafels"
                value={aantalTafels}
                onChange={(e) => setAantalTafels(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Wordt gebruikt bij het toekennen van partijen aan tafels (later aanpasbaar)</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-green-700 hover:bg-green-800 disabled:bg-green-400 dark:disabled:bg-green-800 text-white font-medium rounded-lg transition-colors shadow-sm min-h-[44px]"
            >
              {isLoading ? 'Bezig met registreren...' : 'Registreren'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/inloggen" className="text-sm text-green-700 dark:text-green-400 hover:underline inline-flex items-center min-h-[44px]">
              Al een account? Inloggen
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
