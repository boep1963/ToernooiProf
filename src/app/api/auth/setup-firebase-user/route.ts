import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

/**
 * Development-only endpoint to create a Firebase Auth user for testing.
 * Creates or updates a Firebase Auth user with the given email and password.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    let user;
    try {
      // Try to get existing user first
      console.log('[SETUP] Checking if user exists:', email);
      user = await adminAuth.getUserByEmail(email);
      console.log('[SETUP] User found, updating password:', user.uid);
      // Update password if user exists
      user = await adminAuth.updateUser(user.uid, { password });
      console.log(`[SETUP] Updated existing Firebase Auth user: ${email} (${user.uid})`);
    } catch (innerErr: unknown) {
      const innerMsg = (innerErr as Error).message || String(innerErr);
      console.log('[SETUP] getUserByEmail error (expected if new user):', innerMsg);
      // User doesn't exist, create a new one
      console.log('[SETUP] Creating new user:', email);
      user = await adminAuth.createUser({
        email,
        password,
        emailVerified: true,
      });
      console.log(`[SETUP] Created new Firebase Auth user: ${email} (${user.uid})`);
    }

    return NextResponse.json({
      success: true,
      uid: user.uid,
      email: user.email,
      message: `Firebase Auth user ready: ${email}`,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('[SETUP] Error creating Firebase Auth user:', errMsg, error);
    return NextResponse.json(
      { error: `Failed to create Firebase Auth user: ${errMsg}` },
      { status: 500 }
    );
  }
}
