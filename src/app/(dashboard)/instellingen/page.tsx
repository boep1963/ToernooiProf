'use client';

import React from 'react';
import Link from 'next/link';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';

const allSettingsLinks = [
  {
    href: '/instellingen/account',
    title: 'Account',
    description: 'Bekijk en wijzig uw accountgegevens en organisatie-instellingen.',
    icon: '👤',
    requiresAdmin: false,
  },
  {
    href: '/instellingen/backups',
    title: 'Backups',
    description: 'Bekijk en herstel backups van uw Firestore database.',
    icon: '💾',
    requiresAdmin: true,
  },
];

export default function InstellingenPage() {
  const { isSuperAdmin } = useSuperAdmin();

  // Filter links based on admin status
  const settingsLinks = allSettingsLinks.filter(
    (link) => !link.requiresAdmin || isSuperAdmin
  );
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Instellingen
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Configureer uw organisatie-instellingen, account en voorkeuren.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md hover:border-green-500 dark:hover:border-green-400 transition-all group"
          >
            <div className="text-3xl mb-3">{link.icon}</div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
              {link.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {link.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
