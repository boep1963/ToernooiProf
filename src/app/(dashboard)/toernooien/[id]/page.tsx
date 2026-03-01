'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { DISCIPLINES, MOYENNE_MULTIPLIERS, CAR_SYSTEMEN } from '@/types';
import CompetitionSubNav from '@/components/CompetitionSubNav';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface TournamentData {
  id: string;
  t_nummer: number;
  comp_nr?: number;
  t_naam: string;
  comp_naam?: string;
  t_datum: string;
  comp_datum?: string;
  datum_start: string;
  datum_eind: string;
  discipline: number;
  t_car_sys: number;
  t_moy_form: number;
  moy_form?: number;
  t_punten_sys: number;
  punten_sys?: number;
  t_min_car: number;
  min_car?: number;
  t_max_beurten: number;
  max_beurten?: number;
  t_gestart: number;
  t_ronde: number;
  periode?: number;
  openbaar: number;
}

const PUNTEN_SYSTEMEN: Record<number, string> = {
  1: 'WRV 2-1-0',
  2: '10-punten',
  3: 'Belgisch (12-punten)',
};

function formatDateNL(iso: string): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function ToernooiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { orgNummer } = useAuth();
  const { isSuperAdmin } = useSuperAdmin();
  const compNr = parseInt(id, 10);

  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [startError, setStartError] = useState('');
  const [startSuccess, setStartSuccess] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [isUndoingStart, setIsUndoingStart] = useState(false);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [startBlockedReasons, setStartBlockedReasons] = useState<string[]>([]);

  const fetchTournament = useCallback(async () => {
    if (!orgNummer || isNaN(compNr)) return;
    setIsLoading(true);
    try {
      const [res, playersRes, poulesRes] = await Promise.all([
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`),
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/players`),
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/poules?ronde_nr=1`),
      ]);
      if (res.ok) {
        setTournament(await res.json());
        const reasons: string[] = [];
        const playersData = playersRes.ok ? await playersRes.json() : { count: 0, players: [] };
        const playerCount = Number(playersData.count ?? playersData.players?.length ?? 0);
        if (playerCount < 2) {
          reasons.push('Er zijn minimaal 2 spelers nodig.');
        }

        const poulesData = poulesRes.ok ? await poulesRes.json() : { poules: [] };
        const ronde1Poules = poulesData.poules || [];
        if (ronde1Poules.length > 0) {
          const pouleNrs = ronde1Poules.map((p: any) => Number(p.poule_nr)).filter((n: number) => !isNaN(n)).sort((a: number, b: number) => a - b);
          const maxPoule = pouleNrs[pouleNrs.length - 1] || 0;
          for (let nr = 1; nr <= maxPoule; nr++) {
            if (!pouleNrs.includes(nr)) {
              reasons.push(`Poule ${nr} ontbreekt. Gebruik aansluitende poulenummers.`);
              break;
            }
          }

          const playerCounts = await Promise.all(
            ronde1Poules.map(async (p: any) => {
              const r = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/poules/${p.id}/players`);
              const d = r.ok ? await r.json() : { players: [] };
              return { pouleNr: Number(p.poule_nr), count: (d.players || []).length };
            })
          );
          playerCounts.forEach(({ pouleNr, count }) => {
            if (count < 2) reasons.push(`Poule ${pouleNr} heeft minder dan 2 spelers.`);
          });
        }
        setStartBlockedReasons(reasons);
      } else {
        setError('Toernooi niet gevonden.');
      }
    } catch {
      setError('Er is een fout opgetreden.');
    } finally {
      setIsLoading(false);
    }
  }, [orgNummer, compNr]);

  useEffect(() => { fetchTournament(); }, [fetchTournament]);

  const handleStartToernooi = async () => {
    if (!orgNummer || !tournament) return;
    setIsStarting(true);
    setStartError('');
    setStartSuccess('');
    try {
      const res = await fetch(
        `/api/organizations/${orgNummer}/competitions/${compNr}/start`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } }
      );
      if (res.ok) {
        setStartSuccess('Toernooi gestart! Ronde 1 is aangemaakt.');
        setShowStartConfirm(false);
        await fetchTournament();
        setTimeout(() => setStartSuccess(''), 5000);
      } else {
        const data = await res.json();
        setStartError(data.error || 'Fout bij starten toernooi.');
        setShowStartConfirm(false);
      }
    } catch {
      setStartError('Er is een fout opgetreden.');
      setShowStartConfirm(false);
    } finally {
      setIsStarting(false);
    }
  };

  const handleUndoStartToernooi = async () => {
    if (!orgNummer || !tournament) return;
    if (!confirm('Weet u zeker dat u de start van dit toernooi wilt terugdraaien? Ronde 1 en bijbehorende wedstrijden worden verwijderd.')) {
      return;
    }
    setIsUndoingStart(true);
    setStartError('');
    setStartSuccess('');
    try {
      const res = await fetch(
        `/api/organizations/${orgNummer}/competitions/${compNr}/start`,
        { method: 'DELETE', headers: { 'Content-Type': 'application/json' } }
      );
      if (res.ok) {
        setStartSuccess('Start van het toernooi is teruggedraaid.');
        await fetchTournament();
        setTimeout(() => setStartSuccess(''), 5000);
      } else {
        const data = await res.json();
        setStartError(data.error || 'Fout bij terugdraaien start.');
      }
    } catch {
      setStartError('Er is een fout opgetreden.');
    } finally {
      setIsUndoingStart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
        <LoadingSpinner size="lg" label="Toernooi laden..." />
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
        <p className="text-slate-600 dark:text-slate-400">{error || 'Toernooi niet gevonden.'}</p>
        <Link href="/toernooien" className="mt-4 inline-block px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
          Naar toernooioverzicht
        </Link>
      </div>
    );
  }

  const compNaam = tournament.t_naam ?? tournament.comp_naam ?? '';
  const periode = tournament.t_ronde ?? tournament.periode ?? 0;
  const tPuntenSys = tournament.t_punten_sys ?? tournament.punten_sys ?? 1;
  const tMoyForm = tournament.t_moy_form ?? tournament.moy_form ?? 3;
  const tMinCar = tournament.t_min_car ?? tournament.min_car ?? 0;
  const tMaxBeurten = tournament.t_max_beurten ?? tournament.max_beurten ?? 0;
  const tCarSys = tournament.t_car_sys ?? 1;
  const multiplier = MOYENNE_MULTIPLIERS[tMoyForm] || 25;
  const isGestart = (tournament.t_gestart ?? 0) === 1;
  const canStartTournament = !isGestart && startBlockedReasons.length === 0;

  const navItems = [
    { label: 'Spelers', href: `/toernooien/${compNr}/spelers`, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', desc: 'Beheer spelers in dit toernooi', requiresStarted: false },
    { label: 'Uitslagbeheer', href: `/toernooien/${compNr}/planning`, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', desc: 'Uitslagen invoeren en beheren per ronde', requiresStarted: false },
    { label: 'Stand', href: `/toernooien/${compNr}/stand`, icon: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', desc: 'Stand per poule', requiresStarted: true },
    { label: 'Uitslagen per speler', href: `/toernooien/${compNr}/uitslagen/per-speler`, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', desc: 'Resultaten en statistieken per speler', requiresStarted: true },
    { label: 'Ronden', href: `/toernooien/${compNr}/ronden`, icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', desc: 'Ronde-overgangen beheren', requiresStarted: true },
    ...(isSuperAdmin ? [{ label: 'Controle', href: `/toernooien/${compNr}/controle`, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', desc: 'Data validatie en controle', requiresStarted: false }] : []),
  ];

  return (
    <div>
      <CompetitionSubNav compNr={compNr} compNaam={compNaam} periode={periode} tGestart={tournament.t_gestart} />

      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{compNaam}</h1>
          {(() => {
            const subtitle = tournament.t_datum || tournament.comp_datum || '';
            // Toon alleen vrije tekst als subtitel, niet datum-placeholders zoals 00-00-0000
            const isPlaceholderDate = subtitle && /^\d{1,2}-\d{1,2}-\d{4}$/.test(subtitle.trim());
            const hasFreeText = subtitle && /\D/.test(subtitle);
            return hasFreeText && !isPlaceholderDate ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                {subtitle}
              </p>
            ) : null;
          })()}
        </div>
        <div className="flex items-center gap-2">
          {!isGestart && (
            <button
              onClick={() => setShowStartConfirm(true)}
              disabled={!canStartTournament}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start toernooi
            </button>
          )}
          {isGestart && (
            <>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-lg border border-green-200 dark:border-green-800">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Gestart – Ronde {periode}
              </span>
              <button
                onClick={handleUndoStartToernooi}
                disabled={isUndoingStart}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                {isUndoingStart ? 'Bezig...' : 'Start terugdraaien'}
              </button>
            </>
          )}
          <Link
            href={`/toernooien/${compNr}/bewerken`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Wijzigen
          </Link>
        </div>
      </div>

      {startError && (
        <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800">
          {startError}
        </div>
      )}
      {startSuccess && (
        <div role="status" className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm border border-green-200 dark:border-green-800">
          {startSuccess}
        </div>
      )}
      {!isGestart && startBlockedReasons.length > 0 && (
        <div className="mb-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-sm border border-amber-200 dark:border-amber-800">
          <p className="font-medium mb-2">Toernooi kan nog niet gestart worden:</p>
          <ul className="list-disc list-inside space-y-1">
            {startBlockedReasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Discipline</p>
            <p className="text-sm text-slate-900 dark:text-white">{DISCIPLINES[tournament.discipline]}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Puntensysteem</p>
            <p className="text-sm text-slate-900 dark:text-white">{PUNTEN_SYSTEMEN[tPuntenSys] || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Caramboles-systeem</p>
            <p className="text-sm text-slate-900 dark:text-white">{CAR_SYSTEMEN[tCarSys] || '—'}</p>
          </div>
          {tCarSys === 1 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Formule</p>
              <p className="text-sm text-slate-900 dark:text-white">Car = Moyenne × {multiplier}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Min. caramboles</p>
            <p className="text-sm text-slate-900 dark:text-white">{tMinCar}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Max. beurten</p>
            <p className="text-sm text-slate-900 dark:text-white">{tMaxBeurten === 0 ? 'Geen limiet' : tMaxBeurten}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Stand openbaar</p>
            <p className="text-sm text-slate-900 dark:text-white">{tournament.openbaar === 1 ? 'Ja' : 'Nee'}</p>
          </div>
          {tournament.datum_start && (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Periode</p>
              <p className="text-sm text-slate-900 dark:text-white">
                {formatDateNL(tournament.datum_start)} – {formatDateNL(tournament.datum_eind)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick nav cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {navItems.map(item => {
          const isBlocked = !isGestart && item.requiresStarted;
          const cardClasses = `bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-5 transition-all group ${
            isBlocked
              ? 'border-slate-200 dark:border-slate-700 opacity-70 cursor-not-allowed'
              : 'border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md'
          }`;

          const content = (
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                isBlocked
                  ? 'bg-slate-100 dark:bg-slate-700'
                  : 'bg-orange-50 dark:bg-orange-900/30 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50'
              }`}>
                <svg className={`w-5 h-5 ${isBlocked ? 'text-slate-400 dark:text-slate-500' : 'text-orange-600 dark:text-orange-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
              </div>
              <div>
                <h3 className={`text-sm font-semibold transition-colors ${
                  isBlocked
                    ? 'text-slate-500 dark:text-slate-400'
                    : 'text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400'
                }`}>
                  {item.label}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isBlocked ? 'Beschikbaar nadat het toernooi is gestart' : item.desc}
                </p>
              </div>
            </div>
          );

          if (isBlocked) {
            return (
              <div key={item.label} className={cardClasses}>
                {content}
              </div>
            );
          }

          return (
            <Link key={item.label} href={item.href} className={cardClasses}>
              {content}
            </Link>
          );
        })}
      </div>

      {/* Start toernooi confirm dialog */}
      {showStartConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Toernooi starten
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Door het toernooi te starten worden:
            </p>
            <ul className="mb-4 text-sm text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1">
              <li>De wedstrijden voor ronde 1 automatisch aangemaakt (Round Robin per poule)</li>
              <li>Het toernooi gemarkeerd als gestart</li>
            </ul>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Zorg ervoor dat alle spelers en poule-indeling klaar zijn.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowStartConfirm(false)}
                disabled={isStarting}
                className="px-4 py-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
              >
                Annuleren
              </button>
              <button
                onClick={handleStartToernooi}
                disabled={isStarting}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                {isStarting ? 'Bezig...' : 'Ja, start toernooi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
