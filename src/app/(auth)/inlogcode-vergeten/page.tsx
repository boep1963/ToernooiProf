'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import logo from '../../../../public/ToernooiProf.png';
import ThemeToggle from '@/components/ThemeToggle';
import { apiFetch } from '@/lib/api';

export default function ForgotLoginCodePage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; already_sent?: boolean; sent_at?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsLoading(true);

    if (!email.trim()) {
      setError('Vul uw e-mailadres in.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiFetch('/api/auth/forgot-login-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult({
          success: data.success,
          message: data.message || 'Als dit e-mailadres bij een account hoort, is de inlogcode verzonden.',
          already_sent: data.already_sent,
          sent_at: data.sent_at,
        });
      } else {
        setError(data.error || 'Er is een fout opgetreden. Probeer het later opnieuw.');
      }
    } catch {
      setError('Er is een fout opgetreden. Probeer het later opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pt-4 pb-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Image
                src={logo}
                alt="ToernooiProf"
                width={140}
                height={140}
                className="w-[120px] h-auto object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              ToernooiProf
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Inlogcode vergeten
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 p-8 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Vul het e-mailadres waarmee u bij ToernooiProf bent geregistreerd. Als er minder dan een week geleden al een inlogcode is verstuurd, krijgt u een melding met de datum.
            </p>

            {error && (
              <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800 flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError('')} className="ml-3 text-red-500 hover:text-red-700 dark:hover:text-red-300 flex-shrink-0" aria-label="Sluiten">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}

            {result && (
              <div
                role="status"
                className={`mb-4 p-3 rounded-lg text-sm border ${
                  result.already_sent
                    ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800'
                    : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200 border-green-200 dark:border-green-800'
                }`}
              >
                {result.message}
              </div>
            )}

            {!result && (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    autoComplete="email"
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 dark:disabled:bg-orange-800 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  {isLoading ? 'Bezig...' : 'Inlogcode versturen'}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link href="/inloggen" className="text-sm text-orange-600 dark:text-orange-400 hover:underline">
                Terug naar inloggen
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a
              href="https://biljart.app"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              Terug naar biljart.app
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
