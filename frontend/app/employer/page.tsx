"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, increment } from 'firebase/firestore';

export default function EmployerPortal() {
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
     const fetchCandidates = async () => {
        try {
           const snapshot = await getDocs(collection(db, 'resumes'));
           const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
           setCandidates(loaded);
        } catch (e) {
           console.error("Failed to fetch candidates:", e);
        } finally {
           setLoading(false);
        }
     };
     fetchCandidates();
  }, []);

  const handleShortlist = async (id: string, currentShortlists: number = 0) => {
      // Demo logic for tracking shortlists.
      alert('Candidate shortlisted! (demo)');
  };

  const activeCandidates = verifiedOnly ? candidates.filter(c => c.verified) : candidates;
  const avgScore = candidates.length > 0 ? Math.round(candidates.reduce((acc, c) => acc + (c.score || 0), 0) / candidates.length) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-[1240px] mx-auto w-full flex flex-col min-h-full">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Employer Portal</h1>
          <p className="text-sm text-primary/70 font-medium font-outfit">Verified candidate analytics with blockchain credentials</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border/80 rounded-xl text-xs font-bold text-foreground hover:bg-gray-50 transition-all shadow-sm">
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"></path><polyline points="7 11 12 16 17 11"></polyline><line x1="12" y1="4" x2="12" y2="16"></line></svg>
          Export
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-5">
        
        {/* Recruiter Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
           <div className="bg-white border border-border/60 p-5 rounded-2xl shadow-sm">
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-1">Total Candidates</p>
              <h2 className="text-3xl font-black text-foreground">{loading ? '-' : candidates.length}</h2>
           </div>
           <div className="bg-white border border-border/60 p-5 rounded-2xl shadow-sm">
              <p className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase mb-1">Verified Profiles</p>
              <h2 className="text-3xl font-black text-emerald-700">{loading ? '-' : candidates.filter(c => c.verified).length}</h2>
           </div>
           <div className="bg-white border border-border/60 p-5 rounded-2xl shadow-sm">
              <p className="text-[10px] font-bold tracking-widest text-blue-600 uppercase mb-1">Your Shortlist</p>
              <h2 className="text-3xl font-black text-blue-700">0</h2>
           </div>
           <div className="bg-white border border-border/60 p-5 rounded-2xl shadow-sm">
              <p className="text-[10px] font-bold tracking-widest text-purple-600 uppercase mb-1">Avg ATS Score</p>
              <h2 className="text-3xl font-black text-purple-700">{loading ? '-' : `${avgScore}%`}</h2>
           </div>
        </div>

        {/* AI Job Portal Integration: Auto-Suggest Ribbon */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-2xl p-4 text-white shadow-xl shadow-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden group">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
           <div className="relative z-10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">🤖</div>
              <div>
                 <h4 className="font-black text-sm uppercase tracking-wider">AI Job Portal Auto-Match</h4>
                 <p className="text-xs text-white/90">Based on your open <strong>Senior React Dev</strong> role, <strong className="text-white">David Chen</strong> is a 96% fit.</p>
              </div>
           </div>
           <button className="relative z-10 whitespace-nowrap px-5 py-2.5 bg-white text-indigo-700 font-bold text-xs rounded-xl shadow-sm hover:scale-105 transition-transform flex items-center gap-2">
              Auto-Invite to Interview
              <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
           </button>
        </div>

        {/* Search Bar Card */}
        <div className="bg-card/80 backdrop-blur-[16px] border border-border/60 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="flex-1 relative group">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Search candidates..."
              className="w-full bg-background/40 border border-border/40 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary/10 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all font-medium"
            />
          </div>

          <div className="relative">
             <select className="appearance-none bg-background/40 border border-border/40 rounded-xl px-5 py-3 pr-10 outline-none focus:ring-2 focus:ring-primary/10 text-sm text-foreground font-medium cursor-pointer min-w-[160px]">
                <option>All Tests</option>
                <option>Frontend Dev</option>
                <option>Backend Dev</option>
                <option>Fullstack</option>
             </select>
             <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-background/40 border border-border/40 rounded-xl">
             <span className="text-xs font-bold text-muted-foreground/60 whitespace-nowrap">Verified Only</span>
             <button 
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`w-10 h-6 rounded-full relative transition-all ${verifiedOnly ? 'bg-primary' : 'bg-muted-foreground/20'}`}
             >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${verifiedOnly ? 'left-5' : 'left-1'}`} />
             </button>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-card/80 backdrop-blur-[16px] border border-border/60 p-6 rounded-[2.5rem] shadow-sm flex-1 flex flex-col min-h-[450px]">
           {loading ? (
             <div className="flex-1 flex items-center justify-center text-muted-foreground font-bold animate-pulse">
                Loading live candidates from Firebase...
             </div>
           ) : activeCandidates.length === 0 ? (
             <div className="flex-1 flex items-center justify-center text-muted-foreground font-medium">
                No published candidates found match the criteria.
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {activeCandidates.map((candidate, i) => (
                 <div key={i} className="bg-white border border-border/40 p-5 rounded-3xl shadow-sm hover:shadow-lg transition-all flex flex-col gap-4">
                   <div className="flex justify-between items-start">
                     <div>
                       <h3 className="font-bold text-foreground text-lg">{candidate.fullName}</h3>
                       <p className="text-primary font-bold text-xs">{candidate.role}</p>
                     </div>
                     <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                       <span>{candidate.score || 0}% Match</span>
                     </div>
                   </div>
                   
                   <div className="space-y-2 text-xs font-medium text-muted-foreground flex-1">
                     {candidate.email && (
                       <div className="flex items-center gap-2">
                         <span className="opacity-50">📧</span>
                         <a href={`mailto:${candidate.email}`} className="hover:text-primary transition-colors text-zinc-600">{candidate.privacy?.hideEmail ? '(Hidden by privacy filter)' : candidate.email}</a>
                       </div>
                     )}
                     {candidate.github && (
                       <div className="flex items-center gap-2">
                         <span className="opacity-50">⌨</span>
                         <a href={candidate.github.startsWith('http') ? candidate.github : `https://${candidate.github}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-zinc-600">{candidate.github}</a>
                       </div>
                     )}
                     {candidate.link && (
                       <div className="flex items-center gap-2">
                         <span className="opacity-50">🔗</span>
                         <a href={candidate.link.startsWith('http') ? candidate.link : `https://${candidate.link}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-zinc-600">{candidate.link.replace('https://', '')}</a>
                       </div>
                     )}
                   </div>

                   <div className="flex flex-wrap gap-1.5">
                     {candidate.skills?.slice(0, 5).map((s: string) => (
                       <span key={s} className="px-2 py-1 bg-zinc-100 text-[9px] font-bold text-zinc-600 rounded-md truncate max-w-[100px]">{s}</span>
                     ))}
                     {candidate.skills && candidate.skills.length > 5 && (
                        <span className="px-2 py-1 bg-zinc-100 text-[9px] font-bold text-zinc-400 rounded-md">+{candidate.skills.length - 5}</span>
                     )}
                   </div>
                   
                   <div className="flex justify-between items-center pt-4 border-t border-border/40 mt-auto">
                     <div className="flex flex-col gap-1">
                       {candidate.verified ? (
                         <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest" title="DigiLocker Verified"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"/> Verified Docs</span>
                       ) : (
                         <span className="flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full"/> Pending ID</span>
                       )}
                       {candidate.hash && (
                         <span className="flex items-center gap-1.5 text-[8px] font-mono font-bold text-zinc-400" title="Blockchain Resume Hash">🔗 {candidate.hash.substring(0, 10)}...</span>
                       )}
                     </div>
                     <div className="flex items-center gap-2">
                       {candidate.videoUrl && (
                          <a href={candidate.videoUrl.startsWith('http') ? candidate.videoUrl : `https://${candidate.videoUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full hover:bg-emerald-200 transition-colors" title="Watch Video Resume">
                            ▶
                          </a>
                       )}
                       <button onClick={() => handleShortlist(candidate.id)} className="text-[10px] font-bold text-primary hover:underline px-3 py-1.5 bg-primary/10 rounded-full">★ Shortlist</button>
                       <button className="text-[10px] font-bold bg-zinc-900 text-white px-3 py-1.5 rounded-full hover:bg-zinc-800 transition-colors">View CV</button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>

        <footer className="mt-8 flex justify-between items-center text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest pl-2 pr-2">
         <div className="flex items-center gap-6 overflow-x-auto pb-2 sm:pb-0">
            {[
              "Resume Generator",
              "JD Analyzer",
              "Interview Coach",
              "Skill Gap Analyzer",
              "Test Assessment"
            ].map(link => (
              <div key={link} className="flex items-center gap-1.5 flex-shrink-0">
                <div className={`w-1 h-1 rounded-full ${link === 'Employer Portal' ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
                <span className={`whitespace-nowrap ${link === 'Employer Portal' ? 'text-primary' : 'hover:text-primary transition-colors cursor-pointer'}`}>{link}</span>
              </div>
            ))}
         </div>
         <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-emerald-500/40" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            <span>5 agents connected</span>
         </div>
      </footer>
      </div>
    </div>
  );
}
