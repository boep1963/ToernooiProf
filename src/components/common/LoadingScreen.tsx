import Image from 'next/image';
import logo from '../../../public/ToernooiProf.png';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-900 z-50">
      <div className="relative w-48 h-48 mb-6 animate-pulse">
        <Image
          src={logo}
          alt="ToernooiProf Logo"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
      <h1 className="text-xl font-semibold text-slate-700 dark:text-slate-200 animate-pulse">
        App is aan het laden...
      </h1>
    </div>
  );
}
