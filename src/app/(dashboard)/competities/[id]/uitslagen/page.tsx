'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DISCIPLINES } from '@/types';
import CompetitionSubNav from '@/components/CompetitionSubNav';
import { formatDateTime, parseDutchDate } from '@/lib/dateUtils';

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

interface MatchData {
  id: string;
  org_nummer: number;
  comp_nr: number;
  nummer_A: number;
  naam_A: string;
  cartem_A: number;
  nummer_B: number;
  naam_B: string;
  cartem_B: number;
  periode: number;
  uitslag_code: string;
  gespeeld: number;
  ronde: number;
}

interface ResultData {
  id: string;
  uitslag_code: string;
  speeldatum: string;
  sp_1_nr: number;
  sp_1_naam?: string;
  sp_1_cartem: number;
  sp_1_cargem: number;
  sp_1_hs: number;
  sp_1_punt: number;
  sp_2_nr: number;
  sp_2_naam?: string;
  sp_2_cartem: number;
  sp_2_cargem: number;
  sp_2_hs: number;
  sp_2_punt: number;
  brt: number;
  gespeeld: number;
}

const PUNTEN_SYSTEMEN: Record<number, string> = {
  1: 'WRV 2-1-0',
  2: '10-punten',
  3: 'Belgisch (12-punten)',
};

export default function CompetiteUitslagenPage() {
  const params = useParams();
  const router = useRouter();
  const { orgNummer } = useAuth();

  const compNr = parseInt(params.id as string, 10);

  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [results, setResults] = useState<ResultData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Result entry form state
  const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null);
  const [formData, setFormData] = useState({
    sp_1_cargem: '',
    sp_1_hs: '',
    sp_2_cargem: '',
    sp_2_hs: '',
    brt: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch results separately - non-blocking, runs after page is already displayed
  // The results API can be slow (denormalization) or fail with 500
  // Page works without results: matches show with gespeeld status from matches API
  const fetchResults = useCallback(async () => {
    if (!orgNummer || isNaN(compNr)) return;
    try {
      const resultsRes = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/results`);
      if (resultsRes.ok) {
        const resultsData = await resultsRes.json();
        setResults(resultsData.results || []);
      }
    } catch {
      // Silently ignore results fetch errors - page works without results
      console.log('[Uitslagen] Results fetch failed, continuing without results data');
    }
  }, [orgNummer, compNr]);

  const fetchData = useCallback(async () => {
    if (!orgNummer || isNaN(compNr)) return;
    setIsLoading(true);
    setError('');
    try {
      // Only fetch competition and matches - these are essential for the page
      // This page shows matches (planned games) for result entry
      // Results are fetched separately (non-blocking) after the page renders
      const [compRes, matchesRes] = await Promise.all([
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`),
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/matches`),
      ]);

      if (!compRes.ok) {
        setError('Competitie niet gevonden.');
        setIsLoading(false);
        return;
      }

      const compData = await compRes.json();
      setCompetition(compData);

      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        setMatches(matchesData.matches || []);
      }
    } catch {
      setError('Er is een fout opgetreden bij het laden.');
    } finally {
      setIsLoading(false);
    }
  }, [orgNummer, compNr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch results in the background after the page has loaded
  // This is non-blocking: the page displays matches immediately
  useEffect(() => {
    if (!isLoading && competition) {
      fetchResults();
    }
  }, [isLoading, competition, fetchResults]);

  // Get result for a match by uitslag_code
  const getResultForMatch = (uitslagCode: string): ResultData | undefined => {
    return results.find((r) => r.uitslag_code === uitslagCode);
  };

  const handleSelectMatch = (match: MatchData) => {
    setSelectedMatch(match);
    setError('');
    setSuccess('');

    // Pre-fill with existing result if available
    const existingResult = getResultForMatch(match.uitslag_code);
    if (existingResult) {
      setFormData({
        sp_1_cargem: String(existingResult.sp_1_cargem || ''),
        sp_1_hs: String(existingResult.sp_1_hs || ''),
        sp_2_cargem: String(existingResult.sp_2_cargem || ''),
        sp_2_hs: String(existingResult.sp_2_hs || ''),
        brt: String(existingResult.brt || ''),
      });
    } else {
      setFormData({
        sp_1_cargem: '',
        sp_1_hs: '',
        sp_2_cargem: '',
        sp_2_hs: '',
        brt: '',
      });
    }
  };

  const handleSubmitResult = async () => {
    if (!orgNummer || !selectedMatch || !competition) return;

    // Validate numeric fields
    const sp1Cargem = Number(formData.sp_1_cargem) || 0;
    const sp1Hs = Number(formData.sp_1_hs) || 0;
    const sp2Cargem = Number(formData.sp_2_cargem) || 0;
    const sp2Hs = Number(formData.sp_2_hs) || 0;
    const brt = Number(formData.brt);

    // Validate caramboles (cannot be negative)
    if (sp1Cargem < 0) {
      setError('Caramboles voor speler 1 kunnen niet negatief zijn.');
      return;
    }
    if (sp2Cargem < 0) {
      setError('Caramboles voor speler 2 kunnen niet negatief zijn.');
      return;
    }

    // Validate highest series (cannot be negative)
    if (sp1Hs < 0) {
      setError('Hoogste serie voor speler 1 kan niet negatief zijn.');
      return;
    }
    if (sp2Hs < 0) {
      setError('Hoogste serie voor speler 2 kan niet negatief zijn.');
      return;
    }

    // Validate turns (must be greater than 0)
    if (!brt || brt <= 0) {
      setError('Aantal beurten moet groter zijn dan 0.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(
        `/api/organizations/${orgNummer}/competitions/${compNr}/results`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uitslag_code: selectedMatch.uitslag_code,
            sp_1_nr: selectedMatch.nummer_A,
            sp_1_cartem: selectedMatch.cartem_A,
            sp_1_cargem: sp1Cargem,
            sp_1_hs: sp1Hs,
            sp_2_nr: selectedMatch.nummer_B,
            sp_2_cartem: selectedMatch.cartem_B,
            sp_2_cargem: sp2Cargem,
            sp_2_hs: sp2Hs,
            brt: brt,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        // Update local state
        setResults((prev) => {
          const existing = prev.findIndex((r) => r.uitslag_code === selectedMatch.uitslag_code);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = data;
            return updated;
          }
          return [...prev, data];
        });

        // Update match as played
        setMatches((prev) =>
          prev.map((m) =>
            m.uitslag_code === selectedMatch.uitslag_code
              ? { ...m, gespeeld: 1 }
              : m
          )
        );

        setSuccess(
          `Uitslag opgeslagen! ${selectedMatch.naam_A}: ${data.sp_1_punt} punt${data.sp_1_punt !== 1 ? 'en' : ''}, ${selectedMatch.naam_B}: ${data.sp_2_punt} punt${data.sp_2_punt !== 1 ? 'en' : ''}`
        );
        setSelectedMatch(null);
        setTimeout(() => setSuccess(''), 6000);
      } else {
        setError(data.error || 'Fout bij opslaan uitslag.');
      }
    } catch {
      setError('Er is een fout opgetreden.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResult = async (result: ResultData) => {
    if (!orgNummer || !result.id) return;
    setIsDeleting(true);
    setError('');
    try {
      const res = await fetch(
        `/api/organizations/${orgNummer}/competitions/${compNr}/results/${result.id}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        // Remove result from local state
        setResults((prev) => prev.filter((r) => r.id !== result.id));
        // Reset match to unplayed
        setMatches((prev) =>
          prev.map((m) =>
            m.uitslag_code === result.uitslag_code
              ? { ...m, gespeeld: 0 }
              : m
          )
        );
        setSuccess('Uitslag succesvol verwijderd.');
        setDeleteConfirm(null);
        setTimeout(() => setSuccess(''), 4000);
      } else {
        const data = await res.json();
        setError(data.error || 'Fout bij verwijderen uitslag.');
      }
    } catch {
      setError('Er is een fout opgetreden bij het verwijderen.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Group matches by round
  const matchesByRound = matches.reduce<Record<number, MatchData[]>>((acc, match) => {
    const round = match.ronde || 1;
    if (!acc[round]) acc[round] = [];
    acc[round].push(match);
    return acc;
  }, {});

  // Sort matches within each round by play date (newest first)
  Object.keys(matchesByRound).forEach(round => {
    matchesByRound[Number(round)].sort((a, b) => {
      const resultA = results.find(r => r.uitslag_code === a.uitslag_code);
      const resultB = results.find(r => r.uitslag_code === b.uitslag_code);

      // Matches without results go to the end
      if (!resultA && !resultB) return 0;
      if (!resultA) return 1;
      if (!resultB) return -1;

      // Sort by date (newest first)
      const dateA = parseDutchDate(resultA.speeldatum);
      const dateB = parseDutchDate(resultB.speeldatum);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB.getTime() - dateA.getTime();
    });
  });

  const roundNumbers = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  if (isLoading) {
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
          Uitslagen - {competition.comp_naam}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {DISCIPLINES[competition.discipline]} | {PUNTEN_SYSTEMEN[competition.punten_sys] || 'Onbekend'}
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800 flex items-center justify-between">
          <span>{error}</span>
          <div className="flex items-center gap-2 ml-3">
            <button onClick={fetchData} className="text-xs px-2.5 py-1 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300 rounded-md transition-colors font-medium">
              Opnieuw proberen
            </button>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors" aria-label="Melding sluiten">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {success && (
        <div role="status" className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm border border-green-200 dark:border-green-800 flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="ml-3 text-green-500 hover:text-green-700 dark:hover:text-green-300 transition-colors" aria-label="Melding sluiten">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Result Entry Form */}
      {selectedMatch && (
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-green-200 dark:border-green-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Uitslag invoeren
          </h2>
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-900 dark:text-white">{selectedMatch.naam_A}</span>
              {' '}vs{' '}
              <span className="font-medium text-slate-900 dark:text-white">{selectedMatch.naam_B}</span>
              <span className="ml-2 text-xs text-slate-400">({selectedMatch.uitslag_code})</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {/* Player 1 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 pb-1">
                {selectedMatch.naam_A}
                <span className="ml-2 text-xs font-normal text-slate-400">(doel: {selectedMatch.cartem_A})</span>
              </h3>
              <div>
                <label htmlFor="sp1-cargem" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Caramboles gemaakt
                </label>
                <input
                  id="sp1-cargem"
                  type="number"
                  min="0"
                  value={formData.sp_1_cargem}
                  onChange={(e) => setFormData({ ...formData, sp_1_cargem: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="sp1-hs" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Hoogste serie
                </label>
                <input
                  id="sp1-hs"
                  type="number"
                  min="0"
                  value={formData.sp_1_hs}
                  onChange={(e) => setFormData({ ...formData, sp_1_hs: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors text-sm"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Player 2 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 pb-1">
                {selectedMatch.naam_B}
                <span className="ml-2 text-xs font-normal text-slate-400">(doel: {selectedMatch.cartem_B})</span>
              </h3>
              <div>
                <label htmlFor="sp2-cargem" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Caramboles gemaakt
                </label>
                <input
                  id="sp2-cargem"
                  type="number"
                  min="0"
                  value={formData.sp_2_cargem}
                  onChange={(e) => setFormData({ ...formData, sp_2_cargem: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="sp2-hs" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Hoogste serie
                </label>
                <input
                  id="sp2-hs"
                  type="number"
                  min="0"
                  value={formData.sp_2_hs}
                  onChange={(e) => setFormData({ ...formData, sp_2_hs: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors text-sm"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Shared fields */}
          <div className="mb-4">
            <label htmlFor="brt" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Aantal beurten
            </label>
            <input
              id="brt"
              type="number"
              min="1"
              value={formData.brt}
              onChange={(e) => setFormData({ ...formData, brt: e.target.value })}
              className="w-full max-w-xs px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors text-sm"
              placeholder="0"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmitResult}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              {isSubmitting ? 'Opslaan...' : 'Uitslag opslaan'}
            </button>
            <button
              onClick={() => { setSelectedMatch(null); setError(''); }}
              className="px-4 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      {/* Matches List with Results */}
      {matches.length === 0 && results.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Er zijn nog geen wedstrijden. Genereer eerst een planning.
          </p>
          <button
            onClick={() => router.push(`/competities/${compNr}/planning`)}
            className="mt-4 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors text-sm"
          >
            Naar planning
          </button>
        </div>
      ) : matches.length === 0 && results.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-2">
            Geen geplande wedstrijden.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
            Maak wedstrijden aan via de planning of bekijk bestaande uitslagen op de overzichtspagina.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => router.push(`/competities/${compNr}/planning`)}
              className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors text-sm"
            >
              Naar planning
            </button>
            <button
              onClick={() => router.push(`/competities/${compNr}/uitslagen/overzicht`)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors text-sm border border-slate-300 dark:border-slate-600"
            >
              Bekijk uitslagen overzicht
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {roundNumbers.map((roundNr) => (
            <div key={roundNr} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Ronde {roundNr}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Speler A</th>
                      <th className="text-center px-2 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Car.</th>
                      <th className="text-center px-2 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pnt</th>
                      <th className="text-center px-2 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Brt</th>
                      <th className="text-center px-2 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pnt</th>
                      <th className="text-center px-2 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Car.</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Speler B</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Datum</th>
                      <th className="text-center px-2 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actie</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {matchesByRound[roundNr].map((match) => {
                      const result = getResultForMatch(match.uitslag_code);
                      const isPlayed = match.gespeeld === 1 || !!result;

                      return (
                        <tr
                          key={match.id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${
                            selectedMatch?.uitslag_code === match.uitslag_code ? 'bg-green-50 dark:bg-green-900/20' : ''
                          }`}
                        >
                          <td className="px-4 py-2.5">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {match.naam_A}
                            </div>
                            <div className="text-xs text-slate-400">doel: {match.cartem_A}</div>
                          </td>
                          <td className="px-2 py-2.5 text-center text-sm tabular-nums">
                            {result ? (
                              <span className={result.sp_1_cargem >= match.cartem_A ? 'text-green-700 dark:text-green-400 font-bold' : 'text-slate-600 dark:text-slate-400'}>
                                {result.sp_1_cargem}
                              </span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600">-</span>
                            )}
                          </td>
                          <td className="px-2 py-2.5 text-center text-sm tabular-nums font-bold">
                            {result ? (
                              <span className={result.sp_1_punt > result.sp_2_punt ? 'text-green-700 dark:text-green-400' : result.sp_1_punt === result.sp_2_punt ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}>
                                {result.sp_1_punt}
                              </span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600">-</span>
                            )}
                          </td>
                          <td className="px-2 py-2.5 text-center text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                            {result ? result.brt : '-'}
                          </td>
                          <td className="px-2 py-2.5 text-center text-sm tabular-nums font-bold">
                            {result ? (
                              <span className={result.sp_2_punt > result.sp_1_punt ? 'text-green-700 dark:text-green-400' : result.sp_2_punt === result.sp_1_punt ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}>
                                {result.sp_2_punt}
                              </span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600">-</span>
                            )}
                          </td>
                          <td className="px-2 py-2.5 text-center text-sm tabular-nums">
                            {result ? (
                              <span className={result.sp_2_cargem >= match.cartem_B ? 'text-green-700 dark:text-green-400 font-bold' : 'text-slate-600 dark:text-slate-400'}>
                                {result.sp_2_cargem}
                              </span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {match.naam_B}
                            </div>
                            <div className="text-xs text-slate-400">doel: {match.cartem_B}</div>
                          </td>
                          <td className="px-4 py-2.5">
                            {result && result.speeldatum ? (
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                {formatDateTime(result.speeldatum)}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-300 dark:text-slate-600">-</span>
                            )}
                          </td>
                          <td className="px-2 py-2.5 text-center">
                            <div className="flex items-center gap-1 justify-center">
                              <button
                                onClick={() => handleSelectMatch(match)}
                                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                                  isPlayed
                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                }`}
                              >
                                {isPlayed ? 'Bewerken' : 'Invoeren'}
                              </button>
                              {isPlayed && result && (
                                deleteConfirm === result.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleDeleteResult(result)}
                                      disabled={isDeleting}
                                      className="text-xs px-2 py-1 rounded-md font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                    >
                                      {isDeleting ? '...' : 'Bevestigen'}
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm(null)}
                                      className="text-xs px-2 py-1 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                                    >
                                      Annuleren
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirm(result.id)}
                                    className="text-xs px-2 py-1 rounded-md font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    title="Verwijderen"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
