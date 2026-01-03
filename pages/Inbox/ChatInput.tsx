
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Lock, X, StopCircle, Zap, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { whatsappService } from '../../services/whatsappService';
import { QuickReply } from '../../types';

interface ChatInputProps {
  onSendMessage: (content: string, type: 'text' | 'note') => void;
  isWindowOpen?: boolean; // New Prop
  onTyping?: () => void; // New Prop
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isWindowOpen = true, onTyping }) => {
  const { t, dir } = useLanguage();
  const [message, setMessage] = useState('');
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number | null>(null);

  // Quick Reply Logic
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [filteredQR, setFilteredQR] = useState<QuickReply[]>([]);

  useEffect(() => {
    const loadQR = async () => {
      const data = await whatsappService.getQuickReplies();
      setQuickReplies(data);
    };
    loadQR();
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }

    // Check for slash command
    const match = message.match(/\/(\w*)$/);
    if (match) {
      const query = match[1].toLowerCase();
      const filtered = quickReplies.filter(qr => qr.shortcut.toLowerCase().startsWith(query));
      setFilteredQR(filtered);
      setShowQuickMenu(filtered.length > 0);
    } else {
      setShowQuickMenu(false);
    }

  }, [message, quickReplies]);

  const insertQuickReply = (content: string) => {
    const newMessage = message.replace(/\/(\w*)$/, content);
    setMessage(newMessage);
    setShowQuickMenu(false);
    textareaRef.current?.focus();
  };

  const handleSend = () => {
    if (!message.trim()) return;
    
    // Guardrail: Duplicate check in real app
    
    onSendMessage(message, isNoteMode ? 'note' : 'text');
    setMessage('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onTyping) onTyping();

    if (showQuickMenu && (e.key === 'Enter' || e.key === 'Tab')) {
      e.preventDefault();
      if (filteredQR.length > 0) insertQuickReply(filteredQR[0].content);
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const cancelRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isInputDisabled = !isWindowOpen && !isNoteMode;

  return (
    <div className={`p-4 border-t transition-colors duration-300 relative ${isNoteMode ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
      
      {/* 24h Window Warning */}
      {!isWindowOpen && !isNoteMode && (
        <div className="absolute bottom-full left-0 w-full bg-red-50 border-t border-red-200 p-2 text-center text-xs text-red-700 font-medium flex justify-center items-center gap-2">
          <Clock size={12} />
          {t.inbox.chat.windowClosed}
        </div>
      )}

      {/* Quick Reply Menu */}
      {showQuickMenu && (
        <div className="absolute bottom-full left-4 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 w-72 max-h-64 overflow-y-auto z-50">
          <div className="p-2 text-xs font-bold text-gray-400 uppercase border-b bg-gray-50 flex justify-between">
             <span>{t.inbox.chat.quickRepliesTitle || 'Quick Replies'}</span>
             <span className="text-[10px]">{t.inbox.chat.quickRepliesHint || 'Use / to insert'}</span>
          </div>
          {filteredQR.map((qr, i) => (
            <div 
              key={qr.id} 
              onClick={() => insertQuickReply(qr.content)}
              className={`p-3 cursor-pointer hover:bg-green-50 text-sm border-b border-gray-50 last:border-0 ${i === 0 ? 'bg-green-50' : ''}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-800 font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">/{qr.shortcut}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">{qr.category}</span>
              </div>
              <div className="text-gray-600 truncate text-xs leading-relaxed">{qr.content}</div>
            </div>
          ))}
        </div>
      )}

      {/* Internal Note Toggle */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={isNoteMode} 
                onChange={() => setIsNoteMode(!isNoteMode)}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${isNoteMode ? 'bg-yellow-400' : 'bg-gray-300'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isNoteMode ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <span className={`ml-2 text-xs font-bold uppercase ${isNoteMode ? 'text-yellow-700' : 'text-gray-500'}`}>
              {t.inbox.chat.privateNote}
            </span>
          </label>
        </div>
      </div>

      {isRecording ? (
        // Recording UI
        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-red-200 animate-pulse">
           <div className="flex items-center text-red-500 gap-2">
             <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
             <span className="font-mono font-medium">{formatTime(recordingTime)}</span>
           </div>
           
           {/* Fake Waveform */}
           <div className="flex items-center gap-1 h-6 mx-4 flex-1 justify-center opacity-50">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-1 bg-gray-800 rounded-full" style={{ height: `${Math.random() * 100}%` }} />
              ))}
           </div>

           <div className="flex items-center gap-3">
             <button onClick={cancelRecording} className="text-gray-500 hover:text-red-500">
               <X size={20} />
             </button>
             <button onClick={cancelRecording} className="text-blue-500 hover:text-blue-600">
               <Send size={20} />
             </button>
           </div>
        </div>
      ) : (
        // Text Input UI
        <div className="flex items-end gap-2">
          <button 
            className="p-3 text-gray-500 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
            disabled={isInputDisabled}
          >
            <Paperclip size={20} />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isInputDisabled}
              placeholder={
                isNoteMode ? t.inbox.chat.privateNotePlaceholder
                : isInputDisabled ? t.inbox.chat.windowClosed
                : t.inbox.chat.inputPlaceholder
              }
              rows={1}
              className={`w-full p-3 rounded-lg border focus:ring-2 resize-none max-h-32 overflow-y-auto outline-none transition-all
                ${isNoteMode 
                  ? 'bg-yellow-100 border-yellow-300 focus:ring-yellow-400 placeholder-yellow-600 text-yellow-900' 
                  : isInputDisabled
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 focus:ring-green-500 focus:border-transparent'
                }`}
            />
          </div>

          {message.trim() ? (
            <button 
              onClick={handleSend}
              disabled={isInputDisabled}
              className={`p-3 rounded-full text-white shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                ${isNoteMode ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
            >
              <Send size={20} className={dir === 'rtl' ? 'transform rotate-180' : ''} />
            </button>
          ) : (
            <button 
              onClick={startRecording}
              disabled={isInputDisabled}
              className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <Mic size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
