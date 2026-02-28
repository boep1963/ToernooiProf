import { NextRequest, NextResponse } from 'next/server';
import { validateSuperAdmin } from '@/lib/admin';
import db from '@/lib/db';
import { isValidAdminCollection } from '@/lib/admin-collections';

/**
 * GET /api/admin/collections/[collection]
 * Returns paginated list of documents from a specific Firestore collection.
 * Protected by super admin check.
 *
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Documents per page (default: 25, max: 100)
 * - search: Optional search term to filter documents
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  // Validate super admin access
  const authResult = await validateSuperAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult; // Return 401/403 error response
  }

  try {
    const { collection } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '25', 10), 100);
    const searchTerm = searchParams.get('search') || '';

    // Validate collection name
    if (!isValidAdminCollection(collection)) {
      return NextResponse.json(
        { error: 'Ongeldige collectie naam.' },
        { status: 400 }
      );
    }

    // Get collection reference
    const collectionRef = db.collection(collection);

    // First, get total count
    const totalSnapshot = await collectionRef.get();
    const total = totalSnapshot.size;

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get all documents (we'll filter/paginate in memory for simplicity)
    // For production with large datasets, consider using cursor-based pagination
    let allDocs = totalSnapshot.docs;

    // For email_queue, sort by created_at descending (most recent first)
    if (collection === 'email_queue') {
      allDocs = allDocs.sort((a, b) => {
        const aData = a.data();
        const bData = b.data();
        const aCreated = aData.created_at || '';
        const bCreated = bData.created_at || '';
        return bCreated.localeCompare(aCreated);
      });
    }

    // For contact_messages, sort by tijd descending (most recent first)
    if (collection === 'contact_messages') {
      allDocs = allDocs.sort((a, b) => {
        const aData = a.data();
        const bData = b.data();
        const aTime = aData.tijd || '';
        const bTime = bData.tijd || '';
        return bTime.localeCompare(aTime);
      });
    }

    // Apply search filter if provided
    let filteredDocs = allDocs;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredDocs = allDocs.filter((doc) => {
        const data = doc.data();
        // Search in document ID and all string fields
        if (doc.id.toLowerCase().includes(searchLower)) {
          return true;
        }
        return Object.values(data).some((value) => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchLower);
          }
          return false;
        });
      });
    }

    const filteredTotal = filteredDocs.length;
    const filteredPages = Math.ceil(filteredTotal / limit);

    // Paginate the filtered results
    const paginatedDocs = filteredDocs.slice(offset, offset + limit);

    // Map documents to a simplified structure
    const documents = paginatedDocs.map((doc) => {
      const data = doc.data() || {};

      // Auto-detect key fields to display in the list
      const keyFields: Record<string, any> = {};
      const priorityFields = ['name', 'naam', 'voornaam', 'achternaam', 'org_naam', 't_naam', 'comp_naam', 'email', 'org_wl_email', 'gebruiker_nr', 't_nummer', 'sp_nummer', 'sp_naam', 'gespeeld', 'to', 'subject', 'type', 'status', 'created_at', 'onderwerp', 'org_email', 'tijd'];

      // Include ID
      keyFields.id = doc.id;

      // Add priority fields if they exist
      priorityFields.forEach((field) => {
        if (data[field] !== undefined) {
          keyFields[field] = data[field];
        }
      });

      // If we don't have many fields yet, add a few more
      if (Object.keys(keyFields).length < 5) {
        const allFields = Object.keys(data);
        for (const field of allFields.slice(0, 6)) {
          if (!keyFields[field] && typeof data[field] !== 'object') {
            keyFields[field] = data[field];
          }
        }
      }

      return {
        id: doc.id,
        keyFields,
        allFieldsCount: Object.keys(data).length,
      };
    });

    return NextResponse.json({
      success: true,
      collection,
      documents,
      pagination: {
        page,
        limit,
        total: searchTerm ? filteredTotal : total,
        totalPages: searchTerm ? filteredPages : totalPages,
        hasNext: page < (searchTerm ? filteredPages : totalPages),
        hasPrev: page > 1,
      },
      searchTerm,
    });
  } catch (error) {
    console.error('[ADMIN] Error fetching collection documents:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen documenten.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/collections/[collection]
 * Creates a new document in the specified Firestore collection.
 * Protected by super admin check.
 *
 * Request body:
 * - data: Object with field name/value pairs
 * - docId: Optional custom document ID (if not provided, auto-generated)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  // Validate super admin access
  const authResult = await validateSuperAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult; // Return 401/403 error response
  }

  try {
    const { collection } = await params;

    // Validate collection name
    if (!isValidAdminCollection(collection)) {
      return NextResponse.json(
        { error: 'Ongeldige collectie naam.' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { data, docId } = body;

    // Validate data
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Document data is verplicht en moet een object zijn.' },
        { status: 400 }
      );
    }

    // Validate that data has at least one field
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'Document moet minimaal één veld bevatten.' },
        { status: 400 }
      );
    }

    // Get collection reference
    const collectionRef = db.collection(collection);

    // Create document
    let docRef;
    if (docId && typeof docId === 'string' && docId.trim()) {
      // Use custom document ID
      const customDocId = docId.trim();

      // Check if document already exists
      const existingDoc = await collectionRef.doc(customDocId).get();
      if (existingDoc.exists) {
        return NextResponse.json(
          { error: `Document met ID "${customDocId}" bestaat al.` },
          { status: 409 }
        );
      }

      docRef = collectionRef.doc(customDocId);
      await docRef.set(data);
    } else {
      // Auto-generate document ID
      docRef = await collectionRef.add(data);
    }

    console.log(`[ADMIN] Created document ${docRef.id} in collection ${collection}`);

    return NextResponse.json({
      success: true,
      message: 'Document succesvol aangemaakt.',
      docId: docRef.id,
      collection,
    });
  } catch (error: any) {
    console.error('[ADMIN] Error creating document:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij aanmaken document.' },
      { status: 500 }
    );
  }
}
