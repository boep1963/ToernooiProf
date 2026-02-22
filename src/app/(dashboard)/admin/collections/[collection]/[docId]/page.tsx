'use client';

import React, { useEffect, useState } from 'react';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface DocumentData {
  id: string;
  data: Record<string, any>;
}

interface DocumentResponse {
  success: boolean;
  document: DocumentData;
}

export default function DocumentDetailPage() {
  const { isSuperAdmin } = useSuperAdmin();
  const router = useRouter();
  const params = useParams();
  const collection = params.collection as string;
  const docId = params.docId as string;

  const [document, setDocument] = useState<DocumentData | null>(null);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch document
  useEffect(() => {
    if (!isSuperAdmin) return;

    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/admin/collections/${collection}/${docId}`);
        if (!response.ok) {
          throw new Error('Fout bij ophalen document');
        }

        const data: DocumentResponse = await response.json();
        setDocument(data.document);
        setEditedData(data.document.data);
      } catch (err) {
        console.error('[ADMIN] Error fetching document:', err);
        setError('Fout bij ophalen document. Probeer het later opnieuw.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [isSuperAdmin, collection, docId]);

  const handleFieldChange = (key: string, value: any) => {
    setEditedData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/admin/collections/${collection}/${docId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: editedData }),
      });

      if (!response.ok) {
        throw new Error('Fout bij opslaan document');
      }

      setSuccess('Document succesvol opgeslagen!');

      // Refresh document data
      const getResponse = await fetch(`/api/admin/collections/${collection}/${docId}`);
      if (getResponse.ok) {
        const data: DocumentResponse = await getResponse.json();
        setDocument(data.document);
        setEditedData(data.document.data);
      }
    } catch (err) {
      console.error('[ADMIN] Error saving document:', err);
      setError('Fout bij opslaan document. Probeer het later opnieuw.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError(null);

      const response = await fetch(`/api/admin/collections/${collection}/${docId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Fout bij verwijderen document');
      }

      // Redirect to collection list
      router.push(`/admin/collections/${collection}`);
    } catch (err) {
      console.error('[ADMIN] Error deleting document:', err);
      setError('Fout bij verwijderen document. Probeer het later opnieuw.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const detectFieldType = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') return 'string';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'unknown';
  };

  const renderFieldInput = (key: string, value: any) => {
    const type = detectFieldType(value);

    switch (type) {
      case 'boolean':
        return (
          <select
            value={editedData[key] ? 'true' : 'false'}
            onChange={(e) => handleFieldChange(key, e.target.value === 'true')}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            value={editedData[key] || ''}
            onChange={(e) => handleFieldChange(key, parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        );
      case 'array':
      case 'object':
        return (
          <textarea
            value={JSON.stringify(editedData[key], null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleFieldChange(key, parsed);
              } catch {
                // Invalid JSON, don't update
              }
            }}
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        );
      case 'string':
      default:
        return (
          <textarea
            value={editedData[key] || ''}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        );
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
          <h1 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Geen toegang</h1>
          <p className="text-red-600 dark:text-red-300">
            U heeft geen beheerderstoegang.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 dark:border-green-400"></div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Laden...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
          <h1 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Document niet gevonden</h1>
          <Link
            href={`/admin/collections/${collection}`}
            className="mt-4 inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Naar collectie
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/admin" className="hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors">
          Admin
        </Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link href={`/admin/collections/${collection}`} className="hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors">
          {collection}
        </Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium text-slate-900 dark:text-white">{docId}</span>
      </nav>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Document Details</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{docId}</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      {/* Document Fields */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Velden</h2>
        </div>

        <div className="p-6 space-y-4">
          {Object.entries(editedData).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {key}
                </label>
                <span className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">
                  {detectFieldType(value)}
                </span>
              </div>
              {renderFieldInput(key, value)}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={deleting}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Verwijderen
        </button>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/collections/${collection}`}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Annuleren
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Document verwijderen?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Weet u zeker dat u dit document wilt verwijderen? Deze actie kan niet ongedaan gemaakt worden.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Verwijderen...' : 'Verwijderen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
