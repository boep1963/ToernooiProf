import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateSuperAdmin } from '@/lib/admin';

const FETCH_LIMIT = 200;

export async function GET(request: NextRequest) {
  const auth = await validateSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const snapshot = await db.collection('login_log')
      .orderBy('timestamp', 'desc')
      .limit(FETCH_LIMIT)
      .get();

    const allLogins = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        org_nummer: Number(d?.org_nummer ?? 0),
        org_naam: (d?.org_naam ?? '') as string,
        timestamp: (d?.timestamp ?? '') as string,
      };
    });

    // Keep only the newest login per organization.
    const seen = new Set<number>();
    const logins = allLogins.filter((login) => {
      if (!Number.isFinite(login.org_nummer) || login.org_nummer <= 0) return false;
      if (seen.has(login.org_nummer)) return false;
      seen.add(login.org_nummer);
      return true;
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
