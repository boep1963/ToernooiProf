'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { DISCIPLINES, MOYENNE_MULTIPLIERS } from '@/types';
import { calculateCaramboles, getMoyenneField, formatPlayerName } from '@/lib/billiards';
import CompetitionSubNav from '@/components/CompetitionSubNav';

interface CompetitionData {
  id: string;
  comp_nr: number;
  comp_naam: string;
  comp_datum: string;
  discipline: number;
  moy_form: number;
  min_car: number;
  punten_sys: number;
  sorteren: number;
  periode: number;
}

interface PlayerData {
  id: string;
  spc_nummer: number;
  spa_vnaam: string;
  spa_tv: string;
  spa_anaam: string;
  spc_moyenne_1: number;
  spc_moyenne_2: number;
  spc_moyenne_3: number;
  spc_moyenne_4: number;
  spc_moyenne_5: number;
  spc_car_1: number;
  spc_car_2: number;
  spc_car_3: number;
  spc_car_4: number;
  spc_car_5: number;
  discipline_moyenne?: number;
  discipline_caramboles?: number;
}

interface MemberData {
  id: string;
  spa_nummer: number;
  spa_vnaam: string;
  spa_tv: string;
  spa_anaam: string;
  spa_moy_lib: number;
  spa_moy_band: number;
  spa_moy_3bkl: number;
  spa_moy_3bgr: number;
  spa_moy_kad: number;
}

// Map discipline to moyenne index (1-5)
const DISCIPLINE_TO_MOY_INDEX: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };
const DISCIPLINE_TO_CAR_KEY: Record<number, keyof PlayerData> = {
  1: 'spc_car_1', 2: 'spc_car_2', 3: 'spc_car_3', 4: 'spc_car_4', 5: 'spc_car_5',
};
const DISCIPLINE_TO_MOY_KEY: Record<number, keyof PlayerData> = {
  1: 'spc_moyenne_1', 2: 'spc_moyenne_2', 3: 'spc_moyenne_3', 4: 'spc_moyenne_4', 5: 'spc_moyenne_5',
};

export default function CompetitieSpelersPage() {
  const params = useParams();
  const router = useRouter();
  const { orgNummer } = useAuth();

  const compNr = parseInt(params.id as string, 10);

  const [competition, setCompetition] = useState<CompetitionData | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<PlayerData | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [resultCount, setResultCount] = useState<number>(0);
  const [loadingResultCount, setLoadingResultCount] = useState(false);

  const fetchData = useCallback(async () => {
    if (!orgNummer || isNaN(compNr)) return;
    setIsLoading(true);
    setError('');
    try {
      // Fetch competition, players, and members in parallel
      const [compRes, playersRes, membersRes] = await Promise.all([
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}`),
        fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/players`),
        fetch(`/api/organizations/${orgNummer}/members`),
      ]);

      if (!compRes.ok) {
        setError('Competitie niet gevonden.');
        setIsLoading(false);
        return;
      }

      const compData = await compRes.json();
      setCompetition(compData);

      if (playersRes.ok) {
        const playersData = await playersRes.json();
        setPlayers(playersData.players || []);
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.members || []);
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

  // Get members not yet in the competition
  const availableMembers = members.filter(
    (m) => !players.some((p) => p.spc_nummer === m.spa_nummer)
  );

  // Get the moyenne for the selected member for the competition's discipline
  const getSelectedMemberMoyenne = (): number => {
    if (!selectedMember || !competition) return 0;
    const member = members.find((m) => m.spa_nummer === selectedMember);
    if (!member) return 0;
    const field = getMoyenneField(competition.discipline) as keyof MemberData;
    return Number(member[field]) || 0;
  };

  // Calculate caramboles for the selected member
  const getSelectedMemberCaramboles = (): number => {
    if (!competition) return 0;
    const moyenne = getSelectedMemberMoyenne();
    return calculateCaramboles(moyenne, competition.moy_form, competition.min_car);
  };

  const handleAddPlayer = async () => {
    if (!orgNummer || !selectedMember || !competition) return;
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(
        `/api/organizations/${orgNummer}/competitions/${compNr}/players`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spc_nummer: selectedMember }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setPlayers((prev) => [...prev, data]);
        setShowAddDialog(false);
        setSelectedMember(null);
        const member = members.find((m) => m.spa_nummer === selectedMember);
        const naam = member
          ? [member.spa_vnaam, member.spa_tv, member.spa_anaam].filter(Boolean).join(' ')
          : `Speler ${selectedMember}`;
        setSuccess(`${naam} is succesvol toegevoegd aan de competitie!`);
        setTimeout(() => setSuccess(''), 4000);
      } else {
        const data = await res.json();
        setError(data.error || 'Fout bij toevoegen speler.');
      }
    } catch {
      setError('Er is een fout opgetreden.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkAddPlayers = async () => {
    if (!orgNummer || selectedMembers.length === 0 || !competition) return;
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(
        `/api/organizations/${orgNummer}/competitions/${compNr}/players`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spc_nummers: selectedMembers }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        // Add all new players to the list
        if (data.players) {
          setPlayers((prev) => [...prev, ...data.players]);
        }
        setShowAddDialog(false);
        setBulkMode(false);
        setSelectedMembers([]);
        setSuccess(`${data.count} speler(s) succesvol toegevoegd aan de competitie!`);
        if (data.errors && data.errors.length > 0) {
          setSuccess(`${data.count} speler(s) toegevoegd. ${data.errors.length} overgeslagen (al toegevoegd of niet gevonden).`);
        }
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const data = await res.json();
        setError(data.error || 'Fout bij toevoegen spelers.');
      }
    } catch {
      setError('Er is een fout opgetreden.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMemberSelection = (memberNummer: number) => {
    setSelectedMembers((prev) => {
      if (prev.includes(memberNummer)) {
        return prev.filter((n) => n !== memberNummer);
      } else {
        return [...prev, memberNummer];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedMembers.length === availableMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(availableMembers.map((m) => m.spa_nummer));
    }
  };

  const fetchResultCount = async (playerNummer: number) => {
    if (!orgNummer) return;
    setLoadingResultCount(true);
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/competitions/${compNr}/results`);
      if (res.ok) {
        const data = await res.json();
        const results = data.results || [];
        // Count results where this player is sp_1_nr or sp_2_nr
        const count = results.filter((r: any) => r.sp_1_nr === playerNummer || r.sp_2_nr === playerNummer).length;
        setResultCount(count);
      }
    } catch {
      setResultCount(0);
    } finally {
      setLoadingResultCount(false);
    }
  };

  const handleRemovePlayer = async () => {
    if (!orgNummer || !playerToRemove) return;
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(
        `/api/organizations/${orgNummer}/competitions/${compNr}/players`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spc_nummer: playerToRemove.spc_nummer }),
        }
      );

      if (res.ok) {
        setPlayers((prev) => prev.filter((p) => p.spc_nummer !== playerToRemove.spc_nummer));
        const naam = formatName(playerToRemove.spa_vnaam, playerToRemove.spa_tv, playerToRemove.spa_anaam);
        setSuccess(`${naam} is succesvol verwijderd uit de competitie!`);
        setTimeout(() => setSuccess(''), 4000);
        setShowRemoveDialog(false);
        setPlayerToRemove(null);
      } else {
        const data = await res.json();
        setError(data.error || 'Fout bij verwijderen speler.');
      }
    } catch {
      setError('Er is een fout opgetreden.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get discipline-specific moyenne and caramboles for a player
  const getPlayerDisciplineMoy = (player: PlayerData): number => {
    if (!competition) return 0;
    const key = DISCIPLINE_TO_MOY_KEY[competition.discipline];
    return key ? Number(player[key]) || 0 : 0;
  };

  const getPlayerDisciplineCar = (player: PlayerData): number => {
    if (!competition) return 0;
    const key = DISCIPLINE_TO_CAR_KEY[competition.discipline];
    return key ? Number(player[key]) || 0 : 0;
  };

  const formatName = (vnaam: string, tv: string, anaam: string): string => {
    return formatPlayerName(vnaam, tv, anaam, competition?.sorteren || 1);
  };

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

  return (
    <div>
      <CompetitionSubNav compNr={compNr} compNaam={competition.comp_naam} periode={competition.periode || 1} />

      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Spelers - {competition.comp_naam}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {DISCIPLINES[competition.discipline]} | Formule: x{multiplier} | Min. caramboles: {competition.min_car}
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

      {/* Add Player Dialog */}
      {showAddDialog && (
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {bulkMode ? 'Meerdere spelers toevoegen' : 'Speler toevoegen'}
            </h2>
            {availableMembers.length > 0 && (
              <button
                onClick={() => {
                  setBulkMode(!bulkMode);
                  setSelectedMember(null);
                  setSelectedMembers([]);
                }}
                className="text-sm text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:underline font-medium transition-colors"
              >
                {bulkMode ? 'Schakel naar enkelvoudig' : 'Schakel naar bulk'}
              </button>
            )}
          </div>

          {availableMembers.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Alle leden zijn al toegevoegd aan deze competitie, of er zijn nog geen leden aangemaakt.
            </p>
          ) : bulkMode ? (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Selecteer leden ({selectedMembers.length} van {availableMembers.length})
                  </label>
                  <button
                    onClick={toggleSelectAll}
                    className="text-sm text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:underline font-medium transition-colors"
                  >
                    {selectedMembers.length === availableMembers.length ? 'Deselecteer alles' : 'Selecteer alles'}
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg">
                  {availableMembers.map((m) => (
                    <label
                      key={m.spa_nummer}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer border-b border-slate-200 dark:border-slate-700 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(m.spa_nummer)}
                        onChange={() => toggleMemberSelection(m.spa_nummer)}
                        className="w-4 h-4 text-green-700 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-green-500"
                      />
                      <span className="flex-1 text-sm text-slate-900 dark:text-white">
                        {formatName(m.spa_vnaam, m.spa_tv, m.spa_anaam)} (Nr. {m.spa_nummer})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleBulkAddPlayers}
                  disabled={selectedMembers.length === 0 || isSubmitting}
                  className="px-4 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  {isSubmitting ? 'Bezig...' : `${selectedMembers.length} speler(s) toevoegen`}
                </button>
                <button
                  onClick={() => { setShowAddDialog(false); setBulkMode(false); setSelectedMembers([]); }}
                  className="px-4 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
                >
                  Annuleren
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label htmlFor="member-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Selecteer een lid
                </label>
                <select
                  id="member-select"
                  value={selectedMember || ''}
                  onChange={(e) => setSelectedMember(Number(e.target.value) || null)}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                >
                  <option value="">-- Kies een lid --</option>
                  {availableMembers.map((m) => (
                    <option key={m.spa_nummer} value={m.spa_nummer}>
                      {formatName(m.spa_vnaam, m.spa_tv, m.spa_anaam)} (Nr. {m.spa_nummer})
                    </option>
                  ))}
                </select>
              </div>

              {selectedMember && (
                <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Berekende caramboles
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Moyenne ({DISCIPLINES[competition.discipline]}):</span>
                      <span className="ml-2 font-medium text-slate-900 dark:text-white">
                        {getSelectedMemberMoyenne().toFixed(3)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Formule:</span>
                      <span className="ml-2 font-medium text-slate-900 dark:text-white">
                        {getSelectedMemberMoyenne().toFixed(3)} x {multiplier} = {(getSelectedMemberMoyenne() * multiplier).toFixed(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Caramboles (min. {competition.min_car}):</span>
                      <span className="ml-2 font-bold text-green-700 dark:text-green-400">
                        {getSelectedMemberCaramboles()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddPlayer}
                  disabled={!selectedMember || isSubmitting}
                  className="px-4 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  {isSubmitting ? 'Bezig...' : 'Toevoegen'}
                </button>
                <button
                  onClick={() => { setShowAddDialog(false); setSelectedMember(null); }}
                  className="px-4 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
                >
                  Annuleren
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Add Player Button */}
      {!showAddDialog && (
        <div className="mb-4">
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Speler toevoegen
          </button>
        </div>
      )}

      {/* Players Table */}
      {players.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Er zijn nog geen spelers toegevoegd aan deze competitie.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Naam</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Moyenne</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Caramboles</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {players.map((player) => (
                  <tr key={player.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {formatName(player.spa_vnaam, player.spa_tv, player.spa_anaam)} ({getPlayerDisciplineCar(player)})
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 text-right tabular-nums">
                      {getPlayerDisciplineMoy(player).toFixed(3)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-green-700 dark:text-green-400 text-right tabular-nums">
                      {getPlayerDisciplineCar(player)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setPlayerToRemove(player);
                          setShowRemoveDialog(true);
                          fetchResultCount(player.spc_nummer);
                        }}
                        className="text-xs px-2.5 py-1.5 text-red-600 dark:text-red-200 border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors font-medium"
                      >
                        Verwijderen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {players.length} {players.length === 1 ? 'speler' : 'spelers'} in competitie
            </p>
          </div>
        </div>
      )}

      {/* Remove Player Confirmation Dialog */}
      {showRemoveDialog && playerToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Speler verwijderen
            </h3>
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                ⚠️ Waarschuwing: Dit kan niet ongedaan gemaakt worden!
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                Bij het verwijderen van <strong>{formatName(playerToRemove.spa_vnaam, playerToRemove.spa_tv, playerToRemove.spa_anaam)}</strong> worden ook verwijderd:
              </p>
              <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                {loadingResultCount ? (
                  <li>Uitslagen controleren...</li>
                ) : (
                  <li><strong>{resultCount} uitslag{resultCount !== 1 ? 'en' : ''}</strong> {resultCount > 0 ? 'worden verwijderd (zowel van deze speler als van tegenstanders)' : '(deze speler heeft nog geen uitslagen)'}</li>
                )}
                <li>Alle wedstrijden waar deze speler aan deelneemt</li>
              </ul>
              {!loadingResultCount && resultCount > 0 && (
                <p className="mt-3 text-sm font-semibold text-red-700 dark:text-red-400">
                  Dit heeft consequenties voor de stand van {resultCount > 1 ? 'alle betrokken spelers' : 'de tegenstander'}.
                </p>
              )}
              <p className="mt-3 text-xs text-red-600 dark:text-red-400 font-medium">
                De speler kan wel opnieuw worden toegevoegd aan de competitie.
              </p>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Weet u zeker dat u wilt doorgaan?
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => { setShowRemoveDialog(false); setPlayerToRemove(null); }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
              >
                Annuleren
              </button>
              <button
                onClick={handleRemovePlayer}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                {isSubmitting ? 'Bezig...' : 'Ja, verwijder speler'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
