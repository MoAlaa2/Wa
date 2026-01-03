
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

  const activeClass = "bg-green-50 text-green-700 border-r-4 border-green-600";
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
      <div 
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside className={`
        w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed top-0 overflow-y-auto z-30 transition-transform duration-300
        ${dir === 'rtl' ? 'right-0 border-r-0 border-l' : 'left-0'}
        ${isOpen ? 'translate-x-0' : (dir === 'rtl' ? 'translate-x-full' : '-translate-x-full')}
        lg:translate-x-0
      `}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center">
            <img 
              src="https://guthmi.online/wp-content/uploads/2025/11/Asset-35-1.png" 
              alt="Guthmi" 
              className="h-8 w-auto object-contain"
            />
            <span className="ml-2 rtl:mr-2 rtl:ml-0 text-sm font-bold text-gray-800 hidden sm:block">Guthmi WA</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-red-500">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-1">
          
          {hasPermission('view_dashboard') && (
            <NavLink 
              to="/" 
              end
              onClick={onClose}
              className={({ isActive }) => `flex items-center px-6 py-3 text-sm font-medium transition-colors ${isActive ? activeClass : inactiveClass}`}
            >
              <LayoutDashboard size={20} className="mr-3 rtl:mr-0 rtl:ml-3" />
              {t.common.dashboard}
            </NavLink>
          )}

          {showAnalytics && (
            <div>
              <button 
                onClick={() => setAnalyticsOpen(!isAnalyticsOpen)}
                className={`w-full flex items-center justify-between px-6 py-3 text-sm font-medium ${inactiveClass}`}
              >
                <div className="flex items-center">
                  <BarChart2 size={20} className="mr-3 rtl:mr-0 rtl:ml-3" />
                  {t.common.analytics}
                </div>
                {renderChevron(isAnalyticsOpen)}
              </button>
              
              {isAnalyticsOpen && (
                <div className="space-y-1 mt-1">
                  <NavLink to="/analytics/messaging" onClick={onClose} className={({ isActive }) => `block py-2 text-sm ${subMenuClass} ${isActive ? "text-green-700 font-medium" : "text-gray-500 hover:text-gray-900"}`}>
                    {t.nav.messagingAnalytics}
                  </NavLink>
                  <NavLink to="/analytics/notifications" onClick={onClose} className={({ isActive }) => `block py-2 text-sm ${subMenuClass} ${isActive ? "text-green-700 font-medium" : "text-gray-500 hover:text-gray-900"}`}>
                    {t.nav.notificationAnalytics}
                  </NavLink>
                  <NavLink to="/analytics/bots" onClick={onClose} className={({ isActive }) => `block py-2 text-sm ${subMenuClass} ${isActive ? "text-green-700 font-medium" : "text-gray-500 hover:text-gray-900"}`}>
                    {t.nav.botAnalytics}
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {hasPermission('view_inbox') && (
            <NavLink 
              to="/inbox" 
              onClick={onClose}
              className={({ isActive }) => `flex items-center px-6 py-3 text-sm font-medium transition-colors ${isActive ? activeClass : inactiveClass}`}
            >
              <MessageSquare size={20} className="mr-3 rtl:mr-0 rtl:ml-3" />
              {t.common.inbox}
            </NavLink>
          )}

          {showOrders && (
            <NavLink 
              to="/orders" 
              onClick={onClose}
              className={({ isActive }) => `flex items-center px-6 py-3 text-sm font-medium transition-colors ${isActive ? activeClass : inactiveClass}`}
            >
              <ShoppingBag size={20} className="mr-3 rtl:mr-0 rtl:ml-3" />
              {t.common.orders}
            </NavLink>
          )}

          {hasPermission('manage_notifications') && (
            <NavLink 
              to="/notifications" 
              onClick={onClose}
              className={({ isActive }) => `flex items-center px-6 py-3 text-sm font-medium transition-colors ${isActive ? activeClass : inactiveClass}`}
            >
              <Megaphone size={20} className="mr-3 rtl:mr-0 rtl:ml-3" />
              {t.common.notifications}
            </NavLink>
          )}

          {showContacts && (
            <div>
              <button 
                onClick={() => setContactsOpen(!isContactsOpen)}
                className={`w-full flex items-center justify-between px-6 py-3 text-sm font-medium ${inactiveClass}`}
              >
                <div className="flex items-center">
                  <Users size={20} className="mr-3 rtl:mr-0 rtl:ml-3" />
                  {t.common.contacts}
                </div>
                {renderChevron(isContactsOpen)}
              </button>
              
              {isContactsOpen && (
                <div className="space-y-1 mt-1">
                  <NavLink to="/contacts" end onClick={onClose} className={({ isActive }) => `block py-2 text-sm ${subMenuClass} ${isActive ? "text-green-700 font-medium" : "text-gray-500 hover:text-gray-900"}`}>
                    {t.nav.allContacts}
                  </NavLink>
                  <NavLink to="/contacts/lists" onClick={onClose} className={({ isActive }) => `block py-2 text-sm ${subMenuClass} ${isActive ? "text-green-700 font-medium" : "text-gray-500 hover:text-gray-900"}`}>
                    {t.nav.lists}
                  </NavLink>
                  <NavLink to="/contacts/tags" onClick={onClose} className={({ isActive }) => `block py-2 text-sm ${subMenuClass} ${isActive ? "text-green-700 font-medium" : "text-gray-500 hover:text-gray-900"}`}>
                    {t.nav.tags}
                  </NavLink>
                  <NavLink to="/contacts/segments" onClick={onClose} className={({ isActive }) => `block py-2 text-sm ${subMenuClass} ${isActive ? "text-green-700 font-medium" : "text-gray-500 hover:text-gray-900"}`}>
                    {t.nav.segments}
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {showContentLibrary && (
            <div>
              <button 
                onClick={() => setContentLibraryOpen(!isContentLibraryOpen)}
                className={`w-full flex items-center justify-between px-6 py-3 text-sm font-medium ${inactiveClass}`}
              >
                <div className="flex items-center">
                  <Library size={20} className="mr-3 rtl:mr-0 rtl:ml-3" />
                  {t.common.contentLibrary}
                </div>
                {renderChevron(isContentLibraryOpen)}
              </button>
              
              {isContentLibraryOpen && (
                <div className="space-y-1 mt-1">
                  {hasPermission('manage_templates') && (
                    <NavLink to="/content/templates" onClick={onClose} className={({ isActive }) => `block py-2 text-sm ${subMenuClass} ${isActive ? "text-green-700 font-medium" : "text-gray-500 hover:text-gray-900"}`}>
                      <div className="flex items-center">
                        <FileText size={16} className="mr-2 rtl:mr-0 rtl:ml-2" />
                        {t.nav.templates}
                      </div>
                    </NavLink>
                  )}
                  {hasPermission('manage_flows') && (
                    <NavLink to="/content/flows" onClick={onClose} className={({ isActive }) => `block py-2 text-sm ${subMenuClass} ${isActive ? "text-green-700 font-medium" : "text-gray-500 hover:text-gray-900"}`}>
                      <div className="flex items-center">
                        <Workflow size={16} className="mr-2 rtl:mr-0 rtl:ml-2" />
                        {t.nav.flows}
                      </div>
                    </NavLink>
                  )}
                  {hasPermission('manage_quick_replies') && (
                    <NavLink to="/content/quick-replies" onClick={onClose} className={({ isActive }) => `block py-2 text-sm ${subMenuClass} ${isActive ? "text-green-700 font-medium" : "text-gray-500 hover:text-gray-900"}`}>
                      <div className="flex items-center">
                        <MessageCircle size={16} className="mr-2 rtl:mr-0 rtl:ml-2" />
                        {t.nav.quickReplies}
                      </div>
                    </NavLink>
                  )}
                </div>
              )}
            </div>
          )}

          {showAutomation && (
            <div>
              <button 
                onClick={() => setAutomationOpen(!isAutomationOpen)}
                className={`w-full flex items-center justify-between px-6 py-3 text-sm font-medium ${inactiveClass}`}
              >
                <div className="flex items-center">
                  <Bot size={20} className="mr-3 rtl:mr-0 rtl:ml-3" />
                  {t.common.automation}
                </div>
                {renderChevron(isAutomationOpen)}
              </button>
              
              {isAutomationOpen && (
                <div className="space-y-1 mt-1">
                  {hasPermission('manage_auto_replies') && (
                    <NavLink to="/automation/auto-replies" onClick={onClose} className={({ isActive }) => `block py-2 text-sm ${subMenuClass} ${isActive ? "text-green-700 font-medium" : "text-gray-500 hover:text-gray-900"}`}>
                      <div className="flex items-center">
                        <Zap size={16} className="mr-2 rtl:mr-0 rtl:ml-2" />
                        {t.nav.autoReplies}
                      </div>
                    </NavLink>
                  )}
                  {hasPermission('manage_chatbot') && (
                    <NavLink to="/automation/chatbot" onClick={onClose} className={({ isActive }) => `block py-2 text-sm ${subMenuClass} ${isActive ? "text-green-700 font-medium" : "text-gray-500 hover:text-gray-900"}`}>
                      <div className="flex items-center">
                        <Bot size={16} className="mr-2 rtl:mr-0 rtl:ml-2" />
                        {t.nav.chatbot}
                      </div>
                    </NavLink>
                  )}
                  {hasPermission('manage_knowledge_base') && (
                    <NavLink to="/automation/knowledge-base" onClick={onClose} className={({ isActive }) => `block py-2 text-sm ${subMenuClass} ${isActive ? "text-green-700 font-medium" : "text-gray-500 hover:text-gray-900"}`}>
                      <div className="flex items-center">
                        <BookOpen size={16} className="mr-2 rtl:mr-0 rtl:ml-2" />
                        {t.nav.knowledgeBase}
                      </div>
                    </NavLink>
                  )}
                </div>
              )}
            </div>
          )}

          {hasPermission('view_settings') && (
            <NavLink 
              to="/settings" 
              onClick={onClose}
              className={({ isActive }) => `flex items-center px-6 py-3 text-sm font-medium transition-colors ${isActive ? activeClass : inactiveClass}`}
            >
              <Settings size={20} className="mr-3 rtl:mr-0 rtl:ml-3" />
              {t.common.settings}
            </NavLink>
          )}

        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center font-medium">
             {t.common.madeWithLove}
          </div>
          <div className="text-[10px] text-gray-400 text-center mt-1">
            v1.1.0 Enterprise
          </div>
        </div>
      </aside>
    </>
  );
};
