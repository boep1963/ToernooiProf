import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

interface RouteParams {
  params: Promise<{ orgNr: string; tableNr: string }>;
}

/**
 * GET /api/organizations/:orgNr/scoreboards/device/:tableNr
 * Get device configuration for a specific table
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, tableNr } = await params;
    const orgNummer = parseInt(orgNr, 10);
    const tafelNr = parseInt(tableNr, 10);

    if (isNaN(orgNummer) || isNaN(tafelNr)) {
      return NextResponse.json(
        { error: 'Ongeldige parameters.' },
        { status: 400 }
      );
    }

    console.log(`[DEVICE_CONFIG] Getting config for org:${orgNummer} table:${tafelNr}`);
    const snapshot = await db.collection('device_config')
      .where('org_nummer', '==', orgNummer)
      .where('tafel_nr', '==', tafelNr)
      .get();

    if (snapshot.empty) {
      // Return default config (mouse)
      return NextResponse.json({
        org_nummer: orgNummer,
        tafel_nr: tafelNr,
        soort: 1, // default to mouse
      });
    }

    const doc = snapshot.docs[0];
    return NextResponse.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    console.error('[DEVICE_CONFIG] Error fetching device config:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen apparaatconfiguratie.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/organizations/:orgNr/scoreboards/device/:tableNr
 * Update device configuration for a specific table
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, tableNr } = await params;
    const orgNummer = parseInt(orgNr, 10);
    const tafelNr = parseInt(tableNr, 10);

    if (isNaN(orgNummer) || isNaN(tafelNr)) {
      return NextResponse.json(
        { error: 'Ongeldige parameters.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const soort = Number(body.soort);

    if (soort !== 1 && soort !== 2) {
      return NextResponse.json(
        { error: 'Ongeldig bedieningstype. Gebruik 1 (muis) of 2 (tablet).' },
        { status: 400 }
      );
    }

    console.log(`[DEVICE_CONFIG] Updating config for org:${orgNummer} table:${tafelNr} to soort:${soort}`);

    // Find existing config
    const snapshot = await db.collection('device_config')
      .where('org_nummer', '==', orgNummer)
      .where('tafel_nr', '==', tafelNr)
      .get();

    if (snapshot.empty) {
      // Create new config
      const configData = {
        org_nummer: orgNummer,
        tafel_nr: tafelNr,
        soort: soort,
      };
      const docRef = await db.collection('device_config').add(configData);
      console.log(`[DEVICE_CONFIG] Created new config for table ${tafelNr}`);
      return NextResponse.json({
        success: true,
        id: docRef.id,
        ...configData,
      });
    }

    // Update existing config
    const doc = snapshot.docs[0];
    await doc.ref.update({ soort });
    console.log(`[DEVICE_CONFIG] Updated config for table ${tafelNr}`);

    return NextResponse.json({
      success: true,
      id: doc.id,
      org_nummer: orgNummer,
      tafel_nr: tafelNr,
      soort: soort,
    });
  } catch (error) {
    console.error('[DEVICE_CONFIG] Error updating device config:', error);
    return NextResponse.json(
      { error: 'Fout bij bijwerken apparaatconfiguratie.' },
      { status: 500 }
    );
  }
}
