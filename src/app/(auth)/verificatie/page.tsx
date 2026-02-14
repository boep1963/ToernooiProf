'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

function VerificationPageContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState(emailParam);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<{
    org_code: string;
    org_naam: string;
    org_nummer: number;
  } | null>(null);

  // Fetch email from session if not provided in URL params
  useEffect(() => {
    if (!emailParam) {
      fetch('/api/auth/session')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.organization?.org_wl_email) {
            setEmail(data.organization.org_wl_email);
          }
        })
        .catch(() => {});
    }
  }, [emailParam]);

  // Focus the verification code input on mount
  useEffect(() => {
    const input = document.getElementById('verificationCode');
    if (input) input.focus();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!verificationCode.trim()) {
      setError('Voer de verificatiecode in.');
      setIsLoading(false);
      return;
    }

    if (!email) {
      setError('E-mailadres ontbreekt. Ga terug naar de registratiepagina.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          verification_code: verificationCode.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess({
          org_code: data.org_code,
          org_naam: data.org_naam,
          org_nummer: data.org_nummer,
        });
      } else {
        setError(data.error || 'Verificatie mislukt. Probeer het opnieuw.');
        if (data.already_verified) {
          // Already verified - redirect to login after a short delay
          setTimeout(() => {
            window.location.href = '/inloggen';
          }, 2000);
        }
      }
    } catch {
      setError('Er is een fout opgetreden. Probeer het later opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success state - show login code and link to dashboard
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 relative">
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
              Verificatie voltooid!
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 p-8 border border-slate-200 dark:border-slate-700">
            <div className="text-center space-y-4">
              {/* Success icon */}
              <div className="flex items-center justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Welkom, {success.org_naam}!
              </h2>

              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Uw e-mailadres is geverifieerd. Hieronder vindt u uw inlogcode.
                Bewaar deze goed!
              </p>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Uw inlogcode:</p>
                <p className="text-2xl font-mono font-bold text-green-700 dark:text-green-400 tracking-wider select-all">
                  {success.org_code}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Organisatienummer: {success.org_nummer}
                </p>
              </div>

              <p className="text-xs text-amber-600 dark:text-amber-400">
                Let op: Noteer uw inlogcode. U heeft deze nodig om in te loggen.
              </p>

              <a
                href="/dashboard"
                className="block w-full py-2.5 px-4 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors shadow-sm text-center min-h-[44px] leading-[28px]"
              >
                Ga naar Dashboard
              </a>

              <a
                href="/inloggen"
                className="block text-sm text-slate-500 dark:text-slate-400 hover:text-green-700 dark:hover:text-green-400 hover:underline min-h-[44px] leading-[44px]"
              >
                Naar inlogpagina
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            E-mail verificatie
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 p-8 border border-slate-200 dark:border-slate-700">
          <div className="text-center mb-6">
            {/* Email icon */}
            <div className="flex items-center justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Er is een verificatiecode verzonden naar:
            </p>
            <p className="font-medium text-slate-900 dark:text-white mt-1">
              {email || '(onbekend e-mailadres)'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              De code is 15 minuten geldig. Check ook uw spam/ongewenst map.
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              (Ontwikkelmodus: de code staat in de server terminal)
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Verificatiecode
              </label>
              <input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Bijv. 12345"
                required
                maxLength={10}
                autoComplete="one-time-code"
                aria-required="true"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors text-center text-2xl font-mono tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-green-700 hover:bg-green-800 disabled:bg-green-400 dark:disabled:bg-green-800 text-white font-medium rounded-lg transition-colors shadow-sm min-h-[44px]"
            >
              {isLoading ? 'Bezig met verifiëren...' : 'Verifiëren'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <a href="/registreren" className="text-sm text-green-700 dark:text-green-400 hover:underline inline-flex items-center min-h-[44px]">
              Opnieuw registreren
            </a>
            <span className="text-slate-300 dark:text-slate-600 mx-2">|</span>
            <a href="/inloggen" className="text-sm text-green-700 dark:text-green-400 hover:underline inline-flex items-center min-h-[44px]">
              Inloggen
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function VerificationPage(_props: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Laden...</p>
        </div>
      </div>
    }>
      <VerificationPageContent />
    </Suspense>
  );
}
