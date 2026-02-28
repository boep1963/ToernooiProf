import { NextRequest, NextResponse } from 'next/server';
import { validateSuperAdmin } from '@/lib/admin';
import db from '@/lib/db';
import { isValidAdminCollection } from '@/lib/admin-collections';

/**
 * POST /api/admin/collections/[collection]/import
 * Import documents from JSON file into a Firestore collection
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

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file contents
    const fileText = await file.text();
    let importData;

    try {
      importData = JSON.parse(fileText);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON file' },
        { status: 400 }
      );
    }

    // Extract documents array
    let documents;
    if (Array.isArray(importData)) {
      // Direct array of documents
      documents = importData;
    } else if (importData.documents && Array.isArray(importData.documents)) {
      // Export format with metadata
      documents = importData.documents;
    } else {
      return NextResponse.json(
        { error: 'Invalid format: expected array of documents or object with "documents" array' },
        { status: 400 }
      );
    }

    // Validate documents
    for (const doc of documents) {
      if (!doc.id) {
        return NextResponse.json(
          { error: 'All documents must have an "id" field' },
          { status: 400 }
        );
      }
    }

    // Import documents using batch writes (max 500 per batch)
    const batchSize = 500;
    let importedCount = 0;

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = documents.slice(i, i + batchSize);

      for (const doc of batchDocs) {
        const { id, ...data } = doc;
        const docRef = db.collection(collection).doc(id);
        batch.set(docRef, data, { merge: true }); // merge: true allows updating existing docs
      }

      await batch.commit();
      importedCount += batchDocs.length;
    }

    return NextResponse.json({
      success: true,
      imported: importedCount,
    });
  } catch (error) {
    console.error('[ADMIN] Error importing documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
