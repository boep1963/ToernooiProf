import type { Metadata } from 'next';
import './globals.css';
import ChunkLoadHandler from '@/components/ChunkLoadHandler';
import StartupGuard from '@/components/common/StartupGuard';

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
        <ChunkLoadHandler />
        <StartupGuard>
          {children}
        </StartupGuard>
      </body>
    </html>
  );
}
