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

// GET /api/news/:id/comments - List comments for a news article
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Note: avoid where+orderBy combo that requires Firestore composite index
    const commentsSnapshot = await db.collection('news_reactions')
      .where('news_id', '==', id)
      .get();

    const comments: Record<string, unknown>[] = [];
    commentsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data) {
        comments.push({ id: doc.id, ...data });
      }
    });

    // Sort by tijd ascending in application code
    comments.sort((a, b) => {
      const aTime = String(a.tijd || '');
      const bTime = String(b.tijd || '');
      return aTime.localeCompare(bTime);
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('[NEWS] Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST /api/news/:id/comments - Add a comment to a news article
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthOrg();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Verify the news article exists
    const newsDoc = await db.collection('news').doc(id).get();
    if (!newsDoc.exists) {
      return NextResponse.json({ error: 'News article not found' }, { status: 404 });
    }

    const body = await request.json();
    const { tekst, naam } = body;

    if (!tekst || tekst.trim().length === 0) {
      return NextResponse.json({ error: 'Tekst is verplicht' }, { status: 400 });
    }

    if (tekst.length > 500) {
      return NextResponse.json({ error: 'Reactie mag maximaal 500 tekens zijn' }, { status: 400 });
    }

    // Generate auto-incrementing nummer for the reaction
    const existingSnapshot = await db.collection('news_reactions')
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

    const commentData = {
      nummer: nextNummer,
      news_id: id,
      naam: naam?.trim() || auth.orgName || 'Anoniem',
      tekst: tekst.trim(),
      tijd: now,
      org_nummer: auth.orgNummer,
    };

    const docRef = await db.collection('news_reactions').add(commentData);

    console.log(`[NEWS] Added comment #${nextNummer} to article ${id} by ${commentData.naam}`);

    return NextResponse.json({ id: docRef.id, ...commentData }, { status: 201 });
  } catch (error) {
    console.error('[NEWS] Error adding comment:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
