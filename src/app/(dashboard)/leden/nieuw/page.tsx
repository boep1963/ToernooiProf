'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function NieuwLid() {
  const router = useRouter();
  const { orgNummer } = useAuth();

  const [formData, setFormData] = useState({
    spa_vnaam: '',
    spa_tv: '',
    spa_anaam: '',
    spa_moy_lib: '',
    spa_moy_band: '',
    spa_moy_3bkl: '',
    spa_moy_3bgr: '',
    spa_moy_kad: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!orgNummer) {
      setError('Sessie verlopen. Log opnieuw in.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.spa_vnaam.trim() && !formData.spa_anaam.trim()) {
      setError('Voornaam of achternaam is verplicht.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        spa_vnaam: formData.spa_vnaam.trim(),
        spa_tv: formData.spa_tv.trim(),
        spa_anaam: formData.spa_anaam.trim(),
        spa_moy_lib: formData.spa_moy_lib ? parseFloat(formData.spa_moy_lib) : 0,
        spa_moy_band: formData.spa_moy_band ? parseFloat(formData.spa_moy_band) : 0,
        spa_moy_3bkl: formData.spa_moy_3bkl ? parseFloat(formData.spa_moy_3bkl) : 0,
        spa_moy_3bgr: formData.spa_moy_3bgr ? parseFloat(formData.spa_moy_3bgr) : 0,
        spa_moy_kad: formData.spa_moy_kad ? parseFloat(formData.spa_moy_kad) : 0,
      };

      const res = await fetch(`/api/organizations/${orgNummer}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const naam = [data.spa_vnaam, data.spa_tv, data.spa_anaam].filter(Boolean).join(' ');
        setSuccess(`Lid "${naam}" is succesvol aangemaakt!`);
        setTimeout(() => {
          router.push('/leden');
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Fout bij aanmaken lid.');
      }
    } catch {
      setError('Er is een fout opgetreden. Probeer het later opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <button
            type="button"
            onClick={() => router.push('/leden')}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            aria-label="Terug naar leden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Nieuw lid toevoegen
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 ml-8">
          Vul de gegevens in om een nieuw lid aan te maken.
        </p>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Persoonsgegevens
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="spa_vnaam" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Voornaam
              </label>
              <input
                id="spa_vnaam"
                name="spa_vnaam"
                type="text"
                value={formData.spa_vnaam}
                onChange={handleChange}
                placeholder="Bijv. Jan"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="spa_tv" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tussenvoegsel
              </label>
              <input
                id="spa_tv"
                name="spa_tv"
                type="text"
                value={formData.spa_tv}
                onChange={handleChange}
                placeholder="Bijv. van"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="spa_anaam" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Achternaam
              </label>
              <input
                id="spa_anaam"
                name="spa_anaam"
                type="text"
                value={formData.spa_anaam}
                onChange={handleChange}
                placeholder="Bijv. Berg"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Voornaam of achternaam is verplicht.
          </p>
        </div>

        {/* Moyennes */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Moyennes per discipline
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Vul de moyennes in voor de disciplines waarin het lid speelt. Laat leeg als niet van toepassing.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label htmlFor="spa_moy_lib" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Libre
              </label>
              <input
                id="spa_moy_lib"
                name="spa_moy_lib"
                type="number"
                step="0.001"
                min="0"
                value={formData.spa_moy_lib}
                onChange={handleChange}
                placeholder="0.000"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="spa_moy_band" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Bandstoten
              </label>
              <input
                id="spa_moy_band"
                name="spa_moy_band"
                type="number"
                step="0.001"
                min="0"
                value={formData.spa_moy_band}
                onChange={handleChange}
                placeholder="0.000"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="spa_moy_3bkl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Driebanden klein
              </label>
              <input
                id="spa_moy_3bkl"
                name="spa_moy_3bkl"
                type="number"
                step="0.001"
                min="0"
                value={formData.spa_moy_3bkl}
                onChange={handleChange}
                placeholder="0.000"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="spa_moy_3bgr" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Driebanden groot
              </label>
              <input
                id="spa_moy_3bgr"
                name="spa_moy_3bgr"
                type="number"
                step="0.001"
                min="0"
                value={formData.spa_moy_3bgr}
                onChange={handleChange}
                placeholder="0.000"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="spa_moy_kad" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Kader
              </label>
              <input
                id="spa_moy_kad"
                name="spa_moy_kad"
                type="number"
                step="0.001"
                min="0"
                value={formData.spa_moy_kad}
                onChange={handleChange}
                placeholder="0.000"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            {isSubmitting ? 'Bezig met aanmaken...' : 'Lid toevoegen'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/leden')}
            className="px-6 py-2.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
          >
            Annuleren
          </button>
        </div>
      </form>
    </div>
  );
}
