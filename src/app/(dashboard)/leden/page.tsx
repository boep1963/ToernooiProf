'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { DISCIPLINES } from '@/types';

interface MemberItem {
  id: string;
  spa_nummer: number;
  spa_vnaam: string;
  spa_tv: string;
  spa_anaam: string;
  spa_org: number;
  spa_moy_lib: number;
  spa_moy_band: number;
  spa_moy_3bkl: number;
  spa_moy_3bgr: number;
  spa_moy_kad: number;
}

// Discipline keys mapped to moyenne field names
const DISCIPLINE_MOY_KEYS: { key: keyof MemberItem; label: string }[] = [
  { key: 'spa_moy_lib', label: 'Libre' },
  { key: 'spa_moy_band', label: 'Band' },
  { key: 'spa_moy_3bkl', label: '3B kl.' },
  { key: 'spa_moy_3bgr', label: '3B gr.' },
  { key: 'spa_moy_kad', label: 'Kader' },
];

export default function LedenPage() {
  const { orgNummer } = useAuth();
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!orgNummer) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/members`);
      if (res.ok) {
        const data = await res.json();
        // Sort by spa_nummer
        const sorted = (data.members || []).sort(
          (a: MemberItem, b: MemberItem) => a.spa_nummer - b.spa_nummer
        );
        setMembers(sorted);
      } else {
        setError('Fout bij ophalen leden.');
      }
    } catch {
      setError('Er is een fout opgetreden bij het laden van de leden.');
    } finally {
      setIsLoading(false);
    }
  }, [orgNummer]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleDelete = async (memberNr: number) => {
    if (!orgNummer) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/members/${memberNr}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.spa_nummer !== memberNr));
        setDeleteConfirm(null);
      } else {
        setError('Fout bij verwijderen lid.');
      }
    } catch {
      setError('Er is een fout opgetreden bij het verwijderen.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatMoyenne = (value: number): string => {
    if (!value || value === 0) return '-';
    return value.toFixed(3);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Ledenbeheer
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Beheer de leden van uw vereniging
          </p>
        </div>
        <Link
          href="/leden/nieuw"
          className="flex items-center gap-2 px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nieuw lid
        </Link>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Leden laden...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-3">
            Er zijn nog geen leden aangemaakt.
          </p>
          <Link
            href="/leden/nieuw"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Eerste lid toevoegen
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nr</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Naam</th>
                  {DISCIPLINE_MOY_KEYS.map(d => (
                    <th key={d.key} className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {d.label}
                    </th>
                  ))}
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 tabular-nums">{member.spa_nummer}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {member.spa_vnaam}
                        {member.spa_tv ? ` ${member.spa_tv}` : ''}
                        {member.spa_anaam ? ` ${member.spa_anaam}` : ''}
                      </span>
                    </td>
                    {DISCIPLINE_MOY_KEYS.map(d => (
                      <td key={d.key} className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 text-right tabular-nums">
                        {formatMoyenne(member[d.key] as number)}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      {deleteConfirm === member.spa_nummer ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(member.spa_nummer)}
                            disabled={deleteLoading}
                            className="text-xs px-2.5 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md transition-colors"
                          >
                            {deleteLoading ? 'Bezig...' : 'Bevestigen'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-xs px-2.5 py-1.5 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded-md transition-colors"
                          >
                            Annuleren
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/leden/${member.spa_nummer}/bewerken`}
                            className="text-xs px-2.5 py-1.5 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-md transition-colors"
                          >
                            Bewerken
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(member.spa_nummer)}
                            className="text-xs px-2.5 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                          >
                            Verwijderen
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {members.length} {members.length === 1 ? 'lid' : 'leden'} gevonden
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
