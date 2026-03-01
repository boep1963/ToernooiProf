'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import CompetitionSubNav from '@/components/CompetitionSubNav';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { TableSkeleton } from '@/components/ui/Skeleton';

interface CompetitionData {
  comp_naam: string;
  t_ronde?: number;
  periode?: number;
}

interface PouleInfo {
  id: string;
  poule_nr: number;
  ronde_nr: number;
  playerCount?: number;
}

interface UitslagItem {
  id: string;
  sp_nummer_1: number;
  sp_nummer_2: number;
  sp1_car_tem: number;
  sp2_car_tem: number;
  sp1_car_gem: number;
  sp2_car_gem: number;
  sp1_hs: number;
  sp2_hs: number;
  sp1_punt: number;
  sp2_punt: number;
  brt: number;
  p_ronde: number;
  koppel: number;
  sp_partcode: string;
  gespeeld: number;
  tafel_nr: number;
}

interface SpelerInfo {
  sp_nummer: number;
  sp_naam: string;
}

function PlanningContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { orgNummer } = useAuth();
  const searchParams = useSearchParams();
  const compNr = parseInt(id, 10);
  const pouleFromUrl = searchParams.get('poule');

  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [poules, setPoules] = useState<PouleInfo[]>([]);
  const [selectedPoule, setSelectedPoule] = useState<number | null>(null);
  const [uitslagen, setUitslagen] = useState<UitslagItem[]>([]);
  const [spelers, setSpelers] = useState<SpelerInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUitslagen, setIsLoadingUitslagen] = useState(false);
  const [error, setError] = useState('');

  const huidigeRonde = competition?.t_ronde ?? competition?.periode ?? 1;
  const spelersMap = new Map(spelers.map((s) => [s.sp_nummer, s.sp_naam]));
  const getNaam = (nr: number) => spelersMap.get(nr) ?? `Speler ${nr}`;

  // Load competition + poules
  useEffect(() => {
    if (!orgNummer || isNaN(compNr)) return;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const compRes = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`);
        if (!compRes.ok) {
          setError('Toernooi niet gevonden.');
          setIsLoading(false);
          return;
        }
        const compData = await compRes.json();
        setCompetition(compData);

        const ronde = compData.t_ronde ?? compData.periode ?? 1;
        const [poulesRes, spelersRes] = await Promise.all([
          fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/poules?ronde_nr=${ronde}`),
          fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/players`),
        ]);

        if (poulesRes.ok) {
          const { poules: p } = await poulesRes.json();
          setPoules(p || []);
          const wantedPoule = pouleFromUrl ? parseInt(pouleFromUrl, 10) : null;
          if (!isNaN(wantedPoule)) setSelectedPoule(wantedPoule);
          else if (p?.length === 1) setSelectedPoule(p[0].poule_nr);
        }

        if (spelersRes.ok) {
          const { players } = await spelersRes.json();
          setSpelers((players || []).map((pl: { sp_nummer: number; sp_naam: string }) => ({
            sp_nummer: pl.sp_nummer,
            sp_naam: pl.sp_naam ?? '',
          })));
        }
      } catch {
        setError('Er is een fout opgetreden bij het laden.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [orgNummer, compNr, pouleFromUrl]);

  // Load uitslagen when poule is selected
  useEffect(() => {
    if (!orgNummer || isNaN(compNr) || selectedPoule === null || !competition) return;

    const ronde = competition.t_ronde ?? competition.periode ?? 1;
    setIsLoadingUitslagen(true);
    fetch(
      `/api/organizations/${orgNummer}/competitions/${compNr}/uitslagen?ronde_nr=${ronde}&poule_nr=${selectedPoule}`
    )
      .then((r) => r.json())
      .then((data) => setUitslagen(data.uitslagen || []))
      .catch(() => setUitslagen([]))
      .finally(() => setIsLoadingUitslagen(false));
  }, [orgNummer, compNr, selectedPoule, competition]);

  if (isLoading || !competition) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8">
        <LoadingSpinner size="lg" label="Toernooi laden..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Link href="/toernooien" className="mt-4 inline-block text-orange-600 dark:text-orange-400 hover:underline">
          Naar toernooien
        </Link>
      </div>
    );
  }

  const compNaam = competition.comp_naam ?? '';
  const ronde = competition.t_ronde ?? competition.periode ?? 1;

  return (
    <div>
      <CompetitionSubNav compNr={compNr} compNaam={compNaam} periode={ronde} />

      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Planning – {compNaam}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-0.5">
          {compNaam} | Ronde {ronde}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        {selectedPoule === null ? (
          <div className="p-8">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
              Kies poule
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Kies de gewenste poule om de partijen en uitslagen te beheren:
            </p>
            <div className="flex flex-wrap gap-3">
              {poules.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPoule(p.poule_nr)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                >
                  Poule {String.fromCharCode(64 + p.poule_nr)}
                  {p.playerCount != null && ` (${p.playerCount} spelers)`}
                </button>
              ))}
            </div>
            {poules.length === 0 && (
              <p className="text-slate-500 dark:text-slate-400">
                Geen poules gevonden voor ronde {ronde}. Start het toernooi eerst.
              </p>
            )}
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Planning poule {String.fromCharCode(64 + selectedPoule)} in ronde {ronde}
              </h2>
              <button
                onClick={() => setSelectedPoule(null)}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              >
                ← Andere poule kiezen
              </button>
            </div>

            {isLoadingUitslagen ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                  <LoadingSpinner size="sm" />
                  Partijen laden...
                </div>
                <TableSkeleton rows={6} cols={7} />
              </div>
            ) : uitslagen.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                Geen partijen gevonden voor deze poule. Start het toernooi om partijen aan te maken.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">Ronde</th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">Koppel</th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">Invoer</th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">Wijzig</th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">Speler A</th>
                      <th className="text-center py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">Car</th>
                      <th className="text-center py-3 px-2">—</th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">Speler B</th>
                      <th className="text-center py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">Car</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uitslagen.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="py-2 px-2 font-medium">{u.p_ronde}</td>
                        <td className="py-2 px-2">{u.koppel}</td>
                        <td className="py-2 px-2">
                          {u.gespeeld === 0 ? (
                            <Link
                              href={`/toernooien/${compNr}/planning/invoer?poule=${selectedPoule}&code=${u.sp_partcode}`}
                              className="inline-block px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded"
                            >
                              Invoer
                            </Link>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2 px-2">
                          {u.gespeeld === 1 ? (
                            <Link
                              href={`/toernooien/${compNr}/planning/wijzig?poule=${selectedPoule}&code=${u.sp_partcode}`}
                              className="inline-block px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded"
                            >
                              Wijzig
                            </Link>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2 px-2">{getNaam(u.sp_nummer_1)}</td>
                        <td className="py-2 px-2 text-center">
                          {u.gespeeld === 1 ? u.sp1_car_gem : u.sp1_car_tem}
                        </td>
                        <td className="py-2 px-2 text-center">–</td>
                        <td className="py-2 px-2">{getNaam(u.sp_nummer_2)}</td>
                        <td className="py-2 px-2 text-center">
                          {u.gespeeld === 1 ? u.sp2_car_gem : u.sp2_car_tem}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlanningPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8">
        <LoadingSpinner size="lg" label="Laden..." />
      </div>
    }>
      <PlanningContent params={params} />
    </Suspense>
  );
}
