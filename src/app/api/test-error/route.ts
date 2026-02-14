import { NextResponse } from 'next/server';

/**
 * GET /api/test-error
 * Test endpoint that intentionally throws a 500 error
 * Used to verify error handling displays user-friendly messages
 */
export async function GET() {
  try {
    // Intentionally throw an error to test error handling
    throw new Error('Intentional test error with technical stack trace details');
  } catch (error) {
    console.error('[TEST-ERROR] Intentional error for testing:', error);
    return NextResponse.json(
      { error: 'Er is een serverfout opgetreden. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }
}
