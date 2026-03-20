"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function SkillInsights() {
  const [analyzing, setAnalyzing] = useState(false);
  const [skills, setSkills] = useState(['React', 'TypeScript', 'Next.js']);
  const [newSkill, setNewSkill] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [result, setResult] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleAnalyze = async () => {
    if (!targetRole.trim() || skills.length === 0) return;
    setAnalyzing(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/agents/skill-gap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.email || 'guest',
          message: `Target Role: ${targetRole}\nCurrent Skills: ${skills.join(', ')}`
        })
      });
      const data = await response.json();
      console.log('Skill Gap Data:', data);
      const parsedResult = data.result || data.data?.module_outputs || (data.data && Object.keys(data.data).length > 0 ? data.data : null) || data;
      if (parsedResult) {
        setResult(parsedResult);
      } else {
        console.warn('Could not find result in data:', data);
      }
    } catch (error) {
      console.error('Skill gap analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-[1240px] mx-auto w-full flex flex-col min-h-full pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Skill Insights</h1>
        <p className="text-sm text-primary/70 font-medium">Identify gaps with industry benchmarks and learning paths</p>
      </div>

      <div className="flex-1 flex flex-col gap-8">
        <div className="bg-card/80 backdrop-blur-[16px] border border-border/60 p-8 rounded-[1.5rem] shadow-sm flex flex-col gap-8 w-full max-w-5xl mx-auto">
          {/* Target Role */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Target Role</label>
            <input 
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
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
              onClick={handleAnalyze}
              disabled={analyzing}
              className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2.5 text-xs disabled:opacity-50 disabled:hover:scale-100"
            >
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M18 20l0 -4"></path><path d="M14 20l0 -7"></path><path d="M10 20l0 -11"></path><path d="M6 20l0 -6"></path></svg>
              {analyzing ? 'Analyzing Gaps...' : 'Analyze Gaps'}
            </button>
          </div>
          </div>
        </div>

        {result && (
          <div className="w-full max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             {/* Score Header */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-primary p-8 rounded-3xl text-white flex flex-col items-center justify-center space-y-2 shadow-xl shadow-primary/20">
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Readiness Score</p>
                   <p className="text-5xl font-black italic tracking-tighter">{result.overall_skill_score}%</p>
                </div>
                <div className="md:col-span-2 bg-card border border-border/40 p-8 rounded-3xl flex flex-col justify-center gap-3">
                   <h3 className="font-bold text-foreground">Market Readiness Summary</h3>
                   <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
                </div>
             </div>

             {/* Skill Gaps */}
             <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Identified Skill Gaps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {result.skill_gaps?.map((gap: any, i: number) => (
                     <div key={i} className="bg-card/60 p-5 rounded-2xl border border-border/40 space-y-3 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 px-3 py-1 text-[8px] font-black uppercase tracking-widest ${gap.priority === 'critical' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>
                          {gap.priority}
                        </div>
                        <h4 className="font-bold text-foreground">{gap.skill}</h4>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                           <span>Current: <span className="text-rose-500">{gap.current_level}</span></span>
                           <span>Required: <span className="text-emerald-500">{gap.required_level}</span></span>
                        </div>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed italic border-t border-border/20 pt-2">{gap.gap_description}</p>
                     </div>
                   ))}
                </div>
             </div>

             {/* Learning Recommendations */}
             <div className="bg-card/60 p-8 rounded-3xl border border-border/40 space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Learning Recommendations</h3>
                <div className="grid grid-cols-1 gap-4">
                   {result.recommendations?.map((rec: any, i: number) => (
                     <div key={i} className="p-5 rounded-2xl bg-muted/30 border border-border/40 flex items-center justify-between group hover:bg-muted/50 transition-all">
                        <div className="space-y-1">
                           <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{rec.course_name}</h4>
                           <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{rec.provider} • {rec.duration}</p>
                        </div>
                        <a href={rec.url} target="_blank" className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold rounded-lg hover:bg-primary hover:text-white transition-all">EXPLORE</a>
                     </div>
                   ))}
                </div>
             </div>

             {/* Trends & Strengths */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl space-y-4">
                   <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600">Your Core Strengths</h3>
                   <div className="flex flex-wrap gap-2">
                      {result.strengths?.map((s: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-white/50 border border-emerald-500/10 rounded-xl text-[10px] font-bold text-emerald-700 shadow-sm">✓ {s}</span>
                      ))}
                   </div>
                </div>
                <div className="bg-indigo-500/5 border border-indigo-500/20 p-6 rounded-3xl space-y-4">
                   <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Market Trends</h3>
                   <div className="flex flex-col gap-2">
                      {result.market_trends?.map((t: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-[10px] font-medium text-indigo-700">
                           <div className="w-1 h-1 rounded-full bg-indigo-400" />
                           {t}
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}

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
  );
}
