'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import Link from 'next/link';

interface BackupMetadata {
  timestamp: string;
  collections: string[];
  totalDocuments: number;
  durationMs: number;
}

interface Backup {
  name: string;
  timestamp: string;
  metadata?: BackupMetadata;
}

export default function BackupsPage() {
  const router = useRouter();
  const { isSuperAdmin } = useSuperAdmin();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore dialog state
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [confirmationStep, setConfirmationStep] = useState(1); // 1, 2, or 3
  const [orgNameInput, setOrgNameInput] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState('');

  // Fetch backups on mount
  useEffect(() => {
    if (!isSuperAdmin) return;
    fetchBackups();
  }, [isSuperAdmin]);

  async function fetchBackups() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/backup/list');

      if (!response.ok) {
        throw new Error(`Failed to fetch backups: ${response.status}`);
      }

      const data = await response.json();
      setBackups(data.backups || []);
    } catch (err) {
      console.error('Failed to fetch backups:', err);
      setError(err instanceof Error ? err.message : 'Failed to load backups');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  function formatSize(bytes?: number): string {
    if (!bytes) return 'Onbekend';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }

  function openRestoreDialog(backup: Backup) {
    setSelectedBackup(backup);
    setConfirmationStep(1);
    setOrgNameInput('');
    setRestoreDialogOpen(true);
  }

  function closeRestoreDialog() {
    setRestoreDialogOpen(false);
    setSelectedBackup(null);
    setConfirmationStep(1);
    setOrgNameInput('');
    setRestoring(false);
    setRestoreProgress('');
  }

  async function handleRestore() {
    if (!selectedBackup) return;

    try {
      setRestoring(true);
      setRestoreProgress('Pre-restore backup wordt gemaakt...');

      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          backupName: selectedBackup.name,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Restore failed');
      }

      setRestoreProgress('Restore voltooid!');

      // Show success message
      alert(
        `Restore succesvol!\n\n` +
          `Pre-restore backup: ${result.preRestoreBackup}\n` +
          `Collecties hersteld: ${result.collectionsRestored}\n` +
          `Documenten hersteld: ${result.documentsRestored}\n\n` +
          `De applicatie wordt nu herladen.`
      );

      // Reload the page to reflect restored data
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Restore failed:', err);
      setRestoreProgress('');
      alert(`Restore mislukt: ${err instanceof Error ? err.message : 'Onbekende fout'}`);
    } finally {
      setRestoring(false);
    }
  }

  // Access control: only super admins can view backups
  if (!isSuperAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h1 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Geen toegang</h1>
          <p className="text-red-600 dark:text-red-300 mb-4">
            U heeft geen beheerderstoegang. Deze pagina is alleen beschikbaar voor systeembeheerders.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Naar dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Backups
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Bekijk en herstel backups van uw Firestore data
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Terug
        </button>
      </div>

      {loading && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-900 dark:text-blue-200">Backups laden...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-900 dark:text-red-200">Fout: {error}</p>
        </div>
      )}

      {!loading && !error && backups.length === 0 && (
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Geen backups beschikbaar
          </p>
        </div>
      )}

      {!loading && backups.length > 0 && (
        <div className="space-y-4">
          {backups.map((backup) => (
            <div
              key={backup.name}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                    {formatDate(backup.timestamp)}
                  </h3>

                  {backup.metadata && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Collecties
                        </p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {backup.metadata.collections.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Documenten
                        </p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {backup.metadata.totalDocuments.toLocaleString('nl-NL')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Duur
                        </p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {(backup.metadata.durationMs / 1000).toFixed(1)}s
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Backup ID
                        </p>
                        <p className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate">
                          {backup.name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => openRestoreDialog(backup)}
                  disabled={restoring}
                  className="ml-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-400 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Herstellen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Restore Confirmation Dialog */}
      {restoreDialogOpen && selectedBackup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            {!restoring && confirmationStep === 1 && (
              <>
                <h2 className="text-xl font-bold text-red-900 dark:text-red-200 mb-4">
                  ⚠️ Waarschuwing
                </h2>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  Dit overschrijft <strong>ALLE</strong> huidige data in uw Firestore database
                  met de data uit deze backup.
                </p>
                <p className="text-slate-700 dark:text-slate-300 mb-6">
                  Backup: <strong>{formatDate(selectedBackup.timestamp)}</strong>
                </p>
                <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                  Een automatische pre-restore backup wordt gemaakt als veiligheidsmaatregel.
                </p>
                <p className="text-slate-900 dark:text-white font-semibold mb-4">
                  Weet u het zeker?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={closeRestoreDialog}
                    className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={() => setConfirmationStep(2)}
                    className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
                  >
                    Ja, doorgaan
                  </button>
                </div>
              </>
            )}

            {!restoring && confirmationStep === 2 && (
              <>
                <h2 className="text-xl font-bold text-red-900 dark:text-red-200 mb-4">
                  Bevestig met organisatienaam
                </h2>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  Type uw organisatienaam om te bevestigen dat u de restore wilt uitvoeren.
                </p>
                <input
                  type="text"
                  value={orgNameInput}
                  onChange={(e) => setOrgNameInput(e.target.value)}
                  placeholder="Organisatienaam"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg mb-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmationStep(1)}
                    className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    Terug
                  </button>
                  <button
                    onClick={() => setConfirmationStep(3)}
                    disabled={orgNameInput.trim().length < 3}
                    className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-lg"
                  >
                    Volgende
                  </button>
                </div>
              </>
            )}

            {!restoring && confirmationStep === 3 && (
              <>
                <h2 className="text-xl font-bold text-red-900 dark:text-red-200 mb-4">
                  Laatste bevestiging
                </h2>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  Definitief doorgaan met restore?
                </p>
                <p className="text-red-700 dark:text-red-300 font-semibold mb-6">
                  Dit kan niet ongedaan worden!
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmationStep(2)}
                    className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    Terug
                  </button>
                  <button
                    onClick={handleRestore}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
                  >
                    Ja, definitief herstellen
                  </button>
                </div>
              </>
            )}

            {restoring && (
              <>
                <h2 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-4">
                  Restore bezig...
                </h2>
                <div className="flex items-center gap-3 mb-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-slate-700 dark:text-slate-300">
                    {restoreProgress || 'Bezig met herstellen...'}
                  </p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Dit kan enkele minuten duren. Sluit dit venster niet.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
