'use client';

import React, { useEffect, useMemo, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import CompetitionSubNav from '@/components/CompetitionSubNav';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatPlayerName } from '@/lib/billiards';
import { formatDecimal } from '@/lib/formatUtils';

interface CompetitionData {
  id: string;
  comp_nr: number;
  comp_naam: string;
  t_naam?: string;
  t_nummer?: number;
  periode: number;
  sorteren: number;
  t_ronde?: number;
  t_gestart?: number;
}

interface DraftItem {
  sp_nummer: number;
  sp_naam: string;
  from_poule: number;
  to_poule: number;
  moy_start: number;
  car_start: number;
  include: boolean;
  order_idx: number;
}

export default function NieuweRondePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { orgNummer } = useAuth();
  const compNr = parseInt(id, 10);

  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [sourceRound, setSourceRound] = useState(0);
  const [targetRound, setTargetRound] = useState(0);
  const [selectedSourcePoule, setSelectedSourcePoule] = useState<number | null>(null);
  const [playedMoyByPlayer, setPlayedMoyByPlayer] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const sourcePoules = useMemo(
    () => Array.from(new Set(draftItems.map((it) => Number(it.from_poule) || 0).filter((nr) => nr > 0))).sort((a, b) => a - b),
    [draftItems]
  );

  const visibleItems = useMemo(() => {
    if (!selectedSourcePoule) return [];
    return draftItems
      .filter((it) => it.from_poule === selectedSourcePoule)
      .sort((a, b) => (a.order_idx || 0) - (b.order_idx || 0));
  }, [draftItems, selectedSourcePoule]);

  const groupedTargetOverview = useMemo(() => {
    const map = new Map<number, DraftItem[]>();
    draftItems
      .filter((it) => it.include && (it.to_poule || 0) > 0)
      .forEach((it) => {
        if (!map.has(it.to_poule)) map.set(it.to_poule, []);
        map.get(it.to_poule)!.push(it);
      });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [draftItems]);

  const fetchInitialData = useCallback(async () => {
    if (!orgNummer || isNaN(compNr)) return;
    setIsLoading(true);
    setError('');
    try {
      const [compRes, draftRes] = await Promise.all([
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`),
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/rounds/draft`),
      ]);

      const compData = await compRes.json();
      const draftData = await draftRes.json();

      if (!compRes.ok) throw new Error(compData.error || 'Toernooi niet gevonden');
      if (!draftRes.ok) throw new Error(draftData.error || 'Rondeconcept kon niet geladen worden');

      setCompetition(compData);
      setSourceRound(Number(draftData.source_ronde) || 0);
      setTargetRound(Number(draftData.target_ronde) || 0);

      const items = (Array.isArray(draftData.items) ? draftData.items : []) as DraftItem[];
      setDraftItems(items);
      const firstSourcePoule = items.length > 0
        ? Math.min(...items.map((it) => Number(it.from_poule) || 1))
        : null;
      setSelectedSourcePoule(firstSourcePoule);
    } catch (err) {
      console.error('Error loading new-round draft:', err);
      setError(err instanceof Error ? err.message : 'Fout bij ophalen gegevens');
    } finally {
      setIsLoading(false);
    }
  }, [orgNummer, compNr]);

  const fetchPlayedMoyennes = useCallback(async () => {
    if (!orgNummer || isNaN(compNr) || !selectedSourcePoule || sourceRound < 1) return;
    try {
      const res = await fetch(
        `/api/organizations/${orgNummer}/competitions/${compNr}/standings/${sourceRound}?poule_nr=${selectedSourcePoule}`
      );
      const data = await res.json();
      if (!res.ok) return;
      const map: Record<number, number> = {};
      const standings = Array.isArray(data.standings) ? data.standings : [];
      standings.forEach((s: Record<string, unknown>) => {
        const nr = Number(s.playerNr) || 0;
        if (nr > 0) map[nr] = Number(s.moyenne) || 0;
      });
      setPlayedMoyByPlayer(map);
    } catch {
      // Non-fatal: keep table usable without played moyenne.
    }
  }, [orgNummer, compNr, selectedSourcePoule, sourceRound]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchPlayedMoyennes();
  }, [fetchPlayedMoyennes]);

  const updateItem = (spNummer: number, patch: Partial<DraftItem>) => {
    setDraftItems((prev) =>
      prev.map((it) => {
        if (it.sp_nummer !== spNummer) return it;
        const next = { ...it, ...patch };
        if (patch.include === false) next.to_poule = 0;
        if (patch.to_poule && patch.to_poule > 0) next.include = true;
        return next;
      })
    );
    setSaveMessage('');
  };

  const saveDraft = async (): Promise<boolean> => {
    if (!orgNummer || isNaN(compNr) || sourceRound < 1 || targetRound < 2) return false;
    setIsSavingDraft(true);
    setSaveMessage('');
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/rounds/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_ronde: sourceRound,
          target_ronde: targetRound,
          items: draftItems,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Concept opslaan mislukt');
      setSaveMessage('Concept opgeslagen');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij opslaan concept');
      return false;
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleFinalize = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const ok = await saveDraft();
      if (!ok) return;
      const res = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/rounds/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_ronde: sourceRound,
          target_ronde: targetRound,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ronde finaliseren mislukt');
      }
      router.push(`/toernooien/${compNr}/ronden`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij aanmaken nieuwe ronde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToCurrentRound = async () => {
    await saveDraft();
    router.push(`/toernooien/${compNr}/ronden`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" label="Nieuwe ronde voorbereiden..." />
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          Toernooi niet gevonden.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CompetitionSubNav
        compNr={competition.comp_nr}
        compNaam={competition.comp_naam || competition.t_naam || `Toernooi ${compNr}`}
        periode={targetRound || competition.periode}
        tGestart={competition.t_gestart}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Nieuwe Ronde {targetRound}</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Bronronde {sourceRound}: doorkoppelen per poule, met conceptopslag op server.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {saveMessage && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">
          {saveMessage}
        </div>
      )}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mr-3">Bronpoule huidige ronde</label>
        <select
          value={selectedSourcePoule ?? ''}
          onChange={(e) => setSelectedSourcePoule(Number(e.target.value) || null)}
          className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
        >
          {sourcePoules.map((nr) => (
            <option key={nr} value={nr}>Poule {nr}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Doorkoppelen vanuit poule {selectedSourcePoule ?? '-'}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Door?</th>
                  <th className="px-4 py-3 text-left">Speler</th>
                  <th className="px-4 py-3 text-right">Gespeeld moy</th>
                  <th className="px-4 py-3 text-right">Start moy</th>
                  <th className="px-4 py-3 text-right">Car</th>
                  <th className="px-4 py-3 text-left">Naar poule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {visibleItems.map((item) => {
                  const nameParts = item.sp_naam.split(/\s+/);
                  const vnaam = nameParts[0] ?? '';
                  const anaam = nameParts.slice(1).join(' ');
                  return (
                    <tr key={item.sp_nummer}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={item.include}
                          onChange={(e) => updateItem(item.sp_nummer, { include: e.target.checked })}
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {formatPlayerName(vnaam, '', anaam, competition.sorteren)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-300">
                        {playedMoyByPlayer[item.sp_nummer] ? formatDecimal(playedMoyByPlayer[item.sp_nummer]) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          value={item.moy_start}
                          min={0.1}
                          step={0.001}
                          onChange={(e) => updateItem(item.sp_nummer, { moy_start: Number(e.target.value) || 0 })}
                          className="w-24 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-right font-mono"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          value={item.car_start}
                          min={3}
                          step={1}
                          onChange={(e) => updateItem(item.sp_nummer, { car_start: Math.max(Number(e.target.value) || 0, 3) })}
                          className="w-20 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-right font-mono"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={item.to_poule}
                          onChange={(e) => updateItem(item.sp_nummer, { to_poule: Number(e.target.value) || 0 })}
                          className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1"
                        >
                          <option value={0}>Niet doorkoppelen</option>
                          {Array.from({ length: 25 }, (_, i) => i + 1).map((nr) => (
                            <option key={nr} value={nr}>Poule {nr}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Overzicht nieuwe indeling ronde {targetRound}</h3>
          <div className="space-y-3">
            {groupedTargetOverview.length === 0 && (
              <p className="text-sm text-slate-500">Nog geen spelers doorgeselecteerd.</p>
            )}
            {groupedTargetOverview.map(([pouleNr, items]) => (
              <div key={pouleNr} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <div className="text-sm font-semibold mb-1">Poule {pouleNr} ({items.length})</div>
                <div className="text-xs text-slate-500">
                  {items.map((it) => it.sp_naam).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={saveDraft}
          disabled={isSavingDraft || isSubmitting}
          className="px-5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
        >
          {isSavingDraft ? 'Opslaan...' : 'Concept opslaan'}
        </button>
        <button
          onClick={handleBackToCurrentRound}
          disabled={isSavingDraft || isSubmitting}
          className="px-5 py-2 rounded-lg border border-orange-300 text-orange-700 hover:bg-orange-50 disabled:opacity-50"
        >
          Terug naar huidige ronde (met behoud)
        </button>
        <button
          onClick={handleFinalize}
          disabled={isSavingDraft || isSubmitting}
          className="px-6 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Nieuwe ronde aanmaken...' : `Maak ronde ${targetRound} aan`}
        </button>
        <div className="self-center text-xs text-slate-500">
          Controle bij aanmaak: min. 2 spelers per poule en geen gaten in poulenummers.
        </div>
      </div>
    </div>
  );
}
