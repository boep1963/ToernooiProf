export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-700 border-r-transparent mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Laden...</p>
      </div>
    </div>
  );
}
