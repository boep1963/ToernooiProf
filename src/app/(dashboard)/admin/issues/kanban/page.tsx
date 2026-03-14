'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';

type IssueStatus = 'not_started' | 'in_progress' | 'done';
type IssueType = 'bug' | 'feature';

interface AdminIssue {
  id: string;
  title: string;
  type: IssueType;
  images: string[];
  status: IssueStatus;
  completedAt: string | null;
  hans_tested: boolean;
  pierre_tested: boolean;
  createdAt: string;
  updatedAt: string;
}

const STATUS_LABELS: Record<IssueStatus, string> = {
  not_started: 'Nog niet opgepakt',
  in_progress: 'In behandeling',
  done: 'Gereed',
};

const TYPE_LABELS: Record<IssueType, string> = {
  bug: 'Bug',
  feature: 'Feature',
};

const COLUMNS: IssueStatus[] = ['not_started', 'in_progress', 'done'];

const NEXT_STATUS: Record<IssueStatus, IssueStatus | null> = {
  not_started: 'in_progress',
  in_progress: 'done',
  done: null,
};

export default function AdminIssuesKanbanPage() {
  const { isSuperAdmin } = useSuperAdmin();
  const [issues, setIssues] = useState<AdminIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<IssueStatus | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/issues');
      if (!res.ok) throw new Error('Fout bij laden');
      const data = await res.json();
      setIssues(data.issues || []);
      setError(null);
    } catch (e) {
      setError('Fout bij ophalen issues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSuperAdmin) return;
    fetchIssues();
  }, [isSuperAdmin]);

  const updateStatus = async (id: string, newStatus: IssueStatus) => {
    setMovingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/issues/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === 'done' ? { completedAt: new Date().toISOString() } : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Fout bij bijwerken');
      }
      const data = await res.json();
      if (data.issue) {
        setIssues((prev) => prev.map((i) => (i.id === id ? data.issue : i)));
      } else {
        setIssues((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: newStatus, completedAt: newStatus === 'done' ? new Date().toISOString() : null } : i))
        );
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fout bij bijwerken.');
    } finally {
      setMovingId(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: IssueStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: IssueStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const id = e.dataTransfer.getData('text/plain');
    if (!id || !draggedId) return;
    const issue = issues.find((i) => i.id === id);
    if (!issue || issue.status === targetStatus) return;
    updateStatus(id, targetStatus);
    setDraggedId(null);
  };

  const issuesByStatus = (status: IssueStatus) => issues.filter((i) => i.status === status);

  if (!isSuperAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
          <h1 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Geen toegang</h1>
          <p className="text-red-600 dark:text-red-300 mb-4">Deze pagina is alleen beschikbaar voor systeembeheerders.</p>
          <Link href="/admin" className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            Naar admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/admin" className="hover:text-green-600 dark:hover:text-green-400 hover:underline">Admin</Link>
        <span>/</span>
        <Link href="/admin/issues" className="hover:text-green-600 dark:hover:text-green-400 hover:underline">Issues</Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-medium">Kanban</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kanban-bord</h1>
        <Link
          href="/admin/issues"
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
        >
          Beheer issues
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400">Laden...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((status) => (
            <div
              key={status}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
              className={`rounded-xl border-2 min-h-[320px] transition-colors ${
                dragOverColumn === status
                  ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'
              }`}
            >
              <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-t-xl">
                <h2 className="font-semibold text-slate-900 dark:text-white">{STATUS_LABELS[status]}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{issuesByStatus(status).length} items</p>
              </div>
              <div className="p-3 space-y-3">
                {issuesByStatus(status).map((issue) => (
                  <div
                    key={issue.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, issue.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 shadow-sm ${
                      draggedId === issue.id ? 'opacity-50' : 'cursor-grab active:cursor-grabbing'
                    }`}
                  >
                    <div className="font-medium text-slate-900 dark:text-white text-sm mb-1">{issue.title}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300">
                        {TYPE_LABELS[issue.type]}
                      </span>
                      {issue.hans_tested && <span className="text-xs text-green-600 dark:text-green-400">H</span>}
                      {issue.pierre_tested && <span className="text-xs text-green-600 dark:text-green-400">P</span>}
                      {issue.status === 'done' && issue.completedAt && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(issue.completedAt).toLocaleDateString('nl-NL')}
                        </span>
                      )}
                    </div>
                    {issue.images.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {issue.images.slice(0, 2).map((src, i) => (
                          <img key={i} src={src} alt="" className="h-10 w-10 object-cover rounded" />
                        ))}
                      </div>
                    )}
                    {NEXT_STATUS[issue.status] && (
                      <button
                        type="button"
                        onClick={() => updateStatus(issue.id, NEXT_STATUS[issue.status]!)}
                        disabled={movingId === issue.id}
                        className="mt-2 w-full text-xs py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white rounded transition-colors"
                      >
                        {movingId === issue.id ? 'Bezig...' : `→ ${STATUS_LABELS[NEXT_STATUS[issue.status]!]}`}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
