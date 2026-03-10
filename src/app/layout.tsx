import type { Metadata } from 'next';
import './globals.css';
import ChunkLoadHandler from '@/components/ChunkLoadHandler';

export const metadata: Metadata = {
  title: 'ToernooiProf',
  description: 'Beheersysteem voor biljarttoernooien',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        {/* Voorkom flits light mode bij full-page reload: thema direct uit localStorage vóór eerste paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('toernoiprof-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');})();`,
          }}
        />
        <ChunkLoadHandler />
        {children}
      </body>
    </html>
  );
}
