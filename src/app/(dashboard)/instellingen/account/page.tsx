'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface OrgDetails {
  org_nummer: number;
  org_code: string;
  org_naam: string;
  org_wl_naam: string;
  org_wl_email: string;
  org_logo: string;
  aantal_tafels: number;
  nieuwsbrief: number;
}

export default function AccountPage() {
  const router = useRouter();
  const { orgNummer, login } = useAuth();

  const [orgDetails, setOrgDetails] = useState<OrgDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editable fields
  const [editName, setEditName] = useState('');
  const [editContactPerson, setEditContactPerson] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const fetchOrgDetails = useCallback(async () => {
    if (!orgNummer) return;
    try {
      const res = await fetch(`/api/organizations/${orgNummer}`);
      if (res.ok) {
        const data: OrgDetails = await res.json();
        setOrgDetails(data);
        setEditName(data.org_naam || '');
        setEditContactPerson(data.org_wl_naam || '');
        setEditEmail(data.org_wl_email || '');
      } else {
        setError('Kon accountgegevens niet laden.');
      }
    } catch {
      setError('Er is een fout opgetreden bij het laden van accountgegevens.');
    } finally {
      setIsLoading(false);
    }
  }, [orgNummer]);

  useEffect(() => {
    fetchOrgDetails();
  }, [fetchOrgDetails]);

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // Reset form to original values
    if (orgDetails) {
      setEditName(orgDetails.org_naam || '');
      setEditContactPerson(orgDetails.org_wl_naam || '');
      setEditEmail(orgDetails.org_wl_email || '');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    if (!orgNummer) {
      setError('Sessie verlopen. Log opnieuw in.');
      setIsSaving(false);
      return;
    }

    if (!editName.trim()) {
      setError('Organisatienaam is verplicht.');
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/organizations/${orgNummer}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_naam: editName.trim(),
          org_wl_naam: editContactPerson.trim(),
          org_wl_email: editEmail.trim(),
        }),
      });

      if (res.ok) {
        setSuccess('Accountgegevens zijn succesvol bijgewerkt!');
        setIsEditing(false);
        // Refresh org details from the server
        await fetchOrgDetails();
        // Update the auth context so sidebar/header reflect the new org name
        await login(orgNummer);
      } else {
        const data = await res.json();
        setError(data.error || 'Fout bij opslaan van wijzigingen.');
      }
    } catch {
      setError('Er is een fout opgetreden. Probeer het later opnieuw.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-600 dark:text-slate-400">Accountgegevens laden...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <button
            type="button"
            onClick={() => router.push('/instellingen')}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            aria-label="Terug naar instellingen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Account
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 ml-8">
          Bekijk en wijzig uw accountgegevens en organisatie-instellingen.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm border border-green-200 dark:border-green-800">
          {success}
        </div>
      )}

      {orgDetails && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Organization Info Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Organisatiegegevens
              </h2>
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="px-4 py-2 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors border border-green-200 dark:border-green-800"
                >
                  Bewerken
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Org Number - always read-only */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Organisatienummer
                </label>
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-600">
                  {orgDetails.org_nummer}
                </div>
              </div>

              {/* Org Name */}
              <div>
                <label htmlFor="org_naam" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Organisatienaam
                </label>
                {isEditing ? (
                  <input
                    id="org_naam"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Naam van de organisatie"
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-600">
                    {orgDetails.org_naam || '-'}
                  </div>
                )}
              </div>

              {/* Contact Person */}
              <div>
                <label htmlFor="org_wl_naam" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Contactpersoon
                </label>
                {isEditing ? (
                  <input
                    id="org_wl_naam"
                    type="text"
                    value={editContactPerson}
                    onChange={(e) => setEditContactPerson(e.target.value)}
                    placeholder="Naam contactpersoon"
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-600">
                    {orgDetails.org_wl_naam || '-'}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="org_wl_email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  E-mailadres
                </label>
                {isEditing ? (
                  <input
                    id="org_wl_email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="email@voorbeeld.nl"
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-600">
                    {orgDetails.org_wl_email || '-'}
                  </div>
                )}
              </div>

              {/* Login Code - always read-only */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Inlogcode
                </label>
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-600 font-mono tracking-wider">
                  {orgDetails.org_code || '-'}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Gebruik deze code om in te loggen met de inlogcode-methode.
                </p>
              </div>
            </div>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                {isSaving ? 'Bezig met opslaan...' : 'Opslaan'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="px-6 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
              >
                Annuleren
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
