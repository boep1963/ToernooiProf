import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

interface RouteParams {
  params: Promise<{ orgNr: string }>;
}

/**
 * GET /api/organizations/:orgNr/scoreboards/device
 * List all device configurations for an organization
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr } = await params;
    const orgNummer = parseInt(orgNr, 10);

    if (isNaN(orgNummer)) {
      return NextResponse.json(
        { error: 'Ongeldig organisatienummer.' },
        { status: 400 }
      );
    }

    console.log('[DEVICE_CONFIG] Querying device configs for org:', orgNummer);
    const snapshot = await db.collection('device_config')
      .where('org_nummer', '==', orgNummer)
      .get();

    const configs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort by tafel_nr
    configs.sort((a, b) => ((a as Record<string, unknown>).tafel_nr as number) - ((b as Record<string, unknown>).tafel_nr as number));

    console.log(`[DEVICE_CONFIG] Found ${configs.length} device configs`);
    return NextResponse.json(configs);
  } catch (error) {
    console.error('[DEVICE_CONFIG] Error fetching device configs:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen apparaatconfiguratie.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/:orgNr/scoreboards/device
 * Remove duplicate device configurations (keep only first per table)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr } = await params;
    const orgNummer = parseInt(orgNr, 10);

    if (isNaN(orgNummer)) {
      return NextResponse.json(
        { error: 'Ongeldig organisatienummer.' },
        { status: 400 }
      );
    }

    console.log('[DEVICE_CONFIG] Removing duplicates for org:', orgNummer);

    // Get all configs
    const snapshot = await db.collection('device_config')
      .where('org_nummer', '==', orgNummer)
      .get();

    // Group by tafel_nr, keep only first per table
    const seen = new Map<number, string>();
    const toDelete: string[] = [];

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const tafelNr = data.tafel_nr as number;

      if (seen.has(tafelNr)) {
        // Duplicate - mark for deletion
        toDelete.push(doc.id);
      } else {
        // First occurrence - keep it
        seen.set(tafelNr, doc.id);
      }
    });

    // Delete duplicates
    for (const docId of toDelete) {
      await db.collection('device_config').doc(docId).delete();
    }

    console.log(`[DEVICE_CONFIG] Deleted ${toDelete.length} duplicate configs`);
    return NextResponse.json({
      success: true,
      deleted: toDelete.length,
      remaining: seen.size,
    });
  } catch (error) {
    console.error('[DEVICE_CONFIG] Error removing duplicates:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen duplicaten.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations/:orgNr/scoreboards/device
 * Initialize device configurations for all tables
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr } = await params;
    const orgNummer = parseInt(orgNr, 10);

    if (isNaN(orgNummer)) {
      return NextResponse.json(
        { error: 'Ongeldig organisatienummer.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const aantalTafels = body.aantal_tafels || 4;

    console.log('[DEVICE_CONFIG] Initializing device configs for org:', orgNummer, 'tables:', aantalTafels);

    // Check existing configs
    const existing = await db.collection('device_config')
      .where('org_nummer', '==', orgNummer)
      .get();

    const existingTables = new Set<number>();
    existing.docs.forEach(doc => {
      const data = doc.data();
      if (data) existingTables.add(data.tafel_nr as number);
    });

    // Create missing configs (default to mouse=1)
    const created: Record<string, unknown>[] = [];
    for (let i = 1; i <= aantalTafels; i++) {
      if (!existingTables.has(i)) {
        const configData = {
          org_nummer: orgNummer,
          tafel_nr: i,
          soort: 1, // 1=mouse, 2=tablet
        };
        const docRef = await db.collection('device_config').add(configData);
        created.push({ id: docRef.id, ...configData });
      }
    }

    console.log(`[DEVICE_CONFIG] Created ${created.length} new device configs`);
    return NextResponse.json({
      success: true,
      created: created.length,
      configs: created,
    }, { status: 201 });
  } catch (error) {
    console.error('[DEVICE_CONFIG] Error initializing device configs:', error);
    return NextResponse.json(
      { error: 'Fout bij initialiseren apparaatconfiguratie.' },
      { status: 500 }
    );
  }
}
