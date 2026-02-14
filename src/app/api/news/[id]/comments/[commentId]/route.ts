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

// DELETE /api/news/:id/comments/:commentId - Delete a comment
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const auth = await getAuthOrg();
  if (!auth) {
    return NextResponse.json({ error: 'Niet ingelogd. Log opnieuw in.' }, { status: 401 });
  }

  const { id, commentId } = await params;

  try {
    // Verify the comment exists
    const commentDoc = await db.collection('news_reactions').doc(commentId).get();
    if (!commentDoc.exists) {
      return NextResponse.json({ error: 'Reactie niet gevonden.' }, { status: 404 });
    }

    const commentData = commentDoc.data();

    // Verify the comment belongs to this article
    if (commentData?.news_id !== id) {
      return NextResponse.json({ error: 'Reactie hoort niet bij dit nieuwsbericht.' }, { status: 400 });
    }

    // Verify the user owns this comment (same organization)
    if (commentData?.org_nummer !== auth.orgNummer) {
      return NextResponse.json({ error: 'Niet gemachtigd om deze reactie te verwijderen' }, { status: 403 });
    }

    // Delete the comment
    await db.collection('news_reactions').doc(commentId).delete();

    console.log(`[NEWS] Deleted comment ${commentId} from article ${id} by org ${auth.orgNummer}`);

    return NextResponse.json({ deleted: true, commentId });
  } catch (error) {
    console.error('[NEWS] Error deleting comment:', error);
    return NextResponse.json({ error: 'Fout bij verwijderen reactie.' }, { status: 500 });
  }
}
