import type { Metadata } from 'next';
import './globals.css';
import ChunkLoadHandler from '@/components/ChunkLoadHandler';

export const metadata: Metadata = {
  title: 'ClubMatch - Biljart Competitie Beheer',
  description: 'Beheersysteem voor biljartcompetities - beheer leden, competities en uitslagen',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <ChunkLoadHandler />
        {children}
      </body>
    </html>
  );
}
