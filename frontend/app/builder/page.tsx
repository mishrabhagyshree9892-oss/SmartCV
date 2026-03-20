"use client";
import { useState } from 'react';

export default function ResumeBuilder() {
  const [activeSection, setActiveSection] = useState('personal');

  const sections = [
    { id: 'personal', title: 'Personal Info' },
    { id: 'education', title: 'Education' },
    { id: 'skills', title: 'Skills' },
    { id: 'experience', title: 'Work Experience' },
    { id: 'projects', title: 'Projects' },
    { id: 'achievements', title: 'Achievements' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-[1240px] mx-auto w-full flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Resume Builder</h1>
        <p className="text-muted-foreground font-medium text-sm">Generate ATS-optimized, blockchain-verified resumes</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        {/* Form Section */}
        <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
          {sections.map((section) => (
            <div key={section.id} className="bg-card/80 backdrop-blur-[12px] rounded-xl border border-border/60 overflow-hidden shadow-sm">
              <button 
                onClick={() => setActiveSection(activeSection === section.id ? '' : section.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors"
              >
                <span className="font-bold text-foreground text-sm tracking-tight">{section.title}</span>
                <span className="text-muted-foreground text-xs">{activeSection === section.id ? '▴' : '▾'}</span>
              </button>
              
              {activeSection === section.id && (
                <div className="p-5 pt-0 animate-in slide-in-from-top-2 duration-300">
                  {section.id === 'personal' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                        <input className="w-full p-2.5 bg-background/60 border border-border/40 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm" placeholder="John Doe" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email</label>
                        <input className="w-full p-2.5 bg-background/60 border border-border/40 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm" placeholder="john@email.com" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone</label>
                        <input className="w-full p-2.5 bg-background/60 border border-border/40 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm" placeholder="+1 234 567 8900" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">LinkedIn</label>
                        <input className="w-full p-2.5 bg-background/60 border border-border/40 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm" placeholder="linkedin.com/in/..." />
                      </div>
                    </div>
                  )}
                  {['education', 'experience', 'projects', 'achievements'].includes(section.id) && (
                    <textarea 
                      className="w-full h-32 p-4 bg-background/60 border border-border/40 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-xs resize-none"
                      placeholder={`Enter your ${section.title} details here...`}
                    />
                  )}
                  {(section.id === 'skills') && (
                    <div className="flex gap-2">
                       <input className="flex-1 p-2.5 bg-background/60 border border-border/40 rounded-lg outline-none text-sm" placeholder="Add skill..." />
                       <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">+</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <div className="pt-6">
             <h3 className="font-bold text-foreground mb-3 text-sm">Target JD</h3>
             <div className="bg-card/80 backdrop-blur-[12px] p-5 rounded-xl border border-border/60 shadow-sm">
                <textarea 
                  className="w-full h-24 p-4 bg-background/60 border border-border/40 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 resize-none text-xs"
                  placeholder="Paste the job description you are targeting..."
                />
             </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:w-[42%] hidden lg:block">
           <div className="bg-card/90 backdrop-blur-[16px] rounded-[2.5rem] border border-border/60 shadow-2xl p-10 min-h-[500px] h-full flex flex-col items-center justify-center text-center space-y-5">
              <div className="text-5xl text-muted-foreground/20">📄</div>
              <div className="space-y-2">
                 <h4 className="font-bold text-muted-foreground text-base">Resume preview will appear here</h4>
                 <p className="text-xs text-muted-foreground/60 font-medium">Fill in your profile and generate</p>
              </div>
              <button className="mt-8 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                Download PDF
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
