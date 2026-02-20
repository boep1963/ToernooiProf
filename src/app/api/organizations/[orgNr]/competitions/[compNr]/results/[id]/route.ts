import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateOrgAccess } from '@/lib/auth-helper';

interface RouteParams {
  params: Promise<{ orgNr: string; compNr: string; id: string }>;
}

/**
 * DELETE /api/organizations/:orgNr/competitions/:compNr/results/:id
 * Delete a specific result
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { orgNr, compNr, id } = await params;

    // Validate session and org access
    const authResult = validateOrgAccess(request, orgNr);
    if (authResult instanceof NextResponse) return authResult;
    const orgNummer = authResult.orgNummer;

    const compNumber = parseInt(compNr, 10);
    if (isNaN(compNumber)) {
      return NextResponse.json(
        { error: 'Ongeldige parameters' },
        { status: 400 }
      );
    }

    console.log(`[RESULTS DELETE] Deleting result ${id} from competition ${compNumber}`);

    // Get the result to verify it belongs to this organization/competition
    const resultDoc = await db.collection('results').doc(id).get();

    if (!resultDoc.exists) {
      return NextResponse.json(
        { error: 'Uitslag niet gevonden' },
        { status: 404 }
      );
    }

    const resultData = resultDoc.data();
    const resultOrgNr = Number(resultData?.org_nummer);
    const resultCompNr = Number(resultData?.comp_nr);

    // Verify ownership
    if (resultOrgNr !== orgNummer || resultCompNr !== compNumber) {
      return NextResponse.json(
        { error: 'Geen toegang tot deze uitslag' },
        { status: 403 }
      );
    }

    // Delete the result
    await resultDoc.ref.delete();

    console.log(`[RESULTS DELETE] Result ${id} deleted successfully`);

    return NextResponse.json({
      message: 'Uitslag succesvol verwijderd',
      id,
    });
  } catch (error) {
    console.error('[RESULTS DELETE] Error deleting result:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen uitslag', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
