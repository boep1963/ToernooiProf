/**
 * Full-page loading screen for cold start and route loading.
 * Used by app/loading.tsx and route-group loading.tsx files.
 */
export default function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
      role="status"
      aria-live="polite"
      aria-label="Applicatie wordt geladen"
    >
      <div className="text-center max-w-sm px-6">
        <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-green-700 border-r-transparent mb-6" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          ClubMatch
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-1">
          De app wordt opgestart…
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          Bij de eerste keer kan dit even duren. Even geduld.
        </p>
      </div>
    </div>
  );
}
