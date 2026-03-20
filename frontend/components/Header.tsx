"use client";
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useNotifications } from '@/context/NotificationContext';
import NotificationList from './NotificationList';
import { Sun, Moon, Bell, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && db) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setUser({ ...currentUser, ...userDoc.data() });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };
  
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

        {user && (
          <div className="flex items-center gap-3 pl-2 border-l border-border ml-1">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[11px] font-bold text-foreground leading-tight">{user.fullName || 'User'}</span>
              <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">Professional Account</span>
            </div>
            <div className="relative group">
               <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shadow-sm group-hover:bg-primary/20 transition-all cursor-pointer">
                 {getInitials(user.fullName)}
               </div>
               
               {/* Simple logout tooltip/menu on hover or click */}
               <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
                  <div className="px-4 py-2 border-b border-border mb-1">
                    <p className="text-[11px] font-bold truncate">{user.fullName}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-[11px] font-medium text-rose-500 hover:bg-muted transition-all"
                  >
                    <LogOut className="w-3 h-3" />
                    Sign Out
                  </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
