"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/', icon: <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> },
    { name: 'Resume Builder', href: '/builder', icon: <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
    { name: 'JD Analyzer', href: '/analyzer', icon: <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg> },
    { name: 'Interview Coach', href: '/coach', icon: <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg> },
    { name: 'Skill Insights', href: '/insights', icon: <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg> },
    { name: 'Assessments', href: '/assessments', icon: <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> },
    { name: 'Employer Portal', href: '/employer', icon: <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
  ];

  return (
    <aside className="fixed lg:sticky top-0 left-0 z-40 h-screen w-[240px] bg-card/90 backdrop-blur-[20px] border-r border-border flex flex-col transition-transform duration-300">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.15)]">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-primary" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-foreground tracking-tight">SmartCV</h2>
            <div className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[9px] px-1.5 py-0 border border-primary/20 font-bold uppercase">Enterprise</div>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all ${
              pathname === link.href 
                ? 'bg-primary/10 text-primary font-bold' 
                : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <span className={pathname === link.href ? 'text-primary' : ''}>{link.icon}</span>
            <span className="flex-1 text-left">{link.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-3 mt-auto border-t border-border bg-muted/30 space-y-2">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-card/50 border border-border">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] text-muted-foreground font-bold">Blockchain: Active</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-card/50 border border-border">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-[10px] text-muted-foreground font-bold">Proctoring: Online</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1">
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-muted-foreground/30" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <span className="text-[9px] text-muted-foreground/30 font-medium">Secured by SmartCV</span>
        </div>
      </div>
    </aside>
  );
}
