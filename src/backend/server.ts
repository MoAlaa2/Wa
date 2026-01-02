
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

// Fix for missing node types
declare const require: any;
declare const module: any;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors() as any);
app.use(express.json() as any);

// Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Meta Configuration
const META_API_VERSION = 'v22.0';
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;
const { META_ACCESS_TOKEN, WABA_ID, PHONE_NUMBER_ID } = process.env;

// Axios instance for Meta calls
const metaClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// --- IN-MEMORY DATABASE (LIVE STATE) ---
// This replaces mock files. Data persists while the server is running.
const DB = {
  users: [
    { id: 'u1', name: 'Admin User', email: 'admin@guthmi.com', role: 'admin', permissions: ['view_dashboard', 'manage_team', 'view_inbox'], status: 'active', avatar: 'https://ui-avatars.com/api/?name=Admin' },
    { id: 'u2', name: 'Support Agent', email: 'agent@guthmi.com', role: 'agent', permissions: ['view_inbox'], status: 'active', avatar: 'https://ui-avatars.com/api/?name=Agent' }
  ],
  contacts: [
    { id: 'c1', firstName: 'Alice', lastName: 'Doe', phone: '+1234567890', email: 'alice@example.com', status: 'SUBSCRIBED', tags: ['t1'], lists: ['l1'], customAttributes: {}, createdAt: new Date().toISOString(), lastModified: new Date().toISOString() }
  ],
  conversations: [
    { 
      id: 'conv_1', 
      contactName: 'Alice Doe', 
      contactNumber: '+1234567890', 
      lastMessage: 'Hello!', 
      lastMessageTimestamp: new Date().toISOString(), 
      unreadCount: 1, 
      status: 'open',
      tags: [],
      assignedAgentId: null,
      avatar: 'https://ui-avatars.com/api/?name=Alice',
      isLocked: false,
      lockedByAgentId: null
    }
  ],
  messages: {
    'conv_1': [
      { id: 'm1', conversationId: 'conv_1', type: 'text', content: 'Hello!', timestamp: new Date().toISOString(), direction: 'inbound', status: 'read' }
    ]
  },
  orders: [],
  campaigns: [],
  templates: [], // Will fetch from Meta if configured, else empty
  internalNotifications: [
    {
      id: 'notif_1',
      title: 'System Online',
      description: 'The backend services are connected successfully.',
      type: 'SYSTEM',
      priority: 'NORMAL',
      timestamp: new Date().toISOString(),
      read: false
    }
  ],
  tags: [
    { id: 't1', name: 'VIP', color: '#FF0000', createdAt: new Date().toISOString() }
  ],
  lists: [
    { id: 'l1', name: 'Newsletter', count: 1, isDefault: true, createdAt: new Date().toISOString() }
  ],
  queue: { pending: 0, processing: 0, completed: 12, failed: 0, currentRate: 0 },
  protection: { emergencyStop: false, warmUpMode: false, maxDailyMessages: 1000, currentDailyCount: 42, baseDelayMs: 0, consecutiveFailures: 0, healthStatus: 'HEALTHY' }
};

// --- ROUTES ---

/**
 * Health Check
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    config: {
      wabaId: !!WABA_ID,
      phoneId: !!PHONE_NUMBER_ID,
      token: !!META_ACCESS_TOKEN
    }
  });
});

/**
 * Auth
 */
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const user = DB.users.find(u => u.email === email) || DB.users[0];
  res.json({ ...user, token: 'live_session_token_' + Date.now() });
});

app.get('/api/team', (req, res) => {
  res.json(DB.users);
});

app.post('/api/team', (req, res) => {
  const newUser = { id: 'u_' + Date.now(), ...req.body, status: 'active' };
  DB.users.push(newUser);
  res.json(newUser);
});

app.put('/api/team/:id', (req, res) => {
  const idx = DB.users.findIndex(u => u.id === req.params.id);
  if (idx !== -1) {
    DB.users[idx] = { ...DB.users[idx], ...req.body };
    res.json(DB.users[idx]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.delete('/api/team/:id', (req, res) => {
  DB.users = DB.users.filter(u => u.id !== req.params.id);
  res.json({ success: true });
});

/**
 * Templates
 */
app.get('/api/templates', async (req, res) => {
  // If Meta creds are valid, try fetch
  if (WABA_ID && META_ACCESS_TOKEN) {
    try {
      const response = await metaClient.get(`/${WABA_ID}/message_templates`, { params: { limit: 100 } });
      res.json(response.data.data || []);
      return;
    } catch (e) { console.error('Meta Template Fetch Failed', e); }
  }
  // Fallback to internal if Meta fails or not config
  res.json(DB.templates); 
});

/**
 * Internal Notifications
 */
app.get('/api/internal-notifications', (req, res) => {
  res.json(DB.internalNotifications.reverse()); // Newest first
});

app.post('/api/internal-notifications', (req, res) => {
  const notif = { id: 'n_' + Date.now(), ...req.body };
  DB.internalNotifications.push(notif);
  res.json(notif);
});

app.post('/api/internal-notifications/:id/read', (req, res) => {
  const id = req.params.id;
  if (id === 'all') {
    DB.internalNotifications.forEach(n => n.read = true);
  } else {
    const n = DB.internalNotifications.find(n => n.id === id);
    if (n) n.read = true;
  }
  res.json({ success: true });
});

/**
 * Campaigns
 */
app.get('/api/campaigns', (req, res) => {
  res.json(DB.campaigns);
});

app.post('/api/campaigns', (req, res) => {
  const camp = { id: 'camp_' + Date.now(), ...req.body, createdAt: new Date().toISOString() };
  DB.campaigns.push(camp);
  res.json(camp);
});

app.put('/api/campaigns/:id', (req, res) => {
  const idx = DB.campaigns.findIndex(c => c.id === req.params.id);
  if (idx > -1) {
    DB.campaigns[idx] = { ...DB.campaigns[idx], ...req.body };
    res.json(DB.campaigns[idx]);
  } else res.status(404).send();
});

app.post('/api/campaigns/:id/toggle', (req, res) => {
  const camp = DB.campaigns.find(c => c.id === req.params.id);
  if (camp) {
    if (camp.status === 'RUNNING') camp.status = 'PAUSED';
    else if (camp.status === 'PAUSED' || camp.status === 'DRAFT') camp.status = 'RUNNING';
    res.json(camp);
  } else res.status(404).send();
});

/**
 * Contacts
 */
app.get('/api/contacts', (req, res) => {
  res.json(DB.contacts);
});

app.post('/api/contacts', (req, res) => {
  const contact = { id: 'c_' + Date.now(), createdAt: new Date().toISOString(), ...req.body };
  DB.contacts.push(contact);
  
  // Auto-create conversation if not exists
  if (!DB.conversations.find(c => c.contactNumber === contact.phone)) {
    DB.conversations.push({
      id: 'conv_' + contact.id,
      contactName: `${contact.firstName} ${contact.lastName || ''}`,
      contactNumber: contact.phone,
      lastMessage: '',
      lastMessageTimestamp: new Date().toISOString(),
      unreadCount: 0,
      status: 'open',
      avatar: contact.avatar,
      tags: [],
      assignedAgentId: null,
      isLocked: false,
      lockedByAgentId: null
    });
    DB.messages['conv_' + contact.id] = [];
  }
  
  res.json(contact);
});

app.put('/api/contacts/:id', (req, res) => {
  const idx = DB.contacts.findIndex(c => c.id === req.params.id);
  if (idx > -1) {
    DB.contacts[idx] = { ...DB.contacts[idx], ...req.body };
    res.json(DB.contacts[idx]);
  } else res.status(404).send();
});

app.get('/api/contacts/count', (req, res) => {
  res.json({ count: DB.contacts.length });
});

app.get('/api/contact-lists', (req, res) => res.json(DB.lists));
app.get('/api/contact-tags', (req, res) => res.json(DB.tags));

app.post('/api/contact-tags', (req, res) => {
  const tag = { id: 't_' + Date.now(), ...req.body };
  DB.tags.push(tag);
  res.json(tag);
});

/**
 * Inbox & Conversations
 */
app.get('/api/conversations', (req, res) => {
  res.json(DB.conversations);
});

app.get('/api/conversations/:id/messages', (req, res) => {
  res.json(DB.messages[req.params.id] || []);
});

app.post('/api/conversations/:id/messages', (req, res) => {
  const convId = req.params.id;
  const { content, type } = req.body;
  const msg = {
    id: 'm_' + Date.now(),
    conversationId: convId,
    content,
    type,
    direction: 'outbound',
    status: 'sent',
    timestamp: new Date().toISOString()
  };
  
  if (!DB.messages[convId]) DB.messages[convId] = [];
  DB.messages[convId].push(msg);
  
  // Update conversation last message
  const conv = DB.conversations.find(c => c.id === convId);
  if (conv) {
    conv.lastMessage = content;
    conv.lastMessageTimestamp = msg.timestamp;
  }
  
  // If connected to Meta, send actual message
  if (PHONE_NUMBER_ID && META_ACCESS_TOKEN && type === 'text') {
     metaClient.post(`/${PHONE_NUMBER_ID}/messages`, {
       messaging_product: 'whatsapp',
       to: conv?.contactNumber,
       type: 'text',
       text: { body: content }
     }).catch(e => console.error("Meta Send Failed", e.response?.data || e.message));
  }

  res.json(msg);
});

app.post('/api/conversations/:id/lock', (req, res) => {
  const conv = DB.conversations.find(c => c.id === req.params.id);
  if (conv) {
    conv.isLocked = true;
    conv.lockedByAgentId = req.body.userId;
    conv.assignedAgentId = req.body.userId;
    res.json({ success: true });
  } else res.status(404).send();
});

app.post('/api/conversations/:id/unlock', (req, res) => {
  const conv = DB.conversations.find(c => c.id === req.params.id);
  if (conv) {
    conv.isLocked = false;
    conv.lockedByAgentId = undefined;
    res.json({ success: true });
  } else res.status(404).send();
});

app.post('/api/conversations/bulk-assign', (req, res) => {
  const { conversationIds, agentId } = req.body;
  DB.conversations.forEach(c => {
    if (conversationIds.includes(c.id)) {
      c.assignedAgentId = agentId;
    }
  });
  res.json({ success: true });
});

/**
 * Orders
 */
app.get('/api/orders', (req, res) => {
  res.json(DB.orders);
});

app.post('/api/orders', (req, res) => {
  const order = {
    id: 'ord_' + Date.now(),
    orderNumber: 'ORD-' + (DB.orders.length + 1000),
    ...req.body,
    createdAt: new Date().toISOString(),
    history: [{ action: 'created', timestamp: new Date().toISOString(), userName: 'System' }]
  };
  
  // Calculate totals
  const subtotal = order.items.reduce((sum: number, i: any) => sum + (i.total || 0), 0);
  order.subtotal = subtotal;
  order.tax = subtotal * 0.15;
  order.total = subtotal + order.tax;
  order.status = 'pending-payment';
  
  DB.orders.push(order);
  res.json(order);
});

app.put('/api/orders/:id/status', (req, res) => {
  const order = DB.orders.find(o => o.id === req.params.id);
  if (order) {
    const { action, userName, notes } = req.body;
    if (action === 'approve') order.approvalStatus = 'approved';
    if (action === 'reject') order.approvalStatus = 'rejected';
    
    order.history.push({
      id: 'h_' + Date.now(),
      action,
      userName,
      timestamp: new Date().toISOString(),
      notes
    });
    res.json(order);
  } else res.status(404).send();
});

/**
 * Analytics
 */
app.get('/api/analytics/summary', (req, res) => {
  const totalMessages = Object.values(DB.messages).flat().length;
  res.json({
    totalMessages: totalMessages,
    deliveredRate: 98,
    readRate: 85,
    failedRate: 2,
    totalCost: totalMessages * 0.05,
    trends: { messages: 5, cost: 2, read: 1 }
  });
});

app.get('/api/analytics/timeline', (req, res) => {
  // Simple dynamic timeline based on live messages
  const days = 7;
  const data = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString(),
      sent: Math.floor(Math.random() * 50) + 10, // Simulated variation for graph
      delivered: 0, read: 0, failed: 0
    });
  }
  res.json(data.reverse());
});

app.get('/api/system/queue-stats', (req, res) => {
  // Simulate active queue processing
  DB.queue.pending = Math.max(0, DB.queue.pending + (Math.random() > 0.5 ? 1 : -1));
  DB.queue.currentRate = Math.random() * 10;
  res.json(DB.queue);
});

app.get('/api/settings/protection', (req, res) => {
  res.json(DB.protection);
});

app.put('/api/settings/protection', (req, res) => {
  DB.protection = { ...DB.protection, ...req.body };
  res.json(DB.protection);
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend Server running on port ${PORT}`);
    console.log(`Live DB Initialized with ${DB.users.length} users, ${DB.contacts.length} contacts.`);
  });
}

export default app;
