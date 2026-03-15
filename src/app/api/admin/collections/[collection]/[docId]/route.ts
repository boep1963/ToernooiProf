import { NextRequest, NextResponse } from 'next/server';
import { validateSuperAdmin } from '@/lib/admin';
import db from '@/lib/db';
import { isValidAdminCollection } from '@/lib/admin-collections';
import { sanitizeAdminDocumentUpdate } from '@/lib/adminUpdatePolicy';
import { logMutationAudit } from '@/lib/mutationAudit';

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

    if (!isValidAdminCollection(collection)) {
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

    if (!isValidAdminCollection(collection)) {
      return NextResponse.json(
        { error: 'Ongeldige collectie naam.' },
        { status: 400 }
      );
    }

    if (!body.data || typeof body.data !== 'object' || Array.isArray(body.data)) {
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

    const currentData = (doc.data() ?? {}) as Record<string, unknown>;
    const sanitized = sanitizeAdminDocumentUpdate(currentData, body.data);
    if (!sanitized.ok) {
      return NextResponse.json({ error: sanitized.error }, { status: 400 });
    }

    // Update document with sanitized data only
    await docRef.update(sanitized.data);

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

  const actorOrgNummer = authResult.orgNummer;
  let collectionName = 'unknown';
  let resourceId = 'unknown';

  try {
    const { collection, docId } = await params;
    collectionName = collection;
    resourceId = docId;

    if (!isValidAdminCollection(collection)) {
      logMutationAudit({
        action: 'admin_delete_document',
        orgNummer: actorOrgNummer,
        resourceType: collection,
        resourceId: docId,
        success: false,
        actor: `super_admin_org_${actorOrgNummer}`,
        details: { reason: 'invalid_collection' },
      });
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
      logMutationAudit({
        action: 'admin_delete_document',
        orgNummer: actorOrgNummer,
        resourceType: collection,
        resourceId: docId,
        success: false,
        actor: `super_admin_org_${actorOrgNummer}`,
        details: { reason: 'not_found' },
      });
      return NextResponse.json(
        { error: 'Document niet gevonden.' },
        { status: 404 }
      );
    }

    // Delete document
    await docRef.delete();
    logMutationAudit({
      action: 'admin_delete_document',
      orgNummer: actorOrgNummer,
      resourceType: collection,
      resourceId: docId,
      success: true,
      actor: `super_admin_org_${actorOrgNummer}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Document succesvol verwijderd.',
    });
  } catch (error) {
    logMutationAudit({
      action: 'admin_delete_document',
      orgNummer: actorOrgNummer,
      resourceType: collectionName,
      resourceId,
      success: false,
      actor: `super_admin_org_${actorOrgNummer}`,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    console.error('[ADMIN] Error deleting document:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen document.' },
      { status: 500 }
    );
  }
}
