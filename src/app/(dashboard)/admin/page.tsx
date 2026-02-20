'use client';

import React, { useEffect, useState } from 'react';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Collection {
  name: string;
  count: number;
  error?: string;
}

interface CollectionsResponse {
  success: boolean;
  collections: Collection[];
  total: number;
}

export default function AdminPage() {
  const { isSuperAdmin } = useSuperAdmin();
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch collections data
  useEffect(() => {
    if (!isSuperAdmin) return;

    const fetchCollections = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/collections');
        if (!response.ok) {
          throw new Error('Fout bij ophalen collecties');
        }
        const data: CollectionsResponse = await response.json();
        setCollections(data.collections);
      } catch (err) {
        console.error('[ADMIN] Error fetching collections:', err);
        setError('Fout bij ophalen collecties. Probeer het later opnieuw.');
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h1 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Geen toegang</h1>
          <p className="text-red-600 dark:text-red-300">
            U heeft geen beheerderstoegang. Deze pagina is alleen beschikbaar voor systeembeheerders.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Terug naar dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <svg className="w-6 h-6 text-green-700 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Beheerder Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Systeembeheer en configuratie</p>
        </div>
      </div>

      {/* Introduction and Explanation */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Welkom bij het Admin-paneel</h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Dit paneel is exclusief beschikbaar voor systeembeheerders en biedt inzicht in de onderliggende database-structuur van ClubMatch.
            </p>
          </div>
        </div>

        <div className="space-y-3 ml-9">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Wat is een Firestore Collectie?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Firestore is de database van ClubMatch. Elke <strong>collectie</strong> bevat gerelateerde gegevens: bijvoorbeeld de collectie <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">organizations</code> bevat alle organisaties, <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">competitions</code> alle competities, enzovoort.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Wat betekent het aantal documenten?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Elk document is één record in de database. Bijvoorbeeld: 50 documenten in de collectie <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">members</code> betekent dat er 50 leden zijn opgeslagen in het systeem.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Wat kunt u doen met de &quot;Bekijken&quot; link?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Door op <strong>Bekijken</strong> te klikken bij een collectie, kunt u de individuele documenten inzien. Dit is handig voor het controleren van data, het opsporen van fouten, of het inspecteren van specifieke records (bijvoorbeeld het bekijken van alle uitslagen in een competitie).
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">Let op!</p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Deze pagina is bedoeld voor monitoring en controle. Wijzigingen aan de database moeten via de normale applicatie-interface (Competities, Leden, etc.) worden gedaan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Firestore Collections */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Firestore Collecties</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">ClubMatch/data namespace</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 dark:border-green-400"></div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Laden...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Collectie
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Documenten
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map((collection) => (
                    <tr
                      key={collection.name}
                      className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {collection.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {collection.error ? (
                            <span className="text-red-500">Fout</span>
                          ) : (
                            collection.count.toLocaleString('nl-NL')
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/collections/${collection.name}`}
                          className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                        >
                          Bekijken
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 dark:border-slate-600">
                    <td className="py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Totaal
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {collections.reduce((sum, col) => sum + (col.error ? 0 : col.count), 0).toLocaleString('nl-NL')}
                    </td>
                    <td className="py-3 px-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
