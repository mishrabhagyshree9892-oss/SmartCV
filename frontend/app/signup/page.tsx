"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !jobRole) {
      setMessage('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      if (!auth || !db) {
        throw new Error('Firebase is not initialized.');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Save additional user info like jobRole to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        jobRole,
        role: 'user',
        createdAt: serverTimestamp(),
      });
      
      setMessage('Account created successfully! Redirecting...');
      setTimeout(() => router.push('/'), 1000);
      
    } catch (err: any) {
      console.error('Signup error:', err);
      setMessage(err.message || 'Error creating account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 space-y-8 animate-in fade-in zoom-in duration-500">
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

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Job Role/Profession</label>
            <input 
              type="text" 
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all" 
              placeholder="e.g., Software Engineer, Teacher, Chef" 
            />
          </div>
          
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
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all" 
              placeholder="Create a strong password" 
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account? <Link href="/login" className="text-primary font-bold">Log in</Link>
        </p>
      </div>
    </div>
  );
}
