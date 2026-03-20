"use client";
import { useState } from 'react';

export default function InterviewCoach() {
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const roles = [
    "Frontend Developer",
    "Backend Engineer",
    "Full-Stack Developer",
    "Data Scientist",
    "Product Manager",
    "DevOps Engineer"
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-[1200px] mx-auto w-full">
      <div className="flex justify-between items-center sm:items-end mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Interview Coach</h1>
          <p className="text-sm text-muted-foreground mt-1">Practice interviews with AI-powered behavioral analysis</p>
        </div>
        <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-full border border-border/40 backdrop-blur-sm">
           <span className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${mode === 'text' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'}`} onClick={() => setMode('text')}>Text</span>
           <div className={`w-8 h-4 bg-primary rounded-full relative cursor-pointer`} onClick={() => setMode(mode === 'text' ? 'voice' : 'text')}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${mode === 'text' ? 'left-0.5' : 'right-0.5'}`} />
           </div>
           <span className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${mode === 'voice' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'}`} onClick={() => setMode('voice')}>Voice</span>
        </div>
      </div>

      <div className="bg-card/80 backdrop-blur-[16px] border border-border/60 p-5 rounded-2xl flex items-center justify-between shadow-sm relative z-20">
         <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between gap-10 px-4 py-2 bg-background/60 border border-border/60 rounded-md text-sm font-medium text-foreground min-w-[200px] h-9"
            >
              <span className={selectedRole ? 'text-foreground' : 'text-muted-foreground'}>
                {selectedRole || 'Select role...'}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-4 w-4 opacity-50"><path d="m6 9 6 6 6-6"></path></svg>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border/60 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                 {roles.map(role => (
                   <button 
                     key={role}
                     onClick={() => { setSelectedRole(role); setIsDropdownOpen(false); }}
                     className={`w-full text-left px-5 py-3 text-sm font-medium hover:bg-muted/50 transition-colors ${selectedRole === role ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}
                   >
                     {role}
                   </button>
                 ))}
              </div>
            )}
         </div>

         {mode === 'voice' && (
           <button className="px-4 py-2 bg-primary text-white font-medium rounded-md shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2 text-sm h-10">
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> 
              Start Call
           </button>
         )}
      </div>

      <div className="flex-1 bg-card/80 backdrop-blur-[16px] border border-border/60 p-10 py-16 rounded-[2rem] shadow-sm flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
         <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 bg-muted ${mode === 'voice' ? 'text-primary border-2 border-primary/20' : 'text-muted-foreground/40'}`}>
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
         </div>
         <div className="space-y-2">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-2">
              {mode === 'voice' ? 'Ready' : 'Mock Interview'}
            </div>
            <h4 className="font-bold text-foreground text-lg">
              {mode === 'voice' ? 'AI Coach is Listening' : 'Start your mock interview'}
            </h4>
            <p className="text-sm text-muted-foreground font-medium">
              {mode === 'voice' 
                ? "Click \"Start Call\" to begin your voice interview" 
                : "Type a message or select a role and say hello"}
            </p>
         </div>

         {mode === 'text' && (
           <div className="absolute inset-x-8 bottom-8 animate-in slide-in-from-bottom-5 duration-500">
              <div className="bg-background/60 border border-border/60 p-2 rounded-2xl flex items-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                 <input 
                   className="flex-1 bg-transparent px-4 py-3 outline-none text-sm text-foreground placeholder:text-muted-foreground/50" 
                   placeholder="Type your answer..."
                 />
                 <button className="w-10 h-10 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95">
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 ml-0.5" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                 </button>
              </div>
           </div>
         )}
      </div>

      <footer className="mt-8 pt-6 flex justify-between items-center">
         <div className="flex items-center gap-4 overflow-x-auto pb-2 sm:pb-0">
            {[
              "Resume Generator",
              "JD Analyzer",
              "Interview Coach",
              "Skill Gap Analyzer",
              "Test Assessment"
            ].map(link => (
              <div key={link} className="flex items-center gap-1.5 flex-shrink-0">
                <div className={`w-1 h-1 rounded-full ${link === 'Interview Coach' ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                <span className={`text-[10px] whitespace-nowrap font-bold uppercase tracking-widest ${link === 'Interview Coach' ? 'text-primary' : 'text-muted-foreground/60'}`}>{link}</span>
              </div>
            ))}
         </div>
         <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-emerald-500" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M9 15l6 -6"></path><path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464"></path><path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463"></path></svg>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">5 agents connected</span>
         </div>
      </footer>
    </div>
  );
}
