import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

function getFirebaseAdmin() {
  if (admin.apps.length > 0) return admin.apps[0]!;

  let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
  // Strip surrounding quotes
  privateKey = privateKey.replace(/^[\"']|[\"']$/g, '');
  // Handle both \\n and \n (Vercel can double-escape)
  privateKey = privateKey.replace(/\\n/g, '\n');

  if (!privateKey || !process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error(
      `Firebase env vars missing: PROJECT_ID=${!!process.env.FIREBASE_PROJECT_ID}, CLIENT_EMAIL=${!!process.env.FIREBASE_CLIENT_EMAIL}, PRIVATE_KEY=${privateKey.length > 0}`
    );
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();

  // Initialize Firebase separately so errors are descriptive
  try {
    getFirebaseAdmin();
  } catch (initError: any) {
    console.error('Firebase Admin init failed:', initError.message);
    return NextResponse.json({ error: `Server config error: ${initError.message}` }, { status: 500 });
  }

  try {
    const db = admin.firestore();
    const otpDoc = await db.collection('otps').doc(email).get();

    if (!otpDoc.exists) {
      return NextResponse.json({ error: 'OTP not found. Please request a new one.' }, { status: 400 });
    }

    const data = otpDoc.data()!;
    const now = admin.firestore.Timestamp.now();

    if (data.expiresAt.toMillis() < now.toMillis()) {
      await db.collection('otps').doc(email).delete();
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    if (data.otp === otp) {
      await db.collection('otps').doc(email).delete();
      const customToken = await admin.auth().createCustomToken(email);
      return NextResponse.json({ message: 'OTP verified successfully', token: customToken });
    } else {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('OTP Verify error:', error.message);
    console.error('Stack:', error.stack);
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}
