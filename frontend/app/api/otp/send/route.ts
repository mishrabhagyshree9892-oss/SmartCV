import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
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
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

  try {
    getFirebaseAdmin();
    const db = admin.firestore();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 600000));

    await db.collection('otps').doc(email).set({
      otp,
      expiresAt,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🔐 SmartCV Verification Code',
      text: `Welcome to SmartCV!\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nBest regards,\nThe SmartCV Team`,
    });

    return NextResponse.json({ message: 'OTP sent to email' });
  } catch (error: any) {
    console.error('OTP Send error:', error.message);
    return NextResponse.json({ error: `Failed to send OTP: ${error.message}` }, { status: 500 });
  }
}
