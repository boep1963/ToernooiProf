import { NextRequest, NextResponse } from 'next/server';
import { validateSuperAdmin } from '@/lib/admin';
import db from '@/lib/db';
import { isValidAdminCollection } from '@/lib/admin-collections';

/**
 * POST /api/admin/collections/[collection]/bulk-delete
 * Bulk delete documents from a Firestore collection
 *
 * Super admin only
 */
export async function POST(
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

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ids array is required' },
        { status: 400 }
      );
    }

    // Firestore batch delete (max 500 operations per batch)
    const batchSize = 500;
    let deletedCount = 0;

    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = db.batch();
      const batchIds = ids.slice(i, i + batchSize);

      for (const id of batchIds) {
        const docRef = db.collection(collection).doc(id);
        batch.delete(docRef);
      }

      await batch.commit();
      deletedCount += batchIds.length;
    }

    return NextResponse.json({
      success: true,
      deleted: deletedCount,
    });
  } catch (error) {
    console.error('[ADMIN] Error bulk deleting documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
