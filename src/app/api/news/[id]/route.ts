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

// GET /api/news/:id - Get a single news article with its comments
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Get the news article
    const docSnap = await db.collection('news').doc(id).get();
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Nieuwsbericht niet gevonden.' }, { status: 404 });
    }

    const article = { id: docSnap.id, ...docSnap.data() };

    // Get comments for this article from news_reactions collection
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

    return NextResponse.json({ ...article, comments });
  } catch (error) {
    console.error('[NEWS] Error fetching news article:', error);
    return NextResponse.json({ error: 'Fout bij ophalen nieuwsbericht.' }, { status: 500 });
  }
}

// PUT /api/news/:id - Update a news article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthOrg();
  if (!auth) {
    return NextResponse.json({ error: 'Niet ingelogd. Log opnieuw in.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const docSnap = await db.collection('news').doc(id).get();
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Nieuwsbericht niet gevonden.' }, { status: 404 });
    }

    const body = await request.json();
    const { kop, tekst } = body;

    const updateData: Record<string, unknown> = {};
    if (kop !== undefined) updateData.kop = kop.trim();
    if (tekst !== undefined) updateData.tekst = tekst.trim();

    await db.collection('news').doc(id).update(updateData);

    return NextResponse.json({ id, ...updateData });
  } catch (error) {
    console.error('[NEWS] Error updating news:', error);
    return NextResponse.json({ error: 'Fout bij bijwerken nieuwsbericht.' }, { status: 500 });
  }
}

// DELETE /api/news/:id - Delete a news article and its comments
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthOrg();
  if (!auth) {
    return NextResponse.json({ error: 'Niet ingelogd. Log opnieuw in.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const docSnap = await db.collection('news').doc(id).get();
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Nieuwsbericht niet gevonden.' }, { status: 404 });
    }

    // Delete associated comments
    const commentsSnapshot = await db.collection('news_reactions')
      .where('news_id', '==', id)
      .get();

    for (const doc of commentsSnapshot.docs) {
      await doc.ref.delete();
    }

    // Delete the article itself
    await db.collection('news').doc(id).delete();

    console.log(`[NEWS] Deleted news article ${id} and ${commentsSnapshot.size} comments`);

    return NextResponse.json({ deleted: true, comments_deleted: commentsSnapshot.size });
  } catch (error) {
    console.error('[NEWS] Error deleting news:', error);
    return NextResponse.json({ error: 'Fout bij verwijderen nieuwsbericht.' }, { status: 500 });
  }
}
