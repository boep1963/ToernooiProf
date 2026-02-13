'use client';

import React, { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<'code' | 'email'>('code');
  const [loginCode, setLoginCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: loginCode }),
      });

      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        const data = await res.json();
        setError(data.error || 'Ongeldige inlogcode. Probeer het opnieuw.');
      }
    } catch {
      setError('Er is een fout opgetreden. Probeer het later opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        const data = await res.json();
        setError(data.error || 'Ongeldig e-mailadres of wachtwoord.');
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
            Biljart Competitie Beheer
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 p-8 border border-slate-200 dark:border-slate-700">
          {/* Login method tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
            <button
              type="button"
              onClick={() => { setLoginMethod('code'); setError(''); }}
              className={`flex-1 pb-3 pt-2 min-h-[44px] text-sm font-medium border-b-2 transition-colors ${
                loginMethod === 'code'
                  ? 'border-green-700 text-green-700 dark:text-green-400 dark:border-green-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Inlogcode
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setError(''); }}
              className={`flex-1 pb-3 pt-2 min-h-[44px] text-sm font-medium border-b-2 transition-colors ${
                loginMethod === 'email'
                  ? 'border-green-700 text-green-700 dark:text-green-400 dark:border-green-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              E-mail / Wachtwoord
            </button>
          </div>

          {error && (
            <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {loginMethod === 'code' ? (
            <form onSubmit={handleCodeLogin} className="space-y-4">
              <div>
                <label htmlFor="loginCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Inlogcode
                </label>
                <input
                  id="loginCode"
                  type="text"
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value)}
                  placeholder="Bijv. 1205_AAY@#"
                  required
                  aria-required="true"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-green-700 hover:bg-green-800 disabled:bg-green-400 dark:disabled:bg-green-800 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                {isLoading ? 'Bezig met inloggen...' : 'Inloggen'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-4">
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
                  aria-required="true"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Wachtwoord
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-required="true"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-green-700 hover:bg-green-800 disabled:bg-green-400 dark:disabled:bg-green-800 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                {isLoading ? 'Bezig met inloggen...' : 'Inloggen'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <a href="/registreren" className="text-sm text-green-700 dark:text-green-400 hover:underline inline-flex items-center min-h-[44px]">
              Nog geen account? Registreer hier
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
