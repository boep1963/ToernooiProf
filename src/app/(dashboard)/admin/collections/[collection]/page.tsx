'use client';

import React, { useEffect, useState } from 'react';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Document {
  id: string;
  keyFields: Record<string, any>;
  allFieldsCount: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CollectionResponse {
  success: boolean;
  collection: string;
  documents: Document[];
  pagination: Pagination;
  searchTerm: string;
}

export default function CollectionDetailPage() {
  const { isSuperAdmin } = useSuperAdmin();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const collection = params.collection as string;

  const [documents, setDocuments] = useState<Document[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Fetch documents
  useEffect(() => {
    if (!isSuperAdmin) return;

    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '25',
        });
        if (searchTerm) {
          params.set('search', searchTerm);
        }

        const response = await fetch(`/api/admin/collections/${collection}?${params}`);
        if (!response.ok) {
          throw new Error('Fout bij ophalen documenten');
        }

        const data: CollectionResponse = await response.json();
        setDocuments(data.documents);
        setPagination(data.pagination);
      } catch (err) {
        console.error('[ADMIN] Error fetching documents:', err);
        setError('Fout bij ophalen documenten. Probeer het later opnieuw.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [isSuperAdmin, collection, currentPage, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput) {
      params.set('search', searchInput);
    }
    router.push(`/admin/collections/${collection}?${params}`);
    setSearchTerm(searchInput);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    router.push(`/admin/collections/${collection}?${params}`);
  };

  if (!isSuperAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h1 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Geen toegang</h1>
          <p className="text-red-600 dark:text-red-300">
            U heeft geen beheerderstoegang.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/admin" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
          Admin
        </Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium text-slate-900 dark:text-white">{collection}</span>
      </nav>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{collection}</h1>
            {pagination && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {pagination.total.toLocaleString('nl-NL')} documenten
              </p>
            )}
          </div>
        </div>
        <Link
          href={`/admin/collections/${collection}/nieuw`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nieuw document
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Zoeken in documenten..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
          >
            Zoeken
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setSearchTerm('');
                router.push(`/admin/collections/${collection}`);
              }}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Wissen
            </button>
          )}
        </form>
        {searchTerm && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Zoeken naar: <span className="font-medium text-slate-900 dark:text-white">{searchTerm}</span>
          </p>
        )}
      </div>

      {/* Documents Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 dark:border-green-400"></div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Laden...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && documents.length === 0 && (
            <div className="p-12 text-center">
              <svg className="w-12 h-12 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-500 dark:text-slate-400">
                {searchTerm ? 'Geen documenten gevonden met deze zoekopdracht.' : 'Geen documenten in deze collectie.'}
              </p>
            </div>
          )}

          {!loading && !error && documents.length > 0 && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Document ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Velden
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <code className="text-xs font-mono text-slate-900 dark:text-white break-all">
                          {doc.id}
                        </code>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {Object.entries(doc.keyFields)
                          .filter(([key]) => key !== 'id')
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="text-slate-500 dark:text-slate-400">{key}:</span>{' '}
                              <span className="text-slate-900 dark:text-white font-medium">
                                {typeof value === 'string' && value.length > 50
                                  ? value.substring(0, 50) + '...'
                                  : String(value)}
                              </span>
                            </div>
                          ))}
                        {doc.allFieldsCount > 4 && (
                          <div className="text-xs text-slate-400">
                            +{doc.allFieldsCount - 4} meer velden
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/collections/${collection}/${doc.id}`}
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
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Pagina {pagination.page} van {pagination.totalPages} ({pagination.total.toLocaleString('nl-NL')} totaal)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className={`px-3 py-1 rounded border ${
                  pagination.hasPrev
                    ? 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                } text-sm transition-colors`}
              >
                Vorige
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className={`px-3 py-1 rounded border ${
                  pagination.hasNext
                    ? 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                } text-sm transition-colors`}
              >
                Volgende
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
