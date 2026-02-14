import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all advertisements for an organization
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

    console.log(`[ADVERTISEMENTS] Fetching advertisements for org: ${orgNummer}`);

    const snapshot = await db.collection('advertisements')
      .where('org_nummer', '==', orgNummer)
      .get();

    const advertisements = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<{ id: string; volg_nr?: number; [key: string]: unknown }>;

    // Sort by volg_nr client-side (avoids Firestore composite index requirement)
    advertisements.sort((a, b) => ((a.volg_nr as number) || 0) - ((b.volg_nr as number) || 0));

    return NextResponse.json(advertisements);
  } catch (error) {
    console.error('[ADVERTISEMENTS] Error fetching:', error);
    return NextResponse.json({ error: 'Fout bij ophalen advertenties' }, { status: 500 });
  }
}

// POST - Upload a new advertisement
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgNr: string }> }
) {
  try {
    const { orgNr } = await params;
    const orgNummer = parseInt(orgNr, 10);

    if (isNaN(orgNummer)) {
      return NextResponse.json({ error: 'Ongeldig organisatienummer' }, { status: 400 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Geen bestand geselecteerd' }, { status: 400 });
    }

    // Validate file type - only JPEG allowed (matching PHP: JPG/jpg)
    const allowedTypes = ['image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.jpg') && !file.name.toLowerCase().endsWith('.jpeg')) {
      return NextResponse.json({ error: 'Alleen JPG-formaat is toegestaan' }, { status: 400 });
    }

    // Validate file size - max 2MB (matching PHP: 2000000 bytes)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Het bestand is te groot (max 2 MB)' }, { status: 400 });
    }

    // Check max 20 slides per organization (matching PHP limit)
    const existingSnapshot = await db.collection('advertisements')
      .where('org_nummer', '==', orgNummer)
      .get();

    if (existingSnapshot.size >= 20) {
      return NextResponse.json({
        error: 'Maximum van 20 slides bereikt. Verwijder eerst bestaande slides.'
      }, { status: 400 });
    }

    // Convert file to base64 for storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64Data}`;

    // Calculate next volg_nr
    let maxVolgNr = 0;
    existingSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const vn = data?.volg_nr as number || 0;
      if (vn > maxVolgNr) maxVolgNr = vn;
    });
    const nextVolgNr = maxVolgNr + 1;

    // Create the advertisement document
    const adData = {
      org_nummer: orgNummer,
      volg_nr: nextVolgNr,
      bestandsnaam: file.name,
      image_data: dataUrl,
      file_size: file.size,
      mime_type: file.type || 'image/jpeg',
      created_at: new Date().toISOString(),
    };

    console.log(`[ADVERTISEMENTS] Uploading slide ${nextVolgNr} for org ${orgNummer}: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);

    const docRef = await db.collection('advertisements').add(adData);

    return NextResponse.json({
      id: docRef.id,
      org_nummer: orgNummer,
      volg_nr: nextVolgNr,
      bestandsnaam: file.name,
      file_size: file.size,
      created_at: adData.created_at,
      message: `Slide "${file.name}" is succesvol ge-upload!`,
    }, { status: 201 });
  } catch (error) {
    console.error('[ADVERTISEMENTS] Error uploading:', error);
    return NextResponse.json({ error: 'Fout bij uploaden advertentie' }, { status: 500 });
  }
}
