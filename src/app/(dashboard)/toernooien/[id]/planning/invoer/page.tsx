'use client';

import React, { use, useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import CompetitionSubNav from '@/components/CompetitionSubNav';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function InvoerContent({
  compNr,
  compNaam,
  ronde,
}: {
  compNr: number;
  compNaam: string;
  ronde: number;
}) {
  const { orgNummer } = useAuth();
  const searchParams = useSearchParams();
  const poule = searchParams.get('poule');
  const code = searchParams.get('code');

  const [uitslag, setUitslag] = useState<{
    sp_nummer_1: number;
    sp_nummer_2: number;
    sp1_car_tem: number;
    sp2_car_tem: number;
    sp_naam_1: string;
    sp_naam_2: string;
  } | null>(null);
  const [car1, setCar1] = useState('');
  const [car2, setCar2] = useState('');
  const [brt, setBrt] = useState('');
  const [hs1, setHs1] = useState('');
  const [hs2, setHs2] = useState('');
  const [punt1, setPunt1] = useState('');
  const [punt2, setPunt2] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orgNummer || !poule || !code) return;
    const r = ronde;
    fetch(
      `/api/organizations/${orgNummer}/competitions/${compNr}/uitslagen?ronde_nr=${r}&poule_nr=${poule}`
    )
      .then((res) => res.json())
      .then((data) => {
        const list = data.uitslagen || [];
        const match = list.find((u: { sp_partcode: string }) => u.sp_partcode === code);
        if (!match) {
          setError('Partij niet gevonden.');
          setLoading(false);
          return;
        }
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/players`)
          .then((r) => r.json())
          .then(({ players }) => {
            const map = new Map((players || []).map((p: { sp_nummer: number; sp_naam: string }) => [p.sp_nummer, p.sp_naam]));
            setUitslag({
              sp_nummer_1: match.sp_nummer_1,
              sp_nummer_2: match.sp_nummer_2,
              sp1_car_tem: match.sp1_car_tem,
              sp2_car_tem: match.sp2_car_tem,
              sp_naam_1: map.get(match.sp_nummer_1) ?? `Speler ${match.sp_nummer_1}`,
              sp_naam_2: map.get(match.sp_nummer_2) ?? `Speler ${match.sp_nummer_2}`,
            });
          });
      })
      .catch(() => setError('Fout bij laden.'))
      .finally(() => setLoading(false));
  }, [orgNummer, compNr, poule, code, ronde]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgNummer) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/uitslagen`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ronde_nr: ronde,
          poule_nr: Number(poule),
          sp_partcode: code,
          sp1_car_gem: parseInt(car1, 10) || 0,
          sp2_car_gem: parseInt(car2, 10) || 0,
          brt: parseInt(brt, 10) || 0,
          sp1_hs: parseInt(hs1, 10) || 0,
          sp2_hs: parseInt(hs2, 10) || 0,
          sp1_punt: parseInt(punt1, 10) ?? 0,
          sp2_punt: parseInt(punt2, 10) ?? 0,
        }),
      });
      if (res.ok) {
        window.location.href = `/toernooien/${compNr}/planning?poule=${poule}`;
      } else {
        const d = await res.json();
        setError(d.error || 'Opslaan mislukt.');
      }
    } catch {
      setError('Fout bij opslaan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !uitslag) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3">
        <LoadingSpinner size="lg" label="Uitslag laden..." />
      </div>
    );
  }
  if (error || !uitslag) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600 dark:text-red-400">{error || 'Uitslag niet gevonden.'}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block text-slate-600 dark:text-slate-400 mb-1">Speler A (te maken: {uitslag.sp1_car_tem})</label>
          <p className="font-medium">{uitslag.sp_naam_1}</p>
        </div>
        <div>
          <label className="block text-slate-600 dark:text-slate-400 mb-1">Speler B (te maken: {uitslag.sp2_car_tem})</label>
          <p className="font-medium">{uitslag.sp_naam_2}</p>
        </div>
        <div>
          <label className="block text-slate-600 dark:text-slate-400 mb-1">Car gemaakt A</label>
          <input type="number" min={0} value={car1} onChange={(e) => setCar1(e.target.value)} required
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800" />
        </div>
        <div>
          <label className="block text-slate-600 dark:text-slate-400 mb-1">Car gemaakt B</label>
          <input type="number" min={0} value={car2} onChange={(e) => setCar2(e.target.value)} required
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800" />
        </div>
        <div>
          <label className="block text-slate-600 dark:text-slate-400 mb-1">Beurten</label>
          <input type="number" min={0} value={brt} onChange={(e) => setBrt(e.target.value)} required
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800" />
        </div>
        <div />
        <div>
          <label className="block text-slate-600 dark:text-slate-400 mb-1">Hoogste serie A</label>
          <input type="number" min={0} value={hs1} onChange={(e) => setHs1(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800" />
        </div>
        <div>
          <label className="block text-slate-600 dark:text-slate-400 mb-1">Hoogste serie B</label>
          <input type="number" min={0} value={hs2} onChange={(e) => setHs2(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800" />
        </div>
        <div>
          <label className="block text-slate-600 dark:text-slate-400 mb-1">Punten A</label>
          <input type="number" min={0} value={punt1} onChange={(e) => setPunt1(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800" />
        </div>
        <div>
          <label className="block text-slate-600 dark:text-slate-400 mb-1">Punten B</label>
          <input type="number" min={0} value={punt2} onChange={(e) => setPunt2(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800" />
        </div>
      </div>
      {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-lg">
          {saving ? 'Opslaan...' : 'Opslaan'}
        </button>
        <Link href={`/toernooien/${compNr}/planning`} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
          Annuleren
        </Link>
      </div>
    </form>
  );
}

export default function UitslagInvoerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const compNr = parseInt(id, 10);
  const { orgNummer } = useAuth();
  const [comp, setComp] = useState<{ comp_naam: string; t_ronde?: number; periode?: number } | null>(null);

  useEffect(() => {
    if (!orgNummer) return;
    fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`)
      .then((r) => r.json())
      .then(setComp)
      .catch(() => setComp(null));
  }, [orgNummer, compNr]);

  const compNaam = comp?.comp_naam ?? '';
  const ronde = comp?.t_ronde ?? comp?.periode ?? 1;

  return (
    <div>
      <CompetitionSubNav compNr={compNr} compNaam={compNaam} periode={ronde} />
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Uitslag invoeren</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-0.5">{compNaam} | Ronde {ronde}</p>
      </div>
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <Suspense fallback={<p className="text-slate-500">Laden...</p>}>
          <InvoerContent compNr={compNr} compNaam={compNaam} ronde={ronde} />
        </Suspense>
      </div>
    </div>
  );
}
