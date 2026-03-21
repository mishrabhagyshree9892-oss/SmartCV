"use client";
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, PlusCircle, Upload, CheckCircle2 } from 'lucide-react';

export default function SelectResumeOption() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        // Store file data in sessionStorage so builder page can access it
        sessionStorage.setItem('uploadedResumeName', file.name);
        sessionStorage.setItem('uploadedResumeType', file.type);
        sessionStorage.setItem('uploadedResumeData', reader.result as string);
      } catch {
        // sessionStorage might be full; proceed anyway
      }
      router.push(`/builder?templateId=${templateId}&upload=true`);
    };
    reader.onerror = () => setUploading(false);
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full">
         <Link href="/templates" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors mb-12 font-bold text-sm">
            <ArrowLeft size={20} />
            Back to templates
         </Link>

         <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">How would you like to build your resume?</h1>
            <p className="text-gray-500 font-medium">Choose an option below to start using your selected template.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Create New Option */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all group cursor-pointer flex flex-col items-center text-center">
               <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 group-hover:bg-green-100 transition-colors relative">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-green-500">
                     <PlusCircle size={32} />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-green-500">
                     <CheckCircle2 size={24} />
                  </div>
               </div>
               
               <h2 className="text-2xl font-bold text-gray-900 mb-4">Start with a new resume</h2>
               <p className="text-gray-500 text-sm leading-relaxed mb-10 flex-grow">
                  Get step-by-step support with expert content suggestions at your fingertips!
               </p>

               <Link href={`/builder?templateId=${templateId}`} className="w-full">
                  <button className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-blue-700 transition-all">
                     Create new
                  </button>
               </Link>
            </div>

            {/* Upload Existing Option */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all group flex flex-col items-center text-center">
               <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8 group-hover:bg-blue-100 transition-colors relative">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-500">
                     <Upload size={32} />
                  </div>
               </div>
               
               <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload an existing resume</h2>
               <p className="text-gray-500 text-sm leading-relaxed mb-10 flex-grow">
                  Edit your resume using expertly generated content in a fresh, new design.
               </p>

               {/* Hidden real file input */}
               <input
                  ref={fileInputRef}
                  type="file"
                  accept=".doc,.docx,.pdf,.html,.rtf,.txt"
                  className="hidden"
                  onChange={handleFileChange}
               />

               <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-4 bg-amber-400 text-gray-900 font-bold rounded-2xl shadow-lg shadow-amber-400/20 hover:bg-amber-500 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
               >
                  <Upload size={20} />
                  {uploading ? 'Opening builder...' : 'Choose file'}
               </button>
               
               <p className="mt-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                  DOC, DOCX, PDF, HTML, RTF, TXT
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
