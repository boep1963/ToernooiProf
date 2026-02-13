import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get advertisement image data for scoreboard slideshow display
// Returns only the image data URLs (no metadata) for efficient slideshow rendering
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orgNr: string }> }
) {
  try {
    const { orgNr } = await params;
    const orgNummer = parseInt(orgNr, 10);

    if (isNaN(orgNummer)) {
      return NextResponse.json({ error: 'Ongeldig organisatienummer' }, { status: 400 });
    }

    const snapshot = await db.collection('advertisements')
      .where('org_nummer', '==', orgNummer)
      .get();

    const images = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        volg_nr: data?.volg_nr as number || 0,
        image_data: data?.image_data,
      };
    });

    // Sort by volg_nr client-side (avoids Firestore composite index requirement)
    images.sort((a, b) => a.volg_nr - b.volg_nr);

    return NextResponse.json(images);
  } catch (error) {
    console.error('[ADVERTISEMENTS] Error fetching images for slideshow:', error);
    return NextResponse.json({ error: 'Fout bij ophalen afbeeldingen' }, { status: 500 });
  }
}
