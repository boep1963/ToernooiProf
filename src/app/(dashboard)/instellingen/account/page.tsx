'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import OrganizationLogo from '@/components/common/OrganizationLogo';
import Breadcrumb from '@/components/common/Breadcrumb';

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

  // Logo upload state
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

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

    // Check if email has changed
    const emailChanged = orgDetails && editEmail.trim() !== (orgDetails.org_wl_email || '');

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
        let successMsg = 'Accountgegevens zijn succesvol bijgewerkt!';
        if (emailChanged) {
          successMsg += ' Uw logingegevens worden bijgewerkt.';
        }
        setSuccess(successMsg);
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

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedLogo(file);
      setUploadSuccess('');
      setError('');
    }
  };

  const handleLogoUpload = async () => {
    if (!selectedLogo || !orgNummer) return;

    setIsUploadingLogo(true);
    setError('');
    setUploadSuccess('');

    try {
      const formData = new FormData();
      formData.append('logo', selectedLogo);

      const res = await fetch(`/api/organizations/${orgNummer}/logo`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setUploadSuccess('Logo succesvol ge-upload!');
        setSelectedLogo(null);
        // Reset file input
        const fileInput = document.getElementById('logo-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        // Refresh org details to show new logo
        await fetchOrgDetails();
      } else {
        setError(data.error || 'Fout bij uploaden logo.');
      }
    } catch {
      setError('Er is een fout opgetreden bij het uploaden.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleLogoRemove = async () => {
    if (!orgNummer) return;

    if (!confirm('Weet u zeker dat u het logo wilt verwijderen?')) return;

    setError('');
    setUploadSuccess('');

    try {
      const res = await fetch(`/api/organizations/${orgNummer}/logo`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setUploadSuccess('Logo verwijderd!');
        await fetchOrgDetails();
      } else {
        setError(data.error || 'Fout bij verwijderen logo.');
      }
    } catch {
      setError('Er is een fout opgetreden bij het verwijderen.');
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
      {/* Breadcrumb + Header */}
      <div className="mb-6">
        <Breadcrumb items={[
          { label: 'Instellingen', href: '/instellingen' },
          { label: 'Account' },
        ]} />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Account
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Bekijk en wijzig uw accountgegevens en organisatie-instellingen.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-3 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors flex-shrink-0" aria-label="Melding sluiten">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {success && (
        <div role="status" className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm border border-green-200 dark:border-green-800 flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="ml-3 text-green-500 hover:text-green-700 dark:hover:text-green-300 transition-colors flex-shrink-0" aria-label="Melding sluiten">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {uploadSuccess && (
        <div role="status" className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm border border-green-200 dark:border-green-800 flex items-center justify-between">
          <span>{uploadSuccess}</span>
          <button onClick={() => setUploadSuccess('')} className="ml-3 text-green-500 hover:text-green-700 dark:hover:text-green-300 transition-colors flex-shrink-0" aria-label="Melding sluiten">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
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
                    required
                    aria-required="true"
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

          {/* Email Change Warning */}
          {isEditing && orgDetails && editEmail.trim() !== (orgDetails.org_wl_email || '') && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                    E-mailadres wijziging
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Let op: Bij het wijzigen van uw e-mailadres worden uw logingegevens bijgewerkt. U ontvangt mogelijk een bevestigingsmail op het nieuwe adres.
                  </p>
                </div>
              </div>
            </div>
          )}

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

          {/* Logo Upload */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Organisatie logo
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Upload een eigen logo voor uw organisatie. Het logo wordt weergegeven in de header en op scoreborden.
            </p>

            {/* Current Logo Display */}
            {orgDetails.org_logo && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Huidig logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                    <OrganizationLogo
                      src={orgDetails.org_logo}
                      alt="Organisatie logo"
                      className="max-h-24 max-w-xs object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleLogoRemove}
                    className="px-4 py-2 text-sm font-medium text-red-700 dark:text-red-200 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors border border-red-200 dark:border-red-800"
                  >
                    Logo verwijderen
                  </button>
                </div>
              </div>
            )}

            {/* Upload Instructions */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">
                Vereisten voor het logo:
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>Alleen JPG-formaat toegestaan</li>
                <li>Maximale bestandsgrootte: 1 MB</li>
                <li>Bij voorkeur verhouding 2:1 (breedte:hoogte)</li>
                <li>Een nieuw logo overschrijft het oude logo</li>
              </ul>
            </div>

            {/* File Input */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  id="logo-file"
                  type="file"
                  accept="image/jpeg,image/jpg,.jpg,.jpeg"
                  onChange={handleLogoSelect}
                  className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 dark:file:bg-green-900/30 file:text-green-700 dark:file:text-green-400 hover:file:bg-green-100 dark:hover:file:bg-green-900/50 file:cursor-pointer file:transition-colors"
                />
              </div>
              {selectedLogo && (
                <button
                  type="button"
                  onClick={handleLogoUpload}
                  disabled={isUploadingLogo}
                  className="px-6 py-2 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
                >
                  {isUploadingLogo ? 'Uploaden...' : 'Upload'}
                </button>
              )}
            </div>
            {selectedLogo && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Geselecteerd: {selectedLogo.name} ({(selectedLogo.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

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
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-200 mb-2">
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
                <p className="text-sm text-red-700 dark:text-red-200 mb-3 font-mono bg-red-100 dark:bg-red-900/40 px-3 py-1.5 rounded inline-block">
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
