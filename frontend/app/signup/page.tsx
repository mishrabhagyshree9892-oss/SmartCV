"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const sendOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setStep(2);
        setMessage('OTP sent to your email!');
      } else {
        setMessage('Failed to send OTP. Try again.');
      }
    } catch (err: any) {
      console.error('Verify error:', err);
      if (err.code === 'auth/configuration-not-found') {
        setMessage('Firebase Auth not enabled. Click "Get Started" in Authentication Console.');
      } else {
        setMessage(err.message || 'Error connecting to server.');
      }
    }
    setLoading(false);
  };

  const router = useRouter();

  const verifyOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        if (!auth) {
          setMessage('Firebase not initialized. Check your environment variables.');
          setLoading(false);
          return;
        }
        await signInWithCustomToken(auth!, data.token);
        setMessage('Verification successful! Redirecting...');
        setTimeout(() => router.push('/'), 1000);
      } else {
        setMessage(data.error || 'Invalid OTP. Please try again.');
      }
    } catch (err: any) {
      console.error('Verify error:', err);
      // Show more descriptive error for Firebase configuration issues
      if (err.code === 'auth/configuration-not-found') {
        setMessage('Firebase Auth not enabled in Console. Please click "Get Started" in Authentication tab.');
      } else {
        setMessage(err.message || 'Error connecting to server.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 space-y-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">S</div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Create Account</h1>
        <p className="text-gray-500 text-sm mb-6 font-medium tracking-tight">Join SmartCV to land your dream job.</p>

        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all" 
                  placeholder="name@company.com" 
                />
              </div>
              <button 
                onClick={sendOTP}
                disabled={loading}
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2 text-center">
                <p className="text-sm text-gray-600 mb-4">We sent a 6-digit code to <b>{email}</b></p>
                <div className="flex justify-center gap-2">
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-center text-2xl font-bold tracking-[1em] focus:ring-2 focus:ring-primary outline-none" 
                  />
                </div>
              </div>
              <button 
                onClick={verifyOTP}
                disabled={loading}
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
              <button onClick={() => setStep(1)} className="w-full text-sm text-gray-500 hover:text-primary transition-colors">Change Email</button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500">
          Already have an account? <Link href="/login" className="text-primary font-bold">Log in</Link>
        </p>
      </div>
    </div>
  );
}
