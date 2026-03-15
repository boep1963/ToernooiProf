import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateSuperAdmin } from '@/lib/admin';

const TEST_COLLECTION = 'test_persistence';
const TEST_DOC_ID = 'restart_test_doc';

async function ensureAllowed(request: NextRequest): Promise<NextResponse | null> {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Endpoint niet beschikbaar in productie.' }, { status: 404 });
  }
  const adminAccess = await validateSuperAdmin(request);
  if (adminAccess instanceof NextResponse) return adminAccess;
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const accessError = await ensureAllowed(request);
    if (accessError) return accessError;

    // Try to read the test document
    const docRef = db.collection(TEST_COLLECTION).doc(TEST_DOC_ID);
    const doc = await docRef.get();

    if (doc.exists) {
      const data = doc.data();
      return NextResponse.json({
        status: 'FOUND',
        message: 'Test data exists - persistence verified',
        data: data,
        created: data?.timestamp,
      });
    } else {
      return NextResponse.json({
        status: 'NOT_FOUND',
        message: 'Test data does not exist yet',
      });
    }
  } catch (error) {
    console.error('[TEST-PERSISTENCE] Read failed:', error);
    return NextResponse.json(
      {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessError = await ensureAllowed(request);
    if (accessError) return accessError;

    const testData = {
      test_name: 'RESTART_TEST_12345',
      timestamp: new Date().toISOString(),
      purpose: 'Verify data persists across server restart',
    };

    // Create test document
    const docRef = db.collection(TEST_COLLECTION).doc(TEST_DOC_ID);
    await docRef.set(testData);

    console.log('[TEST-PERSISTENCE] Test data created:', testData);

    return NextResponse.json({
      status: 'CREATED',
      message: 'Test data created successfully',
      data: testData,
    });
  } catch (error) {
    console.error('[TEST-PERSISTENCE] Create failed:', error);
    return NextResponse.json(
      {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const accessError = await ensureAllowed(request);
    if (accessError) return accessError;

    // Delete test document
    const docRef = db.collection(TEST_COLLECTION).doc(TEST_DOC_ID);
    await docRef.delete();

    console.log('[TEST-PERSISTENCE] Test data deleted');

    return NextResponse.json({
      status: 'DELETED',
      message: 'Test data deleted successfully',
    });
  } catch (error) {
    console.error('[TEST-PERSISTENCE] Delete failed:', error);
    return NextResponse.json(
      {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
