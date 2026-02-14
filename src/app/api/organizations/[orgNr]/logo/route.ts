import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';

interface RouteParams {
  params: Promise<{ orgNr: string }>;
}

/**
 * POST /api/organizations/:orgNr/logo
 * Upload organization logo
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr } = await params;

    // Validate session and org access
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

    // Validate file type - only JPG/JPEG
    if (!file.type.match(/^image\/(jpeg|jpg)$/i)) {
      return NextResponse.json(
        { error: 'Alleen JPG-formaat is toegestaan.' },
        { status: 400 }
      );
    }

    // Validate file size - max 1MB
    if (file.size > 1000000) {
      return NextResponse.json(
        { error: 'Bestand is te groot. Maximaal 1MB toegestaan.' },
        { status: 400 }
      );
    }

    // Convert file to base64 data URL for storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

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
