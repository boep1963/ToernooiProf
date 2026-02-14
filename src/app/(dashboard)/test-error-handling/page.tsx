'use client';

import { useState } from 'react';

/**
 * Test page for Feature #96: API 500 error handled gracefully
 * This page intentionally triggers a 500 error to verify error handling
 */
export default function TestErrorHandlingPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const triggerError = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/test-error');
      if (res.ok) {
        setSuccess('Aanroep succesvol (dit zou niet moeten gebeuren)');
      } else {
        // Parse error message from API response
        const data = await res.json();
        setError(data.error || 'Er is een fout opgetreden.');
      }
    } catch (err) {
      setError('Netwerkfout bij het verbinden met de server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Test: Foutafhandeling
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Deze pagina test of 500 fouten correct worden afgehandeld met gebruiksvriendelijke berichten.
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-3 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            aria-label="Melding sluiten"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {success && (
        <div role="status" className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm border border-green-200 dark:border-green-800">
          {success}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
          500 Fout Trigger
        </h2>
        <p className="mb-4 text-slate-600 dark:text-slate-400">
          Klik op de knop hieronder om een intentionele 500 serverfout te triggeren.
          Er zou een gebruiksvriendelijk Nederlands bericht moeten verschijnen, geen technische stacktrace.
        </p>
        <button
          onClick={triggerError}
          disabled={isLoading}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors shadow-sm disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Bezig...
            </span>
          ) : (
            'Trigger 500 Fout'
          )}
        </button>

        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">Verificatiestappen:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>Foutmelding verschijnt in Nederlands</li>
            <li>Geen technische stacktrace zichtbaar voor gebruiker</li>
            <li>Pagina blijft navigeerbaar</li>
            <li>Andere functies werken nog steeds</li>
            <li>Sluitknop (X) werkt om melding te verwijderen</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-300">Navigatietest</h3>
        <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
          Test of de pagina navigeerbaar blijft na een fout:
        </p>
        <div className="flex gap-2">
          <a
            href="/dashboard"
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            Ga naar Dashboard
          </a>
          <a
            href="/leden"
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            Ga naar Leden
          </a>
        </div>
      </div>
    </div>
  );
}
