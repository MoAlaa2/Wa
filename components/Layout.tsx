
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './Sidebar';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Globe, Bell, User as UserIcon, Menu, LogOut, Check, Info, AlertTriangle, AlertOctagon, MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InternalNotification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { language, setLanguage, t, dir } = useLanguage();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotification();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // Notification UI State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen]);

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

  // Limit to latest 3 for dropdown
  const dropdownNotifications = notifications.slice(0, 3);

  return (
    <div className={`min-h-screen bg-surface flex flex-col ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 lg:ml-64 ${dir === 'rtl' ? 'lg:mr-64 lg:ml-0' : 'lg:ml-64'}`}>
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 px-4 lg:px-8 flex items-center justify-between">
          
          {/* Left Side */}
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

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 lg:space-x-4 rtl:space-x-reverse">
            
            {/* Visual Confirmation for Arabic */}
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

            {/* Notification Bell */}
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

              {/* Notification Dropdown */}
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
                              {notif.sender && <div className="mt-1 text-[10px] text-gray-400">By {notif.sender}</div>}
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

            <div className="flex items-center pl-2 lg:pl-4 rtl:pl-0 rtl:pr-2 lg:rtl:pr-4 border-l rtl:border-l-0 rtl:border-r border-gray-200">
              <div className="flex flex-col text-right rtl:text-left mr-3 rtl:mr-0 rtl:ml-3 hidden sm:flex">
                <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                <span className="text-xs text-gray-500 uppercase">{user?.role}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={20} className="m-1.5 text-gray-500" />
                )}
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title={t.common.logout}
            >
              <LogOut size={20} />
            </button>

          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          {children}
        </div>

      </main>
    </div>
  );
};
