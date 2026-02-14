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
  const { orgNummer, login, logout } = useAuth();

  const [orgDetails, setOrgDetails] = useState<OrgDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Delete account state
  const [deleteStep, setDeleteStep] = useState(0); // 0=hidden, 1=first confirm, 2=type name confirm
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Newsletter toggle state
  const [isSavingNewsletter, setIsSavingNewsletter] = useState(false);

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

  const handleNewsletterToggle = async () => {
    if (!orgNummer || !orgDetails) return;
    setIsSavingNewsletter(true);
    setError('');
    setSuccess('');

    const newValue = orgDetails.nieuwsbrief === 1 ? 0 : 1;

    try {
      const res = await fetch(`/api/organizations/${orgNummer}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nieuwsbrief: newValue }),
      });

      if (res.ok) {
        setOrgDetails({ ...orgDetails, nieuwsbrief: newValue });
        setSuccess(
          newValue === 1
            ? 'U bent succesvol aangemeld voor de nieuwsbrief!'
            : 'U bent succesvol afgemeld voor de nieuwsbrief.'
        );
      } else {
        setError('Fout bij bijwerken nieuwsbriefstatus.');
      }
    } catch {
      setError('Er is een fout opgetreden. Probeer het later opnieuw.');
    } finally {
      setIsSavingNewsletter(false);
    }
  };

  const handleDeleteStart = () => {
    setDeleteStep(1);
    setDeleteConfirmName('');
    setError('');
    setSuccess('');
  };

  const handleDeleteCancel = () => {
    setDeleteStep(0);
    setDeleteConfirmName('');
  };

  const handleDeleteStepOne = () => {
    setDeleteStep(2);
  };

  const handleDeleteConfirm = async () => {
    if (!orgNummer || !orgDetails) return;

    if (deleteConfirmName !== orgDetails.org_naam) {
      setError('De ingevoerde naam komt niet overeen met de organisatienaam.');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const res = await fetch(`/api/organizations/${orgNummer}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Logout and redirect to login
        await logout();
        router.push('/inloggen');
      } else {
        const data = await res.json();
        setError(data.error || 'Fout bij verwijderen van account.');
        setIsDeleting(false);
      }
    } catch {
      setError('Er is een fout opgetreden bij het verwijderen.');
      setIsDeleting(false);
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
        <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-3 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors flex-shrink-0" aria-label="Melding sluiten">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {success && (
        <div role="status" className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm border border-green-200 dark:border-green-800">
          {success}
        </div>
      )}

      {orgDetails && (
        <div className="space-y-6">
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

          {/* Newsletter Subscription */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Nieuwsbrief
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Ontvang updates en nieuws over ClubMatch per e-mail.
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleNewsletterToggle}
                disabled={isSavingNewsletter}
                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                  orgDetails.nieuwsbrief === 1
                    ? 'bg-green-600'
                    : 'bg-slate-300 dark:bg-slate-600'
                } ${isSavingNewsletter ? 'opacity-50 cursor-wait' : ''}`}
                role="switch"
                aria-checked={orgDetails.nieuwsbrief === 1}
                aria-label="Nieuwsbrief abonnement"
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    orgDetails.nieuwsbrief === 1 ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {orgDetails.nieuwsbrief === 1 ? 'Aangemeld' : 'Afgemeld'}
              </span>
            </div>
          </div>

          {/* Danger Zone - Account Deletion */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-red-200 dark:border-red-800 p-6">
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
              Gevarenzone
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Het verwijderen van uw account is permanent en kan niet ongedaan worden gemaakt. Alle leden, competities, uitslagen en instellingen worden verwijderd.
            </p>

            {deleteStep === 0 && (
              <button
                type="button"
                onClick={handleDeleteStart}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                Account verwijderen
              </button>
            )}

            {/* Step 1: First confirmation */}
            {deleteStep === 1 && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-3">
                  Weet u zeker dat u uw account wilt verwijderen? Dit verwijdert alle gegevens van uw organisatie, inclusief alle leden, competities en uitslagen.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDeleteStepOne}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                  >
                    Ja, doorgaan met verwijderen
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCancel}
                    className="px-5 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Type organization name to confirm */}
            {deleteStep === 2 && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-3">
                  Typ de naam van uw organisatie om de verwijdering te bevestigen:
                </p>
                <p className="text-sm text-red-700 dark:text-red-400 mb-3 font-mono bg-red-100 dark:bg-red-900/40 px-3 py-1.5 rounded inline-block">
                  {orgDetails.org_naam}
                </p>
                <div className="mb-3">
                  <input
                    type="text"
                    value={deleteConfirmName}
                    onChange={(e) => setDeleteConfirmName(e.target.value)}
                    placeholder="Typ de organisatienaam..."
                    aria-label="Bevestig organisatienaam"
                    className="w-full px-4 py-2.5 border border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-colors"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting || deleteConfirmName !== orgDetails.org_naam}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-800 text-white font-medium rounded-lg transition-colors shadow-sm"
                  >
                    {isDeleting ? 'Bezig met verwijderen...' : 'Account definitief verwijderen'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCancel}
                    disabled={isDeleting}
                    className="px-5 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
