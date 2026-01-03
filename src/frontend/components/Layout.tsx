import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Globe, Bell, User as UserIcon, Menu, LogOut, Check, Info,
  AlertTriangle, AlertOctagon, MessageSquare, ArrowRight,
  LayoutDashboard, ShoppingBag, Bot, BarChart2, Settings,
  MessageCircle, Star, Pin, History
} from 'lucide-react';
import { InternalNotification, UserRole, RecentPage } from '../types';

export const Layout: React.FC = () => {
  const { language, setLanguage, t, dir } = useLanguage();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  /* ================= SHORTCUT CONFIG ================= */
  const SHORTCUT_CONFIG = useMemo(() => [
    { path: '/', label: t.common.dashboard, icon: LayoutDashboard, roles: ['admin', 'supervisor'] },
    { path: '/inbox', label: t.common.inbox, icon: MessageSquare, roles: ['admin', 'agent', 'supervisor', 'viewer'] },
    { path: '/orders', label: t.common.orders, icon: ShoppingBag, roles: ['admin', 'agent', 'supervisor'] },
    { path: '/automation/chatbot', label: t.common.automation, icon: Bot, roles: ['admin', 'supervisor'] },
    { path: '/analytics/messaging', label: t.common.analytics, icon: BarChart2, roles: ['admin', 'supervisor'] },
    { path: '/content/quick-replies', label: t.nav.quickReplies, icon: MessageCircle, roles: ['admin', 'agent', 'supervisor'] },
    { path: '/settings', label: t.common.settings, icon: Settings, roles: ['admin', 'supervisor', 'viewer'] },
  ], [t]);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /* ================= LAYOUT ================= */
  return (
    <div className={`min-h-screen bg-surface flex ${dir === 'rtl' ? 'rtl' : 'ltr'}`}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className={`flex-1 lg:ml-64 ${dir === 'rtl' ? 'lg:mr-64 lg:ml-0' : ''}`}>
        {/* HEADER */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button
              className="lg:hidden p-2 rounded hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu />
            </button>
            <span className="font-bold text-lg">Guthmi WA</span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}>
              <Globe />
            </button>

            <button onClick={handleLogout} className="text-red-600">
              <LogOut />
            </button>
          </div>
        </header>

        {/* ✅ ROUTER OUTLET (ده السر) */}
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
