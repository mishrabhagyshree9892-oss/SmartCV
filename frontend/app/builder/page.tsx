"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';

export default function ResumeBuilder() {
  const searchParams = useSearchParams();
  const isUploadMode = searchParams.get('upload') === 'true';
  const [activeSection, setActiveSection] = useState('personal');
  const [generating, setGenerating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const templateId = searchParams.get('templateId') || 'ats';
  const componentRef = useRef<HTMLDivElement>(null);
  
  const getLayoutStyles = () => {
    const type = templateId.split('-')[0].toLowerCase();
    if (type === 'modern') {
      return {
        container: 'space-y-6 bg-white p-8 border-l-8 border-indigo-600 text-gray-800 print:p-4 print:shadow-none',
        header: 'border-b-2 border-indigo-600 pb-4 mb-4',
        name: 'text-3xl font-black text-gray-900',
        sectionHead: 'text-sm font-bold uppercase tracking-widest text-indigo-600 mb-2 border-b-2 border-indigo-600/20 pb-1 inline-block',
        bullet: 'list-disc list-outside ml-4 space-y-1 marker:text-indigo-600',
      };
    } else if (type === 'creative') {
       return {
        container: 'space-y-6 bg-[#fdfbf7] p-8 text-gray-800 border-2 border-amber-900/10 print:p-4 print:shadow-none',
        header: 'bg-emerald-700 text-white p-6 -mx-8 -mt-8 mb-6',
        name: 'text-4xl font-extrabold text-white',
        sectionHead: 'text-sm font-extrabold uppercase tracking-widest bg-emerald-700/10 text-emerald-800 px-3 py-1 rounded inline-block mb-3',
        bullet: 'list-disc list-outside ml-4 space-y-1',
       };
    } else { // default ats
       return {
        container: 'space-y-4 bg-white p-8 text-black font-serif print:p-4 print:shadow-none',
        header: 'text-center border-b border-black pb-4 mb-4',
        name: 'text-2xl font-bold uppercase',
        sectionHead: 'text-sm font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-2',
        bullet: 'list-disc list-outside ml-4 space-y-1',
       };
    }
  };
  const styles = getLayoutStyles();

  const handleDirectDownload = async () => {
     if (!componentRef.current) return;
     const html2pdf = (await import('html2pdf.js')).default;
     const element = componentRef.current;
     const fileName = user?.fullName ? `${user.fullName}_SmartCV.pdf` : 'SmartCV_Resume.pdf';
     const opt = {
       margin: 10,
       filename: fileName,
       image: { type: 'jpeg', quality: 0.98 },
       html2canvas: { scale: 2, useCORS: true },
       jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
     };
     html2pdf().set(opt).from(element).save();
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: user?.fullName ? `${user.fullName}_SmartCV` : 'SmartCV_Resume',
  });
  
  // Resume Data State
  const [resumeData, setResumeData] = useState({
    personal: { fullName: '', email: '', phone: '', linkedin: '', photo: '' },
    education: '',
    experience: '',
    skills: [] as string[],
    projects: '',
    achievements: '',
    targetJd: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [generatedResume, setGeneratedResume] = useState<any>(null);

  const [userRole, setUserRole] = useState('Professional');

  // ... (keeping effect hooks unchanged) ...
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth!, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const { getDoc, doc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const userDoc = await getDoc(doc(db as any, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().jobRole) {
            setUserRole(userDoc.data().jobRole);
          }
        } catch(e) {}
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isUploadMode) {
      const name = sessionStorage.getItem('uploadedResumeName');
      if (name) setUploadedFileName(name);
    }
  }, [isUploadMode]);

  const handleInputChange = (section: string, field: string, value: string) => {
    if (field) {
      setResumeData(prev => ({
        ...prev,
        [section]: { ...(prev as any)[section], [field]: value }
      }));
    } else {
      setResumeData(prev => ({ ...prev, [section]: value }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleInputChange('personal', 'photo', event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setResumeData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const message = `
        Role: ${userRole}
        Info: ${JSON.stringify({ ...resumeData.personal, photo: 'REMOVED_FOR_AI' })}
        Edu: ${resumeData.education}
        Skills: ${resumeData.skills.join(', ')}
        Exp: ${resumeData.experience}
        Proj: ${resumeData.projects}
        Achv: ${resumeData.achievements}
        JD: ${resumeData.targetJd}
        
        CRITICAL: Generate a very brief, ATS-optimized resume in valid JSON. Be extremely fast. Output ONLY the necessary JSON fields (professional_summary, skills array, work_experience array, projects array, keyword_match_score, recommended_template). Keep descriptions under 2 sentences. No conversational text.
      `;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/agents/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.email || 'guest',
          message
        })
      });
      const data = await response.json();
      const parsedResult = data.result || data.data?.module_outputs || (data.data && Object.keys(data.data).length > 0 ? data.data : null) || data;
      if (parsedResult) {
        setGeneratedResume(parsedResult);
      }
    } catch (error) {
      console.error('Resume generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  const sections = [
    { id: 'personal', title: 'Personal Info' },
    { id: 'education', title: 'Education' },
    { id: 'skills', title: 'Skills' },
    { id: 'experience', title: 'Work Experience' },
    { id: 'projects', title: 'Projects' },
    { id: 'achievements', title: 'Achievements' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-[1240px] mx-auto w-full flex flex-col h-full pb-10">
      {isUploadMode && uploadedFileName && (
        <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 font-medium">
          <span className="text-lg">📎</span>
          <span>Uploaded: <strong>{uploadedFileName}</strong> — fill in any missing details below and click Generate.</span>
        </div>
      )}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resume Builder</h1>
          <p className="text-muted-foreground font-medium text-sm">Generate ATS-optimized, blockchain-verified resumes</p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={generating}
          className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50"
        >
          {generating ? 'Generating...' : '✨ Generate AI Resume'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Form Section */}
        <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar lg:max-h-[75vh]">
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
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0">
                          {resumeData.personal.photo ? (
                            <img src={resumeData.personal.photo} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-muted-foreground text-xs">No img</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Profile Photo</label>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer w-full"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                          <input 
                            value={resumeData.personal.fullName}
                            onChange={(e) => handleInputChange('personal', 'fullName', e.target.value)}
                            className="w-full p-2.5 bg-background/60 border border-border/40 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm" 
                            placeholder="John Doe" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email</label>
                          <input 
                            value={resumeData.personal.email}
                            onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
                            className="w-full p-2.5 bg-background/60 border border-border/40 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm" 
                            placeholder="john@email.com" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone</label>
                          <input 
                            value={resumeData.personal.phone}
                            onChange={(e) => handleInputChange('personal', 'phone', e.target.value)}
                            className="w-full p-2.5 bg-background/60 border border-border/40 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm" 
                            placeholder="+1 234 567 8900" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">LinkedIn</label>
                          <input 
                            value={resumeData.personal.linkedin}
                            onChange={(e) => handleInputChange('personal', 'linkedin', e.target.value)}
                            className="w-full p-2.5 bg-background/60 border border-border/40 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm" 
                            placeholder="linkedin.com/in/..." 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {['education', 'experience', 'projects', 'achievements'].includes(section.id) && (
                    <textarea 
                      value={(resumeData as any)[section.id]}
                      onChange={(e) => handleInputChange(section.id, '', e.target.value)}
                      className="w-full h-32 p-4 bg-background/60 border border-border/40 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-xs resize-none"
                      placeholder={`Enter your ${section.title} details here...`}
                    />
                  )}
                  {(section.id === 'skills') && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                         <input 
                           value={newSkill}
                           onChange={(e) => setNewSkill(e.target.value)}
                           onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                           className="flex-1 p-2.5 bg-background/60 border border-border/40 rounded-lg outline-none text-sm" 
                           placeholder="Add skill..." 
                         />
                         <button onClick={addSkill} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">+</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map((s, i) => (
                          <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg border border-primary/20 flex items-center gap-2">
                            {s}
                            <button onClick={() => setResumeData(prev => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== i) }))}>×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <div className="pt-6">
             <h3 className="font-bold text-foreground mb-3 text-sm">Target JD (Optional but Recommended)</h3>
             <div className="bg-card/80 backdrop-blur-[12px] p-5 rounded-xl border border-border/60 shadow-sm">
                <textarea 
                  value={resumeData.targetJd}
                  onChange={(e) => handleInputChange('targetJd', '', e.target.value)}
                  className="w-full h-24 p-4 bg-background/60 border border-border/40 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 resize-none text-xs"
                  placeholder="Paste the job description you are targeting..."
                />
             </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:w-[48%] flex flex-col">
           <div className="bg-white rounded-3xl border border-border/60 shadow-2xl p-8 flex-1 overflow-y-auto custom-scrollbar min-h-[600px] text-zinc-800">
              {!generatedResume ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-5 opacity-40">
                  <div className="text-5xl">📄</div>
                  <div className="space-y-2">
                     <h4 className="font-bold text-base">Resume preview will appear here</h4>
                     <p className="text-xs font-medium">Fill in your profile and click "Generate AI Resume"</p>
                  </div>
                </div>
              ) : (
                <div ref={componentRef} className={`${styles.container} animate-in fade-in duration-1000 relative`}>
                  {/* Photo Profile if available */}
                  {resumeData.personal.photo && (
                    <div className="absolute top-8 right-8 w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gray-100 flex items-center justify-center print:border-gray-200">
                       <img src={resumeData.personal.photo} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {/* Header */}
                  <div className={styles.header}>
                    <h2 className={`${styles.name} ${resumeData.personal.photo ? 'pr-28' : ''}`}>{resumeData.personal.fullName || user?.displayName || 'YOUR NAME'}</h2>
                    <div className={`flex flex-wrap gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-2 ${resumeData.personal.photo ? 'pr-28' : ''}`}>
                      {resumeData.personal.email && (
                        <span><a href={`mailto:${resumeData.personal.email}`} className="hover:text-primary transition-colors">{resumeData.personal.email}</a></span>
                      )}
                      {resumeData.personal.phone && (
                        <><span>•</span><span>{resumeData.personal.phone}</span></>
                      )}
                      {resumeData.personal.linkedin && (
                        <><span>•</span><span><a href={resumeData.personal.linkedin.startsWith('http') ? resumeData.personal.linkedin : `https://${resumeData.personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a></span></>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <h3 className={styles.sectionHead}>Professional Summary</h3>
                    <p className="text-[11px] leading-relaxed text-zinc-600">{generatedResume.professional_summary}</p>
                  </div>

                  {/* Skills */}
                  <div className="space-y-2">
                    <h3 className={styles.sectionHead}>Technical Expertise</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {generatedResume.skills?.map((s: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-zinc-50 border border-zinc-200 rounded text-[9px] font-bold text-zinc-700">{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="space-y-4">
                    <h3 className={styles.sectionHead}>Professional Experience</h3>
                    {generatedResume.work_experience?.map((exp: any, i: number) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <h4 className="font-bold text-xs">{exp.role} @ {exp.company}</h4>
                          <span className="text-[9px] font-bold text-zinc-400">{exp.duration}</span>
                        </div>
                        <ul className={styles.bullet}>
                          {exp.bullets?.map((b: string, j: number) => (
                            <li key={j} className="text-[10px] text-zinc-600 leading-relaxed">{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Projects */}
                  <div className="space-y-4">
                    <h3 className={styles.sectionHead}>Key Projects</h3>
                    {generatedResume.projects?.map((proj: any, i: number) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between items-baseline gap-2">
                          <h4 className="font-bold text-xs">
                            {proj.link ? <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{proj.name}</a> : proj.name}
                          </h4>
                          {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-[9px] text-zinc-400 hover:text-primary transition-colors whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{proj.link}</a>}
                        </div>
                        <p className="text-[10px] text-zinc-600 leading-relaxed">{proj.description}</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {proj.technologies?.map((t: string, j: number) => (
                            <span key={j} className="text-[8px] font-bold text-primary/70">{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Analytics */}
                  <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
                     <div className="space-y-1">
                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">ATS Match Score</p>
                        <p className="text-xl font-black text-primary italic">{generatedResume.keyword_match_score}%</p>
                     </div>
                     <div className="text-right space-y-1">
                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Template Suggestion</p>
                        <p className="text-[10px] font-bold text-zinc-800">{generatedResume.recommended_template}</p>
                     </div>
                  </div>
                </div>
              )}
           </div>
           
           {generatedResume && (
             <div className="mt-4">
               <button onClick={() => handlePrint()} className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                 🖨️ Download or Print PDF
               </button>
               <p className="text-[10px] text-center text-muted-foreground mt-2 font-medium">Use 'Save as PDF' in the destination dropdown for best formatting.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
