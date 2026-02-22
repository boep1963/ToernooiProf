import { NextResponse } from 'next/server';
import db from '@/lib/db';

const TEST_COLLECTION = 'test_persistence';
const TEST_DOC_ID = 'restart_test_doc';
const TEST_DATA = {
  test_name: 'RESTART_TEST_12345',
  timestamp: new Date().toISOString(),
  purpose: 'Verify data persists across server restart',
};

export async function GET() {
  try {
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

export async function POST() {
  try {
    // Create test document
    const docRef = db.collection(TEST_COLLECTION).doc(TEST_DOC_ID);
    await docRef.set(TEST_DATA);

    console.log('[TEST-PERSISTENCE] Test data created:', TEST_DATA);

    return NextResponse.json({
      status: 'CREATED',
      message: 'Test data created successfully',
      data: TEST_DATA,
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

export async function DELETE() {
  try {
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
