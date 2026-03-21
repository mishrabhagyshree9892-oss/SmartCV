import { useState } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';

interface TemplateCardProps {
  template: any;
  selectedColor: string;
}

export default function TemplateCard({ template, selectedColor }: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative group bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden cursor-pointer ${isHovered ? 'border-primary shadow-xl -translate-y-1' : 'border-gray-100 shadow-sm'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Recommended Badge */}
      {template.recommended && (
        <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-amber-400 text-white text-[10px] font-bold rounded-full uppercase tracking-tighter shadow-sm">
          Recommended
        </div>
      )}

      {/* Template Preview (Mock Resume) */}
      <div className="aspect-[3/4] bg-white border border-gray-100/50 p-4 flex flex-col gap-3 overflow-hidden relative transform scale-100 origin-top">
        {/* Placeholder for actual resume preview - simulated with real micro text */}
        <div className="flex gap-4 items-center border-b pb-3" style={{ borderColor: `${selectedColor}20` }}>
          {template.hasPhoto && (
            <div className="w-10 h-10 rounded-full bg-gray-100 border-2 shadow-sm flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ borderColor: selectedColor }}>
               <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
            </div>
          )}
          <div className="flex-1">
            <h1 className="font-extrabold text-[12px] leading-tight" style={{ color: selectedColor }}>Alex Mercer</h1>
            <h2 className="text-[8px] font-bold text-gray-600 mt-0.5 uppercase tracking-widest">{template.category === 'Creative' ? 'Senior UI/UX Designer' : template.category === 'Modern' ? 'Product Manager' : 'Financial Analyst'}</h2>
            <div className="text-[5px] text-gray-500 mt-1 flex gap-2">
               <span>alex.m@example.com</span>
               <span>•</span>
               <span>555-0192</span>
               <span>•</span>
               <span>linkedin.com/in/alexm</span>
            </div>
          </div>
        </div>

        <div className={`grid ${template.columns === 2 ? 'grid-cols-3' : 'grid-cols-1'} gap-4 mt-1`}>
            {template.columns === 2 && (
                <div className="col-span-1 border-r pr-3" style={{ borderColor: `${selectedColor}15` }}>
                    <div className="mb-3">
                       <h3 className="text-[6px] font-bold uppercase tracking-widest mb-1.5" style={{ color: selectedColor }}>Skills</h3>
                       <div className="flex flex-col gap-1">
                         {["Strategic Planning", "Data Analysis", "Leadership", "Agile", "UI/UX"].map(s => (
                           <div key={s} className="text-[5px] font-semibold text-gray-600 bg-gray-50 px-1 py-0.5 rounded">{s}</div>
                         ))}
                       </div>
                    </div>
                    <div>
                       <h3 className="text-[6px] font-bold uppercase tracking-widest mb-1.5" style={{ color: selectedColor }}>Education</h3>
                       <p className="text-[5px] font-bold text-gray-700">MBA, Business Admin</p>
                       <p className="text-[4px] text-gray-400">Harvard University, 2018</p>
                    </div>
                </div>
            )}
            <div className={`${template.columns === 2 ? 'col-span-2' : 'col-span-1'} flex flex-col gap-3`}>
                <div>
                   <h3 className="text-[6px] font-bold uppercase tracking-widest mb-1.5 border-b pb-0.5" style={{ color: selectedColor, borderColor: `${selectedColor}30` }}>Professional Summary</h3>
                   <p className="text-[5.5px] text-gray-600 leading-relaxed">
                     Dedicated professional with 8+ years of experience delivering cross-functional projects and driving key metrics. Proven track record of increasing user retention by 40% and managing $5M budgets efficiently.
                   </p>
                </div>

                <div>
                   <h3 className="text-[6px] font-bold uppercase tracking-widest mb-1.5 border-b pb-0.5" style={{ color: selectedColor, borderColor: `${selectedColor}30` }}>Experience</h3>
                   
                   <div className="mb-2">
                     <div className="flex justify-between items-baseline">
                        <h4 className="text-[6px] font-bold text-gray-800">Senior Consultant</h4>
                        <span className="text-[4px] font-bold text-gray-400">2020 - Present</span>
                     </div>
                     <p className="text-[5px] text-gray-500 font-semibold mb-1">TechFlow Inc.</p>
                     <ul className="text-[5px] text-gray-600 pl-2 list-disc space-y-0.5">
                       <li>Led a team of 15 effectively.</li>
                       <li>Revamped core product design.</li>
                     </ul>
                   </div>

                   <div>
                     <div className="flex justify-between items-baseline">
                        <h4 className="text-[6px] font-bold text-gray-800">Specialist</h4>
                        <span className="text-[4px] font-bold text-gray-400">2018 - 2020</span>
                     </div>
                     <p className="text-[5px] text-gray-500 font-semibold mb-1">Global Corp</p>
                     <ul className="text-[5px] text-gray-600 pl-2 list-disc space-y-0.5">
                       <li>Managed operational budgets.</li>
                     </ul>
                   </div>
                </div>
            </div>
        </div>

        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-black/5 flex flex-col items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-white rounded-full p-3 shadow-lg mb-4 hover:scale-110 transition-transform">
                <Search className="text-primary" size={24} />
            </div>
            <Link href={`/templates/options?templateId=${template.id}`}>
               <button className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                  Choose template
               </button>
            </Link>
        </div>
      </div>

      {/* Info Footer */}
      <div className="p-4 bg-white border-t border-gray-50">
        <h3 className="font-bold text-gray-900">{template.name}</h3>
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{template.category}</p>
      </div>
    </div>
  );
}
