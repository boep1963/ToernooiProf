'use client';

import React from 'react';

export default function LedenPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Ledenbeheer
      </h1>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <p className="text-slate-600 dark:text-slate-400">
          Beheer de leden van uw vereniging. Voeg nieuwe leden toe, bewerk gegevens en beheer moyennes.
        </p>
      </div>
    </div>
  );
}
