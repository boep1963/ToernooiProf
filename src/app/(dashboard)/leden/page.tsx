'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { formatDecimal } from '@/lib/formatUtils';
// Types imported from shared types module

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

/**
 * Build a full display name from member parts.
 * Search uses String.includes() instead of regex, making it inherently safe
 * against special characters like (, ), [, ], *, +, $, ^, etc.
 */
function getMemberFullName(member: MemberItem): string {
  const parts: string[] = [];
  if (member.spa_vnaam) parts.push(member.spa_vnaam);
  if (member.spa_tv) parts.push(member.spa_tv);
  if (member.spa_anaam) parts.push(member.spa_anaam);
  return parts.join(' ');
}

export default function LedenPage() {
  const { orgNummer, organization } = useAuth();
  const pathname = usePathname();
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset search when pathname changes (navigating away and back)
  useEffect(() => {
    setSearchQuery('');
  }, [pathname]);

  // Print CSS styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page { size: A4 portrait; margin: 2cm; }
        body * { visibility: hidden; }
        #print-area, #print-area * { visibility: visible; }
        #print-header, #print-header * { visibility: visible; }
        #print-area {
          position: absolute;
          left: 0;
          top: 4cm;
          width: 100%;
          color: black !important;
        }
        #print-header {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          margin-bottom: 1cm;
          border-bottom: 2px solid #333;
          padding-bottom: 0.5cm;
          color: black !important;
        }
        #print-area table { border-collapse: collapse; width: 100%; }
        #print-area th, #print-area td {
          border: 1px solid #333 !important;
          padding: 6px !important;
          color: black !important;
          background: white !important;
        }
        #print-area th { background: #f0f0f0 !important; font-weight: bold; }
        .print\\:hidden { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const fetchMembers = useCallback(async () => {
    if (!orgNummer) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/members`);
      if (res.ok) {
        const data = await res.json();
        // Sort alphabetically by full name
        const sorted = (data.members || []).sort(
          (a: MemberItem, b: MemberItem) => {
            const nameA = getMemberFullName(a).toLowerCase();
            const nameB = getMemberFullName(b).toLowerCase();
            return nameA.localeCompare(nameB, 'nl');
          }
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

  // Refetch when page gains focus (e.g. returning from bewerken) so moyenne changes show immediately
  useEffect(() => {
    const onFocus = () => {
      if (orgNummer) fetchMembers();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [orgNummer, fetchMembers]);

  // Filter members based on search query (case-insensitive, partial match, special-char-safe)
  const filteredMembers = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return members;

    const lowerQuery = trimmed.toLowerCase();
    return members.filter((member) => {
      const fullName = getMemberFullName(member).toLowerCase();
      return fullName.includes(lowerQuery);
    });
  }, [members, searchQuery]);

  const handleDelete = async (memberNr: number) => {
    if (!orgNummer) return;
    setDeleteLoading(true);
    setError('');
    setSuccess('');
    try {
      const deletedMember = members.find(m => m.spa_nummer === memberNr);
      const res = await fetch(`/api/organizations/${orgNummer}/members/${memberNr}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const naam = deletedMember ? getMemberFullName(deletedMember) : `#${memberNr}`;
        setMembers(prev => prev.filter(m => m.spa_nummer !== memberNr));
        setDeleteConfirm(null);
        setSuccess(`Lid "${naam}" is succesvol verwijderd.`);
        setTimeout(() => setSuccess(''), 4000);
      } else {
        // Parse error response for detailed message
        const errorData = await res.json();
        if (res.status === 409 && errorData.competitions) {
          // Member is linked to competitions - show detailed error
          const competitionList = errorData.competitions
            .map((c: { comp_nr: number; comp_naam: string }) => `${c.comp_naam} (#${c.comp_nr})`)
            .join(', ');
          setError(`${errorData.message} Competities: ${competitionList}`);
        } else {
          setError(errorData.error || 'Fout bij verwijderen lid.');
        }
        setDeleteConfirm(null);
      }
    } catch {
      setError('Er is een fout opgetreden bij het verwijderen.');
      setDeleteConfirm(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatMoyenne = (value: number): string => {
    if (!value || value === 0) return '-';
    return formatDecimal(value);
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
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            disabled={members.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-lg transition-colors shadow-sm"
            title={members.length === 0 ? 'Geen leden om te printen' : 'Print ledenoverzicht'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
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
      </div>

      {error && (
        <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800 flex items-center justify-between">
          <span>{error}</span>
          <div className="flex items-center gap-2 ml-3">
            <button onClick={fetchMembers} className="text-xs px-2.5 py-1 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300 rounded-md transition-colors font-medium">
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

      {/* Search input */}
      {!isLoading && members.length > 0 && (
        <div className="mb-4 print:hidden">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zoek op naam..."
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-600 dark:focus:border-green-600 outline-none transition-colors"
              aria-label="Zoek leden op naam"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label="Zoekopdracht wissen"
                title="Zoekopdracht wissen"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
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
        <>
          {/* Print-only header */}
          <div id="print-header" className="hidden print:block mb-4">
            <h1 className="text-xl font-bold mb-2">{organization?.org_naam || 'Ledenoverzicht'}</h1>
            <p className="text-sm mb-1">Ledenbeheer</p>
            <p className="text-xs">Afgedrukt op: <span suppressHydrationWarning>{new Date().toLocaleDateString('nl-NL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span></p>
          </div>

          <div id="print-area" className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* No results from search */}
            {filteredMembers.length === 0 && searchQuery.trim() !== '' ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  Geen leden gevonden voor &ldquo;{searchQuery.trim()}&rdquo;
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-green-700 dark:text-green-400 hover:underline"
                >
                  Zoekopdracht wissen
                </button>
              </div>
            ) : (
            <>
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
                      <th className="print:hidden text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acties</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredMembers.map((member) => (
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
                        <td className="print:hidden px-4 py-3 text-right">
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
                                className="text-xs px-2.5 py-1.5 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-md transition-colors font-medium"
                              >
                                Bewerken
                              </Link>
                              <button
                                onClick={() => setDeleteConfirm(member.spa_nummer)}
                                className="text-xs px-2.5 py-1.5 text-red-600 dark:text-red-200 border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors font-medium"
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
                  {searchQuery.trim()
                    ? `${filteredMembers.length} van ${members.length} ${members.length === 1 ? 'lid' : 'leden'} gevonden`
                    : `${members.length} ${members.length === 1 ? 'lid' : 'leden'} gevonden`
                  }
                </p>
              </div>
            </>
          )}
          </div>
        </>
      )}
    </div>
  );
}
