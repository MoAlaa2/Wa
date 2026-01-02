
import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { whatsappService } from '../../services/whatsappService';
import { Conversation, Message, Tag, Team } from '../../types';
import { Search, Filter, MoreVertical, UserCircle, Phone, Trash2, Mail, MailOpen, User, ArrowLeft, Send, Lock, Briefcase, ShoppingBag, AlertTriangle, Inbox, CheckSquare, Clock, Plus, CreditCard, MessageSquare, Star, Zap } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { ConversationDetails } from './ConversationDetails';
import { CreateOrderPanel } from './components/CreateOrderPanel';
import { useLocation } from 'react-router-dom';

type InboxView = 'all' | 'mine' | 'unread' | 'unassigned' | 'b2c' | 'b2b' | 'high_priority';

const InboxPage = () => {
  const { t, dir } = useLanguage();
  const { user, users } = useAuth(); // Use real users from context
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mobile View State: 'list' | 'chat' | 'details'
  const [mobileView, setMobileView] = useState<'list' | 'chat' | 'details'>('list');
  const [showDetails, setShowDetails] = useState(false); // For desktop toggle
  const [rightPanelMode, setRightPanelMode] = useState<'details' | 'order'>('details');

  // Tags & Filters
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeView, setActiveView] = useState<InboxView>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Teams
  const [teams, setTeams] = useState<Team[]>([]);

  // New State for features
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const [showChatOptions, setShowChatOptions] = useState(false);
  
  // Handlers for fetching data
  useEffect(() => {
    fetchConversations();
    fetchTags();
    fetchTeams();
  }, []);

  // Deep Link Handling
  useEffect(() => {
    if (location.state && location.state.conversationId) {
      setSelectedConversationId(location.state.conversationId);
      // Clean up state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, conversations]); // Depend on conversations loaded

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
      setSelectedMessageIds(new Set()); // Clear selection on chat change
      setShowAgentMenu(false);
      setShowChatOptions(false);
      setRightPanelMode('details'); // Reset to details on chat switch
      
      // Auto switch to chat view on mobile
      if (window.innerWidth < 1024) {
        setMobileView('chat');
      }
    }
  }, [selectedConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    const data = await whatsappService.getConversations();
    setConversations(data);
    setLoading(false);
  };

  const fetchTags = async () => {
    const data = await whatsappService.getTags();
    setTags(data);
  };

  const fetchTeams = async () => {
    const data = await whatsappService.getTeams();
    setTeams(data);
  };

  const fetchMessages = async (id: string) => {
    setLoadingMessages(true);
    const data = await whatsappService.getMessages(id);
    setMessages(data);
    setLoadingMessages(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Helper Functions ---
  
  const getSLAStatus = (conv: Conversation) => {
    if (!conv.lastCustomerMessageTimestamp) return 'ok';
    const now = new Date();
    const lastMsg = new Date(conv.lastCustomerMessageTimestamp);
    const diffHours = (now.getTime() - lastMsg.getTime()) / (1000 * 60 * 60);
    
    // SLA Logic
    if (diffHours > 24) return 'breached';
    if (diffHours > 4) return 'warning';
    return 'ok';
  };

  const is24hWindowOpen = (conv: Conversation) => {
    if (!conv.lastCustomerMessageTimestamp) return false;
    const now = new Date();
    const lastMsg = new Date(conv.lastCustomerMessageTimestamp);
    const diffHours = (now.getTime() - lastMsg.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  };

  // --- View Logic ---
  const getFilteredConversations = () => {
    let filtered = conversations;

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.contactName.toLowerCase().includes(q) || 
        c.contactNumber.includes(q)
      );
    }

    // Views
    switch (activeView) {
      case 'mine':
        return filtered.filter(c => c.assignedAgentId === user?.id);
      case 'unread':
        return filtered.filter(c => c.unreadCount > 0);
      case 'unassigned':
        return filtered.filter(c => !c.assignedAgentId);
      case 'b2b':
        return filtered.filter(c => c.context?.campaignType === 'B2B' || c.systemTags?.some(t => t.value === 'B2B'));
      case 'b2c':
        return filtered.filter(c => c.context?.campaignType === 'B2C');
      case 'high_priority':
        return filtered.filter(c => c.context?.priority === 'HIGH');
      default:
        return filtered;
    }
  };

  const filteredConversations = getFilteredConversations();

  // --- Actions ---

  const handleSendMessage = async (content: string, type: 'text' | 'note' | 'feedback_request') => {
    if (!selectedConversationId) return;

    // Check Lock
    const conversation = conversations.find(c => c.id === selectedConversationId);
    if (type === 'text' && conversation?.isLocked && conversation.lockedByAgentId !== user?.id) {
      alert("This conversation is locked by another agent.");
      return;
    }

    const tempId = Date.now().toString();
    const optimisticMessage: Message = {
      id: tempId,
      conversationId: selectedConversationId,
      type: type,
      content: content,
      direction: 'outbound',
      status: 'pending',
      timestamp: new Date().toISOString(),
      senderName: type === 'note' ? (user?.name || 'You') : undefined
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    await whatsappService.sendMessage(selectedConversationId, content, type);
    
    // Lock conversation on reply if not already locked
    if (type === 'text' && !conversation?.assignedAgentId && user?.id) {
       handleAssignAgent(user.id); // Auto-lock to current user
    }

    fetchMessages(selectedConversationId);
    setConversations(prev => prev.map(c => 
      c.id === selectedConversationId 
        ? { 
            ...c, 
            lastMessage: type === 'note' ? 'Internal Note' : content, 
            lastMessageTimestamp: new Date().toISOString(),
            typingUser: undefined
          } 
        : c
    ));
  };

  const handleOrderCreated = (link: string, orderNumber: string) => {
    handleSendMessage(`Your order #${orderNumber} has been created.\nPlease complete payment using the link below:\n${link}`, 'text');
    setRightPanelMode('details'); // Close panel
  };

  const handleCloseAndFeedback = async () => {
    if (!selectedConversationId) return;
    
    if (window.confirm("Close this chat and request feedback from the customer?")) {
      await whatsappService.sendFeedbackRequest(selectedConversationId, user?.id || 'agent');
      setMessages(prev => [...prev, {
        id: `fb_req_${Date.now()}`,
        conversationId: selectedConversationId,
        type: 'feedback_request',
        content: 'Feedback request sent',
        direction: 'outbound',
        status: 'sent',
        timestamp: new Date().toISOString()
      }]);
      setConversations(prev => prev.map(c => c.id === selectedConversationId ? { ...c, status: 'pending_feedback' } : c));
      setShowChatOptions(false);
    }
  };

  const toggleMessageSelection = (id: string, selected: boolean) => {
    const newSet = new Set(selectedMessageIds);
    if (selected) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedMessageIds(newSet);
  };

  const handleMessageAction = (action: any, message: Message) => {
    if (action === 'delete') {
      setMessages(prev => prev.map(m => m.id === message.id ? { ...m, isDeleted: true } : m));
    }
    if (action === 'mark_unread') {
       setConversations(prev => prev.map(c => 
         c.id === message.conversationId ? { ...c, unreadCount: c.unreadCount + 1 } : c
       ));
    }
    if (action === 'send_template') {
       alert('Template selection modal would open here.');
    }
  };

  const handleBulkAction = (action: 'clear' | 'mark_read' | 'mark_unread') => {
    if (action === 'clear') {
      setMessages(prev => prev.map(m => selectedMessageIds.has(m.id) ? { ...m, isDeleted: true } : m));
    }
    setSelectedMessageIds(new Set());
  };

  const handleAssignAgent = async (agentId: string) => {
    if (!selectedConversationId) return;
    
    if (agentId === 'unassigned') {
        await whatsappService.releaseLock(selectedConversationId);
        setConversations(prev => prev.map(c => 
            c.id === selectedConversationId ? { 
              ...c, 
              assignedAgentId: undefined,
              isLocked: false,
              lockedByAgentId: undefined
            } : c
        ));
    } else {
        await whatsappService.acquireLock(selectedConversationId, agentId);
        // Also update assignment logic if backend separates lock vs assignment
        await whatsappService.bulkAssign([selectedConversationId], agentId);
        
        setConversations(prev => prev.map(c => 
            c.id === selectedConversationId ? { 
              ...c, 
              assignedAgentId: agentId,
              isLocked: true,
              lockedByAgentId: agentId
            } : c
        ));
    }
    setShowAgentMenu(false);
  };

  const handleBlockContact = () => {
    if (!selectedConversationId) return;
    setConversations(prev => prev.map(c => 
      c.id === selectedConversationId ? { ...c, isBlocked: !c.isBlocked } : c
    ));
  };

  const handleDeleteConversation = () => {
    if (!selectedConversationId) return;
    if (window.confirm(t.common.confirmDelete)) {
      setConversations(prev => prev.filter(c => c.id !== selectedConversationId));
      setSelectedConversationId(null);
      setMobileView('list');
    }
  };

  const handleUpdateTags = (newTags: string[]) => {
    if (!selectedConversationId) return;
    setConversations(prev => prev.map(c => 
      c.id === selectedConversationId ? { ...c, tags: newTags } : c
    ));
  };

  const handleTyping = () => {
    // Real implementation would emit socket event here
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const assignedAgent = users.find(a => a.id === selectedConversation?.assignedAgentId);
  
  // Lock Logic
  const isChatLocked = selectedConversation?.isLocked && selectedConversation?.lockedByAgentId !== user?.id;
  const lockedByName = users.find(a => a.id === selectedConversation?.lockedByAgentId)?.name;
  
  // Collision Logic - Only show if typing user is NOT me and exists
  const isCollision = !!selectedConversation?.typingUser && selectedConversation.typingUser !== user?.id;
  const collisionUser = selectedConversation?.typingUser ? (users.find(u => u.id === selectedConversation.typingUser)?.name || 'Another agent') : '';

  // 24h Window
  const windowOpen = selectedConversation ? is24hWindowOpen(selectedConversation) : false;

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
      
      {/* LEFT SIDEBAR: Smart Views & List */}
      <div className={`
        w-full lg:w-1/4 border-r border-gray-200 flex flex-col bg-white min-w-[300px] absolute lg:relative z-10 h-full transition-transform duration-300
        ${mobileView === 'list' ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* ... (Keep existing Sidebar Header) ... */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col gap-3">
          <h2 className="text-lg font-bold text-gray-800 px-1">{t.pages.inbox.title}</h2>
          
          {/* Smart Views Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
             <button onClick={() => setActiveView('all')} className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border ${activeView === 'all' ? 'bg-white border-green-500 text-green-700 shadow-sm' : 'border-transparent text-gray-600 hover:bg-gray-200'}`}>
                <Inbox size={14} className="mr-1.5"/> {t.pages.inbox.tabs.all}
             </button>
             <button onClick={() => setActiveView('mine')} className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border ${activeView === 'mine' ? 'bg-white border-green-500 text-green-700 shadow-sm' : 'border-transparent text-gray-600 hover:bg-gray-200'}`}>
                <User size={14} className="mr-1.5"/> {t.pages.inbox.tabs.mine}
             </button>
             <button onClick={() => setActiveView('unread')} className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border ${activeView === 'unread' ? 'bg-white border-green-500 text-green-700 shadow-sm' : 'border-transparent text-gray-600 hover:bg-gray-200'}`}>
                <Mail size={14} className="mr-1.5"/> {t.pages.inbox.tabs.unread}
             </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar border-t border-gray-200 pt-2">
             <button onClick={() => setActiveView('unassigned')} className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border ${activeView === 'unassigned' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}>
                <AlertTriangle size={14} className="mr-1.5"/> Unassigned
             </button>
             <button onClick={() => setActiveView('high_priority')} className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border ${activeView === 'high_priority' ? 'bg-red-50 border-red-200 text-red-700' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}>
                <Clock size={14} className="mr-1.5"/> High Priority
             </button>
             <button onClick={() => setActiveView('b2b')} className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border ${activeView === 'b2b' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}>
                <Briefcase size={14} className="mr-1.5"/> B2B
             </button>
             <button onClick={() => setActiveView('b2c')} className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border ${activeView === 'b2c' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}>
                <ShoppingBag size={14} className="mr-1.5"/> B2C
             </button>
          </div>

          <div className="relative mt-1">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Global Search (Name, Phone, Order ID...)"
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent rtl:pl-4 rtl:pr-9"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 rtl:right-3 rtl:left-auto" size={16} />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
             <div className="p-8 text-center text-gray-400">{t.common.loading}</div>
          ) : filteredConversations.length === 0 ? (
             <div className="p-8 text-center text-gray-400 text-sm">No conversations found.</div>
          ) : (
            filteredConversations.map(conv => {
              const slaStatus = getSLAStatus(conv);
              
              return (
                <div 
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 relative
                    ${selectedConversationId === conv.id ? 'bg-green-50 border-l-4 border-l-green-500 rtl:border-l-0 rtl:border-r-4 rtl:border-r-green-500' : ''}
                  `}
                >
                  <div className="relative">
                    <img src={conv.avatar || 'https://ui-avatars.com/api/?name=' + conv.contactName} alt={conv.contactName} className="w-10 h-10 rounded-full object-cover" />
                    {conv.status === 'open' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm font-semibold truncate ${selectedConversationId === conv.id ? 'text-gray-900' : 'text-gray-800'}`}>
                        {conv.contactName}
                      </h4>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(conv.lastMessageTimestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-sm truncate max-w-[85%] ${conv.unreadCount > 0 ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                        {conv.lastMessage}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    
                    {/* System Tags & Campaign Info */}
                    <div className="flex gap-1 mt-2 flex-wrap items-center">
                      {/* SLA Badge */}
                      {slaStatus !== 'ok' && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center ${slaStatus === 'breached' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          <Clock size={8} className="mr-1"/> {slaStatus === 'breached' ? 'SLA BREACH' : 'SLA Warning'}
                        </span>
                      )}
                      
                      {conv.context?.priority === 'HIGH' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold flex items-center">
                          <AlertTriangle size={8} className="mr-1"/> HIGH
                        </span>
                      )}
                      {conv.systemTags?.map(tag => (
                        <span key={tag.id} className="text-[10px] px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: tag.color }}>
                          {tag.value}
                        </span>
                      ))}
                      {/* Assigned Team Badge */}
                      {conv.assignedTeamId && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                          {teams.find(t => t.id === conv.assignedTeamId)?.name || 'Team'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MIDDLE: Chat Window */}
      <div className={`
        flex-1 flex flex-col bg-[#efeae2] relative min-w-0 w-full absolute lg:relative z-0 h-full transition-transform duration-300
        ${mobileView === 'chat' || mobileView === 'details' ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shadow-sm z-10 relative">
              
              <div className="flex items-center gap-2 lg:gap-3">
                <button onClick={() => setMobileView('list')} className="lg:hidden p-1 mr-1 text-gray-600">
                  <ArrowLeft size={20} />
                </button>

                <img src={selectedConversation.avatar || 'https://ui-avatars.com/api/?name=' + selectedConversation.contactName} alt="Avatar" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full" />
                <div onClick={() => { setMobileView('details'); setRightPanelMode('details'); }} className="cursor-pointer">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm lg:text-base">
                    {selectedConversation.contactName}
                    {selectedConversation.isLocked && (
                      <span title={`Locked by ${lockedByName}`}>
                        <Lock size={12} className="text-orange-500" />
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500 gap-2">
                    <span className="flex items-center gap-1"><Phone size={10} /> {selectedConversation.contactNumber}</span>
                    <span className="text-gray-300">|</span>
                    <span className={`flex items-center gap-1 font-medium ${windowOpen ? 'text-green-600' : 'text-red-500'}`}>
                      <Clock size={10} /> {windowOpen ? '24h Open' : '24h Closed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 lg:gap-3">
                 
                 {/* Bulk Actions */}
                 {selectedMessageIds.size > 0 && (
                   <div className="absolute inset-0 bg-green-50 flex items-center justify-between px-4 lg:px-6 z-20">
                     <span className="font-semibold text-green-800 text-sm">
                       {selectedMessageIds.size} {t.pages.inbox.bulkActions.selected}
                     </span>
                     <div className="flex gap-2">
                       <button onClick={() => handleBulkAction('clear')} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={18} /></button>
                       <button onClick={() => handleBulkAction('mark_read')} className="p-2 text-green-700 hover:bg-green-100 rounded-full"><MailOpen size={18} /></button>
                     </div>
                   </div>
                 )}

                 {/* Create Order Button */}
                 <button 
                   onClick={() => { setRightPanelMode('order'); setShowDetails(true); setMobileView('details'); }}
                   className="hidden sm:flex items-center gap-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                 >
                   <Plus size={16} />
                   <span className="hidden lg:inline">Create Order</span>
                 </button>

                 {/* Assign Agent Dropdown */}
                 <div className="relative hidden sm:block">
                   <button 
                     onClick={() => setShowAgentMenu(!showAgentMenu)}
                     className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                   >
                     <UserCircle size={18} />
                     <span className="hidden sm:inline">
                       {assignedAgent ? assignedAgent.name : t.pages.inbox.assignAgent}
                     </span>
                   </button>
                   
                   {showAgentMenu && (
                     <>
                       <div className="fixed inset-0 z-10" onClick={() => setShowAgentMenu(false)} />
                       <div className="absolute top-10 right-0 w-48 bg-white shadow-xl rounded-lg border border-gray-100 py-1 z-20 flex flex-col max-h-64 overflow-y-auto">
                         <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase border-b border-gray-50 mb-1">Select Agent</div>
                         <button 
                             onClick={() => handleAssignAgent('unassigned')}
                             className={`px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 text-gray-500`}
                           >
                             <UserCircle size={14} /> Unassigned
                         </button>
                         {users.map(agent => (
                           <button 
                             key={agent.id}
                             onClick={() => handleAssignAgent(agent.id)}
                             className={`px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 ${selectedConversation.assignedAgentId === agent.id ? 'text-green-600 font-medium' : 'text-gray-700'}`}
                           >
                             <User size={14} />
                             {agent.name}
                           </button>
                         ))}
                       </div>
                     </>
                   )}
                 </div>

                 {/* More Options */}
                 <div className="relative">
                   <button onClick={() => setShowChatOptions(!showChatOptions)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full hidden lg:block">
                     <MoreVertical size={20} />
                   </button>
                   {showChatOptions && (
                     <>
                       <div className="fixed inset-0 z-10" onClick={() => setShowChatOptions(false)} />
                       <div className="absolute top-10 right-0 w-56 bg-white shadow-xl rounded-lg border border-gray-100 py-1 z-20 flex flex-col">
                         <button onClick={handleCloseAndFeedback} className="px-4 py-2 text-sm text-left hover:bg-gray-50 text-gray-700 flex items-center gap-2">
                           <Star size={14} className="text-yellow-500" /> Close & Request Feedback
                         </button>
                         <button onClick={() => { setRightPanelMode('details'); setShowDetails(!showDetails); setShowChatOptions(false); }} className="px-4 py-2 text-sm text-left hover:bg-gray-50 text-gray-700">
                           View Details
                         </button>
                       </div>
                     </>
                   )}
                 </div>
              </div>
            </div>

            {/* Context Banner */}
            {selectedConversation.context && (
              <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <span className="font-bold bg-blue-200 text-blue-800 px-2 py-0.5 rounded text-xs uppercase">{selectedConversation.context.campaignType}</span>
                  <span>Reply from Campaign: <strong>{selectedConversation.context.campaignName}</strong></span>
                </div>
                <div className="text-xs text-blue-600 flex items-center gap-4">
                   <span>Source: {selectedConversation.context.source}</span>
                   {selectedConversation.assignedTeamId && (
                     <span className="font-semibold">→ Routing to {teams.find(t => t.id === selectedConversation.assignedTeamId)?.name}</span>
                   )}
                </div>
              </div>
            )}

            {/* Collision Banner */}
            {isCollision && (
              <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2 text-sm text-yellow-800 font-bold">
                  <Zap size={16} />
                  <span>{collisionUser} is typing...</span>
                </div>
                <button 
                  onClick={() => handleAssignAgent(user?.id || '')}
                  className="text-xs bg-white border border-yellow-300 px-2 py-1 rounded hover:bg-yellow-50 text-yellow-800"
                >
                  Take Over
                </button>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-opacity-50">
              {loadingMessages ? (
                <div className="flex justify-center pt-10">
                  <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble 
                    key={msg.id} 
                    message={msg}
                    isSelected={selectedMessageIds.has(msg.id)}
                    onSelect={(checked) => toggleMessageSelection(msg.id, checked)}
                    onAction={handleMessageAction}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {isChatLocked ? (
              <div className="p-4 bg-gray-100 border-t border-gray-200 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                <Lock size={16} />
                Conversation is locked by <strong>{lockedByName}</strong>.
                <button 
                  onClick={() => handleAssignAgent(user?.id || 'usr_123')} 
                  className="text-blue-600 hover:underline font-medium ml-1"
                >
                  Take Over
                </button>
              </div>
            ) : (
              <ChatInput 
                onSendMessage={handleSendMessage} 
                isWindowOpen={windowOpen}
                onTyping={handleTyping}
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Send size={32} className="text-gray-400" />
            </div>
            <p className="text-lg font-medium">{t.pages.inbox.noSelection}</p>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR: Conversation Details / Order Panel */}
      {selectedConversation && (
        <div className={`
          absolute lg:relative w-full lg:w-80 bg-white h-full z-20 transition-transform duration-300 border-l border-gray-200
          ${(mobileView === 'details' || (showDetails && window.innerWidth >= 1024)) ? 'translate-x-0' : (dir === 'rtl' ? '-translate-x-full lg:translate-x-0 lg:hidden' : 'translate-x-full lg:translate-x-0 lg:hidden')}
        `}>
          <div className="h-full flex flex-col">
            <div className="lg:hidden p-4 border-b border-gray-100 flex items-center gap-2">
               <button onClick={() => setMobileView('chat')} className="text-gray-600"><ArrowLeft size={20}/></button>
               <span className="font-bold">Back to Chat</span>
            </div>
            
            {rightPanelMode === 'order' ? (
              <CreateOrderPanel 
                conversation={selectedConversation}
                agentId={user?.id || 'unknown'}
                onClose={() => setRightPanelMode('details')}
                onOrderCreated={handleOrderCreated}
              />
            ) : (
              <ConversationDetails 
                conversation={selectedConversation} 
                onBlock={handleBlockContact} 
                onDelete={handleDeleteConversation}
                onUpdateTags={handleUpdateTags}
              />
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default InboxPage;
