import { NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * GET /api/verify-collections
 * Verify all required Firestore collections exist and support correct document structure.
 * Creates test documents, verifies fields, then cleans up.
 */
export async function GET() {
  const results: Record<string, { status: string; fields?: string[]; error?: string }> = {};

  // Define all collections and their expected test data
  const verificationDocuments: Record<string, Record<string, unknown>> = {
    organizations: {
      org_nummer: 99999,
      org_code: 'TEST_99999_XYZ',
      org_naam: 'Test Organisatie',
      org_wl_naam: 'Test Contact',
      org_wl_email: 'test@example.com',
      org_logo: '',
      aantal_tafels: 4,
      return_code: 0,
      time_start: 0,
      code_ontvangen: 1,
      date_start: new Date().toISOString(),
      date_inlog: new Date().toISOString(),
      nieuwsbrief: 0,
      reminder_send: 0,
      firebase_uid: '',
    },
    competitions: {
      org_nummer: 99999,
      comp_nr: 1,
      comp_naam: 'Test Competitie',
      comp_datum: '2026-01-01',
      discipline: 1,
      periode: 1,
      punten_sys: 10000,
      moy_form: 3,
      min_car: 5,
      max_beurten: 0,
      vast_beurten: 0,
      sorteren: 1,
    },
    members: {
      spa_nummer: 999,
      spa_vnaam: 'Test',
      spa_tv: 'van',
      spa_anaam: 'Verificatie',
      spa_org: 99999,
      spa_moy_lib: 1.0,
      spa_moy_band: 0.5,
      spa_moy_3bkl: 0.3,
      spa_moy_3bgr: 0.2,
      spa_moy_kad: 0.1,
    },
    competition_players: {
      spc_nummer: 999,
      spc_org: 99999,
      spc_competitie: 1,
      spc_moyenne_1: 1.0,
      spc_moyenne_2: 0,
      spc_moyenne_3: 0,
      spc_moyenne_4: 0,
      spc_moyenne_5: 0,
      spc_car_1: 25,
      spc_car_2: 0,
      spc_car_3: 0,
      spc_car_4: 0,
      spc_car_5: 0,
    },
    matches: {
      org_nummer: 99999,
      comp_nr: 1,
      nummer_A: 1,
      naam_A: 'Speler A',
      cartem_A: 25,
      tafel: '100000000000',
      nummer_B: 2,
      naam_B: 'Speler B',
      cartem_B: 30,
      periode: 1,
      uitslag_code: '1_001_002',
      gespeeld: 0,
    },
    results: {
      org_nummer: 99999,
      comp_nr: 1,
      uitslag_code: '1_001_002',
      periode: 1,
      speeldatum: new Date().toISOString(),
      sp_1_nr: 1,
      sp_1_cartem: 25,
      sp_1_cargem: 20,
      sp_1_hs: 5,
      sp_1_punt: 0,
      brt: 20,
      sp_2_nr: 2,
      sp_2_cartem: 30,
      sp_2_cargem: 30,
      sp_2_hs: 8,
      sp_2_punt: 2,
      gespeeld: 1,
    },
    tables: {
      org_nummer: 99999,
      comp_nr: 1,
      u_code: '1_001_002',
      tafel_nr: 1,
      status: 0,
    },
    device_config: {
      org_nummer: 99999,
      tafel_nr: 1,
      soort: 1,
    },
    score_helpers: {
      org_nummer: 99999,
      comp_nr: 1,
      uitslag_code: '1_001_002',
      car_A_tem: 25,
      car_A_gem: 10,
      hs_A: 3,
      brt: 10,
      car_B_tem: 30,
      car_B_gem: 15,
      hs_B: 4,
      turn: 1,
      alert: 0,
    },
    score_helpers_tablet: {
      org_nummer: 99999,
      comp_nr: 1,
      uitslag_code: '1_001_002',
      car_A_tem: 25,
      car_A_gem: 10,
      hs_A: 3,
      brt: 10,
      car_B_tem: 30,
      car_B_gem: 15,
      hs_B: 4,
      turn: 1,
      alert: 0,
      tafel_nr: 1,
      serie_A: 2,
      serie_B: 3,
    },
    news_reactions: {
      nummer: 99999,
      tijd: new Date().toISOString(),
      naam: 'Test User',
      tekst: 'Test reactie',
    },
  };

  const createdDocIds: Array<{ collection: string; id: string }> = [];

  try {
    // Test each collection: create, read, verify, delete
    for (const [collectionName, data] of Object.entries(verificationDocuments)) {
      try {
        // Create test document
        const docRef = await db.collection(collectionName).add(data);
        createdDocIds.push({ collection: collectionName, id: docRef.id });

        // Read back the document
        const readDoc = await docRef.get();

        if (!readDoc.exists) {
          results[collectionName] = { status: 'FAIL', error: 'Document created but not readable' };
          continue;
        }

        const readData = readDoc.data();
        if (!readData) {
          results[collectionName] = { status: 'FAIL', error: 'Document data is null' };
          continue;
        }

        // Verify all fields are present and correctly typed
        const missingFields: string[] = [];
        const wrongTypes: string[] = [];

        for (const [field, expectedValue] of Object.entries(data)) {
          if (readData[field] === undefined) {
            missingFields.push(field);
          } else if (typeof readData[field] !== typeof expectedValue) {
            wrongTypes.push(`${field}: expected ${typeof expectedValue}, got ${typeof readData[field]}`);
          }
        }

        if (missingFields.length > 0) {
          results[collectionName] = {
            status: 'FAIL',
            fields: Object.keys(readData),
            error: `Missing fields: ${missingFields.join(', ')}`,
          };
        } else if (wrongTypes.length > 0) {
          results[collectionName] = {
            status: 'WARN',
            fields: Object.keys(readData),
            error: `Type mismatches: ${wrongTypes.join('; ')}`,
          };
        } else {
          results[collectionName] = {
            status: 'PASS',
            fields: Object.keys(readData),
          };
        }

        // Delete test document
        await docRef.delete();
      } catch (error) {
        results[collectionName] = {
          status: 'FAIL',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    const totalCollections = Object.keys(verificationDocuments).length;
    const passingCollections = Object.values(results).filter(r => r.status === 'PASS').length;
    const allPass = passingCollections === totalCollections;

    return NextResponse.json({
      status: allPass ? 'ALL_PASS' : 'SOME_FAILURES',
      summary: `${passingCollections}/${totalCollections} collections verified`,
      collections: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Clean up any created documents on error
    for (const { collection, id } of createdDocIds) {
      try {
        await db.collection(collection).doc(id).delete();
      } catch {
        // Ignore cleanup errors
      }
    }

    return NextResponse.json(
      {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
        partialResults: results,
      },
      { status: 500 }
    );
  }
}
