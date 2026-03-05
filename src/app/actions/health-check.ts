'use server';

import db from '@/lib/db';

export async function checkDatabaseConnection(): Promise<{ connected: boolean; type?: string }> {
  try {
    const status = await db.healthCheck();
    return { 
      connected: status.status === 'connected',
      type: status.type
    };
  } catch (error) {
    console.error('Database connection check failed:', error);
    return { connected: false };
  }
}
