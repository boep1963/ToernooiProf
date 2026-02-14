'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DISCIPLINES } from '@/types';
import CompetitionSubNav from '@/components/CompetitionSubNav';

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
  hoogsteSerie: number;
  punten: number;
}

const PUNTEN_SYSTEMEN: Record<number, string> = {
  1: 'WRV 2-1-0',
  2: '10-punten',
  3: 'Belgisch (12-punten)',
};

export default function CompetitieStandPage() {
  const params = useParams();
  const router = useRouter();
  const { orgNummer, organization } = useAuth();
  const orgNaam = organization?.org_naam || '';

  const compNr = parseInt(params.id as string, 10);

  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const printRef = useRef<HTMLDivElement>(null);

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
        setStandings(data.standings || []);
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

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const orgName = orgNaam || 'ClubMatch';
    const compName = competition?.comp_naam || 'Competitie';
    const discipline = competition ? DISCIPLINES[competition.discipline] : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Stand - ${compName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #1e293b; }
          h1 { font-size: 18px; margin-bottom: 4px; }
          h2 { font-size: 14px; font-weight: normal; color: #64748b; margin-top: 0; margin-bottom: 16px; }
          .header-info { font-size: 12px; color: #64748b; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #f1f5f9; padding: 8px 6px; text-align: left; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
          th.right, td.right { text-align: right; }
          th.center, td.center { text-align: center; }
          td { padding: 6px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background: #f8fafc; }
          .rank { font-weight: 700; }
          .points { font-weight: 700; }
          .footer { margin-top: 16px; font-size: 10px; color: #94a3b8; }
          @media print { body { margin: 10mm; } }
        </style>
      </head>
      <body>
        <h1>${orgName} - ${compName}</h1>
        <h2>${discipline} | ${PUNTEN_SYSTEMEN[competition?.punten_sys || 1] || ''} | Periode ${selectedPeriod}</h2>
        <table>
          <thead>
            <tr>
              <th class="center">#</th>
              <th>Naam</th>
              <th class="center">P</th>
              <th class="right">Car.</th>
              <th class="right">Doel</th>
              <th class="right">%</th>
              <th class="right">Brt</th>
              <th class="right">Moy</th>
              <th class="right">HS</th>
              <th class="right">Pnt</th>
            </tr>
          </thead>
          <tbody>
            ${standings.map((entry) => `
              <tr>
                <td class="center rank">${entry.rank}</td>
                <td>${entry.playerName}</td>
                <td class="center">${entry.matchesPlayed}</td>
                <td class="right">${entry.carambolesGemaakt}</td>
                <td class="right">${entry.carambolesTeMaken}</td>
                <td class="right">${entry.percentage.toFixed(2)}</td>
                <td class="right">${entry.beurten}</td>
                <td class="right">${entry.moyenne.toFixed(3)}</td>
                <td class="right">${entry.hoogsteSerie}</td>
                <td class="right points">${entry.punten}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          Afgedrukt op ${new Date().toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} | ClubMatch
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
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
        <button
          onClick={() => router.push('/competities')}
          className="mt-4 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors"
        >
          Terug naar competities
        </button>
      </div>
    );
  }

  return (
    <div>
      <CompetitionSubNav compNr={compNr} compNaam={competition.comp_naam} />

      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Stand - {competition.comp_naam}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {DISCIPLINES[competition.discipline]} | {PUNTEN_SYSTEMEN[competition.punten_sys] || 'Onbekend'}
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800 flex items-center justify-between">
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
      <div className="mb-4 flex flex-wrap items-center gap-3">
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
            Er zijn nog geen uitslagen voor deze periode. Voer eerst uitslagen in.
          </p>
          <button
            onClick={() => router.push(`/competities/${compNr}/uitslagen`)}
            className="mt-4 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors text-sm"
          >
            Naar uitslagen
          </button>
        </div>
      )}

      {!isLoading && standings.length > 0 && (
        <div ref={printRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-10">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Naam</th>
                  <th className="text-center px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" title="Partijen gespeeld">P</th>
                  <th className="text-right px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" title="Caramboles gemaakt">Car.</th>
                  <th className="text-right px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" title="Caramboles te maken">Doel</th>
                  <th className="text-right px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" title="Percentage">%</th>
                  <th className="text-right px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" title="Beurten">Brt</th>
                  <th className="text-right px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" title="Moyenne">Moy</th>
                  <th className="text-right px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" title="Hoogste serie">HS</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" title="Punten">Pnt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {standings.map((entry, index) => (
                  <tr
                    key={entry.playerNr}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${
                      index === 0 ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
                    }`}
                  >
                    <td className="text-center px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                      {index === 0 && entry.matchesPlayed > 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-500 text-white text-xs rounded-full">
                          {entry.rank}
                        </span>
                      ) : (
                        entry.rank
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white">
                      {entry.playerName}
                    </td>
                    <td className="text-center px-2 py-2.5 text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {entry.matchesPlayed}
                    </td>
                    <td className="text-right px-2 py-2.5 text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {entry.carambolesGemaakt}
                    </td>
                    <td className="text-right px-2 py-2.5 text-sm text-slate-500 dark:text-slate-500 tabular-nums">
                      {entry.carambolesTeMaken}
                    </td>
                    <td className="text-right px-2 py-2.5 text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {entry.percentage.toFixed(2)}
                    </td>
                    <td className="text-right px-2 py-2.5 text-sm text-slate-500 dark:text-slate-500 tabular-nums">
                      {entry.beurten}
                    </td>
                    <td className="text-right px-2 py-2.5 text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {entry.moyenne.toFixed(3)}
                    </td>
                    <td className="text-right px-2 py-2.5 text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                      {entry.hoogsteSerie}
                    </td>
                    <td className="text-right px-3 py-2.5 text-sm font-bold text-green-700 dark:text-green-400 tabular-nums">
                      {entry.punten}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {standings.length} {standings.length === 1 ? 'speler' : 'spelers'} | Periode {selectedPeriod}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Sortering: punten &gt; percentage &gt; moyenne &gt; hoogste serie
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
