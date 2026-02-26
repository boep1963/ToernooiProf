'use client';

export default function Footer() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? '–';
  const buildId = process.env.NEXT_PUBLIC_BUILD_ID;
  const versionDisplay = buildId ? `${version} (${buildId})` : version;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto py-4 px-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <p>&copy; {year} ClubMatch - Biljart Competitie Beheer</p>
        <p className="sm:ml-auto">Versie {versionDisplay}</p>
      </div>
    </footer>
  );
}
