import axios from 'axios';
import {
  Template,
  Conversation,
  Message,
  AutoReply,
  ChatFlow,
  KnowledgeArticle,
  Tag,
  NotificationCampaign,
  Contact,
  ContactList,
  ContactTag,
  ImportJob,
  AnalyticsSummary,
  MessageTimelineData,
  CostBreakdown,
  ErrorLog,
  AgentPerformance,
  CampaignHeatmapPoint,
  InternalNotification,
  ProtectionConfig,
  QueueItem,
  QueueStats,
  Team,
  Product,
  Order,
  OrderItem,
  GlobalSettings,
  User,
  QuickReply
} from '../types';

// ==============================
// API Configuration (FIXED)
// ==============================
const getBaseUrl = () => {
  // ✅ Vercel / Production
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    // @ts-ignore
    return import.meta.env.VITE_API_BASE_URL;
  }

  // ✅ Local development
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:3000';
  }

  // ✅ Production fallback
  return 'https://api.guthmi.site';
};

// ⚠️ /api يتحط هنا فقط
const API_BASE = `${getBaseUrl()}/api`;

console.log('🔌 API Service Initialized:', API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==============================
// Request interceptor (Auth)
// ==============================
api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('guthmi_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (e) {
      console.warn('Invalid user token in storage');
    }
  }
  return config;
});

export default api;

// Helper for safe fetch to prevent UI crashes
const safeGet = async <T>(url: string, fallback: T): Promise<T> => {
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.warn(`API Error [${url}]:`, error);
    return fallback;
  }
};

export const whatsappService = {
  // --- HEALTH & AUTH ---
  checkHealth: async (): Promise<boolean> => { 
    try { 
      await api.get('/health'); 
      return true; 
    } catch { 
      return false; 
    } 
  },

 login: async (email: string): Promise<User | null> => {
  try {
    console.log(`Attempting login to /login for ${email}`);

    const response = await api.post('/login', { email });

    console.log('Login success', response.data);
    return response.data;
  } catch (error) {
    console.error('Login failed', error);
    return null;
  }
},

  // --- TEAM MANAGEMENT ---
  getUsers: async (): Promise<User[]> => safeGet('/team', []),
  
  saveUser: async (user: Partial<User>): Promise<User> => {
    if (user.id) {
      const response = await api.put(`/team/${user.id}`, user);
      return response.data;
    } else {
      const response = await api.post('/team', user);
      return response.data;
    }
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/team/${id}`);
  },

  // --- TEMPLATES ---
  getTemplates: async (): Promise<Template[]> => safeGet('/templates', []),
  
  deleteTemplate: async (id: string): Promise<void> => { 
    await api.delete(`/templates/${id}`);
  },

  // --- CHAT FLOWS ---
  getChatFlows: async (): Promise<ChatFlow[]> => safeGet('/flows', []),
  
  saveChatFlow: async (flow: ChatFlow): Promise<ChatFlow> => { 
    if (flow.id && !flow.id.startsWith('flow_')) { 
      const response = await api.put(`/flows/${flow.id}`, flow);
      return response.data;
    } else {
      const response = await api.post('/flows', flow);
      return response.data;
    }
  },
  
  deleteChatFlow: async (id: string): Promise<void> => { 
    await api.delete(`/flows/${id}`);
  },
  
  // --- TEAMS (GROUPS) ---
  getTeams: async (): Promise<Team[]> => safeGet('/teams', []),

  // --- QUICK REPLIES ---
  getQuickReplies: async (): Promise<QuickReply[]> => safeGet('/quick-replies', []),
  
  saveQuickReply: async (reply: Partial<QuickReply>): Promise<QuickReply> => {
    if (reply.id) {
      const response = await api.put(`/quick-replies/${reply.id}`, reply);
      return response.data;
    }
    const response = await api.post('/quick-replies', reply);
    return response.data;
  },
  
  deleteQuickReply: async (id: string): Promise<void> => {
    await api.delete(`/quick-replies/${id}`);
  },
  
  // --- AUTO REPLIES ---
  getAutoReplies: async (): Promise<AutoReply[]> => safeGet('/auto-replies', []),
  
  toggleAutoReply: async (id: string, enabled: boolean): Promise<void> => {
    await api.patch(`/auto-replies/${id}`, { enabled });
  },
  
  saveAutoReply: async (reply: Partial<AutoReply>): Promise<AutoReply> => {
    if (reply.id) {
      const response = await api.put(`/auto-replies/${reply.id}`, reply);
      return response.data;
    }
    const response = await api.post('/auto-replies', reply);
    return response.data;
  },
  
  deleteAutoReply: async (id: string): Promise<void> => {
    await api.delete(`/auto-replies/${id}`);
  },
  
  // --- KNOWLEDGE BASE ---
  getKnowledgeArticles: async (): Promise<KnowledgeArticle[]> => safeGet('/knowledge-base', []),
  
  saveKnowledgeArticle: async (article: Partial<KnowledgeArticle>): Promise<void> => {
    if (article.id) {
      await api.put(`/knowledge-base/${article.id}`, article);
    } else {
      await api.post('/knowledge-base', article);
    }
  },
  
  deleteKnowledgeArticle: async (id: string): Promise<void> => {
    await api.delete(`/knowledge-base/${id}`);
  },
  
  // --- CAMPAIGNS ---
  getCampaigns: async (): Promise<NotificationCampaign[]> => safeGet('/campaigns', []),
  
  getCampaign: async (id: string): Promise<NotificationCampaign | undefined> => {
    try {
      const response = await api.get(`/campaigns/${id}`);
      return response.data;
    } catch {
      return undefined;
    }
  },
  
  saveCampaign: async (campaign: Partial<NotificationCampaign>): Promise<NotificationCampaign> => {
    if (campaign.id) {
      const response = await api.put(`/campaigns/${campaign.id}`, campaign);
      return response.data;
    }
    const response = await api.post('/campaigns', campaign);
    return response.data;
  },
  
  deleteCampaign: async (id: string): Promise<void> => {
    await api.delete(`/campaigns/${id}`);
  },
  
  toggleCampaignStatus: async (id: string): Promise<void> => {
    await api.post(`/campaigns/${id}/toggle`);
  },
  
  // --- CONTACTS ---
  getContacts: async (): Promise<Contact[]> => safeGet('/contacts', []),
  
  getContactsCount: async (): Promise<number> => {
    try {
      const response = await api.get('/contacts/count');
      return response.data.count;
    } catch {
      return 0;
    }
  },

  saveContact: async (contact: Partial<Contact>): Promise<Contact> => {
    if (contact.id) {
      const response = await api.put(`/contacts/${contact.id}`, contact);
      return response.data;
    }
    const response = await api.post('/contacts', contact);
    return response.data;
  },
  
  deleteContact: async (id: string): Promise<void> => {
    await api.delete(`/contacts/${id}`);
  },
  
  getContactLists: async (): Promise<ContactList[]> => safeGet('/contact-lists', []),
  
  saveContactList: async (list: Partial<ContactList>): Promise<void> => {
    if (list.id) {
      await api.put(`/contact-lists/${list.id}`, list);
    } else {
      await api.post('/contact-lists', list);
    }
  },
  
  deleteContactList: async (id: string): Promise<void> => {
    await api.delete(`/contact-lists/${id}`);
  },
  
  getContactTags: async (): Promise<ContactTag[]> => safeGet('/contact-tags', []),
  
  saveContactTag: async (tag: Partial<ContactTag>): Promise<void> => {
    if (tag.id) {
      await api.put(`/contact-tags/${tag.id}`, tag);
    } else {
      await api.post('/contact-tags', tag);
    }
  },
  
  deleteContactTag: async (id: string): Promise<void> => {
    await api.delete(`/contact-tags/${id}`);
  },
  
  importContacts: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await api.post('/contacts/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  getImportHistory: async (): Promise<ImportJob[]> => safeGet('/contacts/import-history', []),
  
  // --- ANALYTICS ---
  getAnalyticsSummary: async (range?: string): Promise<AnalyticsSummary> => {
    try {
      const response = await api.get('/analytics/summary', { params: { range } });
      return response.data;
    } catch {
      return { totalMessages: 0, deliveredRate: 0, readRate: 0, failedRate: 0, totalCost: 0, costPerMessage: 0, avgReadTime: '0s', activeConversations: 0, peakHour: '-', trends: { messages: 0, cost: 0, read: 0 } };
    }
  },
  
  getTimelineData: async (range: string): Promise<MessageTimelineData[]> => safeGet('/analytics/timeline', []),
  
  getCostBreakdown: async (): Promise<CostBreakdown[]> => safeGet('/analytics/cost', []),
  
  getErrorLogs: async (): Promise<ErrorLog[]> => safeGet('/analytics/errors', []),
  
  getAgentPerformance: async (): Promise<AgentPerformance[]> => safeGet('/analytics/agents', []),
  
  getHeatmapData: async (): Promise<CampaignHeatmapPoint[]> => safeGet('/analytics/heatmap', []),
  
  // --- INTERNAL NOTIFICATIONS ---
  getInternalNotifications: async (): Promise<InternalNotification[]> => safeGet('/internal-notifications', []),
  
  markNotificationRead: async (id: string): Promise<void> => {
    try {
      await api.post(`/internal-notifications/${id}/read`);
    } catch (e) { console.error(e); }
  },
  
  createInternalNotification: async (notification: Partial<InternalNotification>): Promise<void> => {
    await api.post('/internal-notifications', notification);
  },
  
  // --- PROTECTION LAYER ---
  getProtectionConfig: async (): Promise<ProtectionConfig> => {
    return safeGet('/settings/protection', { 
      emergencyStop: false, warmUpMode: false, maxDailyMessages: 1000, 
      currentDailyCount: 0, baseDelayMs: 0, consecutiveFailures: 0, healthStatus: 'HEALTHY' 
    });
  },
  
  updateProtectionConfig: async (config: Partial<ProtectionConfig>): Promise<void> => {
    await api.put('/settings/protection', config);
  },
  
  getQueueStats: async (): Promise<QueueStats> => {
    return safeGet('/system/queue-stats', { pending: 0, processing: 0, completed: 0, failed: 0, estimatedCompletion: '-', currentRate: 0 });
  },
  
  // --- GLOBAL SETTINGS ---
  getGlobalSettings: async (): Promise<GlobalSettings> => safeGet('/settings/global', {
    inventory: { reserveOnApproval: false, lowStockThreshold: 0 },
    invoicing: { autoGenerate: false, companyName: '', taxId: '' },
    workingHours: { enabled: false, timezone: '', schedule: {}, holidays: [], offHoursMessage: '' },
    sla: { firstResponseMinutes: 0, resolutionHours: 0 }
  }),
  
  updateGlobalSettings: async (settings: Partial<GlobalSettings>): Promise<GlobalSettings> => {
    const response = await api.put('/settings/global', settings);
    return response.data;
  },

  // --- MESSAGING & INBOX ---
  getConversations: async (): Promise<Conversation[]> => safeGet('/conversations', []),

  getMessages: async (id: string): Promise<Message[]> => safeGet(`/conversations/${id}/messages`, []),

  sendMessage: async (conversationId: string, content: string, type: 'text' | 'note' | 'feedback_request'): Promise<Message> => {
    const response = await api.post(`/conversations/${conversationId}/messages`, { content, type });
    return response.data;
  },
  
  sendFeedbackRequest: async (conversationId: string, agentId: string): Promise<void> => {
    await api.post(`/conversations/${conversationId}/feedback-request`, { agentId });
  },

  submitFeedback: async (conversationId: string, rating: number, comment?: string): Promise<void> => {
    await api.post(`/conversations/${conversationId}/feedback`, { rating, comment });
  },

  updateConversation: async (conversation: Partial<Conversation>): Promise<void> => {
    await api.put(`/conversations/${conversation.id}`, conversation);
  },

  // --- TAGS (CONVERSATION) ---
  getTags: async (): Promise<Tag[]> => safeGet('/tags', []),
  
  createTag: async (tag: Partial<Tag>): Promise<Tag> => {
    const response = await api.post('/tags', tag);
    return response.data;
  },
  
  deleteTag: async (id: string): Promise<void> => {
    await api.delete(`/tags/${id}`);
  },

  // --- LOCKING & ASSIGNMENT ---
  acquireLock: async (conversationId: string, userId: string): Promise<boolean> => {
    try {
      const response = await api.post(`/conversations/${conversationId}/lock`, { userId });
      return response.data.success;
    } catch {
      return false;
    }
  },

  releaseLock: async (conversationId: string): Promise<void> => {
    await api.post(`/conversations/${conversationId}/unlock`);
  },

  bulkAssign: async (conversationIds: string[], agentId: string): Promise<void> => {
    await api.post('/conversations/bulk-assign', { conversationIds, agentId });
  },

  bulkTag: async (conversationIds: string[], tagId: string): Promise<void> => {
    await api.post('/conversations/bulk-tag', { conversationIds, tagId });
  },

  bulkStatusUpdate: async (conversationIds: string[], status: string): Promise<void> => {
    await api.post('/conversations/bulk-status', { conversationIds, status });
  },

  // --- GLOBAL SEARCH ---
  globalSearch: async (query: string): Promise<any[]> => {
    if (!query) return [];
    return safeGet(`/search?q=${query}`, []);
  },

  // --- POS & ORDER MANAGEMENT ---
  getProducts: async (query?: string): Promise<Product[]> => safeGet(`/products?q=${query || ''}`, []),

  createOrder: async (orderData: any): Promise<Order> => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getOrders: async (filters?: any): Promise<Order[]> => safeGet('/orders', []),

  updateOrder: async (orderId: string, updates: Partial<Order>, userId: string, userName: string, notes?: string): Promise<Order> => {
    const response = await api.put(`/orders/${orderId}`, { updates, userId, userName, notes });
    return response.data;
  },

  updateOrderStatus: async (orderId: string, action: 'approve' | 'reject', userId: string, userName: string, notes?: string): Promise<Order> => {
    const response = await api.put(`/orders/${orderId}/status`, { action, userId, userName, notes });
    return response.data;
  },

  generateInvoice: async (orderId: string): Promise<string> => {
    const response = await api.post(`/orders/${orderId}/invoice`);
    return response.data.url;
  }
};
