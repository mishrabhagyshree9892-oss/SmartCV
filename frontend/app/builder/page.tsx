"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import CryptoJS from 'crypto-js';

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



  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: user?.fullName ? `${user.fullName}_SmartCV` : 'SmartCV_Resume',
  });
  
  // Resume Data State
  const [resumeData, setResumeData] = useState({
    personal: { fullName: '', email: '', phone: '', linkedin: '', photo: '', github: '', behance: '', kaggle: '', videoUrl: '' },
    education: '',
    experienceType: 'fresher' as 'fresher' | 'experience',
    experienceDetails: { company: '', designation: '', duration: '' },
    experience: '',
    skills: [] as string[],
    projects: '',
    achievements: '',
    targetJd: '',
    digilockerVerified: false
  });
  const [newSkill, setNewSkill] = useState('');
  const [generatedResume, setGeneratedResume] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleDigilockerMock = () => {
    setIsVerifying(true);
    // Simulate API delay and verification
    setTimeout(() => {
      setResumeData(prev => ({
        ...prev,
        education: "B.Tech in Computer Science, State University, 2018-2022 (Verified)\nClass 12th Board, Central Board, 2018 (Verified)",
        digilockerVerified: true
      }));
      setIsVerifying(false);
    }, 2000);
  };

  const [userRole, setUserRole] = useState('Professional');
  const [documentType, setDocumentType] = useState('Resume'); // 'Resume' or 'CV'
  const [privacy, setPrivacy] = useState({ hideEmail: false, hidePhone: false });
  const [cvHash, setCvHash] = useState<string | null>(null);

  // Compute Blockchain Hash dynamically when data changes
  useEffect(() => {
    if (generatedResume) {
       const rawString = JSON.stringify(generatedResume) + JSON.stringify(resumeData) + JSON.stringify(privacy);
       setCvHash(CryptoJS.SHA256(rawString).toString());
    }
  }, [generatedResume, resumeData, privacy]);

  const [savingAction, setSavingAction] = useState(false);

  const handleSaveToHub = async () => {
    if (!user) {
      alert("Please login to save your profile to the Candidate Hub.");
      return;
    }
    if (!generatedResume) return;

    setSavingAction(true);
    try {
      // Check if user already has a saved profile 
      const q = query(collection(db, 'resumes'), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      
      const profileData = {
         userId: user.uid,
         email: user.email || resumeData.personal.email,
         fullName: resumeData.personal.fullName || user.displayName || 'Anonymous Candidate',
         role: generatedResume.professional_summary?.substring(0, 50) + "..." || "Candidate",
         score: generatedResume.keyword_match_score || 0,
         verified: resumeData.digilockerVerified,
         link: resumeData.personal.linkedin || '',
         github: resumeData.personal.github || '',
         videoUrl: resumeData.personal.videoUrl || '',
         hash: cvHash || '',
         skills: generatedResume.skills || resumeData.skills || [],
         privacy: privacy,
         resumeData: resumeData,
         generatedResume: generatedResume,
         updatedAt: serverTimestamp(),
      };

      if (!snapshot.empty) {
         // Update existing profile
         const docId = snapshot.docs[0].id;
         await updateDoc(doc(db, 'resumes', docId), profileData);
      } else {
         // Create new profile with base analytics
         await addDoc(collection(db, 'resumes'), {
            ...profileData,
            views: 0,
            downloads: 0,
            searchAppearances: 0,
            createdAt: serverTimestamp(),
         });
      }
      alert("✅ Successfully updated to your Candidate Hub Profile!");
    } catch (err: any) {
      console.error("Firestore Save Error:", err);
      alert("Failed to save profile. Is Firebase setup properly?");
    } finally {
      setSavingAction(false);
    }
  };

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
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.jobRole) setUserRole(data.jobRole);
            
            // Auto-fill personal data from profile if still empty
            setResumeData(prev => ({
              ...prev,
              personal: {
                ...prev.personal,
                fullName: prev.personal.fullName || data.fullName || '',
                email: prev.personal.email || data.email || currentUser.email || '',
                phone: prev.personal.phone || data.phone || '',
              }
            }));
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
    if (section === 'experienceDetails') {
       setResumeData(prev => ({
         ...prev,
         experienceDetails: { ...prev.experienceDetails, [field]: value }
       }));
       return;
    }
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
        Exp Type: ${resumeData.experienceType}
        ${resumeData.experienceType === 'experience' ? `Current/Last Job: ${resumeData.experienceDetails.designation} at ${resumeData.experienceDetails.company} (${resumeData.experienceDetails.duration})` : ''}
        Exp Details: ${resumeData.experience}
        Proj: ${resumeData.projects}
        Achv: ${resumeData.achievements}
        JD: ${resumeData.targetJd}
        
        CRITICAL: Generate a ${documentType === 'CV' ? 'detailed, comprehensive academic/professional CV (can span multiple pages). Include extensive detail on projects, research, tools, and achievements.' : 'very brief, ATS-optimized 1-page resume.'} Output ONLY the necessary JSON fields (professional_summary, skills array, work_experience array, projects array, education array (include degree, institution, duration objects), keyword_match_score, missing_keywords_for_jd array (strings)). ${documentType === 'Resume' ? 'Keep descriptions under 2 sentences.' : 'Expand bullet points with deep technical context.'} No conversational text.
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
      console.log('Parsed Resume Data:', parsedResult);
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
      <div className="mb-8 flex justify-between items-end border-b border-border/40 pb-5">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Document Builder</h1>
          <div className="flex items-center gap-3 mt-4">
            <button 
              onClick={() => setDocumentType('Resume')} 
              className={`px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${documentType === 'Resume' ? 'bg-zinc-900 text-white shadow-lg' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
            >
              Resume (1-2 Pages)
            </button>
            <button 
              onClick={() => setDocumentType('CV')} 
              className={`px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${documentType === 'CV' ? 'bg-zinc-900 text-white shadow-lg' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
            >
              CV (Detailed 3+ Pages)
            </button>
          </div>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={generating}
          className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {generating ? <span className="animate-pulse">Analyzing...</span> : `✨ Generate AI ${documentType}`}
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
                      
                      {/* Sub-section: Portfolio Links */}
                      <div className="pt-3 mt-3 border-t border-border/40 space-y-3">
                         <h4 className="text-[10px] font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                           <span>🌐</span> Portfolio Links
                         </h4>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <input 
                              value={resumeData.personal.github}
                              onChange={(e) => handleInputChange('personal', 'github', e.target.value)}
                              className="w-full p-2 bg-background border border-border/40 rounded outline-none focus:ring-1 focus:ring-primary text-xs" 
                              placeholder="github.com/..." 
                            />
                            <input 
                              value={resumeData.personal.behance}
                              onChange={(e) => handleInputChange('personal', 'behance', e.target.value)}
                              className="w-full p-2 bg-background border border-border/40 rounded outline-none focus:ring-1 focus:ring-primary text-xs" 
                              placeholder="behance.net/..." 
                            />
                            <input 
                              value={resumeData.personal.kaggle}
                              onChange={(e) => handleInputChange('personal', 'kaggle', e.target.value)}
                              className="w-full p-2 bg-background border border-border/40 rounded outline-none focus:ring-1 focus:ring-primary text-xs" 
                              placeholder="kaggle.com/..." 
                            />
                            <input 
                              value={resumeData.personal.videoUrl}
                              onChange={(e) => handleInputChange('personal', 'videoUrl', e.target.value)}
                              className="w-full p-2 bg-emerald-50/50 border border-emerald-500/30 rounded outline-none focus:ring-1 focus:ring-emerald-500 text-xs placeholder:text-emerald-700/40" 
                              placeholder="Video Resume URL (Loom/YT)" 
                            />
                         </div>
                      </div>
                    </div>
                  )}
                  {section.id === 'experience' && (
                    <div className="mb-4 flex flex-col gap-4">
                       <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-xl border border-border/40">
                          <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground cursor-pointer transition-colors hover:text-foreground">
                             <input 
                               type="radio" 
                               name="experienceType" 
                               checked={resumeData.experienceType === 'fresher'} 
                               onChange={() => setResumeData(prev => ({...prev, experienceType: 'fresher'}))}
                               className="accent-primary" 
                             />
                             Fresher
                          </label>
                          <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground cursor-pointer transition-colors hover:text-foreground">
                             <input 
                               type="radio" 
                               name="experienceType" 
                               checked={resumeData.experienceType === 'experience'} 
                               onChange={() => setResumeData(prev => ({...prev, experienceType: 'experience'}))}
                               className="accent-primary" 
                             />
                             Work Experience
                          </label>
                       </div>

                       {resumeData.experienceType === 'experience' && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2">
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Company Name</label>
                                <input 
                                   value={resumeData.experienceDetails.company}
                                   onChange={(e) => handleInputChange('experienceDetails', 'company', e.target.value)}
                                   className="w-full p-2.5 bg-background/60 border border-border/40 rounded-lg outline-none text-xs" 
                                   placeholder="e.g. Google" 
                                />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Designation</label>
                                <input 
                                   value={resumeData.experienceDetails.designation}
                                   onChange={(e) => handleInputChange('experienceDetails', 'designation', e.target.value)}
                                   className="w-full p-2.5 bg-background/60 border border-border/40 rounded-lg outline-none text-xs" 
                                   placeholder="e.g. SDE-1" 
                                />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Duration</label>
                                <input 
                                   value={resumeData.experienceDetails.duration}
                                   onChange={(e) => handleInputChange('experienceDetails', 'duration', e.target.value)}
                                   className="w-full p-2.5 bg-background/60 border border-border/40 rounded-lg outline-none text-xs" 
                                   placeholder="e.g. 2 yrs" 
                                />
                             </div>
                          </div>
                       )}
                    </div>
                  )}
                  {['education', 'experience', 'projects', 'achievements'].includes(section.id) && (
                    <div className="space-y-3">
                      {section.id === 'education' && (
                         <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                            <div className="flex items-center gap-2">
                               <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                  <span className="text-emerald-600 font-bold text-xs">DL</span>
                               </div>
                               <div>
                                  <h4 className="text-[11px] font-bold text-emerald-900">DigiLocker Verification</h4>
                                  <p className="text-[9px] text-emerald-700">Import verified academic records directly.</p>
                               </div>
                            </div>
                            {resumeData.digilockerVerified ? (
                               <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full shadow-sm">
                                  <span>✓</span> Verified
                               </div>
                            ) : (
                               <button 
                                 onClick={handleDigilockerMock}
                                 disabled={isVerifying}
                                 className="px-4 py-1.5 bg-white text-emerald-700 text-[10px] font-bold rounded-full shadow-sm border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                               >
                                 {isVerifying ? 'Authenticating...' : 'Connect'}
                                </button>
                            )}
                         </div>
                      )}
                      <textarea 
                        value={(resumeData as any)[section.id]}
                        onChange={(e) => handleInputChange(section.id, '', e.target.value)}
                        className="w-full h-32 p-4 bg-background/60 border border-border/40 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-xs resize-none"
                        placeholder={section.id === 'experience' && resumeData.experienceType === 'fresher' ? "Describe any internships, volunteering or academic leadership..." : `Describe your ${section.title} details here...`}
                      />
                    </div>
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

          <div className="pt-6 border-t border-border/40 mt-6 space-y-6">
             {/* Target JD */}
             <div>
               <h3 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2"><span>🎯</span> Target JD (Optional)</h3>
               <div className="bg-card/80 backdrop-blur-[12px] p-5 rounded-xl border border-border/60 shadow-sm">
                  <textarea 
                    value={resumeData.targetJd}
                    onChange={(e) => handleInputChange('targetJd', '', e.target.value)}
                    className="w-full h-24 p-4 bg-background/60 border border-border/40 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 resize-none text-xs"
                    placeholder="Paste the job description you are targeting..."
                  />
               </div>
             </div>

             {/* Privacy Filters */}
             <div>
               <h3 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2"><span>🔐</span> Privacy Settings</h3>
               <div className="bg-card/80 backdrop-blur-[12px] p-5 rounded-xl border border-border/60 shadow-sm flex flex-wrap items-center gap-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                     <input type="checkbox" checked={privacy.hideEmail} onChange={(e) => setPrivacy(p => ({ ...p, hideEmail: e.target.checked }))} className="accent-primary w-4 h-4 cursor-pointer" />
                     Mask Email from Recruiters
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                     <input type="checkbox" checked={privacy.hidePhone} onChange={(e) => setPrivacy(p => ({ ...p, hidePhone: e.target.checked }))} className="accent-primary w-4 h-4 cursor-pointer" />
                     Mask Phone from Recruiters
                  </label>
               </div>
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
                    <div className={`flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-2 ${resumeData.personal.photo ? 'pr-28' : ''}`}>
                      {resumeData.personal.email && !privacy.hideEmail && (
                        <span><a href={`mailto:${resumeData.personal.email}`} className="hover:text-primary transition-colors">{resumeData.personal.email}</a></span>
                      )}
                      {resumeData.personal.phone && !privacy.hidePhone && (
                        <><span>•</span><span>{resumeData.personal.phone}</span></>
                      )}
                    </div>
                    
                    {/* Portfolio Links Render */}
                    <div className={`flex flex-wrap gap-3 mt-3 text-[9px] font-bold tracking-wider ${resumeData.personal.photo ? 'pr-28' : ''}`}>
                       {resumeData.personal.linkedin && (
                         <a href={resumeData.personal.linkedin.startsWith('http') ? resumeData.personal.linkedin : `https://${resumeData.personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 shadow-sm rounded flex items-center gap-1 hover:bg-blue-100 transition-colors"><span>in</span> LinkedIn</a>
                       )}
                       {resumeData.personal.github && (
                         <a href={resumeData.personal.github.startsWith('http') ? resumeData.personal.github : `https://${resumeData.personal.github}`} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-zinc-100 text-zinc-800 border border-zinc-300 shadow-sm rounded flex items-center gap-1 hover:bg-zinc-200 transition-colors"><span>⌨</span> GitHub</a>
                       )}
                       {resumeData.personal.behance && (
                         <a href={resumeData.personal.behance.startsWith('http') ? resumeData.personal.behance : `https://${resumeData.personal.behance}`} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm rounded flex items-center gap-1 hover:bg-indigo-100 transition-colors"><span>Bē</span> Behance</a>
                       )}
                       {resumeData.personal.kaggle && (
                         <a href={resumeData.personal.kaggle.startsWith('http') ? resumeData.personal.kaggle : `https://${resumeData.personal.kaggle}`} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm rounded flex items-center gap-1 hover:bg-cyan-100 transition-colors"><span>K</span> Kaggle</a>
                       )}
                       {resumeData.personal.videoUrl && (
                         <a href={resumeData.personal.videoUrl.startsWith('http') ? resumeData.personal.videoUrl : `https://${resumeData.personal.videoUrl}`} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-emerald-500 text-white shadow-sm rounded flex items-center gap-1 hover:bg-emerald-600 transition-colors animate-pulse"><span>▶</span> Play Video Resume</a>
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

                  {/* Education */}
                  <div className="space-y-4">
                    <h3 className={styles.sectionHead}>Academic Background</h3>
                    {generatedResume.education?.map((edu: any, i: number) => (
                      <div key={i} className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-xs flex items-center gap-2">
                             {edu.degree}
                             {resumeData.digilockerVerified && (
                               <span title="Verified by DigiLocker" className="inline-flex items-center justify-center w-3 h-3 bg-emerald-500 text-white rounded-full text-[6px]">✓</span>
                             )}
                          </h4>
                          <span className="text-[10px] text-zinc-600">{edu.institution}</span>
                        </div>
                        <span className="text-[9px] font-bold text-zinc-400">{edu.duration}</span>
                      </div>
                    ))}
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

                  {/* Footer Analytics + Blockchain Verification */}
                  <div className="mt-8 pt-6 border-t border-zinc-100 flex justify-between items-end gap-6">
                     <div className="flex items-center gap-4 shrink-0">
                        {cvHash && (
                          <div className="p-1.5 bg-white border border-zinc-200 rounded-lg shadow-sm">
                            <QRCodeSVG value={`https://smartcv.app/verify/${cvHash}`} size={40} />
                          </div>
                        )}
                        <div className="space-y-1">
                           <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5H5a2 2 0 0 0 0 4h14"/></svg> 
                             Blockchain Verified
                           </p>
                           <p className="text-[7px] font-mono text-zinc-500 w-32 truncate" title={cvHash || ''}>{cvHash}</p>
                        </div>
                     </div>
                     <div className="flex-1 flex flex-col items-end gap-3 text-right">
                        <div className="space-y-1">
                           <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">ATS Match Score</p>
                           <p className="text-xl font-black text-primary italic">{generatedResume.keyword_match_score || 0}%</p>
                        </div>
                        {generatedResume.missing_keywords_for_jd && generatedResume.missing_keywords_for_jd.length > 0 && (
                          <div className="space-y-1 w-full max-w-[200px]">
                             <p className="text-[8px] font-bold text-rose-500 uppercase tracking-widest text-right">Missing JD Keywords</p>
                             <div className="flex flex-wrap gap-1 justify-end">
                               {generatedResume.missing_keywords_for_jd.map((kw: string, i: number) => (
                                 <span key={i} className="text-[7px] px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded font-semibold">{kw}</span>
                               ))}
                             </div>
                          </div>
                        )}
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
               
               <button 
                 onClick={handleSaveToHub} 
                 disabled={savingAction || !user}
                 className="w-full mt-4 py-4 bg-zinc-900 border border-zinc-700 text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
               >
                 {savingAction ? <span className="animate-pulse">Saving to Hub...</span> : '💾 Save & Publish to Candidate Hub'}
               </button>
               {!user && <p className="text-[10px] text-center text-rose-500 mt-2 font-bold">You must be logged in to publish.</p>}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
