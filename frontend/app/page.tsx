"use client";
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Landing from '@/components/Landing';
import ProfileSetup from '@/components/ProfileSetup';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth!, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && db) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setHasProfile(userDoc.exists() && userDoc.data()?.profileCompleted);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const stats = [
    { label: "Resumes Built", value: "0", icon: "📄", color: "text-green-600" },
    { label: "Interviews Done", value: "0", icon: "🎙️", color: "text-blue-600" },
    { label: "Tests Taken", value: "0", icon: "✔️", color: "text-purple-600" },
    { label: "Skill Score", value: "0", icon: "📈", color: "text-orange-600" },
    { label: "Verified Resumes", value: "0", icon: "🛡️", color: "text-teal-600" },
    { label: "Proctored Tests", value: "0", icon: "👁️", color: "text-indigo-600" },
    { label: "Chain Verifications", value: "0", icon: "🔗", color: "text-pink-600" },
    { label: "Avg Integrity", value: "0%", icon: "🔒", color: "text-yellow-600" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  if (!hasProfile) {
    return <ProfileSetup onComplete={() => setHasProfile(true)} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-[1200px] mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Enterprise Dashboard</h1>
        <p className="text-muted-foreground font-medium text-sm">Blockchain-verified career intelligence platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card/80 backdrop-blur-[12px] p-5 rounded-2xl border border-border/60 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <div className="space-y-3">
               <div className="flex items-center gap-2">
                  <span className={`text-base ${stat.color}`}>{stat.icon}</span>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
               </div>
               <h3 className="text-xl font-bold text-foreground">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-4">
        <div className="lg:col-span-2 bg-card/80 backdrop-blur-[12px] p-8 rounded-3xl border border-border/60 flex flex-col items-center justify-center min-h-[350px]">
           <div className="flex items-center gap-2 self-start mb-auto">
              <span className="text-primary text-sm">🕒</span>
              <h3 className="font-bold text-foreground text-sm">Recent Activity</h3>
           </div>
           
           <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center text-2xl mx-auto text-muted-foreground/40">🕘</div>
              <h4 className="font-bold text-muted-foreground text-sm">No activity yet</h4>
              <p className="text-[10px] text-muted-foreground/60">Start using SmartCV to see your activity here</p>
           </div>
           
           <div className="mt-auto invisible text-[10px]">spacer</div>
        </div>

        <div className="bg-card/80 backdrop-blur-[12px] p-8 rounded-3xl border border-border/60 space-y-6">
           <div className="flex items-center gap-2">
              <span className="text-primary text-sm">🏆</span>
              <h3 className="font-bold text-foreground text-sm">Enterprise Badges</h3>
           </div>
           
           <div className="space-y-5">
              {[
                "Blockchain Pioneer",
                "Integrity Champion", 
                "Verified Professional",
                "Resume Pro"
              ].map(badge => (
                <div key={badge} className="flex items-center gap-3 group">
                   <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center text-muted-foreground/40 group-hover:bg-primary/10 group-hover:text-primary transition-all text-sm">🛡️</div>
                   <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-all">{badge}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
