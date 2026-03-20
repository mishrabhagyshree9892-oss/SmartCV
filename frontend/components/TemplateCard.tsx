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
      <div className="aspect-[3/4] p-6 bg-gray-50 flex flex-col gap-4 overflow-hidden relative">
        {/* Placeholder for actual resume preview - simulated with divs */}
        <div className="flex gap-4 items-start">
          {template.hasPhoto && (
            <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-white shadow-sm flex-shrink-0" />
          )}
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded-full" style={{ backgroundColor: selectedColor }} />
            <div className="h-2 w-full bg-gray-200 rounded-full" />
            <div className="h-2 w-5/6 bg-gray-200 rounded-full" />
          </div>
        </div>

        <div className={`grid ${template.columns === 2 ? 'grid-cols-3' : 'grid-cols-1'} gap-4 mt-2`}>
            {template.columns === 2 && (
                <div className="col-span-1 space-y-4">
                    <div className="h-2 w-full bg-gray-200 rounded-full" />
                    <div className="h-2 w-3/4 bg-gray-200 rounded-full" />
                    <div className="h-20 w-full rounded-xl" style={{ backgroundColor: `${selectedColor}15` }} />
                </div>
            )}
            <div className={`${template.columns === 2 ? 'col-span-2' : 'col-span-1'} space-y-4`}>
                <div className="space-y-2">
                    <div className="h-1 w-20 rounded-full" style={{ backgroundColor: selectedColor }} />
                    <div className="h-2 w-full bg-gray-200 rounded-full" />
                    <div className="h-2 w-full bg-gray-200 rounded-full" />
                    <div className="h-2 w-5/6 bg-gray-200 rounded-full" />
                </div>
                {template.hasGraphics && (
                   <div className="flex gap-2">
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: selectedColor }} />
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: selectedColor }} />
                   </div>
                )}
                <div className="space-y-2">
                    <div className="h-1 w-20 rounded-full" style={{ backgroundColor: selectedColor }} />
                    <div className="h-2 w-full bg-gray-200 rounded-full" />
                    <div className="h-2 w-full bg-gray-200 rounded-full" />
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
