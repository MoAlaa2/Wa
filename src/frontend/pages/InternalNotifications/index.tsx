
import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { InternalNotification } from '../../types';
import { Check, Info, AlertTriangle, AlertOctagon, MessageSquare, Bell, ArrowDown } from 'lucide-react';

const PAGE_SIZE = 20;

const InternalNotificationsPage = () => {
  const { t } = useLanguage();
  const { notifications, markRead, markAllRead } = useNotification();
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);

  // Sorting is already done in context/service (newest first), but we can enforce it here if needed.
  // Pagination logic:
  const displayedNotifications = useMemo(() => {
    return notifications.slice(0, displayLimit);
  }, [notifications, displayLimit]);

  const hasMore = displayLimit < notifications.length;

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + PAGE_SIZE);
  };

  const getPriorityIcon = (priority: string, type: string) => {
    if (priority === 'CRITICAL') return <AlertOctagon size={20} className="text-red-500" />;
    if (priority === 'IMPORTANT') return <AlertTriangle size={20} className="text-orange-500" />;
    if (type === 'OPERATIONAL') return <MessageSquare size={20} className="text-blue-500" />;
    return <Info size={20} className="text-gray-400" />;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Critical</span>;
      case 'IMPORTANT': return <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Important</span>;
      default: return <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Normal</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.internalNotifications.title}</h1>
          <p className="text-gray-500 mt-1">Full history of system alerts and announcements.</p>
        </div>
        <button 
          onClick={markAllRead} 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm"
        >
          <Check size={16} /> {t.internalNotifications.markAllRead}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-20 text-center text-gray-400">
            <Bell size={48} className="mx-auto mb-4 opacity-20" />
            <p>{t.internalNotifications.empty}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {displayedNotifications.map(notif => (
              <div 
                key={notif.id}
                onClick={() => !notif.read && markRead(notif.id)}
                className={`p-6 hover:bg-gray-50 transition-colors flex gap-4 ${!notif.read ? 'bg-blue-50/40' : ''}`}
              >
                <div className="mt-1 flex-shrink-0">
                  {getPriorityIcon(notif.priority, notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{notif.type}</span>
                      {getPriorityBadge(notif.priority)}
                      {!notif.read && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(notif.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <h3 className={`text-base mb-1 ${!notif.read ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                    {notif.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {notif.description}
                  </p>
                  
                  {notif.sender && (
                    <div className="mt-3 text-xs text-gray-400 flex items-center gap-2">
                      <span>Source: {notif.sender}</span>
                      {notif.target && <span>• Target: {notif.target}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {hasMore && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
            <button 
              onClick={handleLoadMore}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center justify-center w-full"
            >
              Load More <ArrowDown size={14} className="ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternalNotificationsPage;
