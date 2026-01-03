
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Library, 
  Bot, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  ChevronLeft,
  FileText,
  Workflow,
  MessageCircle,
  Zap,
  BookOpen,
  X,
  Megaphone,
  Users,
  BarChart2,
  ShoppingBag
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t, dir } = useLanguage();
  const { hasPermission } = useAuth();
  
  const [isContentLibraryOpen, setContentLibraryOpen] = useState(false);
  const [isAutomationOpen, setAutomationOpen] = useState(false);
  const [isContactsOpen, setContactsOpen] = useState(false);
  const [isAnalyticsOpen, setAnalyticsOpen] = useState(true);

  const linkBase = "flex items-center px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-200";
  const activeClass = "bg-green-50 text-green-700 border-l-4 border-green-600";
  const inactiveClass = "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
  
  const subMenuClass = dir === 'rtl' ? "pr-12" : "pl-12";

  const renderChevron = (isOpen: boolean) => {
    if (isOpen) return <ChevronDown size={16} />;
    return dir === 'rtl' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />;
  };

  const showContentLibrary = hasPermission('manage_templates') || hasPermission('manage_flows') || hasPermission('manage_quick_replies');
  const showAutomation = hasPermission('manage_auto_replies') || hasPermission('manage_chatbot') || hasPermission('manage_knowledge_base');
  const showContacts = hasPermission('manage_contacts');
  const showAnalytics = hasPermission('view_analytics') || hasPermission('view_dashboard');
  const showOrders = hasPermission('manage_orders') || hasPermission('view_inbox');

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`
        w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed top-0 overflow-y-auto z-30 
        transition-transform duration-300 shadow-lg lg:shadow-none
        ${dir === 'rtl' ? 'right-0 border-r-0 border-l' : 'left-0'}
        ${isOpen ? 'translate-x-0' : (dir === 'rtl' ? 'translate-x-full' : '-translate-x-full')}
        lg:translate-x-0
      `}>
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#C8973A] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div>
              <span className="font-bold text-gray-800 text-sm block">Guthmi WA</span>
              <span className="text-[10px] text-gray-400">Enterprise Platform</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          
          {/* Dashboard */}
          {hasPermission('view_dashboard') && (
            <NavLink 
              to="/" 
              end
              onClick={onClose}
              className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
            >
              <LayoutDashboard size={18} className="mr-3 rtl:mr-0 rtl:ml-3" />
              {t.common.dashboard}
            </NavLink>
          )}

          {/* Analytics */}
          {showAnalytics && (
            <div className="px-2">
              <button 
                onClick={() => setAnalyticsOpen(!isAnalyticsOpen)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium ${inactiveClass}`}
              >
                <div className="flex items-center">
                  <BarChart2 size={18} className="mr-3 rtl:mr-0 rtl:ml-3" />
                  {t.common.analytics}
                </div>
                {renderChevron(isAnalyticsOpen)}
              </button>
              
              {isAnalyticsOpen && (
                <div className="space-y-0.5 mt-1 ml-4 rtl:mr-4 rtl:ml-0 border-l rtl:border-r rtl:border-l-0 border-gray-200 pl-4 rtl:pr-4 rtl:pl-0">
                  <NavLink to="/analytics/messaging" onClick={onClose} className={({ isActive }) => `block py-2 text-sm rounded-lg px-2 ${isActive ? "text-green-700 font-medium bg-green-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
                    {t.nav.messagingAnalytics}
                  </NavLink>
                  <NavLink to="/analytics/notifications" onClick={onClose} className={({ isActive }) => `block py-2 text-sm rounded-lg px-2 ${isActive ? "text-green-700 font-medium bg-green-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
                    {t.nav.notificationAnalytics}
                  </NavLink>
                  <NavLink to="/analytics/bots" onClick={onClose} className={({ isActive }) => `block py-2 text-sm rounded-lg px-2 ${isActive ? "text-green-700 font-medium bg-green-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
                    {t.nav.botAnalytics}
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {/* Inbox */}
          {hasPermission('view_inbox') && (
            <NavLink 
              to="/inbox" 
              onClick={onClose}
              className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
            >
              <MessageSquare size={18} className="mr-3 rtl:mr-0 rtl:ml-3" />
              {t.common.inbox}
            </NavLink>
          )}

          {/* Orders */}
          {showOrders && (
            <NavLink 
              to="/orders" 
              onClick={onClose}
              className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
            >
              <ShoppingBag size={18} className="mr-3 rtl:mr-0 rtl:ml-3" />
              {t.common.orders}
            </NavLink>
          )}

          {/* Notifications */}
          {hasPermission('manage_notifications') && (
            <NavLink 
              to="/notifications" 
              onClick={onClose}
              className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
            >
              <Megaphone size={18} className="mr-3 rtl:mr-0 rtl:ml-3" />
              {t.common.notifications}
            </NavLink>
          )}

          {/* Contacts */}
          {showContacts && (
            <div className="px-2">
              <button 
                onClick={() => setContactsOpen(!isContactsOpen)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium ${inactiveClass}`}
              >
                <div className="flex items-center">
                  <Users size={18} className="mr-3 rtl:mr-0 rtl:ml-3" />
                  {t.common.contacts}
                </div>
                {renderChevron(isContactsOpen)}
              </button>
              
              {isContactsOpen && (
                <div className="space-y-0.5 mt-1 ml-4 rtl:mr-4 rtl:ml-0 border-l rtl:border-r rtl:border-l-0 border-gray-200 pl-4 rtl:pr-4 rtl:pl-0">
                  <NavLink to="/contacts" end onClick={onClose} className={({ isActive }) => `block py-2 text-sm rounded-lg px-2 ${isActive ? "text-green-700 font-medium bg-green-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
                    {t.nav.allContacts}
                  </NavLink>
                  <NavLink to="/contacts/lists" onClick={onClose} className={({ isActive }) => `block py-2 text-sm rounded-lg px-2 ${isActive ? "text-green-700 font-medium bg-green-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
                    {t.nav.lists}
                  </NavLink>
                  <NavLink to="/contacts/tags" onClick={onClose} className={({ isActive }) => `block py-2 text-sm rounded-lg px-2 ${isActive ? "text-green-700 font-medium bg-green-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
                    {t.nav.tags}
                  </NavLink>
                  <NavLink to="/contacts/segments" onClick={onClose} className={({ isActive }) => `block py-2 text-sm rounded-lg px-2 ${isActive ? "text-green-700 font-medium bg-green-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
                    {t.nav.segments}
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {/* Content Library */}
          {showContentLibrary && (
            <div className="px-2">
              <button 
                onClick={() => setContentLibraryOpen(!isContentLibraryOpen)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium ${inactiveClass}`}
              >
                <div className="flex items-center">
                  <Library size={18} className="mr-3 rtl:mr-0 rtl:ml-3" />
                  {t.common.contentLibrary}
                </div>
                {renderChevron(isContentLibraryOpen)}
              </button>
              
              {isContentLibraryOpen && (
                <div className="space-y-0.5 mt-1 ml-4 rtl:mr-4 rtl:ml-0 border-l rtl:border-r rtl:border-l-0 border-gray-200 pl-4 rtl:pr-4 rtl:pl-0">
                  {hasPermission('manage_templates') && (
                    <NavLink to="/content/templates" onClick={onClose} className={({ isActive }) => `flex items-center gap-2 py-2 text-sm rounded-lg px-2 ${isActive ? "text-green-700 font-medium bg-green-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
                      <FileText size={14} />
                      {t.nav.templates}
                    </NavLink>
                  )}
                  {hasPermission('manage_flows') && (
                    <NavLink to="/content/flows" onClick={onClose} className={({ isActive }) => `flex items-center gap-2 py-2 text-sm rounded-lg px-2 ${isActive ? "text-green-700 font-medium bg-green-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
                      <Workflow size={14} />
                      {t.nav.flows}
                    </NavLink>
                  )}
                  {hasPermission('manage_quick_replies') && (
                    <NavLink to="/content/quick-replies" onClick={onClose} className={({ isActive }) => `flex items-center gap-2 py-2 text-sm rounded-lg px-2 ${isActive ? "text-green-700 font-medium bg-green-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
                      <MessageCircle size={14} />
                      {t.nav.quickReplies}
                    </NavLink>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Automation */}
          {showAutomation && (
            <div className="px-2">
              <button 
                onClick={() => setAutomationOpen(!isAutomationOpen)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium ${inactiveClass}`}
              >
                <div className="flex items-center">
                  <Bot size={18} className="mr-3 rtl:mr-0 rtl:ml-3" />
                  {t.common.automation}
                </div>
                {renderChevron(isAutomationOpen)}
              </button>
              
              {isAutomationOpen && (
                <div className="space-y-0.5 mt-1 ml-4 rtl:mr-4 rtl:ml-0 border-l rtl:border-r rtl:border-l-0 border-gray-200 pl-4 rtl:pr-4 rtl:pl-0">
                  {hasPermission('manage_auto_replies') && (
                    <NavLink to="/automation/auto-replies" onClick={onClose} className={({ isActive }) => `flex items-center gap-2 py-2 text-sm rounded-lg px-2 ${isActive ? "text-green-700 font-medium bg-green-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
                      <Zap size={14} />
                      {t.nav.autoReplies}
                    </NavLink>
                  )}
                  {hasPermission('manage_chatbot') && (
                    <NavLink to="/automation/chatbot" onClick={onClose} className={({ isActive }) => `flex items-center gap-2 py-2 text-sm rounded-lg px-2 ${isActive ? "text-green-700 font-medium bg-green-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
                      <Bot size={14} />
                      {t.nav.chatbot}
                    </NavLink>
                  )}
                  {hasPermission('manage_knowledge_base') && (
                    <NavLink to="/automation/knowledge-base" onClick={onClose} className={({ isActive }) => `flex items-center gap-2 py-2 text-sm rounded-lg px-2 ${isActive ? "text-green-700 font-medium bg-green-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
                      <BookOpen size={14} />
                      {t.nav.knowledgeBase}
                    </NavLink>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {hasPermission('view_settings') && (
            <NavLink 
              to="/settings" 
              onClick={onClose}
              className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
            >
              <Settings size={18} className="mr-3 rtl:mr-0 rtl:ml-3" />
              {t.common.settings}
            </NavLink>
          )}

        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="text-xs text-gray-500 text-center font-medium">
            Guthmi WA Enterprise
          </div>
          <div className="text-[10px] text-gray-400 text-center mt-0.5">
            v2.1.0 • Since 1942
          </div>
        </div>
      </aside>
    </>
  );
};
