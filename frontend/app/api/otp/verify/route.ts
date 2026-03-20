import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

function getFirebaseAdmin() {
  if (admin.apps.length > 0) return admin.apps[0]!;

  let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
  privateKey = privateKey.replace(/^["']|["']$/g, '');
  privateKey = privateKey.replace(/\\n/g, '\n');

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

  try {
    getFirebaseAdmin();
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
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}
