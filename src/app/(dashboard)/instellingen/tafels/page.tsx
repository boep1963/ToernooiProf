'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface DeviceConfig {
  id?: string;
  org_nummer: number;
  tafel_nr: number;
  soort: number; // 1=mouse, 2=tablet
}

export default function TafelsInstellingenPage() {
  const { orgNummer, organization } = useAuth();
  const [configs, setConfigs] = useState<DeviceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aantalTafels, setAantalTafels] = useState<number>(4);
  const [savingAantalTafels, setSavingAantalTafels] = useState(false);

  useEffect(() => {
    if (!orgNummer || !organization) return;

    const fetchConfigs = async () => {
      try {
        const currentAantalTafels = (organization as unknown as Record<string, unknown>).aantal_tafels as number || 4;
        setAantalTafels(currentAantalTafels);

        const res = await fetch(`/api/organizations/${orgNummer}/scoreboards/device`);
        if (!res.ok) throw new Error('Failed to fetch');
        let data = await res.json();

        if (data.length === 0) {
          // Initialize device configs for all tables
          await fetch(`/api/organizations/${orgNummer}/scoreboards/device`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aantal_tafels: currentAantalTafels }),
          });

          const res2 = await fetch(`/api/organizations/${orgNummer}/scoreboards/device`);
          data = await res2.json();
        }

        setConfigs(data);
      } catch (err) {
        console.error('Error fetching device configs:', err);
        setError('Kan apparaatconfiguratie niet laden');
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, [orgNummer, organization]);

  const handleDeviceChange = (tafelNr: number, soort: number) => {
    setConfigs(prev =>
      prev.map(c =>
        c.tafel_nr === tafelNr ? { ...c, soort } : c
      )
    );
    setSaved(false);
  };

  const handleSaveAantalTafels = async () => {
    if (!orgNummer) return;

    setSavingAantalTafels(true);
    setError(null);

    try {
      const res = await fetch(`/api/organizations/${orgNummer}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aantal_tafels: aantalTafels }),
      });

      if (!res.ok) {
        throw new Error('Fout bij opslaan aantal tafels');
      }

      // Reinitialize device configs for new table count
      await fetch(`/api/organizations/${orgNummer}/scoreboards/device`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aantal_tafels: aantalTafels }),
      });

      // Refresh configs
      const configRes = await fetch(`/api/organizations/${orgNummer}/scoreboards/device`);
      const data = await configRes.json();
      setConfigs(data);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

      // Force reload to update organization data in auth context
      window.location.reload();
    } catch (err) {
      console.error('Error saving aantal tafels:', err);
      setError('Fout bij opslaan aantal tafels');
    } finally {
      setSavingAantalTafels(false);
    }
  };

  const handleSave = async () => {
    if (!orgNummer) return;

    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      // Save each config individually
      for (const config of configs) {
        const res = await fetch(
          `/api/organizations/${orgNummer}/scoreboards/device/${config.tafel_nr}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ soort: config.soort }),
          }
        );

        if (!res.ok) {
          throw new Error(`Fout bij opslaan tafel ${config.tafel_nr}`);
        }
      }

      setSaved(true);
      // Clear success message after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving device configs:', err);
      setError('Fout bij opslaan van configuratie');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Bediening scoreborden
        </h1>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/instellingen" className="hover:text-green-600 dark:hover:text-green-400">
          Instellingen
        </Link>
        <span className="mx-2">›</span>
        <span className="text-slate-700 dark:text-slate-200">Bediening tafels</span>
      </nav>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Bediening scoreborden
      </h1>

      {/* Explanation */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Wijzigen bediening scoreborden
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          De scoreborden bij de tafels kunnen op 2 manieren bediend worden:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🖱️</span>
              <h3 className="font-semibold text-slate-900 dark:text-white">Muis</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Met de bijbehorende draadloze muis worden de knoppen op het scorebord zelf bediend.
              Geschikt voor gebruik met een extern beeldscherm.
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📱</span>
              <h3 className="font-semibold text-slate-900 dark:text-white">Tablet</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Het scorebord wordt bediend vanaf een aparte tablet of smartphone met grotere
              aanraakvriendelijke knoppen.
            </p>
          </div>
        </div>
      </div>

      {/* Number of Tables Configuration */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Aantal tafels
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Stel in hoeveel tafels uw vereniging heeft (1-12). Dit bepaalt hoeveel scoreborden beschikbaar zijn.
        </p>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <label htmlFor="aantal_tafels" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Aantal tafels
            </label>
            <select
              id="aantal_tafels"
              value={aantalTafels}
              onChange={(e) => setAantalTafels(Number(e.target.value))}
              className="w-32 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <button
              onClick={handleSaveAantalTafels}
              disabled={savingAantalTafels}
              className="mt-6 bg-green-700 hover:bg-green-600 disabled:bg-green-800 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors min-h-[44px]"
            >
              {savingAantalTafels ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Opslaan...
                </span>
              ) : (
                'Aantal tafels opslaan'
              )}
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          ⚠️ Let op: Het wijzigen van het aantal tafels zal de bediening voor nieuwe tafels opnieuw initialiseren.
        </p>
      </div>

      {/* Table configuration */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Configuratie per tafel
          </h2>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {configs.map((config) => (
            <div
              key={config.tafel_nr}
              className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-green-700 dark:text-green-400">
                    {config.tafel_nr}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Tafel {config.tafel_nr}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {config.soort === 1 ? 'Muis bediening' : 'Tablet bediening'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 cursor-pointer min-h-[44px] px-3">
                  <input
                    type="radio"
                    name={`tafel_${config.tafel_nr}`}
                    value="1"
                    checked={config.soort === 1}
                    onChange={() => handleDeviceChange(config.tafel_nr, 1)}
                    className="w-5 h-5 text-green-600 focus:ring-green-500 accent-green-600"
                  />
                  <span className="text-slate-700 dark:text-slate-300 text-sm md:text-base">🖱️ Muis</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer min-h-[44px] px-3">
                  <input
                    type="radio"
                    name={`tafel_${config.tafel_nr}`}
                    value="2"
                    checked={config.soort === 2}
                    onChange={() => handleDeviceChange(config.tafel_nr, 2)}
                    className="w-5 h-5 text-green-600 focus:ring-green-500 accent-green-600"
                  />
                  <span className="text-slate-700 dark:text-slate-300 text-sm md:text-base">📱 Tablet</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-red-600 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Success message */}
      {saved && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
          <p className="text-green-600 dark:text-green-400">
            ✅ Configuratie succesvol opgeslagen!
          </p>
        </div>
      )}

      {/* Save button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-700 hover:bg-green-600 disabled:bg-green-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors min-h-[44px] min-w-[200px]"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Opslaan...
            </span>
          ) : (
            'Wijzigingen opslaan'
          )}
        </button>
        <Link
          href="/instellingen"
          className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-4 py-3 rounded-lg transition-colors min-h-[44px]"
        >
          Annuleren
        </Link>
      </div>
    </div>
  );
}
