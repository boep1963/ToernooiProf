import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';

interface RouteParams {
  params: Promise<{ orgNr: string }>;
}

const MAX_LOGO_BYTES = 200 * 1024; // 200 KB
const ALLOWED_TYPES = /^image\/(jpeg|jpg|png|webp|gif)$/i;
const SUPPORTED_FORMATS = 'JPG, PNG, WebP, GIF';

/**
 * Resize and compress image to max 200 KB. Returns JPEG data URL.
 */
async function processLogoToMaxSize(inputBuffer: Buffer): Promise<string> {
  const maxLongEdge = 1200;

  for (const quality of [85, 70, 55, 40]) {
    const out = await sharp(inputBuffer)
      .rotate()
      .resize(maxLongEdge, maxLongEdge, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    if (out.length <= MAX_LOGO_BYTES) {
      return `data:image/jpeg;base64,${out.toString('base64')}`;
    }
  }

  const smaller = 800;
  const out = await sharp(inputBuffer)
    .rotate()
    .resize(smaller, smaller, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 75, mozjpeg: true })
    .toBuffer();
  return `data:image/jpeg;base64,${out.toString('base64')}`;
}

/**
 * POST /api/organizations/:orgNr/logo
 * Upload organization logo. Accepts JPG, PNG, WebP, GIF. Scales down to max 200 KB.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr } = await params;

    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    const formData = await request.formData();
    const file = formData.get('logo') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Geen bestand geselecteerd.' },
        { status: 400 }
      );
    }

    if (!file.type.match(ALLOWED_TYPES)) {
      return NextResponse.json(
        { error: `Alleen ${SUPPORTED_FORMATS} zijn toegestaan.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);
    const dataUrl = await processLogoToMaxSize(inputBuffer);

    console.log('[LOGO] Uploading logo for organization:', orgNummer);

    // Update organization with logo data URL
    const orgSnapshot = await db.collection('organizations')
      .where('org_nummer', '==', orgNummer)
      .limit(1)
      .get();

    if (orgSnapshot.empty) {
      return NextResponse.json(
        { error: 'Organisatie niet gevonden.' },
        { status: 404 }
      );
    }

    await orgSnapshot.docs[0].ref.update({
      org_logo: dataUrl,
    });

    console.log('[LOGO] Logo uploaded successfully');
    return NextResponse.json({
      success: true,
      message: 'Logo succesvol ge-upload!',
      logoUrl: dataUrl,
    });
  } catch (error) {
    console.error('[LOGO] Error uploading logo:', error);
    return NextResponse.json(
      { error: 'Fout bij uploaden logo.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/:orgNr/logo
 * Remove organization logo
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr } = await params;

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    console.log('[LOGO] Removing logo for organization:', orgNummer);

    const orgSnapshot = await db.collection('organizations')
      .where('org_nummer', '==', orgNummer)
      .limit(1)
      .get();

    if (orgSnapshot.empty) {
      return NextResponse.json(
        { error: 'Organisatie niet gevonden.' },
        { status: 404 }
      );
    }

    await orgSnapshot.docs[0].ref.update({
      org_logo: '',
    });

    console.log('[LOGO] Logo removed successfully');
    return NextResponse.json({
      success: true,
      message: 'Logo verwijderd!',
    });
  } catch (error) {
    console.error('[LOGO] Error removing logo:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen logo.' },
      { status: 500 }
    );
  }
}
