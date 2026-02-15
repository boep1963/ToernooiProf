import { NextRequest, NextResponse } from 'next/server';
import { validateSuperAdmin } from '@/lib/admin';
import db from '@/lib/db';

/**
 * GET /api/admin/collections/[collection]/stats
 * Get statistics for a Firestore collection
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

    // Fetch all documents from the collection
    const snapshot = await db.collection(collection).get();

    // Calculate statistics
    const totalDocuments = snapshot.size;

    // Estimate storage size based on JSON serialization
    let estimatedBytes = 0;
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const jsonString = JSON.stringify({ id: doc.id, ...data });
      estimatedBytes += new Blob([jsonString]).size;
    });

    // Convert to human-readable format
    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    return NextResponse.json({
      success: true,
      collection,
      stats: {
        totalDocuments,
        estimatedSize: formatBytes(estimatedBytes),
        estimatedBytes,
      },
    });
  } catch (error) {
    console.error('[ADMIN] Error fetching collection stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
