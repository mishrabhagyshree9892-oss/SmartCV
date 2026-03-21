"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Assessments() {
  const [activeTest, setActiveTest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [testResult, setTestResult] = useState<any>(null);
  const [userRole, setUserRole] = useState('Professional');

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth!, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // user state updated
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch user role from localStorage or an API if simpler, but for now we'll rely on the user having it in db. Let's just fetch it.
  useEffect(() => {
    if (user?.uid) {
      const fetchRole = async () => {
        try {
          const { getDoc, doc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const userDoc = await getDoc(doc(db as any, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().jobRole) {
            setUserRole(userDoc.data().jobRole);
          }
        } catch(e) {}
      };
      fetchRole();
    }
  }, [user]);

  const testOptions = [
    { id: 'core', name: `${userRole} Core Fundamentals`, duration: '45 mins', level: 'Intermediate', icon: '🧠' },
    { id: 'advanced', name: `Advanced ${userRole} Scenarios`, duration: '60 mins', level: 'Expert', icon: '⚡' },
    { id: 'ethics', name: 'Workplace Ethics & Situational Judgement', duration: '30 mins', level: 'General', icon: '⚖️' },
  ];

  const startTest = async (test: any) => {
    setActiveTest(test);
    setLoading(true);
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setTestResult(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/agents/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.email || 'guest',
          message: `Generate a 5-question multiple choice test for: ${test.name}. Level: ${test.level}. Format JSON only.`
        })
      });
      const data = await response.json();
      console.log('Assessment data:', data);
      
      // Try multiple paths to find questions array
      let foundQuestions = null;
      if (data.result?.questions) foundQuestions = data.result.questions;
      else if (data.questions) foundQuestions = data.questions;
      else if (data.data?.questions) foundQuestions = data.data.questions;
      else if (typeof data.result === 'string') {
        // Try parsing JSON string from result
        try {
          const parsed = JSON.parse(data.result);
          if (parsed.questions) foundQuestions = parsed.questions;
        } catch {}
      } else if (data.response) {
        try {
          const match = data.response.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            if (parsed.questions) foundQuestions = parsed.questions;
          }
        } catch {}
      }
      
      if (foundQuestions && foundQuestions.length > 0) {
        setQuestions(foundQuestions);
      } else {
        console.warn('No questions found in response:', data);
        // Show error state
        setQuestions([]);
      }
    } catch (error) {
      console.error('Test generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitTest = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/agents/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.email || 'guest',
          message: `Evaluation Request:\nTest: ${activeTest.name}\nQuestions: ${JSON.stringify(questions)}\nUser Answers: ${JSON.stringify(answers)}\nProvide a detailed evaluation report with score and feedback.`
        })
      });
      const data = await response.json();
      console.log('Assessment Evaluation Data:', data);
      const parsedResult = data.result || data.data?.module_outputs || (data.data && Object.keys(data.data).length > 0 ? data.data : null) || data;
      if (parsedResult) {
        setTestResult(parsedResult);
      } else {
        console.warn('Could not find result in data:', data);
      }
    } catch (error) {
      console.error('Evaluation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (testResult) {
    return (
      <div className="max-w-4xl mx-auto space-y-10 animate-in zoom-in-95 duration-500 pb-20">
         <div className="bg-primary p-12 rounded-[3.5rem] text-white text-center space-y-4 shadow-2xl shadow-primary/20">
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-70">Certification Result</p>
            <h1 className="text-6xl font-black italic tracking-tighter">{testResult.score || testResult.overall_score}%</h1>
            <p className="text-lg font-medium opacity-90">{testResult.performance_summary || 'Test Completed Successfully'}</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border/40 p-8 rounded-3xl space-y-4">
               <h3 className="font-bold text-foreground">Detailed Evaluation</h3>
               <p className="text-sm text-muted-foreground leading-relaxed">{testResult.detailed_evaluation || testResult.feedback}</p>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-3xl space-y-4">
               <h3 className="font-bold text-emerald-600">Strengths</h3>
               <ul className="space-y-2">
                 {testResult.strengths?.map((s: string, i: number) => (
                   <li key={i} className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {s}
                   </li>
                 ))}
               </ul>
            </div>
         </div>

         <div className="bg-zinc-900 p-10 rounded-[3rem] text-white flex items-center justify-between">
            <div className="space-y-2">
               <h4 className="text-xl font-bold">Mint Certificate</h4>
               <p className="text-sm text-zinc-400">Add this verified score to your blockchain profile.</p>
            </div>
            <button className="px-8 py-3 bg-primary rounded-xl font-bold hover:scale-105 transition-all">Mint NFT</button>
         </div>
         
         <button onClick={() => setTestResult(null)} className="w-full py-4 border border-border/40 rounded-2xl font-bold text-muted-foreground hover:bg-muted/50 transition-all">
           Back to Assessments
         </button>
      </div>
    );
  }

  if (activeTest) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 h-[80vh] flex flex-col">
        <header className="flex justify-between items-center">
           <div>
             <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">{activeTest.name}</h4>
             <h2 className="text-xl font-bold">Question {currentIndex + 1} of {questions.length}</h2>
           </div>
           <button onClick={() => setActiveTest(null)} className="text-xs font-bold text-rose-500 uppercase tracking-widest px-4 py-2 border border-rose-500/20 rounded-lg hover:bg-rose-500/5 transition-all">Quit Test</button>
        </header>

        <div className="flex-1 bg-card/60 backdrop-blur-xl border border-border/40 p-10 rounded-[2.5rem] shadow-sm flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
               <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
               <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{questions.length === 0 ? 'Generating AI questions...' : 'Evaluating answers...'}</p>
            </div>
          ) : questions.length > 0 ? (
            <div className="flex-1 flex flex-col justify-center space-y-10">
               <h3 className="text-2xl font-bold text-foreground leading-snug">{questions[currentIndex].question}</h3>
               <div className="grid grid-cols-1 gap-4">
                 {questions[currentIndex].options.map((opt: string, i: number) => (
                   <button 
                     key={i}
                     onClick={() => setAnswers({...answers, [currentIndex]: opt})}
                     className={`w-full text-left p-6 rounded-2xl border-2 transition-all font-medium ${
                       answers[currentIndex] === opt 
                        ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5' 
                        : 'bg-background/40 border-border/40 text-muted-foreground hover:border-primary/30 hover:bg-white'
                     }`}
                   >
                     <span className="inline-block w-8 font-black opacity-30">{String.fromCharCode(65 + i)}.</span>
                     {opt}
                   </button>
                 ))}
               </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
               <p className="text-muted-foreground">Unexpected error. Please restart the test.</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center px-2">
           <button 
             disabled={currentIndex === 0}
             onClick={() => setCurrentIndex(currentIndex - 1)}
             className="px-6 py-2.5 font-bold text-muted-foreground disabled:opacity-30"
           >
             ← Previous
           </button>
           {currentIndex === questions.length - 1 ? (
             <button 
               onClick={submitTest}
               className="px-10 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
             >
               Finalize & Evaluate
             </button>
           ) : (
             <button 
               onClick={() => setCurrentIndex(currentIndex + 1)}
               className="px-10 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:scale-105 transition-all"
             >
               Next Question →
             </button>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <header>
        <h1 className="text-3xl font-bold">Assessments</h1>
        <p className="text-muted-foreground font-medium">Take proctored tests and get blockchain-verified certifications for your skills.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testOptions.map(test => (
          <div key={test.id} className="bg-card/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/40 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 text-6xl opacity-5 group-hover:scale-125 transition-transform">{test.icon}</div>
             <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                {test.icon}
             </div>
             <h3 className="text-xl font-bold mb-2 text-foreground">{test.name}</h3>
             <div className="flex gap-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-8">
                <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-primary" /> {test.duration}</span>
                <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-primary" /> 5-10 Qs</span>
             </div>
             <div className="flex items-center justify-between pt-6 border-t border-border/40">
                <span className="px-3 py-1 bg-muted/50 text-[10px] text-muted-foreground font-black uppercase tracking-widest rounded-lg">{test.level}</span>
                <button 
                  onClick={() => startTest(test)}
                  className="text-primary font-bold hover:translate-x-1 transition-transform flex items-center gap-2 text-sm"
                >
                  Start Assessment →
                </button>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-zinc-900 to-black p-12 rounded-[3.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
         <div className="space-y-4 relative z-10">
            <h2 className="text-4xl font-black italic tracking-tighter">Blockchain Verified Certificates</h2>
            <p className="text-zinc-400 max-w-md font-medium">Your test scores are minted on the blockchain to ensure tamper-proof credibility for employers worldwide.</p>
         </div>
         <button className="px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:scale-105 transition-all relative z-10">
            Learn More
         </button>
      </div>
    </div>
  );
}
