
import axios from 'axios';
import { 
  Template, Conversation, Message, AutoReply, ChatFlow, KnowledgeArticle, Tag, 
  NotificationCampaign, Contact, ContactList, ContactTag, ImportJob, AnalyticsSummary, 
  InternalNotification, ProtectionConfig, QueueStats, 
  Team, Product, Order, QuickReply, GlobalSettings 
} from '../types';

// CRITICAL: Must use full URL in production (Vercel has no proxy)
// In development, Vite proxy handles /api -> localhost:3000
const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://guthmi-api-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('guthmi_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401) {
    localStorage.removeItem('guthmi_token');
    localStorage.removeItem('guthmi_user');
    window.location.href = '/#/login';
  }
  return Promise.reject(error);
});

export const whatsappService = {
  checkHealth: async (): Promise<boolean> => { 
    try { 
      await api.get('/health'); 
      return true; 
    } catch { return false; } 
  },

  // Templates
  getTemplates: async (): Promise<Template[]> => {
    try { const { data } = await api.get('/templates'); return data; } catch { return []; }
  },
  createTemplate: async (templateData: any): Promise<Template> => {
    const { data } = await api.post('/templates', templateData); return data;
  },
  deleteTemplate: async (id: string) => { await api.delete(`/templates/${id}`); },
  syncTemplates: async () => { await api.post('/templates/sync'); },
  getCampaign: async (id: string) => {
    try { const { data } = await api.get(`/notifications/${id}`); return data; } catch { return null; }
  },

  // Conversations
  getConversations: async (): Promise<Conversation[]> => {
    try { const { data } = await api.get('/conversations'); return data; } catch { return []; }
  },
  updateConversation: async (conv: any) => { await api.put(`/conversations/${conv.id}`, conv); },
  assignConversation: async (conversationId: string, agentId: string) => {
    await api.post(`/conversations/${conversationId}/assign`, { agentId });
  },
  
  // Messages
  getMessages: async (conversationId: string): Promise<Message[]> => {
    try { const { data } = await api.get(`/messages/${conversationId}`); return data; } catch { return []; }
  },
  sendMessage: async (conversationId: string, content: string, type: string): Promise<Message> => {
    const { data } = await api.post('/messages', { conversationId, content, type }); return data;
  },
  sendFeedbackRequest: async (conversationId: string, agentId: string) => {
    await api.post(`/conversations/${conversationId}/close`, { agentId });
  },

  // Orders
  getOrders: async (filters?: any): Promise<Order[]> => {
    try { const { data } = await api.get('/orders', { params: filters }); return data; } catch { return []; }
  },
  createOrder: async (orderData: any): Promise<Order> => {
    const { data } = await api.post('/orders', orderData); return data;
  },
  updateOrderStatus: async (id: string, action: string, userId: string, userName: string, notes?: string) => {
    await api.put(`/orders/${id}/status`, { action, userId, userName, notes });
  },
  updateOrder: async (id: string, updates: any, userId: string, userName: string) => {
    await api.put(`/orders/${id}`, { ...updates, userId, userName });
  },
  generateInvoice: async (orderId: string): Promise<string> => {
    return `/invoices/${orderId}.pdf`; 
  },

  // Analytics
  getAnalyticsSummary: async (range: string = '7d'): Promise<AnalyticsSummary> => {
    try { const { data } = await api.get('/analytics/summary', { params: { range } }); return data; } catch { return {} as any; }
  },
  getTimelineData: async (range: string) => {
    try { const { data } = await api.get('/analytics/timeline', { params: { range } }); return data; } catch { return []; }
  },
  getCostBreakdown: async () => {
    try { const { data } = await api.get('/analytics/cost-breakdown'); return data; } catch { return []; }
  },
  getHeatmapData: async () => {
    try { const { data } = await api.get('/analytics/heatmap'); return data; } catch { return []; }
  },
  getErrorLogs: async () => [], 

  // Settings
  getProtectionConfig: async (): Promise<ProtectionConfig> => {
    try { const { data } = await api.get('/settings/protection'); return data; } catch { return {} as any; }
  },
  updateProtectionConfig: async (config: any) => {
    await api.put('/settings/protection', config);
  },
  getGlobalSettings: async (): Promise<GlobalSettings> => {
    try { const { data } = await api.get('/settings/global'); return data; } catch { return {} as any; }
  },
  updateGlobalSettings: async (settings: any) => {
    await api.put('/settings/global', settings);
  },
  
  // Tags
  getTags: async (): Promise<Tag[]> => {
    try { const { data } = await api.get('/tags'); return data; } catch { return []; }
  },
  createTag: async (tag: any) => { await api.post('/tags', tag); },
  deleteTag: async (id: string) => { await api.delete(`/tags/${id}`); },

  // Internal Notifications
  getInternalNotifications: async (): Promise<InternalNotification[]> => {
    try { const { data } = await api.get('/internal-notifications'); return data; } catch { return []; }
  },
  createInternalNotification: async (n: any) => { await api.post('/internal-notifications', n); },
  markNotificationRead: async (id: string) => { await api.put(`/internal-notifications/${id}/read`); },

  // Products
  getProducts: async (query: string): Promise<Product[]> => {
    try { const { data } = await api.get('/products', { params: { search: query } }); return data; } catch { return []; }
  },

  // Queue Control
  setEmergencyStop: async (enabled: boolean) => {
    await api.post('/queue/emergency-stop', { enabled });
  },
  setDailyCap: async (cap: number) => {
    await api.post('/queue/set-daily-cap', { cap });
  },

  // Campaigns
  getCampaigns: async (): Promise<NotificationCampaign[]> => {
    try { const { data } = await api.get('/notifications'); return data; } catch { return []; }
  },
  saveCampaign: async (c: any) => {
    const { data } = await api.post('/notifications', c); return data;
  },
  deleteCampaign: async (id: string) => { await api.delete(`/notifications/${id}`); },
  toggleCampaignStatus: async (id: string) => { await api.put(`/notifications/${id}/toggle`); },

  // Contacts
  getContacts: async (): Promise<Contact[]> => {
    try { const { data } = await api.get('/contacts'); return data; } catch { return []; }
  },
  saveContact: async (c: any) => { await api.post('/contacts', c); },
  deleteContact: async (id: string) => { await api.delete(`/contacts/${id}`); },
  
  // Lists - TODO: Backend needs to implement these endpoints
  getContactLists: async () => {
    // Mock data until backend implements /contacts/lists endpoint
    return [];
  },
  saveContactList: async (l: any) => {
    // TODO: Backend needs POST/PUT /contacts/lists endpoint
    return l;
  },
  deleteContactList: async (id: string) => {
    // TODO: Backend needs DELETE /contacts/lists/:id endpoint
  },
  
  // Tags - TODO: Backend needs to implement these endpoints  
  getContactTags: async () => {
    // Mock data until backend implements /contacts/tags endpoint
    return [];
  },
  saveContactTag: async (t: any) => {
    // TODO: Backend needs POST/PUT /contacts/tags endpoint
    return t;
  },
  deleteContactTag: async (id: string) => {
    // TODO: Backend needs DELETE /contacts/tags/:id endpoint
  },
  
  importContacts: async (file: any) => ({}) as ImportJob,
  getImportHistory: async () => [],

  // Automation - REAL ENDPOINTS
  getQuickReplies: async () => { 
    try { const { data } = await api.get('/automation/quick-replies'); return data; } catch { return []; } 
  },
  saveQuickReply: async (r: any) => { 
    const { data } = await api.post('/automation/quick-replies', r); return data; 
  },
  deleteQuickReply: async (id: string) => { 
    await api.delete(`/automation/quick-replies/${id}`); 
  },
  
  getAutoReplies: async () => { try { const { data } = await api.get('/automation/auto-replies'); return data; } catch { return []; } },
  saveAutoReply: async (r: any) => { const { data } = await api.post('/automation/auto-replies', r); return data; },
  deleteAutoReply: async (id: string) => { await api.delete(`/automation/auto-replies/${id}`); },
  toggleAutoReply: async (id: string, e: boolean) => { await api.put(`/automation/auto-replies/${id}/toggle`, { enabled: e }); },
  
  getChatFlows: async () => { 
    try { const { data } = await api.get('/automation/flows'); return data; } catch { return []; } 
  },
  saveChatFlow: async (f: any) => { 
    const { data } = await api.post('/automation/flows', f); return data; 
  },
  deleteChatFlow: async (id: string) => { 
    await api.delete(`/automation/flows/${id}`); 
  },
  
  getKnowledgeArticles: async () => [],
  saveKnowledgeArticle: async (a: any) => a,
  deleteKnowledgeArticle: async (id: string) => {},

  getQueueStats: async (): Promise<QueueStats> => {
    try {
      const { data } = await api.get('/queue/stats');
      return data;
    } catch {
      return { pending: 0, processing: 0, completed: 0, failed: 0, estimatedCompletion: '0s', currentRate: 0 } as QueueStats;
    }
  },

  getUsers: async () => {
    try {
      const { data } = await api.get('/users');
      return data;
    } catch {
      return [];
    }
  },
};
