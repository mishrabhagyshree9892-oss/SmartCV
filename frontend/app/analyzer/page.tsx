"use client";
import { useState } from 'react';

export default function JDAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-[1240px] mx-auto w-full flex flex-col min-h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">JD Analyzer</h1>
        <p className="text-sm text-primary/70 font-medium">Extract insights and match your skills against any job description</p>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-card/80 backdrop-blur-[16px] border border-border/60 p-6 rounded-[1.5rem] shadow-sm flex flex-col gap-6 w-full max-w-5xl mx-auto min-h-[400px]">
          <textarea 
            className="flex-1 w-full bg-transparent border border-border/40 rounded-xl p-6 outline-none focus:ring-2 focus:ring-primary/20 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none min-h-[250px]"
            placeholder="Paste a job description here to analyze required skills, keywords, and get resume optimization suggestions..."
          />

          <div className="flex">
            <button 
              onClick={() => setAnalyzing(true)}
              className="px-5 py-2.5 bg-primary/20 hover:bg-primary/30 text-primary font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 text-xs border border-primary/20"
            >
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              {analyzing ? 'Analyzing...' : 'Analyze JD'}
            </button>
          </div>
        </div>

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
