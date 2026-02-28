'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { DISCIPLINES } from '@/types';
import CompetitionSubNav from '@/components/CompetitionSubNav';
import { formatDecimal } from '@/lib/formatUtils';

interface CompetitionData {
  id: string;
  comp_nr: number;
  comp_naam: string;
  comp_datum: string;
  discipline: number;
  punten_sys: number;
  moy_form: number;
  min_car: number;
  max_beurten: number;
  vast_beurten: number;
  sorteren: number;
  periode: number;
}

interface StandingEntry {
  rank: number;
  playerName: string;
  playerNr: number;
  matchesPlayed: number;
  carambolesGemaakt: number;
  carambolesTeMaken: number;
  percentage: number;
  beurten: number;
  moyenne: number;
  partijMoyenne: number;
  hoogsteSerie: number;
  punten: number;
  percentagePunten?: number; // Percentage of points earned vs possible
}

const PUNTEN_SYSTEMEN: Record<number, string> = {
  1: 'WRV 2-1-0',
  2: '10-punten',
  3: 'Belgisch (12-punten)',
};

function getPuntenSysLabel(punten_sys: number): string {
  const baseSys = punten_sys >= 10000 ? Math.floor(punten_sys / 10000) : punten_sys;
  return PUNTEN_SYSTEMEN[baseSys] || '';
}

/**
 * Maximaal te behalen punten in één partij op basis van puntensysteem.
 * WRV = 2 (of 3 bij extra punt boven moyenne), 10-punten = 10, Belgisch = 12.
 */
function getMaxPointsPerMatch(punten_sys: number): number {
  const baseSys = punten_sys >= 10000 ? Math.floor(punten_sys / 10000) : punten_sys;
  if (baseSys === 1) {
    // WRV: 3 als bonus (extra punt boven moyenne) actief, anders 2
    const hasBonus = punten_sys >= 11000; // 11xxx = winst-/remise-/verliesbonus
    return hasBonus ? 3 : 2;
  }
  if (baseSys === 2) return 10;
  if (baseSys === 3) return 12;
  return 2;
}

export default function CompetitieStandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { orgNummer, organization } = useAuth();
  const orgNaam = organization?.org_naam || '';

  const compNr = parseInt(id, 10);

  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [sortByPercentage, setSortByPercentage] = useState(false); // false = absolute points, true = percentage points

  // Add print styles on mount
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page {
          size: A4 portrait;
          margin: 1.5cm;
        }
        body {
          background: white !important;
          color: black !important;
        }
        /* Hide navigation and UI elements */
        nav, aside, header, footer, .print\\:hidden {
          display: none !important;
        }
        /* Show print-only elements */
        .hidden.print\\:block {
          display: block !important;
        }
        /* Show only the main content */
        main {
          margin: 0 !important;
          padding: 0 !important;
        }
        /* Table styling */
        table {
          page-break-inside: auto;
          border-collapse: collapse;
          width: 100%;
        }
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        thead {
          display: table-header-group;
        }
        /* Preserve colors in print */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const fetchCompetition = useCallback(async () => {
    if (!orgNummer || isNaN(compNr)) return;
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`);
      if (res.ok) {
        const data = await res.json();
        setCompetition(data);
        setSelectedPeriod(data.periode || 1);
        return data;
      } else {
        setError('Competitie niet gevonden.');
      }
    } catch {
      setError('Er is een fout opgetreden.');
    }
    return null;
  }, [orgNummer, compNr]);

  const fetchStandings = useCallback(async (period: number) => {
    if (!orgNummer || isNaN(compNr)) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/standings/${period}`);
      if (res.ok) {
        const data = await res.json();
        const standingsData = data.standings || [];
        const punten_sys = Number(data.competition?.punten_sys) || 1;
        const maxPointsPerMatch = getMaxPointsPerMatch(punten_sys);

        const standingsWithPercentage = standingsData.map((entry: StandingEntry) => {
          const totaalpunten_max = maxPointsPerMatch * entry.matchesPlayed;
          const percentagePunten = totaalpunten_max > 0
            ? (entry.punten / totaalpunten_max) * 100
            : 0;
          return {
            ...entry,
            percentagePunten: Math.floor(percentagePunten * 1000) / 1000,
          };
        });

        setStandings(standingsWithPercentage);
      } else {
        const data = await res.json();
        setError(data.error || 'Fout bij laden stand.');
      }
    } catch {
      setError('Er is een fout opgetreden bij het laden.');
    } finally {
      setIsLoading(false);
    }
  }, [orgNummer, compNr]);

  useEffect(() => {
    const init = async () => {
      const comp = await fetchCompetition();
      if (comp) {
        await fetchStandings(comp.periode || 1);
      } else {
        setIsLoading(false);
      }
    };
    init();
  }, [fetchCompetition, fetchStandings]);

  const handlePeriodChange = async (period: number) => {
    setSelectedPeriod(period);
    await fetchStandings(period);
  };

  // Sort standings based on current sort mode
  const sortedStandings = React.useMemo(() => {
    if (!standings || standings.length === 0) return [];

    const sorted = [...standings];

    if (sortByPercentage) {
      // Sort by percentage points first, then tiebreakers
      sorted.sort((a, b) => {
        const percA = a.percentagePunten || 0;
        const percB = b.percentagePunten || 0;
        if (percB !== percA) return percB - percA;
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        if (b.moyenne !== a.moyenne) return b.moyenne - a.moyenne;
        return b.hoogsteSerie - a.hoogsteSerie;
      });
    } else {
      // Sort by absolute points (default)
      sorted.sort((a, b) => {
        if (b.punten !== a.punten) return b.punten - a.punten;
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        if (b.moyenne !== a.moyenne) return b.moyenne - a.moyenne;
        return b.hoogsteSerie - a.hoogsteSerie;
      });
    }

    // Re-assign ranks after sorting
    return sorted.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }, [standings, sortByPercentage]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading && !competition) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
        <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 dark:text-slate-400">Laden...</p>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
        <p className="text-slate-600 dark:text-slate-400">Competitie niet gevonden.</p>
        <Link
          href="/competities"
          className="mt-4 inline-block px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors"
        >
          Naar competitieoverzicht
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="print:hidden">
        <CompetitionSubNav compNr={compNr} compNaam={competition.comp_naam} periode={competition.periode || 1} />
      </div>

      {/* Print-only header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold mb-2">{orgNaam || 'ClubMatch'} - {competition.comp_naam}</h1>
        <div className="text-sm mb-2">
          {DISCIPLINES[competition.discipline]}{getPuntenSysLabel(competition.punten_sys) ? ` | ${getPuntenSysLabel(competition.punten_sys)}` : ''} | {selectedPeriod === 0 ? 'Totaal (alle perioden)' : `Periode ${selectedPeriod}`}
        </div>
        <div className="text-sm text-gray-600">
          Afgedrukt: <span suppressHydrationWarning>{new Date().toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })},{' '}
          {new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="border-b-2 border-gray-300 mt-3 mb-4"></div>
      </div>

      <div className="mb-4 print:hidden">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Stand - {competition.comp_naam}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {DISCIPLINES[competition.discipline]}{getPuntenSysLabel(competition.punten_sys) ? ` | ${getPuntenSysLabel(competition.punten_sys)}` : ''}
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800 flex items-center justify-between">
          <span>{error}</span>
          <div className="flex items-center gap-2 ml-3">
            <button onClick={() => fetchStandings(selectedPeriod)} className="text-xs px-2.5 py-1 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300 rounded-md transition-colors font-medium flex-shrink-0">
              Opnieuw proberen
            </button>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors flex-shrink-0" aria-label="Melding sluiten">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Period selector and actions */}
      <div className="mb-4 flex flex-wrap items-center gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <label htmlFor="period-select" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Periode:
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                disabled={isLoading}
                className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === p
                    ? 'bg-green-700 text-white shadow-sm'
                    : p <= (competition.periode || 1)
                    ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => handlePeriodChange(0)}
              disabled={isLoading}
              className={`px-3 h-8 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 0
                  ? 'bg-green-700 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
              }`}
            >
              Totaal
            </button>
          </div>
        </div>

        {/* Sort mode toggle */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Sortering:
          </label>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setSortByPercentage(false)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                !sortByPercentage
                  ? 'bg-white dark:bg-slate-600 text-green-700 dark:text-green-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Punten
            </button>
            <button
              onClick={() => setSortByPercentage(true)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                sortByPercentage
                  ? 'bg-white dark:bg-slate-600 text-green-700 dark:text-green-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              % Punten
            </button>
          </div>
        </div>

        <div className="ml-auto flex gap-2">
          <button
            onClick={() => fetchStandings(selectedPeriod)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Vernieuwen
          </button>
          <button
            onClick={handlePrint}
            disabled={standings.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Afdrukken / Exporteren
          </button>
        </div>
      </div>

      {/* Loading spinner */}
      {isLoading && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Stand berekenen...</p>
        </div>
      )}

      {/* Standings Table */}
      {!isLoading && standings.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Er zijn nog geen uitslagen voor deze periode. Voer eerst uitslagen in via de Matrix.
          </p>
          <button
            onClick={() => router.push(`/competities/${compNr}/matrix`)}
            className="mt-4 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors text-sm"
          >
            Naar Matrix
          </button>
        </div>
      )}

      {!isLoading && standings.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-10">Pos</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Naam</th>
                  {sortByPercentage ? (
                    <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" title="Percentage punten">% Pnt</th>
                  ) : (
                    <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" title="Punten">Pnt</th>
                  )}
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" title="Partijen gespeeld">Part</th>
                  <th className="text-right px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" title="Caramboles gemaakt">Car.</th>
                  <th className="text-right px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" title="Percentage caramboles">% Car</th>
                  <th className="text-right px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" title="Beurten">Brt</th>
                  <th className="text-right px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" title="Moyenne">Moy</th>
                  <th className="text-right px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" title="Partij Moyenne">P.moy</th>
                  <th className="text-right px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" title="Hoogste serie">HS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {sortedStandings.map((entry, index) => (
                  <tr
                    key={entry.playerNr}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="text-center px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                      {entry.matchesPlayed > 0 && entry.rank >= 1 && entry.rank <= 3 ? (
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 text-white text-xs rounded-full ${
                            entry.rank === 1 ? 'bg-green-700' :
                            entry.rank === 2 ? 'bg-green-600' :
                            'bg-green-500'
                          }`}
                        >
                          {entry.rank}
                        </span>
                      ) : (
                        entry.rank
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white">
                      {entry.playerName}
                    </td>
                    {sortByPercentage ? (
                      <td className="text-right px-3 py-2.5 text-sm font-bold text-blue-700 dark:text-blue-400 tabular-nums">
                        {formatDecimal(entry.percentagePunten)}%
                      </td>
                    ) : (
                      <td className="text-right px-3 py-2.5 text-sm font-bold text-green-700 dark:text-green-400 tabular-nums">
                        {entry.punten}
                      </td>
                    )}
                    <td className="text-center px-2 py-2.5 text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {entry.matchesPlayed}
                    </td>
                    <td className="text-right px-2 py-2.5 text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {entry.carambolesGemaakt}
                    </td>
                    <td className="text-right px-2 py-2.5 text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {formatDecimal(entry.percentage)}
                    </td>
                    <td className="text-right px-2 py-2.5 text-sm text-slate-500 dark:text-slate-500 tabular-nums">
                      {entry.beurten}
                    </td>
                    <td className="text-right px-2 py-2.5 text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {formatDecimal(entry.moyenne)}
                    </td>
                    <td className="text-right px-2 py-2.5 text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {formatDecimal(entry.partijMoyenne)}
                    </td>
                    <td className="text-right px-2 py-2.5 text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {entry.hoogsteSerie}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {standings.length} {standings.length === 1 ? 'speler' : 'spelers'} | {selectedPeriod === 0 ? 'Totaal (alle perioden)' : `Periode ${selectedPeriod}`}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {sortByPercentage
                ? 'Sortering: % punten > moyenne > hoogste serie'
                : 'Sortering: punten > moyenne > hoogste serie'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
