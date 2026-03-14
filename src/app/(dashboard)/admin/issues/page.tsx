'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';

type IssueStatus = 'not_started' | 'in_progress' | 'done';
type IssueType = 'bug' | 'feature';

interface AdminIssue {
  id: string;
  title: string;
  description: string;
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

const MAX_IMAGES = 3;

export default function AdminIssuesPage() {
  const { isSuperAdmin } = useSuperAdmin();
  const [issues, setIssues] = useState<AdminIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<IssueType>('bug');
  const [formStatus, setFormStatus] = useState<IssueStatus>('not_started');
  const [formHansTested, setFormHansTested] = useState(false);
  const [formPierreTested, setFormPierreTested] = useState(false);
  const [formImages, setFormImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [editIssue, setEditIssue] = useState<AdminIssue | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editType, setEditType] = useState<IssueType>('bug');
  const [editStatus, setEditStatus] = useState<IssueStatus>('not_started');
  const [editHansTested, setEditHansTested] = useState(false);
  const [editPierreTested, setEditPierreTested] = useState(false);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editNewFiles, setEditNewFiles] = useState<File[]>([]);
  const [editSaving, setEditSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.set('title', formTitle.trim());
      formData.set('description', formDescription.trim());
      formData.set('type', formType);
      formData.set('status', formStatus);
      formData.set('hans_tested', formHansTested ? '1' : '0');
      formData.set('pierre_tested', formPierreTested ? '1' : '0');
      formImages.slice(0, MAX_IMAGES).forEach((f, i) => formData.set(`image${i}`, f));

      const res = await fetch('/api/admin/issues', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij aanmaken');
      setSuccess('Issue toegevoegd.');
      setFormTitle('');
      setFormDescription('');
      setFormType('bug');
      setFormStatus('not_started');
      setFormHansTested(false);
      setFormPierreTested(false);
      setFormImages([]);
      fetchIssues();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fout bij aanmaken.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (issue: AdminIssue) => {
    setEditIssue(issue);
    setEditTitle(issue.title);
    setEditDescription(issue.description ?? '');
    setEditType(issue.type);
    setEditStatus(issue.status);
    setEditHansTested(issue.hans_tested);
    setEditPierreTested(issue.pierre_tested);
    setEditImages([...issue.images]);
    setEditNewFiles([]);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editIssue || !editTitle.trim()) return;
    setEditSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const hasNewFiles = editNewFiles.length > 0;
      if (hasNewFiles) {
        const formData = new FormData();
        formData.set('title', editTitle.trim());
        formData.set('description', editDescription.trim());
        formData.set('type', editType);
        formData.set('status', editStatus);
        formData.set('hans_tested', editHansTested ? '1' : '0');
        formData.set('pierre_tested', editPierreTested ? '1' : '0');
        formData.set('existingImages', JSON.stringify(editImages));
        editNewFiles.slice(0, MAX_IMAGES - editImages.length).forEach((f, i) => formData.set(`image${i}`, f));

        const res = await fetch(`/api/admin/issues/${editIssue.id}`, { method: 'PATCH', body: formData });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Fout bij opslaan');
        }
      } else {
        const res = await fetch(`/api/admin/issues/${editIssue.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editTitle.trim(),
            description: editDescription.trim(),
            type: editType,
            status: editStatus,
            hans_tested: editHansTested,
            pierre_tested: editPierreTested,
            images: editImages,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Fout bij opslaan');
        }
      }
      setSuccess('Issue bijgewerkt.');
      setEditIssue(null);
      fetchIssues();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fout bij opslaan.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/issues/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Fout bij verwijderen');
      }
      setSuccess('Issue verwijderd.');
      setDeleteConfirm(null);
      fetchIssues();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fout bij verwijderen.');
    } finally {
      setDeleteLoading(false);
    }
  };

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
    <div className="max-w-5xl mx-auto space-y-6">
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/admin" className="hover:text-green-600 dark:hover:text-green-400 hover:underline">Admin</Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-medium">Issues & wensen</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Beheer issues</h1>
        <Link
          href="/admin/issues/kanban"
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
        >
          Kanban-bord
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm border border-green-200 dark:border-green-800">
          {success}
        </div>
      )}

      {/* New issue form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Nieuw issue</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titel *</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Omschrijving</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-y"
              placeholder="Optioneel: beschrijf het issue of de wens..."
            />
          </div>
          <div className="flex flex-wrap gap-6">
            <div>
              <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="type" checked={formType === 'bug'} onChange={() => setFormType('bug')} className="text-green-600" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Bug</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="type" checked={formType === 'feature'} onChange={() => setFormType('feature')} className="text-green-600" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Feature</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as IssueStatus)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                {(['not_started', 'in_progress', 'done'] as const).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-4 items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formHansTested} onChange={(e) => setFormHansTested(e.target.checked)} className="rounded text-green-600" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Hans getest</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formPierreTested} onChange={(e) => setFormPierreTested(e.target.checked)} className="rounded text-green-600" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Pierre getest</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Afbeeldingen (max {MAX_IMAGES})</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={(e) => setFormImages(Array.from(e.target.files || []).slice(0, MAX_IMAGES))}
              className="w-full text-sm text-slate-600 dark:text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border file:border-slate-300 dark:file:border-slate-600 file:bg-slate-100 dark:file:bg-slate-700 file:text-slate-700 dark:file:text-slate-300"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !formTitle.trim()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {submitting ? 'Bezig...' : 'Toevoegen'}
          </button>
        </form>
      </div>

      {/* Issues list */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Issues</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">Laden...</div>
        ) : issues.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">Nog geen issues.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Titel</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Omschrijving</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Gereed</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Hans / Pierre</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Afb.</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">Acties</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">{issue.title}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 max-w-[200px] truncate" title={issue.description || undefined}>
                      {issue.description || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{TYPE_LABELS[issue.type]}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{STATUS_LABELS[issue.status]}</td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                      {issue.completedAt ? new Date(issue.completedAt).toLocaleDateString('nl-NL') : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={issue.hans_tested ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}>H</span>
                      <span className="mx-1 text-slate-400">/</span>
                      <span className={issue.pierre_tested ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}>P</span>
                    </td>
                    <td className="py-3 px-4">
                      {issue.images.length > 0 ? (
                        <div className="flex gap-1">
                          {issue.images.slice(0, 3).map((src, i) => (
                            <img key={i} src={src} alt="" className="h-8 w-8 object-cover rounded" />
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {deleteConfirm === issue.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleDelete(issue.id)}
                            disabled={deleteLoading}
                            className="text-xs px-2 py-1 bg-red-600 text-white rounded"
                          >
                            {deleteLoading ? 'Bezig...' : 'Ja'}
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded">
                            Nee
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(issue)} className="text-xs px-2 py-1 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-700 rounded hover:bg-green-50 dark:hover:bg-green-900/30">
                            Bewerken
                          </button>
                          <button onClick={() => setDeleteConfirm(issue.id)} className="text-xs px-2 py-1 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded hover:bg-red-50 dark:hover:bg-red-900/30">
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
        )}
      </div>

      {/* Edit modal */}
      {editIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Issue bewerken</h2>
            </div>
            <form onSubmit={handleEditSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titel *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Omschrijving</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-y"
                  placeholder="Optioneel: beschrijf het issue of de wens..."
                />
              </div>
              <div className="flex gap-6">
                <div>
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={editType === 'bug'} onChange={() => setEditType('bug')} className="text-green-600" />
                      <span className="text-sm">Bug</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={editType === 'feature'} onChange={() => setEditType('feature')} className="text-green-600" />
                      <span className="text-sm">Feature</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as IssueStatus)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    {(['not_started', 'in_progress', 'done'] as const).map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editHansTested} onChange={(e) => setEditHansTested(e.target.checked)} className="rounded text-green-600" />
                  <span className="text-sm">Hans getest</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editPierreTested} onChange={(e) => setEditPierreTested(e.target.checked)} className="rounded text-green-600" />
                  <span className="text-sm">Pierre getest</span>
                </label>
              </div>
              <div>
                <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Afbeeldingen</span>
                {editImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editImages.map((src, i) => (
                      <div key={i} className="relative">
                        <img src={src} alt="" className="h-16 w-16 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => setEditImages((prev) => prev.filter((_, j) => j !== i))}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs leading-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {editImages.length < MAX_IMAGES && (
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={(e) => setEditNewFiles(Array.from(e.target.files || []))}
                    className="w-full text-sm text-slate-600 dark:text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border file:border-slate-300 dark:file:border-slate-600"
                  />
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditIssue(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={editSaving || !editTitle.trim()}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-medium rounded-lg disabled:cursor-not-allowed"
                >
                  {editSaving ? 'Opslaan...' : 'Opslaan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
