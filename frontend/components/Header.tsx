"use client";
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useNotifications } from '@/context/NotificationContext';
import NotificationList from './NotificationList';
import { Sun, Moon, Bell } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const getTitle = () => {
    switch (pathname) {
      case '/': return 'Dashboard';
      case '/builder': return 'Resume Builder';
      case '/analyzer': return 'JD Analyzer';
      case '/coach': return 'Interview Coach';
      case '/insights': return 'Skill Insights';
      case '/assessments': return 'Assessments';
      case '/employer': return 'Employer Portal';
      case '/signup': return 'SmartCV | Join Now';
      case '/login': return 'SmartCV | Sign In';
      default: return 'SmartCV';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-card/60 backdrop-blur-[16px] border-b border-white/[0.18] px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button className="lg:hidden p-1.5 rounded-md hover:bg-secondary/50">
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <h1 className="text-sm font-bold text-foreground hidden sm:block">{getTitle()}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="items-center rounded-full px-2.5 py-0.5 font-bold bg-primary/10 text-primary text-[10px] border border-primary/20 hidden sm:flex">
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> 
          Enterprise Mode
        </div>
        
        <div className="relative cursor-pointer group">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded-lg hover:bg-muted transition-all relative"
          >
            <Bell className={`w-4 h-4 ${showNotifications ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} transition-colors`} />
            {unreadCount > 0 && (
              <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-primary text-[7px] text-white flex items-center justify-center font-bold border border-background">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </button>
          
          {showNotifications && <NotificationList />}
        </div>

        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-all border border-border"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>
      </div>
    </header>
  );
}
