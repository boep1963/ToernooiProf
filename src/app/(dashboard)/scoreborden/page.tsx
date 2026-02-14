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

export default function ScorebordenPage() {
  const { orgNummer, organization } = useAuth();
  const [configs, setConfigs] = useState<DeviceConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgNummer || !organization) return;

    const fetchConfigs = async () => {
      try {
        // Fetch existing device configs
        const res = await fetch(`/api/organizations/${orgNummer}/scoreboards/device`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        if (data.length === 0) {
          // Initialize device configs for all tables
          const aantalTafels = (organization as unknown as Record<string, unknown>).aantal_tafels || 4;
          await fetch(`/api/organizations/${orgNummer}/scoreboards/device`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aantal_tafels: aantalTafels }),
          });

          // Re-fetch
          const res2 = await fetch(`/api/organizations/${orgNummer}/scoreboards/device`);
          const data2 = await res2.json();
          setConfigs(data2);
        } else {
          setConfigs(data);
        }
      } catch (error) {
        console.error('Error fetching device configs:', error);
        // Generate default configs based on organization tables
        const aantalTafels = (organization as unknown as Record<string, unknown>)?.aantal_tafels as number || 4;
        const defaults: DeviceConfig[] = [];
        for (let i = 1; i <= aantalTafels; i++) {
          defaults.push({
            org_nummer: orgNummer,
            tafel_nr: i,
            soort: 1,
          });
        }
        setConfigs(defaults);
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, [orgNummer, organization]);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Scoreborden
        </h1>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Scoreborden
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Selecteer een tafel om het scorebord te openen. Elk scorebord kan in volledig scherm worden weergegeven voor gebruik met een extern beeldscherm.
      </p>

      {/* Table grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {configs.map((config) => (
          <Link
            key={config.id || `table-${config.tafel_nr}`}
            href={`/scoreborden/${config.tafel_nr}`}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md hover:border-green-500 dark:hover:border-green-400 transition-all group"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 dark:group-hover:bg-green-800/40 transition-colors">
                <span className="text-3xl font-bold text-green-700 dark:text-green-400">
                  {config.tafel_nr}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                Tafel {config.tafel_nr}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {config.soort === 1 ? '🖱️ Muis' : '📱 Tablet'}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {configs.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            Geen tafels geconfigureerd. Ga naar{' '}
            <Link href="/instellingen/tafels" className="text-green-600 hover:text-green-500 underline">
              Instellingen &rarr; Tafels
            </Link>{' '}
            om de bediening te configureren.
          </p>
        </div>
      )}
    </div>
  );
}
