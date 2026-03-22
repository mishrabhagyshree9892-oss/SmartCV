"use client";
import { useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function ProfileSetup({ onComplete }: { onComplete: () => void }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    jobTitle: '',
    experience: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !auth.currentUser || !db) return;
    setLoading(true);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        ...formData,
        jobRole: formData.jobTitle, // Ensure both are saved or map it
        email: auth.currentUser.email,
        updatedAt: new Date(),
        profileCompleted: true
      }, { merge: true });
      onComplete();
    } catch (error) {
      console.error("Error saving profile:", error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl p-8 animate-in zoom-in duration-300 relative z-50">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl mx-auto mb-4">
             🎉
          </div>
          <h2 className="text-2xl font-black text-foreground">Welcome to SmartCV!</h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">Signup successful. Let&apos;s set up your dashboard preferences.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Full Name</label>
            <input 
              required
              type="text" 
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full p-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Job Title</label>
              <input 
                required
                type="text" 
                placeholder="e.g., Senior Designer, Chef, Data Analyst"
                value={formData.jobTitle}
                onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                className="w-full p-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Phone</label>
              <input 
                required
                type="tel" 
                placeholder="+1 234 567 890"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Brief Bio</label>
            <textarea 
              placeholder="Tell us a bit about yourself..."
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full p-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm h-24 resize-none"
            />
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 mt-4"
          >
            {loading ? 'Saving Preferences...' : 'Finish Setup & Open Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
