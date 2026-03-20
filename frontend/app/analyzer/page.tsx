"use client";
import { useState, useEffect, useRef } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function JDAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [jdText, setJdText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleAnalyze = async () => {
    if (!jdText.trim()) return;
    setAnalyzing(true);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/agents/analyze-jd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.email || 'guest',
          message: jdText
        })
      });
      const data = await response.json();
      console.log('JD Analyzer Data:', data);
      const parsedResult = data.result || data.data?.module_outputs || (data.data && Object.keys(data.data).length > 0 ? data.data : null) || data;
      if (parsedResult) {
        setResult(parsedResult);
      } else {
        console.warn('Could not find result in data:', data);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      clearInterval(timerRef.current);
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-[1240px] mx-auto w-full flex flex-col min-h-full pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">JD Analyzer</h1>
        <p className="text-sm text-primary/70 font-medium">Extract insights and match your skills against any job description</p>
      </div>

      <div className="flex-1 flex flex-col gap-8">
        <div className="bg-card/80 backdrop-blur-[16px] border border-border/60 p-6 rounded-[1.5rem] shadow-sm flex flex-col gap-6 w-full max-w-5xl mx-auto">
          <textarea 
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            className="flex-1 w-full bg-transparent border border-border/40 rounded-xl p-6 outline-none focus:ring-2 focus:ring-primary/20 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none min-h-[200px]"
            placeholder="Paste a job description here to analyze required skills, keywords, and get resume optimization suggestions..."
          />

          <div className="flex items-center gap-4">
            <button 
              onClick={handleAnalyze}
              disabled={analyzing || !jdText.trim()}
              className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:hover:scale-100"
            >
              {analyzing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  Analyze JD
                </>
              )}
            </button>
            {analyzing && (
              <div className="flex flex-col">
                <span className="text-xs font-bold text-primary">{elapsed}s elapsed</span>
                <span className="text-[10px] text-muted-foreground">AI is analyzing the JD...</span>
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="w-full max-w-5xl mx-auto space-y-8 pb-20">
            <div className="bg-emerald-500 text-white p-4 rounded-xl font-bold">✓ AI Analysis Complete</div>
            {/* Skills & Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card/60 p-6 rounded-2xl border border-border/40 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {result.required_skills?.map((s: any, i: number) => (
                    <span key={i} className={`px-3 py-1 rounded-full text-[10px] font-bold border ${s.category === 'required' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted border-border text-muted-foreground'}`}>
                      {s.skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-card/60 p-6 rounded-2xl border border-border/40 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-500">ATS Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {result.keywords?.map((kw: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-full text-[10px] font-bold">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Rephrasing Suggestions */}
            <div className="bg-card/60 p-8 rounded-3xl border border-border/40 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Optimization Suggestions</h3>
              <div className="space-y-4">
                {result.rephrasing_suggestions?.map((s: any, i: number) => (
                  <div key={i} className="p-5 rounded-2xl bg-muted/40 border border-border/40 grid grid-cols-1 md:grid-cols-2 gap-6 relative group">
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">Generic Version</p>
                      <p className="text-xs text-muted-foreground line-through italic">{s.before}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-primary uppercase">Optimized Version</p>
                      <p className="text-xs font-medium text-foreground">{s.after}</p>
                    </div>
                    <div className="md:col-span-2 pt-2 border-t border-border/20">
                       <p className="text-[10px] text-muted-foreground/60 leading-relaxed italic"><span className="font-bold text-primary not-italic mr-1">Why?</span>{s.improvement_reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitiveness & Summary */}
            <div className="bg-primary/5 p-8 rounded-3xl border border-primary/20 space-y-6">
               <div className="space-y-2">
                  <h3 className="text-xl font-bold whitespace-nowrap">Role Summary</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
               </div>
               <div className="p-5 bg-white rounded-2xl border border-primary/20 shadow-lg shadow-primary/10 flex items-center justify-between gap-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Competitiveness</p>
                  <p className="text-sm font-bold text-primary italic text-right max-w-[70%]">{result.competitiveness_rating}</p>
               </div>
            </div>
          </div>
        )}

        <footer className="mt-8 flex justify-between items-center text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest pl-2 pr-2">
         <div className="flex items-center gap-6 overflow-x-auto pb-2 sm:pb-0">
            {[
              "Resume Generator",
              "JD Analyzer",
              "Interview Coach",
              "Skill Gap Analyzer",
              "Test Assessment"
            ].map(link => (
              <div key={link} className="flex items-center gap-1.5 flex-shrink-0">
                <div className={`w-1 h-1 rounded-full ${link === 'JD Analyzer' ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
                <span className={`whitespace-nowrap ${link === 'JD Analyzer' ? 'text-primary' : 'hover:text-primary transition-colors cursor-pointer'}`}>{link}</span>
              </div>
            ))}
         </div>
         <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-emerald-500/60" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            <span>5 agents connected</span>
         </div>
      </footer>
      </div>
    </div>
  );
}
