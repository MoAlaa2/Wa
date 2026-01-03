
export type Language = 'en' | 'ar';

export type Permission = 
  | 'view_dashboard'
  | 'view_analytics'
  | 'view_inbox'
  | 'manage_templates'
  | 'manage_flows'
  | 'manage_quick_replies'
  | 'manage_auto_replies'
  | 'manage_chatbot'
  | 'manage_knowledge_base'
  | 'view_settings'
  | 'manage_team'
  | 'manage_notifications'
  | 'manage_contacts'
  | 'manage_protection'
  | 'manage_orders' // New permission
  | 'approve_orders'; // New permission

export type UserRole = 'admin' | 'agent' | 'supervisor' | 'viewer'; // Added viewer
export type AgentMode = 'training' | 'standard' | 'senior'; // New Feature 14

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  permissions: Permission[];
  status: 'active' | 'disabled';
  teamId?: string; 
  agentMode: AgentMode; // New
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  permission: Permission;
  children?: NavItem[];
}

export interface RecentPage {
  path: string;
  title: string;
  timestamp: number;
}

// Enterprise Inbox Types
export type CampaignType = 'B2C' | 'B2B' | 'SUPPORT' | 'PROMO';
export type CampaignPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CampaignMetadata {
  campaignId: string;
  campaignName: string;
  campaignType: CampaignType;
  priority: CampaignPriority;
  source: string; // 'Broadcast', 'Ads', etc.
  sentAt: string;
}

export interface Team {
  id: string;
  name: string;
  type: 'SALES' | 'SUPPORT' | 'MARKETING';
}

export interface SystemTag {
  id: string;
  key: string;
  value: string;
  color: string; // Auto-generated based on key
}

// POS & Order Types
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  image?: string;
  manageStock?: boolean; // New
  branchId?: string; // New: Future-ready
}

export interface OrderItem {
  productId?: string; // Optional for custom items
  name: string;
  sku?: string;
  quantity: number;
  price: number;
  total: number;
  isCustom?: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  url: string;
  generatedAt: string;
  status: 'issued' | 'void';
}

export type OrderStatus = 'pending-payment' | 'processing' | 'completed' | 'cancelled' | 'failed' | 'refunded';
export type ApprovalStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'not_required';
export type FulfillmentType = 'delivery' | 'pickup' | 'none';

export interface OrderHistoryEntry {
  id: string;
  action: 'created' | 'submitted' | 'approved' | 'rejected' | 'payment_received' | 'link_sent' | 'invoice_generated' | 'stock_reserved' | 'stock_released' | 'fulfillment_updated' | 'price_override' | 'tax_updated';
  userId: string;
  userName: string;
  timestamp: string;
  notes?: string;
  metadata?: any;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string; // Denormalized for list view
  customerPhone: string; // Denormalized for list view
  conversationId: string;
  agentId: string;
  agentName?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  approvalStatus: ApprovalStatus;
  paymentLink?: string;
  paymentMethod?: 'tabby' | 'tamara' | 'hyperpay' | 'paypal' | 'cod';
  createdAt: string;
  history: OrderHistoryEntry[];
  branchId?: string; // New
  invoice?: Invoice; // New
  
  // New Operational Fields
  fulfillment: {
    type: FulfillmentType;
    branchId?: string; // If pickup
  };
  taxConfig: {
    enabled: boolean;
    rate: number; // e.g. 0.15 for 15%
    isOverride: boolean;
  };
  discount: number; // Fixed amount
  
  metadata?: {
    source: string;
    notes?: string;
    rejectionReason?: string;
  };
}

// Template Types
export type TemplateStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'DRAFT' | 'PAUSED';
export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';

export interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  buttons?: { type: string; text: string; url?: string; phoneNumber?: string }[];
  example?: { header_handle?: string[]; body_text?: string[][] };
}

export interface Template {
  id: string;
  name: string;
  language: string;
  status: TemplateStatus;
  category: TemplateCategory;
  components: TemplateComponent[];
  lastUpdated: string;
  rejectionReason?: string;
}

// Inbox Types
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed' | 'pending' | 'queued' | 'throttled';
export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'document' | 'template' | 'note' | 'feedback_request';
export type MessageDirection = 'inbound' | 'outbound';

export interface Message {
  id: string;
  conversationId: string;
  type: MessageType;
  content: string;
  timestamp: string;
  direction: MessageDirection;
  status: MessageStatus;
  senderName?: string;
  mediaUrl?: string;
  meta?: any;
  isDeleted?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  conversationId: string;
  agentId: string;
  rating: number;
  comment?: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  contactName: string;
  contactNumber: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  lastCustomerMessageTimestamp?: string; // For SLA
  windowExpiresAt?: string; // 24-hour window expiration
  unreadCount: number;
  status: 'open' | 'closed' | 'expired' | 'pending_feedback';
  assignedAgentId?: string;
  assignedTeamId?: string; // New: Routing
  context?: CampaignMetadata; // New: Campaign Context
  isLocked?: boolean; // New: Ownership
  lockedByAgentId?: string; // New: Ownership
  systemTags?: SystemTag[]; // New: Auto-tagging
  tags?: string[]; // Manual tags
  isBlocked?: boolean;
  createdAt?: string;
  lastOutgoingTimestamp?: string;
  feedback?: Feedback; // Feature 11
  
  // Presence & Collision
  typingUser?: string; // Agent ID who is typing
  typingExpiresAt?: number;
}

// Automation Types
export type AutoReplyType = 'welcome' | 'away' | 'keyword';
export type AutoReplyPriority = 'high' | 'medium' | 'low';

export interface AutoReply {
  id: string;
  type: AutoReplyType;
  name: string;
  enabled: boolean;
  matchType?: 'exact' | 'contains';
  keywords?: string[];
  trigger?: string;
  content: string;
  priority?: AutoReplyPriority; 
  schedule?: {
    startTime: string;
    endTime: string;
    days: number[];
    timezone: string;
  };
}

// Chatbot Types
export type FlowNodeType = 'message' | 'question' | 'action' | 'condition' | 'media' | 'list' | 'input';
export type BotTrigger = 'first_message' | 'keyword' | 'new_session' | 'manual';

export interface FlowNodeOption {
  id: string;
  label: string;
  description?: string; // For list messages
}

export interface FlowNodeData {
  // Common
  content?: string;
  
  // Media / Rich Content
  mediaType?: 'image' | 'video' | 'document' | 'audio' | 'sticker';
  mediaUrl?: string;
  caption?: string;
  
  // Interactive (Buttons/List)
  options?: FlowNodeOption[];
  questionType?: 'buttons' | 'list';
  buttonText?: string; // For CTA/Url buttons
  headerText?: string;
  footerText?: string;
  
  // Action specific
  actionType?: 'assign_agent' | 'add_tag' | 'remove_tag' | 'add_list' | 'internal_note' | 'delay' | 'end_chat' | 'api_request';
  actionValue?: string;
  
  // Variable Storage
  variableName?: string;
}

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  label: string;
  data: FlowNodeData; 
  position: { x: number; y: number };
}

export interface FlowEdge {
  id: string;
  source: string;
  sourceHandle?: string; 
  target: string;
}

export interface ChatFlow {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  status: 'active' | 'paused' | 'draft';
  language?: 'en' | 'ar' | 'mixed' | 'auto';
  priority?: number;
  triggers?: BotTrigger[];
  assignedNumbers?: string[];
  isWelcomeBot?: boolean; // Legacy flag, now handled by triggers
  nodes: FlowNode[];
  edges: FlowEdge[];
  lastModified: string;
}

// Quick Replies Types
export interface QuickReply {
  id: string;
  shortcut: string;
  content: string;
  category: string; 
}

// Analytics Types
export interface AnalyticsSummary {
  totalMessages: number;
  deliveredRate: number;
  readRate: number;
  failedRate: number;
  totalCost: number;
  costPerMessage: number;
  avgReadTime: string;
  activeConversations: number;
  peakHour: string;
  trends: {
    messages: number;
    cost: number;
    read: number;
  }
}

export interface MessageTimelineData {
  date: string;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}

export interface CostBreakdown {
  category: TemplateCategory | 'SERVICE';
  amount: number;
  percentage: number;
  count: number;
}

export interface ErrorLog {
  id: string;
  errorType: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  count: number;
  recommendation: string;
}

export interface AgentPerformance {
  id: string;
  name: string;
  chatsHandled: number;
  avgResponseTime: string;
  resolutionRate: number;
}

export interface CampaignHeatmapPoint {
  day: string;
  hour: number;
  intensity: number;
}

// Internal Notifications
export type InternalNotificationType = 'SYSTEM' | 'OPERATIONAL' | 'ADMIN' | 'CUSTOM';
export type InternalNotificationPriority = 'NORMAL' | 'IMPORTANT' | 'CRITICAL';

export interface InternalNotification {
  id: string;
  title: string;
  description: string;
  type: InternalNotificationType;
  priority: InternalNotificationPriority;
  timestamp: string;
  read: boolean;
  link?: string;
  sender?: string;
  target?: string;
}

// Other types (placeholder for existing ones not modified but needed for compilation)
export interface KnowledgeArticle { id: string; question: string; answer: string; tags: string[]; lastUpdated: string; category: string; }

// Campaign Types
export type CampaignStatus = 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'HALTED';

export interface NotificationCampaign {
  id: string;
  title: string;
  type: 'BROADCAST' | 'TRANSACTIONAL';
  templateId?: string;
  templateName?: string;
  recipientListId?: string;
  status: CampaignStatus;
  stats: {
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
  healthScore?: number;
  createdAt: string;
  lastUpdated: string;
  retryEnabled: boolean;
  throttling: number;
  emailReport: boolean;
}

export interface Contact { 
  id: string; 
  firstName?: string; 
  lastName?: string; 
  name?: string; // Backend field
  phone?: string; 
  phoneNumber?: string; // Backend field
  email?: string; 
  avatar?: string; 
  company?: string; // Backend field
  notes?: string; // Backend field
  status?: any; 
  tags: string[]; 
  lists?: string[]; 
  customAttributes?: Record<string, string>; 
  createdAt: string; 
  lastModified?: string;
  lastContactedAt?: string; // Backend field
}
export interface ContactList { id: string; name: string; count: number; isDefault?: boolean; createdAt: string; }
export interface ContactTag { id: string; name: string; color: string; count: number; }
export interface ContactSegment { id: string; name: string; criteria: any[]; count: number; }
export interface ImportJob { id: string; filename: string; status: string; progress: number; total: number; processed: number; startedAt: string; completedAt?: string; }

// Protection Layer Types
export interface ProtectionConfig {
  emergencyStop: boolean;
  warmUpMode: boolean;
  maxDailyMessages: number;
  currentDailyCount: number;
  baseDelayMs: number;
  consecutiveFailures: number;
  healthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

export interface QueueItem {
  id: string;
  messageId: string;
  conversationId: string;
  content: string;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  campaignId?: string;
  contactNumber: string;
  templateCategory?: TemplateCategory;
  queuedAt: string;
  status: 'PENDING' | 'PROCESSING' | 'FAILED' | 'COMPLETED';
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  estimatedCompletion: string;
  currentRate: number;
}

// Global Settings Types
export interface WorkingHoursConfig {
  enabled: boolean;
  timezone: string;
  schedule: {
    [key: string]: { // mon, tue, etc.
      enabled: boolean;
      start: string; // "09:00"
      end: string; // "17:00"
    };
  };
  holidays: string[]; // ISO dates
  offHoursMessage: string;
}

export interface SLAConfig {
  firstResponseMinutes: number; // e.g. 60
  resolutionHours: number; // e.g. 24
}

export interface GlobalSettings {
  inventory: {
    reserveOnApproval: boolean;
    lowStockThreshold: number;
  };
  invoicing: {
    autoGenerate: boolean;
    companyName: string;
    taxId: string;
  };
  workingHours: WorkingHoursConfig;
  sla: SLAConfig;
}
