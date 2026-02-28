import { NextRequest, NextResponse } from 'next/server';
import { validateSuperAdmin } from '@/lib/admin';
import db from '@/lib/db';
import { isValidAdminCollection } from '@/lib/admin-collections';

/**
 * GET /api/admin/collections/[collection]/export
 * Export all documents from a Firestore collection as JSON
 *
 * Super admin only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    // Validate super admin access
    const validation = await validateSuperAdmin(request);
    if (validation instanceof NextResponse) {
      return validation;
    }

    const { collection } = await params;

    if (!isValidAdminCollection(collection)) {
      return NextResponse.json(
        { error: 'Ongeldige collectie naam.' },
        { status: 400 }
      );
    }

    // Fetch all documents from the collection
    const snapshot = await db.collection(collection).get();

    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Create JSON export
    const exportData = {
      collection,
      exportDate: new Date().toISOString(),
      count: documents.length,
      documents,
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    // Return as downloadable JSON file
    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${collection}-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('[ADMIN] Error exporting collection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
