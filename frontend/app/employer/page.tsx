"use client";
import { useState } from 'react';

export default function EmployerPortal() {
  const [verifiedOnly, setVerifiedOnly] = useState(false);

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
        <div className="bg-card/80 backdrop-blur-[16px] border border-border/60 p-12 rounded-[2.5rem] shadow-sm flex-1 flex flex-col items-center justify-center min-h-[450px]">
           <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-muted-foreground/20" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
           </div>
           <h3 className="text-sm font-bold text-muted-foreground/60 mb-1">No candidate data available</h3>
           <p className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-widest">Enable sample data to preview</p>
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
