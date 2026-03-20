"use client";
import { useState } from 'react';

export default function SkillInsights() {
  const [analyzing, setAnalyzing] = useState(false);
  const [skills, setSkills] = useState(['React', 'TypeScript', 'Next.js']);
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-[1240px] mx-auto w-full flex flex-col min-h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Skill Insights</h1>
        <p className="text-sm text-primary/70 font-medium">Identify gaps with industry benchmarks and learning paths</p>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-card/80 backdrop-blur-[16px] border border-border/60 p-8 rounded-[1.5rem] shadow-sm flex flex-col gap-8 w-full max-w-5xl mx-auto">
          {/* Target Role */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Target Role</label>
            <input 
              type="text"
              placeholder="e.g., Senior Frontend Developer"
              className="w-full bg-background/40 border border-border/40 rounded-xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm text-foreground placeholder:text-muted-foreground/30 transition-all font-medium"
            />
          </div>

          {/* Your Skills */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Your Skills</label>
            <div className="flex gap-2">
              <input 
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                placeholder="Add a skill..."
                className="flex-1 bg-background/40 border border-border/40 rounded-xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm text-foreground placeholder:text-muted-foreground/30 transition-all font-medium"
              />
              <button 
                onClick={addSkill}
                className="w-12 h-12 flex items-center justify-center bg-muted/50 hover:bg-muted rounded-xl border border-border/40 text-muted-foreground transition-all"
              >
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((skill, i) => (
                <div key={i} className="px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-lg flex items-center gap-2 group">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{skill}</span>
                  <button 
                    onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}
                    className="opacity-0 group-hover:opacity-100 text-primary/40 hover:text-primary transition-all"
                  >
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex">
            <button 
              onClick={() => setAnalyzing(true)}
              className="px-6 py-3 bg-primary/20 hover:bg-primary/30 text-primary font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2.5 text-xs border border-primary/20"
            >
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M18 20l0 -4"></path><path d="M14 20l0 -7"></path><path d="M10 20l0 -11"></path><path d="M6 20l0 -6"></path></svg>
              {analyzing ? 'Analyzing Gaps...' : 'Analyze Gaps'}
            </button>
          </div>
        </div>

        <footer className="mt-auto pt-10 flex justify-between items-center text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest pl-2 pr-2">
         <div className="flex items-center gap-6 overflow-x-auto pb-2 sm:pb-0">
            {[
              "Resume Generator",
              "JD Analyzer",
              "Interview Coach",
              "Skill Gap Analyzer",
              "Test Assessment"
            ].map(link => (
              <div key={link} className="flex items-center gap-1.5 flex-shrink-0">
                <div className={`w-1 h-1 rounded-full ${link === 'Skill Gap Analyzer' ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
                <span className={`whitespace-nowrap ${link === 'Skill Gap Analyzer' ? 'text-primary' : 'hover:text-primary transition-colors cursor-pointer'}`}>{link}</span>
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
