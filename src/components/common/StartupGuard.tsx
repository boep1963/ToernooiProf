'use client';

import { useEffect, useState, useRef } from 'react';
import LoadingScreen from './LoadingScreen';
import { checkDatabaseConnection } from '@/app/actions/health-check';

export default function StartupGuard({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const attemptRef = useRef(0);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Increment attempt counter
        attemptRef.current += 1;
        
        // Call server action to check DB connection
        const result = await checkDatabaseConnection();
        
        if (result.connected) {
          setIsReady(true);
        } else {
          // Retry with exponential backoff (max 5 attempts)
          if (attemptRef.current < 5) {
            const delay = Math.min(1000 * Math.pow(2, attemptRef.current - 1), 5000);
            setTimeout(checkConnection, delay);
          } else {
            // After max retries, allow app to load anyway (maybe cached data works)
            // or show a specific error screen. For now, let's proceed to allow
            // the user to see potentially cached UI or specific error pages.
            console.warn('Database connection check failed after multiple attempts. Proceeding anyway.');
            setIsReady(true);
          }
        }
      } catch (error) {
        console.error('StartupGuard check failed:', error);
        // On error, also retry or proceed
        setIsReady(true);
      }
    };

    checkConnection();
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
