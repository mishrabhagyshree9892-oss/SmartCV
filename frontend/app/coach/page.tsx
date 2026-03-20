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

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

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

  // Clean up speech on unmount or mode switch
  useEffect(() => {
    return () => {
      stopListening();
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const speak = (text: string) => {
    if (isMuted || typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    const voices = synth.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female'))
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0];
    if (preferred) utterance.voice = preferred;
    synth.speak(utterance);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support voice recognition. Please use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      handleSendMessage(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const startVoiceCall = () => {
    setVoiceActive(true);
    setMessages([]);
    setSessionId(`coach-voice-${Date.now()}`);
    // Greet the user
    const greeting = selectedRole
      ? `Hello! I'm your AI Interview Coach. I'll be conducting a ${selectedRole} mock interview. Let's get started! Could you briefly introduce yourself?`
      : `Hello! I'm your AI Interview Coach. Please select a role above, and then we'll begin your mock interview. I'll ask you a few challenging questions. Ready?`;
    const greetMsg: Message = { role: 'assistant', content: greeting };
    setMessages([greetMsg]);
    speak(greeting);
    // Auto-listen after greeting
    setTimeout(() => startListening(), 2000);
  };

  const endVoiceCall = () => {
    stopListening();
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    setVoiceActive(false);
    setIsListening(false);
  };

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
      const assistantMessage = data.response || data.result || (data.data && typeof data.data === 'string' ? data.data : null);
      if (assistantMessage) {
        const aiReply = typeof assistantMessage === 'string' ? assistantMessage : JSON.stringify(assistantMessage);
        setMessages([...newMessages, { role: 'assistant', content: aiReply }]);
        // Speak AI reply in voice mode
        if (mode === 'voice' && voiceActive) {
          speak(aiReply);
          // Auto-listen after AI speaks
          setTimeout(() => startListening(), aiReply.length * 40 + 1000);
        }
      }
    } catch (error) {
      const errMsg = "I'm having trouble connecting. Please try again.";
      setMessages([...newMessages, { role: 'assistant', content: errMsg }]);
      if (mode === 'voice' && voiceActive) speak(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setIsDropdownOpen(false);
    setMessages([]);
    setSessionId(`coach-${role}-${Date.now()}`);
  };

  // ───── VOICE MODE UI ─────
  if (mode === 'voice') {
    return (
      <div className="space-y-6 animate-in fade-in duration-700 max-w-[1240px] mx-auto w-full flex flex-col h-[85vh]">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Interview Coach</h1>
            <p className="text-sm text-muted-foreground mt-1">Practice interviews with AI-powered behavioral analysis</p>
          </div>
          <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-full border border-border/40">
            <span className="text-[10px] font-bold px-3 py-1 rounded-full cursor-pointer text-muted-foreground" onClick={() => { endVoiceCall(); setMode('text'); }}>Text</span>
            <div className="w-8 h-4 bg-primary rounded-full relative cursor-pointer" onClick={() => { endVoiceCall(); setMode('text'); }}>
              <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-white rounded-full transition-all" />
            </div>
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white shadow-sm text-foreground">Voice</span>
          </div>
        </div>

        {/* Role selector + End Call */}
        <div className="bg-card/80 backdrop-blur-[16px] border border-border/60 p-5 rounded-2xl flex items-center justify-between shadow-sm relative z-30">
          <div className="relative">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between gap-10 px-4 py-2 bg-background/60 border border-border/60 rounded-md text-sm font-medium text-foreground min-w-[200px] h-9">
              <span className={selectedRole ? 'text-foreground' : 'text-muted-foreground'}>{selectedRole || 'Select role...'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border/60 rounded-xl shadow-2xl overflow-hidden z-50">
                {roles.map(role => (
                  <button key={role} onClick={() => handleRoleSelect(role)}
                    className={`w-full text-left px-5 py-3 text-sm font-medium hover:bg-muted/50 transition-colors ${selectedRole === role ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}>
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>
          {voiceActive ? (
            <button onClick={endVoiceCall}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-all text-sm shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
              End Call
            </button>
          ) : (
            <button onClick={startVoiceCall}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-sm shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
              Start Call
            </button>
          )}
        </div>

        {/* Voice UI */}
        <div className="flex-1 bg-card/80 backdrop-blur-[16px] border border-border/60 rounded-[2rem] shadow-sm flex flex-col overflow-hidden">
          {/* Mic area */}
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening ? 'bg-primary/20 ring-4 ring-primary/40 animate-pulse' : 'bg-muted'
            }`}>
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"
                className={`w-12 h-12 ${isListening ? 'text-primary' : 'text-muted-foreground/50'}`} xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              {!voiceActive ? 'Press Start Call to begin' : isListening ? 'Listening...' : loading ? 'AI is thinking...' : 'Tap mic to speak'}
            </p>
            {voiceActive && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { if (isListening) stopListening(); else startListening(); }}
                  disabled={loading}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${
                    isListening ? 'bg-rose-100 text-rose-600 border border-rose-200' : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                  }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  </svg>
                  {isListening ? 'Stop' : 'Speak'}
                </button>
                <button
                  onClick={() => {
                    setIsMuted(!isMuted);
                    if (!isMuted) window.speechSynthesis?.cancel();
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border transition-all ${
                    isMuted ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-muted text-muted-foreground border-border/40 hover:bg-muted/80'
                  }`}>
                  {isMuted ? '🔇 Unmute' : '🔊 Mute'}
                </button>
              </div>
            )}
          </div>

          {/* Transcript */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 pb-6 space-y-4">
            {messages.length > 0 && (
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Transcript</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm font-medium ${
                  msg.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-muted/50 border border-border/40 text-foreground'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted/50 border border-border/40 rounded-2xl px-5 py-3 text-xs font-medium text-muted-foreground animate-pulse">
                  AI Coach is thinking...
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-4 pb-6 flex justify-between items-center">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 sm:pb-0">
            {["Resume Generator","JD Analyzer","Interview Coach","Skill Gap Analyzer","Test Assessment"].map(link => (
              <div key={link} className="flex items-center gap-1.5 flex-shrink-0">
                <div className={`w-1 h-1 rounded-full ${link === 'Interview Coach' ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                <span className={`text-[10px] whitespace-nowrap font-bold uppercase tracking-widest ${link === 'Interview Coach' ? 'text-primary' : 'text-muted-foreground/60'}`}>{link}</span>
              </div>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex-shrink-0 ml-4">5 agents connected</span>
        </footer>
      </div>
    );
  }

  // ───── TEXT MODE UI ─────
  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-[1240px] mx-auto w-full flex flex-col h-[85vh]">
      <div className="flex justify-between items-center sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Interview Coach</h1>
          <p className="text-sm text-muted-foreground mt-1">Practice interviews with AI-powered behavioral analysis</p>
        </div>
        <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-full border border-border/40 backdrop-blur-sm">
           <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white shadow-sm text-foreground">Text</span>
           <div className="w-8 h-4 bg-primary rounded-full relative cursor-pointer" onClick={() => setMode('voice')}>
              <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-all" />
           </div>
           <span className="text-[10px] font-bold px-3 py-1 rounded-full cursor-pointer text-muted-foreground" onClick={() => setMode('voice')}>Voice</span>
        </div>
      </div>

      <div className="bg-card/80 backdrop-blur-[16px] border border-border/60 p-5 rounded-2xl flex items-center justify-between shadow-sm relative z-30">
         <div className="relative">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between gap-10 px-4 py-2 bg-background/60 border border-border/60 rounded-md text-sm font-medium text-foreground min-w-[200px] h-9">
              <span className={selectedRole ? 'text-foreground' : 'text-muted-foreground'}>{selectedRole || 'Select role...'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border/60 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                 {roles.map(role => (
                   <button key={role} onClick={() => handleRoleSelect(role)}
                     className={`w-full text-left px-5 py-3 text-sm font-medium hover:bg-muted/50 transition-colors ${selectedRole === role ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}>
                     {role}
                   </button>
                 ))}
              </div>
            )}
         </div>
         <button onClick={() => setMessages([])} className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:underline">Reset Chat</button>
      </div>

      <div className="flex-1 bg-card/80 backdrop-blur-[16px] border border-border/60 rounded-[2rem] shadow-sm flex flex-col relative overflow-hidden">
         <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-muted text-muted-foreground/40">
                   <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <div className="space-y-2">
                   <h4 className="font-bold text-foreground text-lg">Start your mock interview</h4>
                   <p className="text-sm text-muted-foreground font-medium max-w-sm">
                     {selectedRole ? `Ready for your ${selectedRole} interview? Type "Hi" to begin.` : "Please select a role above and type a message to start."}
                   </p>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm text-sm ${
                    msg.role === 'user' ? 'bg-primary text-white' : 'bg-muted/50 border border-border/40 text-foreground'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted/50 border border-border/40 rounded-2xl p-4 text-xs font-medium text-muted-foreground animate-pulse">AI Coach is thinking...</div>
              </div>
            )}
         </div>
         <div className="p-6 border-t border-border/40 bg-background/40 backdrop-blur-md">
            <div className="bg-white border border-border/60 p-2 rounded-2xl flex items-center gap-3 shadow-sm max-w-4xl mx-auto">
               <input
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                 className="flex-1 bg-transparent px-4 py-3 outline-none text-sm text-gray-900 placeholder:text-muted-foreground/50"
                 placeholder="Type your answer..."
                 disabled={loading}
               />
               <button onClick={() => handleSendMessage()} disabled={loading || !input.trim()}
                 className="w-10 h-10 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 ml-0.5" xmlns="http://www.w3.org/2000/svg"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
               </button>
            </div>
         </div>
      </div>

      <footer className="mt-4 pb-6 flex justify-between items-center">
         <div className="flex items-center gap-4 overflow-x-auto pb-2 sm:pb-0">
            {["Resume Generator","JD Analyzer","Interview Coach","Skill Gap Analyzer","Test Assessment"].map(link => (
              <div key={link} className="flex items-center gap-1.5 flex-shrink-0">
                <div className={`w-1 h-1 rounded-full ${link === 'Interview Coach' ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                <span className={`text-[10px] whitespace-nowrap font-bold uppercase tracking-widest ${link === 'Interview Coach' ? 'text-primary' : 'text-muted-foreground/60'}`}>{link}</span>
              </div>
            ))}
         </div>
         <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">5 agents connected</span>
         </div>
      </footer>
    </div>
  );
}
