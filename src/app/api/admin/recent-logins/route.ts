import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateSuperAdmin } from '@/lib/admin';

const LIMIT = 10;

export async function GET(request: NextRequest) {
  const auth = await validateSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const snapshot = await db.collection('login_log')
      .orderBy('timestamp', 'desc')
      .limit(LIMIT)
      .get();

    const logins = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        org_nummer: d?.org_nummer ?? 0,
        org_naam: (d?.org_naam ?? '') as string,
        timestamp: (d?.timestamp ?? '') as string,
      };
    });

    return NextResponse.json({ logins });
  } catch (error) {
    console.error('[admin/recent-logins]', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen logins.' },
      { status: 500 }
    );
  }
}
