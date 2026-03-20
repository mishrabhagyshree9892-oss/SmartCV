"use client";
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    const unsubscribe = onAuthStateChanged(auth!, async (currentUser) => {
      if (currentUser && db) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setUser({ ...currentUser, ...userDoc.data() });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          WELCOME BACK, {user?.fullName?.toUpperCase() || 'PIONEER'}
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
          Build a Resume that <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
            Defines Your Future.
          </span>
        </h1>
        
        <p className="text-muted-foreground text-lg font-medium max-w-lg mx-auto leading-relaxed">
          Your career intelligence dashboard is ready. Continue building your blockchain-verified professional identity.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link href="/builder" className="px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20">
            Start Building Free
          </Link>
          <Link href="/" className="px-8 py-4 bg-secondary text-foreground font-bold rounded-2xl border border-border hover:bg-muted transition-all">
            View Analytics
          </Link>
        </div>
      </div>

      {/* Profile Preview Card */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-card/40 backdrop-blur-md border border-border rounded-[32px] p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border border-primary/20">
              {user?.fullName?.[0] || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold">{user?.fullName || 'User'}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pb-4">
             <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Resume Theme</p>
                <p className="text-sm font-bold">Modern Professional</p>
             </div>
             <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Integrity Score</p>
                <p className="text-sm font-bold text-primary">98.5%</p>
             </div>
          </div>

          <div className="h-48 w-full bg-muted/20 rounded-2xl border border-dashed border-border flex items-center justify-center relative group overflow-hidden">
             <div className="text-center space-y-2 group-hover:scale-110 transition-transform duration-500">
                <span className="text-3xl opacity-20 group-hover:opacity-100 transition-opacity">📄</span>
                <p className="text-xs font-bold text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">CV Preview Loading...</p>
             </div>
             <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-[32px] p-8 flex flex-col justify-between">
           <div className="space-y-4">
              <h4 className="font-bold text-primary text-sm uppercase tracking-widest">Next Step</h4>
              <p className="text-lg font-bold leading-tight">Your JD analysis for "Senior Software Engineer" is pending.</p>
           </div>
           
           <Link href="/analyzer" className="mt-8 flex items-center justify-between group">
              <span className="font-bold text-sm">Review Now</span>
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
           </Link>
        </div>
      </div>
    </div>
  );
}
