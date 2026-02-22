import { NextRequest, NextResponse } from 'next/server';
import { validateSuperAdmin } from '@/lib/admin';
import db from '@/lib/db';

/**
 * GET /api/admin/collections/[collection]/[docId]
 * Returns a single document from a Firestore collection.
 * Protected by super admin check.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; docId: string }> }
) {
  // Validate super admin access
  const authResult = await validateSuperAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult; // Return 401/403 error response
  }

  try {
    const { collection, docId } = await params;

    // Validate collection name (whitelist approach for security)
    const validCollections = [
      'organizations',
      'members',
      'competitions',
      'competition_players',
      'matches',
      'results',
      'tables',
      'device_config',
      'scoreboards',
      'email_queue',
      'contact_messages',
    ];

    if (!validCollections.includes(collection)) {
      return NextResponse.json(
        { error: 'Ongeldige collectie naam.' },
        { status: 400 }
      );
    }

    // Get document
    const docRef = db.collection(collection).doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Document niet gevonden.' },
        { status: 404 }
      );
    }

    const data = doc.data();

    return NextResponse.json({
      success: true,
      document: {
        id: doc.id,
        data,
      },
    });
  } catch (error) {
    console.error('[ADMIN] Error fetching document:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen document.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/collections/[collection]/[docId]
 * Updates a document in a Firestore collection.
 * Protected by super admin check.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; docId: string }> }
) {
  // Validate super admin access
  const authResult = await validateSuperAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult; // Return 401/403 error response
  }

  try {
    const { collection, docId } = await params;
    const body = await request.json();

    // Validate collection name (whitelist approach for security)
    const validCollections = [
      'organizations',
      'members',
      'competitions',
      'competition_players',
      'matches',
      'results',
      'tables',
      'device_config',
      'scoreboards',
      'email_queue',
      'contact_messages',
    ];

    if (!validCollections.includes(collection)) {
      return NextResponse.json(
        { error: 'Ongeldige collectie naam.' },
        { status: 400 }
      );
    }

    if (!body.data || typeof body.data !== 'object') {
      return NextResponse.json(
        { error: 'Ongeldige data in verzoek.' },
        { status: 400 }
      );
    }

    // Get document reference
    const docRef = db.collection(collection).doc(docId);

    // Check if document exists
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Document niet gevonden.' },
        { status: 404 }
      );
    }

    // Update document
    await docRef.update(body.data);

    return NextResponse.json({
      success: true,
      message: 'Document succesvol bijgewerkt.',
    });
  } catch (error) {
    console.error('[ADMIN] Error updating document:', error);
    return NextResponse.json(
      { error: 'Fout bij bijwerken document.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/collections/[collection]/[docId]
 * Deletes a document from a Firestore collection.
 * Protected by super admin check.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; docId: string }> }
) {
  // Validate super admin access
  const authResult = await validateSuperAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult; // Return 401/403 error response
  }

  try {
    const { collection, docId } = await params;

    // Validate collection name (whitelist approach for security)
    const validCollections = [
      'organizations',
      'members',
      'competitions',
      'competition_players',
      'matches',
      'results',
      'tables',
      'device_config',
      'scoreboards',
      'email_queue',
      'contact_messages',
    ];

    if (!validCollections.includes(collection)) {
      return NextResponse.json(
        { error: 'Ongeldige collectie naam.' },
        { status: 400 }
      );
    }

    // Get document reference
    const docRef = db.collection(collection).doc(docId);

    // Check if document exists
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Document niet gevonden.' },
        { status: 404 }
      );
    }

    // Delete document
    await docRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Document succesvol verwijderd.',
    });
  } catch (error) {
    console.error('[ADMIN] Error deleting document:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen document.' },
      { status: 500 }
    );
  }
}
