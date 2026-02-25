'use client';

import React, { useState } from 'react';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';

interface Field {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  value: string;
}

export default function NewDocumentPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = use(params);
  const { isSuperAdmin } = useSuperAdmin();
  const router = useRouter();

  const [useAutoId, setUseAutoId] = useState(true);
  const [customId, setCustomId] = useState('');
  const [fields, setFields] = useState<Field[]>([
    { id: crypto.randomUUID(), name: '', type: 'string', value: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addField = () => {
    setFields([...fields, { id: crypto.randomUUID(), name: '', type: 'string', value: '' }]);
  };

  const removeField = (id: string) => {
    if (fields.length > 1) {
      setFields(fields.filter((f) => f.id !== id));
    }
  };

  const updateField = (id: string, key: keyof Field, value: string) => {
    setFields(
      fields.map((f) => (f.id === id ? { ...f, [key]: value } : f))
    );
  };

  const parseFieldValue = (field: Field): any => {
    const { type, value } = field;

    if (value.trim() === '') {
      return type === 'string' ? '' : null;
    }

    switch (type) {
      case 'string':
        return value;
      case 'number':
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      case 'boolean':
        return value.toLowerCase() === 'true' || value === '1';
      case 'array':
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : null;
        } catch {
          return null;
        }
      case 'object':
        try {
          const parsed = JSON.parse(value);
          return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
            ? parsed
            : null;
        } catch {
          return null;
        }
      default:
        return value;
    }
  };

  const validateForm = (): string | null => {
    // Validate custom ID if not using auto-generated
    if (!useAutoId && !customId.trim()) {
      return 'Document ID is verplicht wanneer u geen automatische ID gebruikt.';
    }

    // Check for duplicate field names
    const fieldNames = fields.map((f) => f.name.trim()).filter((n) => n !== '');
    const uniqueNames = new Set(fieldNames);
    if (fieldNames.length !== uniqueNames.size) {
      return 'Veldnamen moeten uniek zijn.';
    }

    // Validate at least one field with a name
    if (fieldNames.length === 0) {
      return 'Voeg minimaal één veld toe met een naam.';
    }

    // Validate field values based on type
    for (const field of fields) {
      if (!field.name.trim()) continue; // Skip unnamed fields

      const parsed = parseFieldValue(field);

      if (parsed === null && field.value.trim() !== '') {
        return `Ongeldige waarde voor veld "${field.name}" (type: ${field.type}).`;
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      // Build document data from fields
      const documentData: Record<string, any> = {};
      for (const field of fields) {
        if (field.name.trim() === '') continue; // Skip unnamed fields
        documentData[field.name.trim()] = parseFieldValue(field);
      }

      // Prepare request body
      const body: any = { data: documentData };
      if (!useAutoId && customId.trim()) {
        body.docId = customId.trim();
      }

      // Send POST request
      const response = await fetch(`/api/admin/collections/${collection}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fout bij aanmaken document');
      }

      const result = await response.json();

      // Show success and redirect
      setSuccess(true);
      setTimeout(() => {
        router.push(`/admin/collections/${collection}/${result.docId}`);
      }, 1000);
    } catch (err: any) {
      console.error('[ADMIN] Error creating document:', err);
      setError(err.message || 'Fout bij aanmaken document. Probeer het later opnieuw.');
    } finally {
      setLoading(false);
    }
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/admin" className="hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors">
          Admin
        </Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link
          href={`/admin/collections/${collection}`}
          className="hover:text-green-600 dark:hover:text-green-400 hover:underline transition-colors"
        >
          {collection}
        </Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium text-slate-900 dark:text-white">Nieuw document</span>
      </nav>

      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nieuw document aanmaken</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Collectie: <span className="font-medium">{collection}</span>
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              Document succesvol aangemaakt! U wordt doorgestuurd...
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document ID Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Document ID</h2>

          {/* Auto-generated vs Custom ID */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="idType"
                checked={useAutoId}
                onChange={() => setUseAutoId(true)}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Automatisch gegenereerde ID (aanbevolen)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="idType"
                checked={!useAutoId}
                onChange={() => setUseAutoId(false)}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Aangepaste ID</span>
            </label>

            {!useAutoId && (
              <input
                type="text"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                placeholder="Voer document ID in..."
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            )}
          </div>
        </div>

        {/* Document Fields Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Document velden</h2>
            <button
              type="button"
              onClick={addField}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Veld toevoegen
            </button>
          </div>

          {/* Field List */}
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Veld #{index + 1}
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(field.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Field Name */}
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(field.id, 'name', e.target.value)}
                    placeholder="Veldnaam"
                    className="px-3 py-2 border border-slate-300 dark:border-slate-500 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />

                  {/* Field Type */}
                  <select
                    value={field.type}
                    onChange={(e) => updateField(field.id, 'type', e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-500 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="array">Array (JSON)</option>
                    <option value="object">Object (JSON)</option>
                  </select>

                  {/* Field Value */}
                  {field.type === 'boolean' ? (
                    <select
                      value={field.value}
                      onChange={(e) => updateField(field.id, 'value', e.target.value)}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-500 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    >
                      <option value="">Selecteer...</option>
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : field.type === 'array' || field.type === 'object' ? (
                    <textarea
                      value={field.value}
                      onChange={(e) => updateField(field.id, 'value', e.target.value)}
                      placeholder={field.type === 'array' ? '["item1", "item2"]' : '{"key": "value"}'}
                      rows={2}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-500 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm font-mono"
                    />
                  ) : (
                    <input
                      type={field.type === 'number' ? 'text' : 'text'}
                      value={field.value}
                      onChange={(e) => updateField(field.id, 'value', e.target.value)}
                      placeholder={field.type === 'number' ? '123' : 'Waarde'}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-500 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/admin/collections/${collection}`}
            className="px-6 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
          >
            Annuleren
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            {loading ? 'Aanmaken...' : 'Document aanmaken'}
          </button>
        </div>
      </form>
    </div>
  );
}
