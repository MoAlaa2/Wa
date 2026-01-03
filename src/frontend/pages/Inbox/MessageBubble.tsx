
import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../../types';
import { Check, CheckCheck, Lock, MoreHorizontal, Copy, Trash2, EyeOff, FileText, Delete } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface MessageBubbleProps {
  message: Message;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onAction: (action: 'copy' | 'delete' | 'mark_unread' | 'send_template' | 'clear_conversation', message: Message) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSelected, onSelect, onAction }) => {
  const { t, dir } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const isOutbound = message.direction === 'outbound';
  const isNote = message.type === 'note';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  if (message.isDeleted) return null;

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderStatus = () => {
    if (!isOutbound || isNote) return null;
    const size = 14;
    switch (message.status) {
      case 'sent': return <Check size={size} className="text-gray-400" />;
      case 'delivered': return <CheckCheck size={size} className="text-gray-400" />;
      case 'read': return <CheckCheck size={size} className="text-blue-500" />;
      case 'failed': return <span className="text-red-500 text-xs">!</span>;
      default: return <div className="w-3 h-3 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />;
    }
  };

  const handleAction = (action: any) => {
    if (action === 'copy') {
      navigator.clipboard.writeText(message.content);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
    onAction(action, message);
    setShowMenu(false);
  };

  // Internal Note Style (No selection for notes currently)
  if (isNote) {
    return (
      <div className="flex w-full mb-4 px-8"> {/* gutter spacer */}
        <div className="w-full flex justify-center group">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-[80%] text-center relative hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-center text-xs text-yellow-700 font-bold mb-1 gap-1">
              <Lock size={12} />
              <span>{t.inbox.chat.privateNote} ({message.senderName})</span>
            </div>
            <p className="text-sm text-yellow-900">{message.content}</p>
            <div className="text-[10px] text-yellow-600 mt-1">{formatTime(message.timestamp)}</div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Message Style with External Checkbox Gutter
  return (
    <div className={`flex w-full mb-3 group ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      
      {/* Left Gutter: Checkbox (Always on left for consistency) */}
      <div className={`
        flex items-start pt-3 mr-2 ml-2
        ${isOutbound ? 'order-first' : 'order-first'} 
      `}>
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={(e) => onSelect(e.target.checked)}
          className={`
            w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer
            ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity
          `}
        />
      </div>

      {/* Message Bubble Container */}
      <div className={`relative max-w-[70%] ${isOutbound ? 'mr-2' : 'ml-2'}`}>
        
        <div className={`
          relative rounded-lg p-2 shadow-sm group-hover:shadow-md transition-all
          ${isOutbound ? 'bg-green-100 rounded-tr-none' : 'bg-white rounded-tl-none border border-gray-100'}
          ${isSelected ? 'ring-2 ring-green-500 ring-offset-1' : ''}
        `}>
          
          {/* Menu Toggle (Visible on hover) */}
          <div ref={menuRef} className="absolute -top-2 z-20" style={isOutbound ? {left: -20} : {right: -20}}>
             <button 
               onClick={() => setShowMenu(!showMenu)}
               className={`
                 p-1 rounded-full bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-gray-800
                 ${showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity
               `}
             >
               <MoreHorizontal size={14} />
             </button>

             {/* Dropdown Menu */}
             {showMenu && (
               <div className={`absolute top-full mt-1 ${isOutbound ? 'left-0' : 'right-0'} bg-white rounded-lg shadow-xl border border-gray-100 py-1 w-40 flex flex-col z-30`}>
                 <button onClick={() => handleAction('copy')} className="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left flex items-center gap-2 w-full">
                   <Copy size={12} /> {t.inbox.chat.actions.copy}
                 </button>
                 <button onClick={() => handleAction('mark_unread')} className="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left flex items-center gap-2 w-full">
                   <EyeOff size={12} /> {t.inbox.chat.actions.markUnread}
                 </button>
                 <button onClick={() => handleAction('send_template')} className="px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 text-left flex items-center gap-2 w-full">
                   <FileText size={12} /> {t.inbox.chat.actions.sendTemplate}
                 </button>
                 <button onClick={() => handleAction('delete')} className="px-3 py-2 text-xs text-red-600 hover:bg-red-50 text-left flex items-center gap-2 w-full">
                   <Trash2 size={12} /> {t.inbox.chat.actions.delete}
                 </button>
               </div>
             )}
          </div>

          {/* Copied Feedback */}
          {showCopied && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-40">
              {t.inbox.chat.actions.copied}
            </div>
          )}

          {/* Message Content */}
          <div className="text-sm text-gray-900 whitespace-pre-wrap break-words px-1 pt-1 min-w-[100px]">
            {message.content}
          </div>

          {/* Footer: Time & Status */}
          <div className={`flex items-center gap-1 mt-1 ${isOutbound ? 'justify-end' : 'justify-end'}`}>
            <span className="text-[10px] text-gray-500 min-w-[40px] text-right">
              {formatTime(message.timestamp)}
            </span>
            {renderStatus()}
          </div>
        </div>
      </div>
    </div>
  );
};
