'use client';

import React, { use, useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import CompetitionSubNav from '@/components/CompetitionSubNav';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function WijzigContent({
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
    sp1_car_gem: number;
    sp2_car_gem: number;
    brt: number;
    sp1_hs: number;
    sp2_hs: number;
    sp1_punt: number;
    sp2_punt: number;
    sp_naam_1: string;
    sp_naam_2: string;
  } | null>(null);
  const [car1, setCar1] = useState('');
  const [car2, setCar2] = useState('');
  const [brt, setBrt] = useState('');
  const [hs1, setHs1] = useState('');
  const [hs2, setHs2] = useState('');
  const [preview, setPreview] = useState<{
    sp1_car_tem: number;
    sp2_car_tem: number;
    sp1_car_gem: number;
    sp2_car_gem: number;
    brt: number;
    sp1_hs: number;
    sp2_hs: number;
    sp1_moy: number;
    sp2_moy: number;
    sp1_punt: number;
    sp2_punt: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');

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
          setLoadError('Partij niet gevonden.');
          setLoading(false);
          return;
        }
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/players`)
          .then((r) => r.json())
          .then(({ players }) => {
            const map = new Map<number, string>(
              (players || []).map((p: { sp_nummer: number; sp_naam: string }) => [p.sp_nummer, p.sp_naam ?? ''])
            );
            setUitslag({
              ...match,
              sp_naam_1: map.get(match.sp_nummer_1) ?? `Speler ${match.sp_nummer_1}`,
              sp_naam_2: map.get(match.sp_nummer_2) ?? `Speler ${match.sp_nummer_2}`,
            });
            setCar1(String(match.sp1_car_gem ?? 0));
            setCar2(String(match.sp2_car_gem ?? 0));
            setBrt(String(match.brt ?? 0));
            setHs1(String(match.sp1_hs ?? 0));
            setHs2(String(match.sp2_hs ?? 0));
          });
      })
      .catch(() => setLoadError('Fout bij laden.'))
      .finally(() => setLoading(false));
  }, [orgNummer, compNr, poule, code, ronde]);

  const payload = {
    ronde_nr: ronde,
    poule_nr: poule ? Number(poule) : 0,
    sp_partcode: code ?? '',
    sp1_car_gem: parseInt(car1, 10) || 0,
    sp2_car_gem: parseInt(car2, 10) || 0,
    brt: parseInt(brt, 10) || 0,
    sp1_hs: parseInt(hs1, 10) || 0,
    sp2_hs: parseInt(hs2, 10) || 0,
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgNummer) return;
    setSaving(true);
    setFormError('');
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/uitslagen`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, action: 'preview' }),
      });
      if (res.ok) {
        const data = await res.json();
        setPreview(data.preview ?? null);
      } else {
        const d = await res.json();
        setFormError(d.error || 'Controle mislukt.');
      }
    } catch {
      setFormError('Fout bij controleren.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!orgNummer || !preview) return;
    setSaving(true);
    setFormError('');
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/uitslagen`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, action: 'save' }),
      });
      if (res.ok) {
        window.location.href = `/toernooien/${compNr}/planning?poule=${poule}`;
      } else {
        const d = await res.json();
        setFormError(d.error || 'Opslaan mislukt.');
      }
    } catch {
      setFormError('Fout bij opslaan.');
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
  if (loadError || !uitslag) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600 dark:text-red-400">{loadError || 'Uitslag niet gevonden.'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block text-slate-600 dark:text-slate-400 mb-1">Speler A (te maken: {uitslag.sp1_car_tem})</label>
          <p className="font-medium">{uitslag.sp_naam_1}</p>
        </div>
        <div>
          <label className="block text-slate-600 dark:text-slate-400 mb-1">Speler B (te maken: {uitslag.sp2_car_tem})</label>
          <p className="font-medium">{uitslag.sp_naam_2}</p>
        </div>
      </div>

      {!preview ? (
        <form onSubmit={handleCheck} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
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
              <input type="number" min={1} value={brt} onChange={(e) => setBrt(e.target.value)} required
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
          </div>
          {formError && <p className="text-red-600 dark:text-red-400 text-sm">{formError}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-medium rounded-lg">
              {saving ? 'Controleren...' : 'Controleer'}
            </button>
            <Link href={`/toernooien/${compNr}/planning?poule=${poule}`} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
              Annuleren
            </Link>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/60">
            <h3 className="font-semibold mb-3">Controle uitslag</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-slate-500 dark:text-slate-400">Veld</div>
              <div className="text-slate-500 dark:text-slate-400">{uitslag.sp_naam_1}</div>
              <div className="text-slate-500 dark:text-slate-400">{uitslag.sp_naam_2}</div>
              <div>Car te maken</div><div>{preview.sp1_car_tem}</div><div>{preview.sp2_car_tem}</div>
              <div>Car gemaakt</div><div>{preview.sp1_car_gem}</div><div>{preview.sp2_car_gem}</div>
              <div>Hoogste serie</div><div>{preview.sp1_hs}</div><div>{preview.sp2_hs}</div>
              <div>Moyenne partij</div><div>{preview.sp1_moy.toFixed(3)}</div><div>{preview.sp2_moy.toFixed(3)}</div>
              <div>Punten</div><div className="font-semibold">{preview.sp1_punt}</div><div className="font-semibold">{preview.sp2_punt}</div>
              <div>Beurten</div><div>{preview.brt}</div><div>{preview.brt}</div>
            </div>
          </div>
          {formError && <p className="text-red-600 dark:text-red-400 text-sm">{formError}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPreview(null)}
              disabled={saving}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Terug
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-medium rounded-lg"
            >
              {saving ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UitslagWijzigPage({ params }: { params: Promise<{ id: string }> }) {
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Uitslag wijzigen</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-0.5">{compNaam} | Ronde {ronde}</p>
      </div>
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <Suspense fallback={<p className="text-slate-500">Laden...</p>}>
          <WijzigContent compNr={compNr} compNaam={compNaam} ronde={ronde} />
        </Suspense>
      </div>
    </div>
  );
}
