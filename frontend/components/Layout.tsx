"use client";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth pages should never show Sidebar/Header
  const isAuthPage = pathname === '/signup' || pathname === '/login';

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If it's an auth page, show clean layout without Sidebar/Header.
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background text-foreground" style={{ 
        background: 'linear-gradient(135deg, rgb(234, 246, 242) 0%, rgb(231, 243, 243) 30%, rgb(238, 247, 244) 60%, rgb(234, 246, 238) 100%)' 
      }}>
        {children}
      </div>
    );
  }

  // Dashboard / Authenticated Layout
  if (user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex overflow-hidden" style={{ 
        background: 'linear-gradient(135deg, rgb(234, 246, 242) 0%, rgb(231, 243, 243) 30%, rgb(238, 247, 244) 60%, rgb(234, 246, 238) 100%)' 
      }}>
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col min-h-screen relative h-screen overflow-hidden">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto w-full overflow-y-auto custom-scrollbar h-full">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Fallback for Landing / Not logged in (no sidebar/header)
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ 
      background: 'linear-gradient(135deg, rgb(234, 246, 242) 0%, rgb(231, 243, 243) 30%, rgb(238, 247, 244) 60%, rgb(234, 246, 238) 100%)' 
    }}>
      {children}
    </div>
  );
}
