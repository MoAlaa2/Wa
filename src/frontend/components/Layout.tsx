
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Sidebar } from './Sidebar';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Globe, Bell, User as UserIcon, Menu, LogOut, Check, Info, 
  AlertTriangle, AlertOctagon, MessageSquare, ArrowRight, 
  LayoutDashboard, ShoppingBag, Bot, BarChart2, Settings, MessageCircle,
  Clock, Star, Pin, History
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { InternalNotification, UserRole, RecentPage } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { language, setLanguage, t, dir } = useLanguage();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // UI States
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  
  // Data States
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);
  const [pinnedPaths, setPinnedPaths] = useState<string[]>([]);

  // Refs
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Dynamic Configuration based on language
  const SHORTCUT_CONFIG: { 
    path: string; 
    label: string; 
    icon: React.ElementType; 
    roles: UserRole[] 
  }[] = useMemo(() => [
    { path: '/', label: t.common.dashboard, icon: LayoutDashboard, roles: ['admin', 'supervisor'] },
    { path: '/inbox', label: t.common.inbox, icon: MessageSquare, roles: ['admin', 'agent', 'supervisor', 'viewer'] },
    { path: '/orders', label: t.common.orders, icon: ShoppingBag, roles: ['admin', 'agent', 'supervisor'] },
    { path: '/automation/chatbot', label: t.common.automation, icon: Bot, roles: ['admin', 'supervisor'] },
    { path: '/analytics/messaging', label: t.common.analytics, icon: BarChart2, roles: ['admin', 'supervisor'] },
    { path: '/content/quick-replies', label: t.nav.quickReplies, icon: MessageCircle, roles: ['admin', 'agent', 'supervisor'] },
    { path: '/settings', label: t.common.settings, icon: Settings, roles: ['admin', 'supervisor', 'viewer'] },
  ], [t]);

  // --- RECENT PAGES LOGIC ---
  useEffect(() => {
    if (!user) return;
    const storageKey = `guthmi_recent_pages_${user.id}`;
    const saved = localStorage.getItem(storageKey);
    let currentRecents: RecentPage[] = saved ? JSON.parse(saved) : [];

    const currentConfig = SHORTCUT_CONFIG.find(s => s.path === location.pathname);
    if (currentConfig) {
      const newPage: RecentPage = {
        path: location.pathname,
        title: currentConfig.label,
        timestamp: Date.now()
      };
      currentRecents = currentRecents.filter(p => p.path !== location.pathname);
      currentRecents.unshift(newPage);
      if (currentRecents.length > 3) currentRecents = currentRecents.slice(0, 3);
      setRecentPages(currentRecents);
      localStorage.setItem(storageKey, JSON.stringify(currentRecents));
    }
    setIsUserDropdownOpen(false);
    setIsNotifOpen(false);
  }, [location.pathname, user?.id, SHORTCUT_CONFIG]);

  // --- PINNED SHORTCUTS LOGIC ---
  useEffect(() => {
    if (!user) return;
    const storageKey = `guthmi_pinned_${user.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) setPinnedPaths(JSON.parse(saved));
  }, [user?.id]);

  const togglePin = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) return;

    let newPinned = [...pinnedPaths];
    if (newPinned.includes(path)) {
      newPinned = newPinned.filter(p => p !== path);
    } else {
      if (newPinned.length >= 3) {
        alert("Maximum 3 pinned items allowed.");
        return;
      }
      newPinned.push(path);
    }
    
    setPinnedPaths(newPinned);
    localStorage.setItem(`guthmi_pinned_${user.id}`, JSON.stringify(newPinned));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    if (isNotifOpen || isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen, isUserDropdownOpen]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = async (notification: InternalNotification) => {
    if (!notification.read) {
      await markRead(notification.id);
    }
    if (notification.link) {
      setIsNotifOpen(false);
      navigate(notification.link);
    }
  };

  const getPriorityIcon = (priority: string, type: string) => {
    if (priority === 'CRITICAL') return <AlertOctagon size={16} className="text-red-500" />;
    if (priority === 'IMPORTANT') return <AlertTriangle size={16} className="text-orange-500" />;
    if (type === 'OPERATIONAL') return <MessageSquare size={16} className="text-blue-500" />;
    return <Info size={16} className="text-gray-400" />;
  };

  const getTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const dropdownNotifications = notifications.slice(0, 3);

  const renderShortcutItem = (item: typeof SHORTCUT_CONFIG[0], isPinnedSection = false) => {
    const isPinned = pinnedPaths.includes(item.path);
    if (isPinnedSection && !isPinned) return null;

    const Icon = item.icon;
    return (
      <Link 
        key={item.path} 
        to={item.path}
        className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-700 group transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon size={16} className="text-gray-400 group-hover:text-green-600"/>
          <span>{item.label}</span>
        </div>
        <button 
          onClick={(e) => togglePin(item.path, e)}
          className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-200 ${isPinned ? 'text-yellow-500 opacity-100' : 'text-gray-400'}`}
        >
          {isPinned ? <Pin size={14} className="fill-current" /> : <Pin size={14} />}
        </button>
      </Link>
    );
  };

  const availableShortcuts = useMemo(() => {
    if (!user) return [];
    return SHORTCUT_CONFIG.filter(s => s.roles.includes(user.role));
  }, [user, SHORTCUT_CONFIG]);

  const pinnedShortcuts = useMemo(() => {
    return availableShortcuts.filter(s => pinnedPaths.includes(s.path));
  }, [availableShortcuts, pinnedPaths]);

  return (
    <div className={`min-h-screen bg-surface flex flex-col ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className={`flex-1 transition-all duration-300 lg:ml-64 ${dir === 'rtl' ? 'lg:mr-64 lg:ml-0' : 'lg:ml-64'}`}>
        
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 px-4 lg:px-8 flex items-center justify-between">
          
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-800 truncate">
              Guthmi WA
            </h2>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4 rtl:space-x-reverse">
            
            {language === 'ar' && (
              <span className="hidden sm:inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full animate-pulse border border-green-200">
                🟢 {t.common.arabicEnabled}
              </span>
            )}

            <button 
              onClick={toggleLanguage}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors flex items-center"
              title={t.common.switchLanguage}
            >
              <Globe size={20} />
              <span className="ml-2 text-sm font-medium uppercase hidden sm:inline">{language}</span>
            </button>

            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`p-2 rounded-full transition-colors relative ${isNotifOpen ? 'bg-green-50 text-green-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {isNotifOpen && (
                <div className={`absolute top-12 right-0 rtl:left-0 rtl:right-auto w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 flex flex-col max-h-[80vh] origin-top-right transform transition-all`}>
                  <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-semibold text-gray-800">{t.internalNotifications.title}</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center">
                        <Check size={12} className="mr-1" /> {t.internalNotifications.markAllRead}
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-sm">
                        <Bell size={24} className="mx-auto mb-2 opacity-20" />
                        {t.internalNotifications.empty}
                      </div>
                    ) : (
                      dropdownNotifications.map(notif => (
                        <div 
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors relative ${!notif.read ? 'bg-blue-50/30' : ''}`}
                        >
                          <div className="flex gap-3">
                            <div className="mt-1 flex-shrink-0">
                              {getPriorityIcon(notif.priority, notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                  {notif.title}
                                </h4>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2 rtl:mr-2 rtl:ml-0">
                                  {getTimeAgo(notif.timestamp)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2">{notif.description}</p>
                              {notif.sender && <div className="mt-1 text-[10px] text-gray-400">{notif.sender}</div>}
                            </div>
                            {!notif.read && (
                              <div className="self-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="p-2 border-t border-gray-50 bg-gray-50/50 text-center">
                    <button 
                      onClick={() => { setIsNotifOpen(false); navigate('/internal-notifications'); }} 
                      className="text-xs text-gray-500 hover:text-gray-800 font-medium flex items-center justify-center w-full py-1"
                    >
                      {t.internalNotifications.viewAll} <ArrowRight size={10} className="ml-1 rtl:mr-1 rtl:ml-0" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center pl-2 lg:pl-4 rtl:pl-0 rtl:pr-2 lg:rtl:pr-4 border-l rtl:border-l-0 rtl:border-r border-gray-200 cursor-pointer hover:bg-gray-50 rounded transition-colors"
              >
                <div className="flex flex-col text-right rtl:text-left mr-3 rtl:mr-0 rtl:ml-3 hidden sm:flex">
                  <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                  <span className="text-xs text-gray-500 uppercase">{user?.role}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent hover:ring-green-100">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={20} className="m-1.5 text-gray-500" />
                  )}
                </div>
              </button>

              {isUserDropdownOpen && (
                <div className="absolute top-12 right-0 rtl:left-0 rtl:right-auto w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 flex flex-col max-h-[70vh] animate-fadeIn">
                  
                  <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm overflow-hidden border border-gray-200">
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon size={20} className="m-2 text-gray-400" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-gray-900 truncate">{user?.name}</div>
                        <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-y-auto flex-1 py-2">
                    
                    {pinnedShortcuts.length > 0 && (
                      <div className="mb-2 pb-2 border-b border-gray-50">
                        <div className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <Star size={10} className="fill-current text-yellow-500" /> {t.common.pinned}
                        </div>
                        {pinnedShortcuts.map(s => renderShortcutItem(s, true))}
                      </div>
                    )}

                    {recentPages.length > 0 && (
                      <div className="mb-2 pb-2 border-b border-gray-50">
                        <div className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <History size={10} /> {t.common.recent}
                        </div>
                        {recentPages.map((page, idx) => (
                          <Link 
                            key={`recent-${idx}`} 
                            to={page.path}
                            className="flex items-center justify-between px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                          >
                            <span className="truncate">{page.title}</span>
                            <span className="text-[10px] text-gray-300">
                              {Math.floor((Date.now() - page.timestamp) / 60000) < 1 ? 'Just now' : `${Math.floor((Date.now() - page.timestamp) / 60000)}m`}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}

                    <div>
                      <div className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t.common.menu}</div>
                      {availableShortcuts.filter(s => !pinnedPaths.includes(s.path)).map(s => renderShortcutItem(s))}
                    </div>
                  </div>

                  <div className="p-2 border-t border-gray-100 bg-gray-50">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut size={16} /> {t.common.logout}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        <div className="p-4 lg:p-8">
          {children}
        </div>

      </main>
    </div>
  );
};
