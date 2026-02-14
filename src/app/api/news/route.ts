import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// Helper to get authenticated org from session cookie
async function getAuthOrg(): Promise<{ orgNummer: number; orgName: string } | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('clubmatch-session');
  if (!sessionCookie) return null;
  try {
    const session = JSON.parse(sessionCookie.value);
    return { orgNummer: session.orgNummer, orgName: session.orgNaam || '' };
  } catch {
    return null;
  }
}

// GET /api/news - List all news articles (most recent first)
export async function GET() {
  try {
    const snapshot = await db.collection('news')
      .orderBy('tijd', 'desc')
      .limit(20)
      .get();

    const articles: Record<string, unknown>[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data) {
        articles.push({ id: doc.id, ...data });
      }
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error('[NEWS] Error fetching news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

// POST /api/news - Create a new news article
export async function POST(request: NextRequest) {
  const auth = await getAuthOrg();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { kop, tekst } = body;

    if (!kop || !tekst) {
      return NextResponse.json({ error: 'Kop en tekst zijn verplicht' }, { status: 400 });
    }

    if (kop.length > 100) {
      return NextResponse.json({ error: 'Kop mag maximaal 100 tekens zijn' }, { status: 400 });
    }

    if (tekst.length > 1000) {
      return NextResponse.json({ error: 'Tekst mag maximaal 1000 tekens zijn' }, { status: 400 });
    }

    // Generate auto-incrementing nummer
    const existingSnapshot = await db.collection('news')
      .orderBy('nummer', 'desc')
      .limit(1)
      .get();

    let nextNummer = 1;
    if (!existingSnapshot.empty) {
      const lastDoc = existingSnapshot.docs[0].data();
      if (lastDoc && typeof lastDoc.nummer === 'number') {
        nextNummer = lastDoc.nummer + 1;
      }
    }

    const now = new Date().toISOString();

    const newsData = {
      nummer: nextNummer,
      kop: kop.trim(),
      tekst: tekst.trim(),
      tijd: now,
      org_nummer: auth.orgNummer,
      org_naam: auth.orgName,
    };

    const docRef = await db.collection('news').add(newsData);

    console.log(`[NEWS] Created news article #${nextNummer} by org ${auth.orgNummer}`);

    return NextResponse.json({ id: docRef.id, ...newsData }, { status: 201 });
  } catch (error) {
    console.error('[NEWS] Error creating news:', error);
    return NextResponse.json({ error: 'Failed to create news' }, { status: 500 });
  }
}
