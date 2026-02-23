'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-red-700 dark:text-red-500 mb-4">Fout</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Er is iets misgegaan
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {error.message || 'Een onverwachte fout is opgetreden.'}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors text-sm"
        >
          Probeer opnieuw
        </button>
      </div>
    </div>
  );
}
