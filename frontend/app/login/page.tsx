"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const sendOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/otp/send`, {
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
    } catch (err) {
      setMessage('Error connecting to server.');
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/otp/verify`, {
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
        await signInWithCustomToken(auth, data.token);
        setMessage('Verification successful! Redirecting...');
        // Handle actual login/redirect here
        setTimeout(() => router.push('/'), 1000);
      } else {
        setMessage(data.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setMessage('Error connecting to server.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">S</div>
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Sign in to your SmartCV account.</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm font-semibold text-center ${message.includes('success') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium" 
                  placeholder="name@company.com" 
                />
              </div>
              <button 
                onClick={sendOTP}
                disabled={loading}
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2 text-center">
                <p className="text-sm text-gray-500 mb-6">Enter the 6-digit code sent to <br/><b className="text-gray-900">{email}</b></p>
                <div className="flex justify-center gap-2">
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-center text-2xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-primary/20 outline-none" 
                    placeholder="000000"
                  />
                </div>
              </div>
              <button 
                onClick={verifyOTP}
                disabled={loading}
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Log In'}
              </button>
              <button onClick={() => setStep(1)} className="w-full text-xs font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest">Change Email</button>
            </div>
          )}
        </div>

        <p className="text-center text-sm font-medium text-gray-500 pt-4">
          Don't have an account? <Link href="/signup" className="text-primary font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
