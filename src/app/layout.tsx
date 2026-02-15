import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClubMatch - Biljart Competitie Beheer',
  description: 'Beheersysteem voor biljartcompetities - beheer leden, competities, uitslagen en scoreborden',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
