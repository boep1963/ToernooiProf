import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-green-700 dark:text-green-500 mb-4">404</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Pagina niet gevonden
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          De pagina die u zoekt bestaat niet of is verplaatst.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Naar dashboard
          </Link>
          <Link
            href="/inloggen"
            className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-colors text-sm"
          >
            Naar inlogpagina
          </Link>
        </div>
      </div>
    </div>
  );
}
