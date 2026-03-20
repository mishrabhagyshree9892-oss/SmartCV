"use client";
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  const getTitle = () => {
    switch (pathname) {
      case '/': return 'Dashboard';
      case '/builder': return 'Resume Builder';
      case '/analyzer': return 'JD Analyzer';
      case '/coach': return 'Interview Coach';
      case '/insights': return 'Skill Insights';
      case '/assessments': return 'Assessments';
      case '/employer': return 'Employer Portal';
      case '/signup': return 'Re-Resume_Me | Join Now';
      case '/login': return 'Re-Resume_Me | Sign In';
      default: return 'Re-Resume_Me';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-card/60 backdrop-blur-[16px] border-b border-white/[0.18] px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button className="lg:hidden p-1.5 rounded-md hover:bg-secondary/50">
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <h1 className="text-sm font-bold text-gray-900 hidden sm:block">{getTitle()}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="items-center rounded-full px-2.5 py-0.5 font-bold bg-primary/10 text-primary text-[10px] border border-primary/20 hidden sm:flex">
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> 
          Enterprise Mode
        </div>
        
        <div className="relative cursor-pointer group">
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary text-[7px] text-white flex items-center justify-center font-bold">3</div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-400 cursor-pointer whitespace-nowrap" htmlFor="sample-toggle">Sample Data</label>
          <div className="w-9 h-5 bg-gray-200 rounded-full relative cursor-pointer" id="sample-toggle">
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
          </div>
        </div>
      </div>
    </header>
  );
}
