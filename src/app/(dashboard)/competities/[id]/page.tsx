'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { DISCIPLINES, MOYENNE_MULTIPLIERS } from '@/types';
import CompetitionSubNav from '@/components/CompetitionSubNav';
import { formatDate } from '@/lib/dateUtils';

interface CompetitionData {
  id: string;
  comp_nr: number;
  comp_naam: string;
  comp_datum: string;
  discipline: number;
  periode: number;
  punten_sys: number;
  moy_form: number;
  min_car: number;
  max_beurten: number;
  vast_beurten: number;
  sorteren: number;
}

const PUNTEN_SYSTEMEN: Record<number, string> = {
  1: 'WRV 2-1-0',
  2: '10-punten',
  3: 'Belgisch (12-punten)',
};

// Decode WRV punten_sys to check for bonuses
// Format: 1XYZW where X=bonus flag, Y=unused, Z=remise bonus, W=verlies bonus
// 10000 = WRV no bonuses, 11100 = WRV with bonuses enabled (winst always on)
// 11110 = +remise, 11101 = +verlies, 11111 = all bonuses
function decodePuntenSys(punten_sys: number): string {
  const puntenSysStr = String(punten_sys);

  // Check if it's a base system (1, 2, 3)
  if (punten_sys <= 3) {
    return PUNTEN_SYSTEMEN[punten_sys] || '-';
  }

  // Check if it's WRV with bonuses (starts with 1)
  if (puntenSysStr.startsWith('1')) {
    const hasBonuses = puntenSysStr.length >= 5 && puntenSysStr[1] === '1';

    if (!hasBonuses) {
      return 'WRV 2-1-0';
    }

    // Parse bonus flags
    const bonusRemise = puntenSysStr.length >= 4 && puntenSysStr[3] === '1';
    const bonusVerlies = puntenSysStr.length >= 5 && puntenSysStr[4] === '1';

    const bonuses = ['winst'];
    if (bonusRemise) bonuses.push('remise');
    if (bonusVerlies) bonuses.push('verlies');

    return `WRV 2-1-0 + bonus (${bonuses.join(', ')})`;
  }

  return PUNTEN_SYSTEMEN[punten_sys] || '-';
}

const SORTEREN_LABELS: Record<number, string> = {
  1: 'Voornaam eerst',
  2: 'Achternaam eerst',
};

export default function CompetitieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { orgNummer } = useAuth();
  const compNr = parseInt(params.id as string, 10);

  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCompetition = useCallback(async () => {
    if (!orgNummer || isNaN(compNr)) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`);
      if (res.ok) {
        const data = await res.json();
        setCompetition(data);
      } else {
        setError('Competitie niet gevonden.');
      }
    } catch {
      setError('Er is een fout opgetreden.');
    } finally {
      setIsLoading(false);
    }
  }, [orgNummer, compNr]);

  useEffect(() => {
    fetchCompetition();
  }, [fetchCompetition]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
        <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 dark:text-slate-400">Competitie laden...</p>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
        <p className="text-slate-600 dark:text-slate-400">{error || 'Competitie niet gevonden.'}</p>
        <Link
          href="/competities"
          className="mt-4 inline-block px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors"
        >
          Naar competitieoverzicht
        </Link>
      </div>
    );
  }

  const multiplier = MOYENNE_MULTIPLIERS[competition.moy_form] || 25;

  const navItems = [
    { label: 'Spelers', href: `/competities/${compNr}/spelers`, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', desc: 'Beheer spelers in deze competitie' },
    { label: 'Dagplanning', href: `/competities/${compNr}/planning`, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', desc: 'Dagplanning voor aanwezige spelers' },
    { label: 'Matrix', href: `/competities/${compNr}/matrix`, icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', desc: 'Matrix en uitslagbeheer' },
    { label: 'Stand', href: `/competities/${compNr}/stand`, icon: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', desc: 'Klassement en stand' },
    { label: 'Periodes', href: `/competities/${compNr}/periodes`, icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', desc: 'Periode-overgangen beheren' },
    { label: 'Controle', href: `/competities/${compNr}/controle`, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', desc: 'Data validatie en controle' },
    { label: 'Doorkoppelen', href: `/competities/${compNr}/doorkoppelen`, icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', desc: 'Koppel moyennes door naar leden' },
  ];

  return (
    <div>
      <CompetitionSubNav compNr={compNr} compNaam={competition.comp_naam} periode={competition.periode || 1} />

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {competition.comp_naam}
        </h1>
        <Link
          href={`/competities/${compNr}/bewerken`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Wijzigen
        </Link>
      </div>

      {/* Competition Info Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Datum</p>
            <p className="text-sm text-slate-900 dark:text-white">{formatDate(competition.comp_datum)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Discipline</p>
            <p className="text-sm text-slate-900 dark:text-white">{DISCIPLINES[competition.discipline]}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Puntensysteem</p>
            <p className="text-sm text-slate-900 dark:text-white">{decodePuntenSys(competition.punten_sys)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Moyenne-formule</p>
            <p className="text-sm text-slate-900 dark:text-white">Car = Moyenne x {multiplier}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Max aantal beurten</p>
            <p className="text-sm text-slate-900 dark:text-white">{competition.max_beurten}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Vast aantal beurten</p>
            <p className="text-sm text-slate-900 dark:text-white">{competition.vast_beurten === 0 ? 'Nee' : 'Ja'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Naam sortering</p>
            <p className="text-sm text-slate-900 dark:text-white">{SORTEREN_LABELS[competition.sorteren] || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Min. caramboles</p>
            <p className="text-sm text-slate-900 dark:text-white">{competition.min_car}</p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
                <svg className="w-5 h-5 text-green-700 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                  {item.label}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
