"use client";
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function CandidateDashboard() {
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phone: '',
    jobRole: '',
    bio: ''
  });

  const fetchData = async (currentUser: any) => {
    try {
      // Fetch stats from resumes collection
      const q = query(collection(db, 'resumes'), where("userId", "==", currentUser.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setProfileData(snapshot.docs[0].data());
      }

      // Fetch basic user profile from users collection
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setEditFormData({
          fullName: data.fullName || '',
          phone: data.phone || '',
          jobRole: data.jobRole || '',
          bio: data.bio || ''
        });
      }
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchData(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = async () => {
    if (!user || !db) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...editFormData,
        updatedAt: new Date()
      });
      await fetchData(user);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-[1240px] mx-auto w-full flex flex-col min-h-full">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-foreground">Candidate Hub</h1>
          <p className="text-sm text-primary/70 font-medium font-outfit mt-1">Track your CV visibility and employer interactions</p>
          {userData && (
            <div className="mt-4 flex items-center gap-4 p-4 bg-card/40 border border-border/40 rounded-2xl w-fit">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl uppercase">
                {userData.fullName?.[0] || 'U'}
              </div>
              <div>
                <h2 className="font-bold text-lg">{userData.fullName}</h2>
                <p className="text-xs text-muted-foreground">{userData.jobRole || 'Professional'}</p>
                <p className="text-[10px] text-muted-foreground/60">{userData.phone}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="px-5 py-2.5 bg-card border border-border/60 text-foreground font-bold rounded-xl shadow-sm hover:bg-muted transition-all text-sm"
          >
            Edit Profile
          </button>
          <Link href="/builder" className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all text-sm">
            Update CV
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Stats */}
         <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-card/80 backdrop-blur-[16px] border border-border/60 p-6 rounded-[2rem] shadow-sm flex flex-col justify-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                     <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </div>
                  <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-1">Total CV Views</p>
                  <h2 className="text-4xl font-black text-foreground">{loading ? '-' : (profileData?.views || 0)}</h2>
               </div>
               <div className="bg-card/80 backdrop-blur-[16px] border border-border/60 p-6 rounded-[2rem] shadow-sm flex flex-col justify-center">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                     <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  </div>
                  <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-1">CV Downloads</p>
                  <h2 className="text-4xl font-black text-foreground">{loading ? '-' : (profileData?.downloads || 0)}</h2>
               </div>
               <div className="bg-card/80 backdrop-blur-[16px] border border-border/60 p-6 rounded-[2rem] shadow-sm flex flex-col justify-center">
                  <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                     <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                  </div>
                  <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-1">Search Appearances</p>
                  <h2 className="text-4xl font-black text-foreground">{loading ? '-' : (profileData?.searchAppearances || 0)}</h2>
               </div>
            </div>

            <div className="bg-card/80 backdrop-blur-[16px] border border-border/60 p-8 rounded-[2.5rem] shadow-sm min-h-[300px]">
               <h3 className="font-bold text-foreground mb-6">Recent Employer Activity</h3>
               <div className="space-y-4">
                 {loading ? (
                    <div className="text-muted-foreground text-sm font-medium animate-pulse">Loading activity log...</div>
                 ) : !profileData ? (
                    <div className="text-muted-foreground text-sm font-medium">No activity yet. Update and publish your CV in the builder to start getting noticed!</div>
                 ) : profileData.views === 0 ? (
                    <div className="text-muted-foreground text-sm font-medium">Your profile is live! Wait 24-48 hours for employers to start reviewing your CV.</div>
                 ) : (
                    <div className="text-emerald-600 text-sm font-bold">You have employer activity! Keep your profile updated to stay on top.</div>
                 )}
               </div>
            </div>
         </div>

         {/* Sidebar Stats */}
         <div className="space-y-6 flex flex-col">
            <div className="bg-primary p-8 rounded-[2.5rem] shadow-sm text-white flex-1 flex flex-col items-center justify-center text-center">
               <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
               </div>
               <h3 className="text-lg font-bold mb-2">Resume Status: {profileData ? 'Active' : 'Not Published'}</h3>
               <p className="text-sm text-white/70 leading-relaxed mb-6">
                 {profileData 
                   ? "Your SmartCV is fully verified and actively indexed in employer search results."
                   : "Your resume is currently drafting. Save your CV in the Builder to publish your profile."
                 }
               </p>
               <div className="flex flex-col gap-2 w-full">
                 <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-white/50">
                    <span>Profile Completeness</span>
                    <span className="text-white">{profileData ? '92%' : '10%'}</span>
                 </div>
                 <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                    <div className={`h-full bg-white rounded-full ${profileData ? 'w-[92%]' : 'w-[10%]'}`}></div>
                 </div>
               </div>
            </div>

            <div className="bg-card/80 backdrop-blur-[16px] border border-border/60 p-6 rounded-[2.5rem] shadow-sm">
               <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4">Video Resume Status</h3>
               {profileData?.videoUrl ? (
                 <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                       <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 pl-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </div>
                    <div>
                       <h4 className="font-bold text-emerald-900 text-sm">Attached</h4>
                       <p className="text-[10px] text-emerald-700">Recruiters are 4x more likely to shortlist.</p>
                    </div>
                 </div>
               ) : (
                 <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                    <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                       <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    </div>
                    <div>
                       <h4 className="font-bold text-orange-900 text-sm">Missing</h4>
                       <p className="text-[10px] text-orange-700">Add a Video URL in the Builder to stand out.</p>
                    </div>
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl p-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-foreground">Edit Your Profile</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
                  className="w-full p-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Job Role</label>
                  <input 
                    type="text" 
                    value={editFormData.jobRole}
                    onChange={(e) => setEditFormData({...editFormData, jobRole: e.target.value})}
                    className="w-full p-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone</label>
                  <input 
                    type="tel" 
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                    className="w-full p-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bio</label>
                <textarea 
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({...editFormData, bio: e.target.value})}
                  className="w-full p-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm h-24 resize-none"
                />
              </div>

              <button 
                onClick={handleUpdateProfile}
                disabled={loading}
                className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 mt-4"
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
