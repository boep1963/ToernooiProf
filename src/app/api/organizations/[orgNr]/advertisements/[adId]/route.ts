import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get a single advertisement by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orgNr: string; adId: string }> }
) {
  try {
    const { orgNr, adId } = await params;
    const orgNummer = parseInt(orgNr, 10);

    if (isNaN(orgNummer)) {
      return NextResponse.json({ error: 'Ongeldig organisatienummer' }, { status: 400 });
    }

    const docSnap = await db.collection('advertisements').doc(adId).get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Advertentie niet gevonden' }, { status: 404 });
    }

    const data = docSnap.data();
    if (data?.org_nummer !== orgNummer) {
      return NextResponse.json({ error: 'Advertentie niet gevonden' }, { status: 404 });
    }

    return NextResponse.json({ id: docSnap.id, ...data });
  } catch (error) {
    console.error('[ADVERTISEMENTS] Error fetching ad:', error);
    return NextResponse.json({ error: 'Fout bij ophalen advertentie' }, { status: 500 });
  }
}

// DELETE - Delete an advertisement
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ orgNr: string; adId: string }> }
) {
  try {
    const { orgNr, adId } = await params;
    const orgNummer = parseInt(orgNr, 10);

    if (isNaN(orgNummer)) {
      return NextResponse.json({ error: 'Ongeldig organisatienummer' }, { status: 400 });
    }

    // Verify the advertisement exists and belongs to this org
    const docSnap = await db.collection('advertisements').doc(adId).get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Advertentie niet gevonden' }, { status: 404 });
    }

    const data = docSnap.data();
    if (data?.org_nummer !== orgNummer) {
      return NextResponse.json({ error: 'Advertentie niet gevonden' }, { status: 404 });
    }

    const bestandsnaam = data?.bestandsnaam || 'onbekend';
    const volgNr = data?.volg_nr || 0;

    console.log(`[ADVERTISEMENTS] Deleting slide ${volgNr} for org ${orgNummer}: ${bestandsnaam}`);

    await db.collection('advertisements').doc(adId).delete();

    return NextResponse.json({
      message: `Slide "${bestandsnaam}" is succesvol verwijderd`,
      deleted_id: adId,
      volg_nr: volgNr,
    });
  } catch (error) {
    console.error('[ADVERTISEMENTS] Error deleting:', error);
    return NextResponse.json({ error: 'Fout bij verwijderen advertentie' }, { status: 500 });
  }
}
