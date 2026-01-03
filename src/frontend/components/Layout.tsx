import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Globe, Bell, Menu, LogOut, X,
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { language, setLanguage, t, dir } = useLanguage();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen bg-[#F0F2F5] flex ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className={`flex-1 min-h-screen ${dir === 'rtl' ? 'lg:mr-64' : 'lg:ml-64'}`}>
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20 shadow-sm">
          
          {/* Left Side */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} className="text-gray-700" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#C8973A] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="font-bold text-lg text-gray-800 hidden sm:block">Guthmi WA</span>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            
            {/* Notifications */}
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* Language Toggle */}
            <button 
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={language === 'en' ? 'العربية' : 'English'}
            >
              <Globe size={20} className="text-gray-600" />
            </button>

            {/* User Info */}
            {user && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
            )}

            {/* Logout */}
            <button 
              onClick={handleLogout} 
              className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
              title={t.common.logout}
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
