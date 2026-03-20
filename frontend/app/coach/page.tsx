"use client";
import { useState, useEffect, useRef } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function InterviewCoach() {
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(`coach-${Date.now()}`);
  const [user, setUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const roles = [
    "Frontend Developer",
    "Backend Engineer",
    "Full-Stack Developer",
    "Data Scientist",
    "Product Manager",
    "DevOps Engineer"
  ];

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth!, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (customMsg?: string) => {
    const messageToSend = customMsg || input;
    if (!messageToSend.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: messageToSend }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/agents/coach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.email || 'guest',
          message: selectedRole ? `[Role: ${selectedRole}] ${messageToSend}` : messageToSend,
          sessionId: sessionId
        })
      });
      const data = await response.json();
      console.log('Coach Data:', data);
      const assistantMessage = data.response || data.result || data.data?.module_outputs || (data.data && typeof data.data === 'string' ? data.data : null);
      if (assistantMessage) {
        setMessages([...newMessages, { role: 'assistant', content: typeof assistantMessage === 'string' ? assistantMessage : JSON.stringify(assistantMessage) }]);
      }
    } catch (error) {
      console.error('Coach failed:', error);
      setMessages([...newMessages, { role: 'assistant', content: "I'm having trouble connecting. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setIsDropdownOpen(false);
    setMessages([]);
    setSessionId(`coach-${role}-${Date.now()}`);
    // Optional: Auto-start with a greeting
    // handleSendMessage("Hi, I want to practice for a " + role + " interview.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-[1240px] mx-auto w-full flex flex-col h-[85vh]">
      <div className="flex justify-between items-center sm:items-end">
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

      <div className="bg-card/80 backdrop-blur-[16px] border border-border/60 p-5 rounded-2xl flex items-center justify-between shadow-sm relative z-30">
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
                     onClick={() => handleRoleSelect(role)}
                     className={`w-full text-left px-5 py-3 text-sm font-medium hover:bg-muted/50 transition-colors ${selectedRole === role ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}
                   >
                     {role}
                   </button>
                 ))}
              </div>
            )}
         </div>

         <button 
            onClick={() => setMessages([])} 
            className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:underline"
         >
           Reset Chat
         </button>
      </div>

      <div className="flex-1 bg-card/80 backdrop-blur-[16px] border border-border/60 rounded-[2rem] shadow-sm flex flex-col relative overflow-hidden">
         {/* Chat Area */}
         <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-muted text-muted-foreground/40`}>
                 {mode === 'text' ? (
                   <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                 ) : (
                   <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                 )}
              </div>
                <div className="space-y-2">
                   <h4 className="font-bold text-foreground text-lg">Start your mock interview</h4>
                   <p className="text-sm text-muted-foreground font-medium max-w-sm">
                     {selectedRole 
                       ? `Ready for your ${selectedRole} interview? Say "Hi" to begin.` 
                       : "Please select a role above and type a message to start."}
                   </p>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-muted/50 border border-border/40 text-foreground'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted/50 border border-border/40 rounded-2xl p-4 text-xs font-medium text-muted-foreground animate-pulse">
                  AI Coach is thinking...
                </div>
              </div>
            )}
         </div>

         {/* Input Area */}
         <div className="p-6 border-t border-border/40 bg-background/40 backdrop-blur-md">
            <div className="bg-white border border-border/60 p-2 rounded-2xl flex items-center gap-3 shadow-sm max-w-4xl mx-auto">
               <input 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                 className="flex-1 bg-transparent px-4 py-3 outline-none text-sm text-foreground placeholder:text-muted-foreground/50" 
                 placeholder="Type your answer..."
                 disabled={loading}
               />
               <button 
                 onClick={() => handleSendMessage()}
                 disabled={loading || !input.trim()}
                 className="w-10 h-10 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
               >
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 ml-0.5" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
               </button>
            </div>
         </div>
      </div>

      <footer className="mt-4 pb-6 flex justify-between items-center">
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
