import { NextRequest, NextResponse } from 'next/server';
import { validateSuperAdmin } from '@/lib/admin';
import db from '@/lib/db';

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
      'news',
    ];

    if (!validCollections.includes(collection)) {
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
    const allDocs = totalSnapshot.docs;

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
      const data = doc.data();

      // Auto-detect key fields to display in the list
      const keyFields: Record<string, any> = {};
      const priorityFields = ['name', 'naam', 'voornaam', 'achternaam', 'org_naam', 'comp_naam', 'email', 'org_wl_email'];

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
