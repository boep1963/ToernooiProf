'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import CompetitionSubNav from '@/components/CompetitionSubNav';

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  details?: string;
}

interface ValidationReport {
  competition: {
    comp_nr: number;
    comp_naam: string;
    periode: number;
  };
  timestamp: string;
  totalIssues: number;
  errors: number;
  warnings: number;
  info: number;
  issues: ValidationIssue[];
  summary: {
    totalPlayers: number;
    totalMatches: number;
    totalResults: number;
    checkedPlayers: number;
    checkedMatches: number;
    checkedResults: number;
  };
}

export default function CompetitionControlePage() {
  const params = useParams();
  const router = useRouter();
  const { orgNummer } = useAuth();
  const compNr = parseInt(params.id as string, 10);

  const [report, setReport] = useState<ValidationReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const runValidation = async () => {
    if (!orgNummer || isNaN(compNr)) return;

    setIsValidating(true);
    setError('');

    try {
      const res = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/validate`);

      if (res.ok) {
        const data = await res.json();
        setReport(data);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Er is een fout opgetreden bij de validatie.');
      }
    } catch {
      setError('Er is een fout opgetreden bij de validatie.');
    } finally {
      setIsValidating(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runValidation();
  }, [orgNummer, compNr]);

  if (isLoading) {
    return (
      <div>
        <CompetitionSubNav compNr={compNr} compNaam="Competitie" />
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Validatie uitvoeren...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <CompetitionSubNav compNr={compNr} compNaam="Competitie" />
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
            <button
              onClick={runValidation}
              disabled={isValidating}
              className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Opnieuw proberen
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div>
        <CompetitionSubNav compNr={compNr} compNaam="Competitie" />
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">Geen validatierapport beschikbaar.</p>
        </div>
      </div>
    );
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return (
          <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-5 h-5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div>
      <CompetitionSubNav compNr={compNr} compNaam={report.competition.comp_naam} periode={report.competition.periode} />

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              Data Controle
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Validatie van {report.competition.comp_naam}
            </p>
          </div>
          <button
            onClick={runValidation}
            disabled={isValidating}
            className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isValidating ? 'Bezig...' : 'Opnieuw controleren'}
          </button>
        </div>
      </div>

      {/* Explanation Section */}
      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800 p-5 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
              Wat wordt er gecontroleerd?
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
              Deze controle valideert de consistentie van uw competitiedata. Er worden checks uitgevoerd op:
              <span className="font-medium"> spelersgegevens</span> (duplicaten, ontbrekende namen),
              <span className="font-medium"> wedstrijdplanning</span> (conflicten, missende wedstrijden), en
              <span className="font-medium"> uitslagen</span> (onmogelijke scores, inconsistenties).
              <strong className="block mt-1">Fouten</strong> zijn kritieke problemen die opgelost moeten worden.
              <strong>Waarschuwingen</strong> zijn aandachtspunten die mogelijk actie vereisen.
              <strong>Informatie</strong> items zijn slechts ter info en geen problemen.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border ${(report.errors + report.warnings) === 0 ? 'border-green-200 dark:border-green-800' : 'border-slate-200 dark:border-slate-700'} p-5`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Totaal Problemen
              </p>
              <p className={`text-2xl font-bold ${(report.errors + report.warnings) === 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>
                {report.errors + report.warnings}
              </p>
            </div>
            {(report.errors + report.warnings) === 0 && (
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Fouten
          </p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{report.errors}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Waarschuwingen
          </p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{report.warnings}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Informatie
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{report.info}</p>
        </div>
      </div>

      {/* Data Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Data Overzicht
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-700 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Spelers</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {report.summary.totalPlayers}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-700 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Wedstrijden</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {report.summary.totalMatches}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-700 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Uitslagen</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {report.summary.totalResults}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Results */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Validatie Resultaten
        </h2>

        {report.totalIssues === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Alles in orde!
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Er zijn geen problemen gevonden met de competitiedata.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Problems Section */}
            {(report.errors + report.warnings) > 0 && (
              <div>
                <h3 className="text-md font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Problemen ({report.errors + report.warnings})
                </h3>
                <div className="space-y-3">
                  {report.issues.filter(issue => issue.type === 'error' || issue.type === 'warning').map((issue, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      {getIssueIcon(issue.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                              {issue.category}
                            </p>
                            <p className="text-sm text-slate-900 dark:text-white">
                              {issue.message}
                            </p>
                            {issue.details && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {issue.details}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informatie Section */}
            {report.info > 0 && (
              <div>
                <h3 className="text-md font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Informatief ({report.info})
                </h3>
                <div className="space-y-3">
                  {report.issues.filter(issue => issue.type === 'info').map((issue, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      {getIssueIcon(issue.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                              {issue.category}
                            </p>
                            <p className="text-sm text-slate-900 dark:text-white">
                              {issue.message}
                            </p>
                            {issue.details && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {issue.details}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timestamp */}
      <div className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
        Laatste controle: {new Date(report.timestamp).toLocaleString('nl-NL', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })}
      </div>
    </div>
  );
}
