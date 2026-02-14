'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface Advertisement {
  id: string;
  org_nummer: number;
  volg_nr: number;
  bestandsnaam: string;
  image_data: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

const MAX_SLIDES = 20;

export default function AdvertentiesPage() {
  const { orgNummer } = useAuth();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAdvertisements = useCallback(async () => {
    if (!orgNummer) return;
    try {
      const res = await fetch(`/api/organizations/${orgNummer}/advertisements`);
      if (!res.ok) throw new Error('Fout bij ophalen advertenties');
      const data = await res.json();
      setAdvertisements(data);
    } catch (err) {
      console.error('Error fetching advertisements:', err);
      setError('Kan advertenties niet laden');
    } finally {
      setLoading(false);
    }
  }, [orgNummer]);

  useEffect(() => {
    fetchAdvertisements();
  }, [fetchAdvertisements]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !orgNummer) return;

    // Client-side validation
    const allowedExtensions = ['.jpg', '.jpeg'];
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(ext)) {
      setError('Alleen JPG-formaat is toegestaan');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setError('Het bestand is te groot (max 2 MB)');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (advertisements.length >= MAX_SLIDES) {
      setError('Maximum van 20 slides bereikt. Verwijder eerst bestaande slides.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress while uploading
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const res = await fetch(`/api/organizations/${orgNummer}/advertisements`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Fout bij uploaden');
      }

      const data = await res.json();
      setSuccess(data.message || `Slide "${file.name}" is succesvol ge-upload!`);

      // Refresh the list
      await fetchAdvertisements();

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Fout bij uploaden advertentie');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDelete = async (adId: string) => {
    if (!orgNummer) return;

    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/organizations/${orgNummer}/advertisements/${adId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Fout bij verwijderen');
      }

      const data = await res.json();
      setSuccess(data.message || 'Slide succesvol verwijderd');
      setDeleteConfirm(null);

      // Refresh the list
      await fetchAdvertisements();
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Fout bij verwijderen advertentie');
    } finally {
      setDeleting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const remainingSlots = MAX_SLIDES - advertisements.length;

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/instellingen"
            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Advertenties</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/instellingen"
          className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Advertenties</h1>
      </div>

      {/* Description */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Slideshow beheer
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-3">
          Hier kunt u slides (advertenties of mededelingen) uploaden voor de slideshow op uw scorebord(en).
        </p>
        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
          <li>Alleen bestanden met de extensie <strong>.JPG</strong> of <strong>.jpg</strong></li>
          <li>Maximaal <strong>2 MB</strong> per bestand</li>
          <li>Verhouding breedte : hoogte dient <strong>2 : 1</strong> te zijn (1900 × 950 pixels)</li>
          <li>Maximaal <strong>20 slides</strong> per organisatie</li>
        </ul>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          U heeft <strong>{advertisements.length}</strong> slides geüpload, u kunt nog <strong>{remainingSlots}</strong> slides uploaden.
        </p>
      </div>

      {/* Success/Error messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-700 dark:text-green-300 font-medium">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600 dark:text-red-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Upload section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Slide uploaden
        </h3>

        {remainingSlots <= 0 ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-yellow-700 dark:text-yellow-300 font-medium">
              U heeft het maximum van 20 slides al bereikt. Verwijder eerst bestaande slides om nieuwe slides te kunnen uploaden.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-4">
              <label className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,image/jpeg"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-slate-500 dark:text-slate-400
                    file:mr-4 file:py-2.5 file:px-5
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-green-600 file:text-white
                    hover:file:bg-green-700
                    file:cursor-pointer file:transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </label>
            </div>

            {/* Upload progress */}
            {uploading && (
              <div className="mt-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Bezig met uploaden... {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advertisement list */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Geüploade slides ({advertisements.length})
        </h3>

        {advertisements.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
            </svg>
            <p className="text-slate-500 dark:text-slate-400">
              Nog geen slides geüpload. Upload uw eerste slide hierboven.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {advertisements.map((ad) => (
              <div
                key={ad.id}
                className="bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden group"
              >
                {/* Image preview */}
                <div className="aspect-[2/1] bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <img
                    src={ad.image_data}
                    alt={`Slide ${ad.volg_nr}: ${ad.bestandsnaam}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info and actions */}
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        Slide {ad.volg_nr}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {ad.bestandsnaam} ({formatFileSize(ad.file_size)})
                      </p>
                    </div>
                    <div>
                      {deleteConfirm === ad.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(ad.id)}
                            disabled={deleting}
                            className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors disabled:opacity-50"
                          >
                            {deleting ? 'Bezig...' : 'Bevestigen'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            disabled={deleting}
                            className="text-xs bg-slate-400 hover:bg-slate-500 text-white px-2 py-1 rounded transition-colors disabled:opacity-50"
                          >
                            Annuleren
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(ad.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-200 dark:hover:text-red-300 p-1 rounded transition-colors"
                          title="Verwijderen"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
