import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import db from '@/lib/db';
import { validateSuperAdmin } from '@/lib/admin';
import { normalizeOrgNummer } from '@/lib/orgNumberUtils';
import { logMutationAudit } from '@/lib/mutationAudit';

interface RouteParams {
  params: Promise<{ orgNr: string }>;
}

const MAX_LOGO_BYTES = 200 * 1024; // 200 KB
const ALLOWED_TYPES = /^image\/(jpeg|jpg|png|webp|gif)$/i;
const SUPPORTED_FORMATS = 'JPG, PNG, WebP, GIF';

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
 * POST /api/admin/organizations/:orgNr/logo
 * Super admin only: upload logo for any organization.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const authResult = await validateSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { orgNr } = await params;
    const orgNummer = normalizeOrgNummer(orgNr);

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

    return NextResponse.json({
      success: true,
      message: 'Logo succesvol ge-upload!',
      logoUrl: dataUrl,
    });
  } catch (error) {
    console.error('[ADMIN LOGO] Error uploading logo:', error);
    return NextResponse.json(
      { error: 'Fout bij uploaden logo.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/organizations/:orgNr/logo
 * Super admin only: remove logo for any organization.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authResult = await validateSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const actorOrgNummer = authResult.orgNummer;
  let targetOrgNummer = actorOrgNummer;

  try {
    const { orgNr } = await params;
    const orgNummer = normalizeOrgNummer(orgNr);
    targetOrgNummer = orgNummer;

    const orgSnapshot = await db.collection('organizations')
      .where('org_nummer', '==', orgNummer)
      .limit(1)
      .get();

    if (orgSnapshot.empty) {
      logMutationAudit({
        action: 'admin_delete_org_logo',
        orgNummer: targetOrgNummer,
        resourceType: 'organizations',
        resourceId: String(orgNummer),
        success: false,
        actor: `super_admin_org_${actorOrgNummer}`,
        details: { reason: 'not_found' },
      });
      return NextResponse.json(
        { error: 'Organisatie niet gevonden.' },
        { status: 404 }
      );
    }

    await orgSnapshot.docs[0].ref.update({
      org_logo: '',
    });
    logMutationAudit({
      action: 'admin_delete_org_logo',
      orgNummer: targetOrgNummer,
      resourceType: 'organizations',
      resourceId: String(orgNummer),
      success: true,
      actor: `super_admin_org_${actorOrgNummer}`,
      details: { field: 'org_logo' },
    });

    return NextResponse.json({
      success: true,
      message: 'Logo verwijderd!',
    });
  } catch (error) {
    logMutationAudit({
      action: 'admin_delete_org_logo',
      orgNummer: targetOrgNummer,
      resourceType: 'organizations',
      resourceId: String(targetOrgNummer),
      success: false,
      actor: `super_admin_org_${actorOrgNummer}`,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    console.error('[ADMIN LOGO] Error removing logo:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen logo.' },
      { status: 500 }
    );
  }
}
