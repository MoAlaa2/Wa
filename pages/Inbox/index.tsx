import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { whatsappService } from '../../services/whatsappService';
import { Conversation, Message, Tag, Team } from '../../types';
import { Search, Filter, MoreVertical, UserCircle, Phone, Trash2, Mail, MailOpen, User, ArrowLeft, Send, Lock, Briefcase, ShoppingBag, AlertTriangle, Inbox, CheckSquare, Clock, Plus, CreditCard, MessageSquare, Star, Zap, Check, ChevronDown, X } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { ConversationDetails } from './ConversationDetails';
import { CreateOrderPanel } from './components/CreateOrderPanel';
import { useLocation } from 'react-router-dom';

const InboxPage = () => {
  const { t, dir } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  
  // Data State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // View State
  const [mobileView, setMobileView] = useState<'list' | 'chat' | 'details'>('list');
  const [showDetails, setShowDetails] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState<'details' | 'order'>('details');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all'|'mine'|'unread'>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all'); // New filter state

  // Load Conversations
  useEffect(() => {
    fetchConversations();
    // Poll for new messages (Primitive real-time)
    const interval = setInterval(fetchConversations, 10000); 
    return () => clearInterval(interval);
  }, []);

  // Poll active chat messages
  useEffect(() => {
    if (!selectedConversationId) return;
    fetchMessages(selectedConversationId);
    const interval = setInterval(() => fetchMessages(selectedConversationId), 5000);
    return () => clearInterval(interval);
  }, [selectedConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    const data = await whatsappService.getConversations();
    setConversations(data);
    setLoading(false);
  };

  const fetchMessages = async (id: string) => {
    // Don't show loader on poll updates to avoid flickering
    const data = await whatsappService.getMessages(id);
    setMessages(data);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string, type: 'text' | 'note') => {
    if (!selectedConversationId) return;
    
    // Optimistic UI
    const tempMsg: Message = {
      id: 'temp_' + Date.now(),
      conversationId: selectedConversationId,
      type,
      content,
      direction: 'outbound',
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await whatsappService.sendMessage(selectedConversationId, content, type);
      fetchMessages(selectedConversationId);
      fetchConversations(); // Update last message preview
    } catch (e) {
      console.error('Send failed');
      // Ideally show error state on message
    }
  };

  const handleOrderCreated = (link: string, orderNumber: string) => {
    const message = t.inbox.orderPanel.orderLinkMessage
      .replace('{orderNumber}', orderNumber)
      .replace('{link}', link);
    handleSendMessage(message, 'text');
    setRightPanelMode('details');
  };

  const handleCloseChat = async () => {
    if (!selectedConversationId) return;
    if (window.confirm(t.inbox.chat.actions.confirmClose)) {
      try {
        await whatsappService.sendFeedbackRequest(selectedConversationId, user?.id || '');
        setConversations(prev => prev.map(c => c.id === selectedConversationId ? { ...c, status: 'closed' } : c));
        setSelectedConversationId(null);
        setMobileView('list');
      } catch (error) {
        console.error('Failed to close conversation:', error);
        alert('Failed to close conversation. Please try again.');
      }
    }
  };

  const handleAssignAgent = async (agentId: string | null) => {
    if (!selectedConversationId) return;
    try {
      await whatsappService.assignConversation(selectedConversationId, agentId);
      setConversations(prev => prev.map(c => 
        c.id === selectedConversationId ? { ...c, assignedAgentId: agentId } : c
      ));
    } catch (error) {
      console.error('Failed to assign agent:', error);
      alert('Failed to assign agent. Please try again.');
    }
  };

  const handleUpdateTags = async (tags: string[]) => {
    if (!selectedConversationId) return;
    try {
      // Update state first (optimistic UI)
      setConversations(prev => prev.map(c => 
        c.id === selectedConversationId ? { ...c, tags } : c
      ));
      // Call API to persist tags (like ConversationDetails does)
      const currentConv = conversations.find(c => c.id === selectedConversationId);
      if (currentConv) {
        await whatsappService.updateConversation({ ...currentConv, tags });
      }
    } catch (error) {
      console.error('Failed to update tags:', error);
      // Revert on error
      fetchConversations();
    }
  };

  // Filtering Logic
  const filteredConversations = conversations.filter(c => {
    // 1. Search
    const matchesSearch = c.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.contactNumber.includes(searchQuery);
    // 2. Tabs
    if (activeTab === 'mine' && c.assignedAgentId !== user?.id) return false;
    if (activeTab === 'unread' && c.unreadCount === 0) return false;
    
    // 3. Dropdown Filter
    if (activeFilter !== 'all') {
        // Implement filter logic based on tags or other properties
        // For now, simple mock filter
        if (activeFilter === 'unassigned' && c.assignedAgentId) return false;
        // Other filters would check tags
    }

    return matchesSearch;
  });

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
      
      {/* List Sidebar */}
      <div className={`w-full lg:w-1/4 border-r border-gray-200 flex flex-col bg-white min-w-[300px] absolute lg:relative z-10 h-full transition-transform duration-300 ${mobileView === 'list' ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Search & Tabs */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col gap-3">
          <h2 className="text-lg font-bold text-gray-800">{t.inbox.title}</h2>
          <div className="flex gap-2">
             {['all', 'mine', 'unread'].map(tab => (
               <button 
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize ${activeTab === tab ? 'bg-white border-green-500 text-green-700' : 'border-transparent text-gray-600'}`}
               >
                 {t.inbox.tabs[tab as keyof typeof t.inbox.tabs]}
               </button>
             ))}
          </div>
          
          <div className="flex gap-2">
             <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder={t.common.search} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 rtl:right-3 rtl:left-auto" size={16} />
             </div>
             
             {/* Filter Dropdown */}
             <select 
               value={activeFilter} 
               onChange={(e) => setActiveFilter(e.target.value)}
               className="bg-white border border-gray-300 rounded-lg text-sm px-2 py-2 w-1/3"
             >
               <option value="all">{t.common.filter}</option>
               <option value="unassigned">{t.inbox.filters.unassigned}</option>
               <option value="high_priority">{t.inbox.filters.highPriority}</option>
               <option value="b2b">{t.inbox.filters.b2b}</option>
               <option value="b2c">{t.inbox.filters.b2c}</option>
             </select>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
             <div className="p-8 text-center text-gray-400">{t.common.loading}</div>
          ) : filteredConversations.length === 0 ? (
             <div className="p-8 text-center text-gray-400 text-sm">{t.inbox.noSelection}</div>
          ) : (
            filteredConversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => { setSelectedConversationId(conv.id); setMobileView('chat'); }}
                className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 ${selectedConversationId === conv.id ? 'bg-green-50' : ''}`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                    {conv.contactName?.charAt(0) || 'U'}
                  </div>
                  {conv.unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-semibold truncate text-gray-900">{conv.contactName || conv.contactNumber}</h4>
                    <span className="text-xs text-gray-400">{new Date(conv.lastMessageTimestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                    {conv.lastMessage || 'Image/Media'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-[#efeae2] relative min-w-0 w-full absolute lg:relative z-0 h-full transition-transform duration-300 ${mobileView === 'chat' || mobileView === 'details' ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileView('list')} className="lg:hidden text-gray-600"><ArrowLeft size={20} /></button>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedConversation.contactName}</h3>
                  <div className="text-xs text-gray-500">{selectedConversation.contactNumber}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleCloseChat} className="p-2 hover:bg-gray-100 rounded-full text-gray-600" title={t.inbox.chat.actions.closeFeedback}>
                  <CheckSquare size={20} />
                </button>
                <button onClick={() => { setShowDetails(!showDetails); setRightPanelMode('details'); if(window.innerWidth < 1024) setMobileView('details'); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  isSelected={false} 
                  onSelect={() => {}} 
                  onAction={() => {}} 
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {selectedConversation.status !== 'closed' ? (
              (() => {
                const lastCustomerTs = selectedConversation?.lastCustomerMessageTimestamp || selectedConversation?.lastMessageTimestamp;
                const isWindowOpen = lastCustomerTs ? (Date.now() - new Date(lastCustomerTs).getTime()) <= 24*60*60*1000 : true;
                return <ChatInput onSendMessage={handleSendMessage} isWindowOpen={isWindowOpen} />;
              })()
            ) : (
              <div className="p-4 bg-gray-50 text-center text-gray-500 text-sm border-t">
                {t.inbox.closeModal.systemMessage}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            {t.inbox.noSelection}
          </div>
        )}
      </div>

      {/* Details Panel */}
      {selectedConversation && (showDetails || mobileView === 'details') && (
        <div className={`absolute lg:relative w-full lg:w-80 bg-white h-full z-20 border-l border-gray-200 transition-transform ${mobileView === 'details' ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
           {rightPanelMode === 'order' ? (
             <CreateOrderPanel 
               conversation={selectedConversation} 
               agentId={user?.id || ''} 
               onClose={() => setRightPanelMode('details')} 
               onOrderCreated={handleOrderCreated}
             />
           ) : (
             <ConversationDetails 
               conversation={selectedConversation} 
               onBlock={() => {}} 
               onDelete={() => {}} 
               onUpdateTags={handleUpdateTags}
               onAssignAgent={handleAssignAgent}
               onCreateOrder={() => setRightPanelMode('order')} 
               onClose={() => { setShowDetails(false); setMobileView('chat'); }} 
             />
           )}
        </div>
      )}

    </div>
  );
};

export default InboxPage;