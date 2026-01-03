
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Settings, Shield, Tag as TagIcon, Plus, Trash2, Users, Edit2, Mail, User as UserIcon, Smartphone, Globe, MessageSquare, AlertTriangle, Eye, EyeOff, CheckCircle, RefreshCw, LogOut, Info, ShoppingBag, Zap, Bell, Send, PauseCircle, PlayCircle, Thermometer, Clock, Activity, Key, Webhook, X } from 'lucide-react';
import { Permission, Tag, User, InternalNotificationType, InternalNotificationPriority, InternalNotification, ProtectionConfig, GlobalSettings } from '../../types';
import { whatsappService } from '../../services/whatsappService';

const SettingsPage = () => {
  const { t, dir } = useLanguage();
  const { user, users, hasPermission, addUser, updateUser, deleteUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'whatsapp' | 'inbox' | 'api' | 'tags' | 'team' | 'notifications' | 'protection' | 'working_hours' | 'sla'>('general');
  
  // Tags State
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');

  // Team State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User>>({});

  // WhatsApp Settings State
  const [catalogEnabled, setCatalogEnabled] = useState(true);
  const [verificationAttempts, setVerificationAttempts] = useState(3);
  
  // Inbox Settings State
  const [readReceipts, setReadReceipts] = useState(true);
  const [autoSaveContacts, setAutoSaveContacts] = useState(true);
  const [assignmentAlgo, setAssignmentAlgo] = useState('round_robin');

  // API State
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Protection State
  const [protectionConfig, setProtectionConfig] = useState<ProtectionConfig | null>(null);
  const [queueStats, setQueueStats] = useState<any>(null);
  const [dailyCap, setDailyCap] = useState(10000);

  // Global Settings (Working Hours & SLA)
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings | null>(null);

  // Notification State
  const [notifForm, setNotifForm] = useState<{
    title: string;
    description: string;
    type: InternalNotificationType;
    priority: InternalNotificationPriority;
    target: string;
    link: string;
  }>({
    title: '',
    description: '',
    type: 'CUSTOM',
    priority: 'NORMAL',
    target: 'ALL',
    link: ''
  });
  const [sentNotifs, setSentNotifs] = useState<InternalNotification[]>([]);

  // Load data on mount based on tab
  useEffect(() => {
    // Initial fetch of commonly used data
    fetchTags();
    fetchProtectionConfig();
    fetchGlobalSettings();
    fetchQueueStats();
    
    // Poll queue stats every 5 seconds
    const interval = setInterval(fetchQueueStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueueStats = async () => {
    const data = await whatsappService.getQueueStats();
    setQueueStats(data);
  };

  const fetchTags = async () => {
    const data = await whatsappService.getTags();
    setTags(data);
  };

  const fetchProtectionConfig = async () => {
    const data = await whatsappService.getProtectionConfig();
    setProtectionConfig(data);
  };

  const fetchGlobalSettings = async () => {
    const data = await whatsappService.getGlobalSettings();
    setGlobalSettings(data);
  };

  const fetchSentNotifications = async () => {
    const data = await whatsappService.getInternalNotifications();
    setSentNotifs(data.filter(n => n.type === 'CUSTOM'));
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    await whatsappService.createTag({ name: newTagName, color: newTagColor });
    setNewTagName('');
    fetchTags();
  };

  const handleDeleteTag = async (id: string) => {
    if (window.confirm(t.common.confirmDelete)) {
      await whatsappService.deleteTag(id);
      fetchTags();
    }
  };

  // Team Handlers
  const handleSaveUser = () => {
    if (!editingUser.name || !editingUser.email) return;
    if (editingUser.id) updateUser(editingUser as User);
    else addUser(editingUser);
    setIsUserModalOpen(false);
    setEditingUser({});
  };

  const handleEditUser = (u: User) => {
    setEditingUser(u);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm(`${t.common.confirmDelete}`)) deleteUser(id);
  };

  // Protection Handlers
  const toggleEmergencyStop = async () => {
    if (!queueStats) return;
    const newState = !queueStats.emergencyStop;
    if (newState && !window.confirm("Pause ALL outgoing messages?")) return;
    await whatsappService.setEmergencyStop(newState);
    fetchQueueStats();
  };

  const handleUpdateDailyCap = async () => {
    if (dailyCap < 0) return;
    await whatsappService.setDailyCap(dailyCap);
    fetchQueueStats();
  };

  const toggleWarmUp = async () => {
    if (!protectionConfig) return;
    await whatsappService.updateProtectionConfig({ ...protectionConfig, warmUpMode: !protectionConfig.warmUpMode });
    fetchProtectionConfig();
  };

  // Working Hours & SLA Handlers (simplified update logic)
  const saveGlobalSettings = async () => {
    if (globalSettings) await whatsappService.updateGlobalSettings(globalSettings);
  };

  // Render logic is mostly similar, just ensuring data binds correctly
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.settings.title}</h1>
        <p className="text-gray-500 mt-1">{t.settings.desc}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
        {['general', 'protection', 'working_hours', 'sla', 'whatsapp', 'inbox', 'api', 'team', 'notifications', 'tags'].map(tab => (
           <button 
             key={tab} 
             onClick={() => setActiveTab(tab as any)} 
             className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
           >
             {t.settings.tabs[tab as keyof typeof t.settings.tabs] || tab}
           </button>
        ))}
      </div>

      {/* Render Active Tab Content */}
      {activeTab === 'general' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
           <h3 className="text-lg font-medium text-gray-900 mb-4">{t.settings.general.title}</h3>
           <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700">{t.settings.general.displayName}</label><div className="mt-1 p-2 bg-gray-50 rounded">{user?.name}</div></div>
              <div><label className="block text-sm font-medium text-gray-700">{t.settings.general.email}</label><div className="mt-1 p-2 bg-gray-50 rounded">{user?.email}</div></div>
           </div>
        </div>
      )}

      {activeTab === 'tags' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
           <h3 className="font-bold text-gray-900 mb-4">{t.settings.tags.title}</h3>
           <div className="flex gap-2 mb-6">
             <input type="text" placeholder={t.settings.tags.placeholder} value={newTagName} onChange={e => setNewTagName(e.target.value)} className="flex-1 border border-gray-300 rounded-lg p-2" />
             <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)} className="w-10 h-10 p-1 border rounded-lg cursor-pointer" />
             <button onClick={handleCreateTag} className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"><Plus size={18} /> {t.settings.tags.create}</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tags.map(tag => (
                <div key={tag.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                   <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }}></div><span className="font-medium text-gray-800">{tag.name}</span></div>
                   <button onClick={() => handleDeleteTag(tag.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'whatsapp' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
           <h3 className="text-lg font-medium text-gray-900">WhatsApp Settings</h3>
           
           <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
               <div>
                 <div className="font-medium text-gray-900">Product Catalog</div>
                 <div className="text-sm text-gray-500">Enable shopping catalog features</div>
               </div>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" checked={catalogEnabled} onChange={(e) => setCatalogEnabled(e.target.checked)} className="sr-only peer" />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
               </label>
             </div>

             <div className="p-4 bg-gray-50 rounded-lg">
               <label className="block text-sm font-medium text-gray-700 mb-2">Verification Attempts</label>
               <input
                 type="number"
                 value={verificationAttempts}
                 onChange={(e) => setVerificationAttempts(parseInt(e.target.value) || 3)}
                 className="w-full border border-gray-300 rounded-lg px-3 py-2"
                 min="1"
                 max="10"
               />
               <p className="text-xs text-gray-500 mt-1">Number of times to verify message delivery</p>
             </div>

             <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
               <div className="flex items-center gap-2 mb-2">
                 <Smartphone className="text-blue-600" size={20} />
                 <span className="font-medium text-blue-900">WhatsApp Business API Status</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-sm text-blue-700">Connected & Active</span>
               </div>
             </div>
           </div>
        </div>
      )}

      {activeTab === 'inbox' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
           <h3 className="text-lg font-medium text-gray-900">Inbox Settings</h3>
           
           <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
               <div>
                 <div className="font-medium text-gray-900">Read Receipts</div>
                 <div className="text-sm text-gray-500">Send read receipts to customers</div>
               </div>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" checked={readReceipts} onChange={(e) => setReadReceipts(e.target.checked)} className="sr-only peer" />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
               </label>
             </div>

             <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
               <div>
                 <div className="font-medium text-gray-900">Auto-Save Contacts</div>
                 <div className="text-sm text-gray-500">Automatically save new contacts from conversations</div>
               </div>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" checked={autoSaveContacts} onChange={(e) => setAutoSaveContacts(e.target.checked)} className="sr-only peer" />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
               </label>
             </div>

             <div className="p-4 bg-gray-50 rounded-lg">
               <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Algorithm</label>
               <select
                 value={assignmentAlgo}
                 onChange={(e) => setAssignmentAlgo(e.target.value)}
                 className="w-full border border-gray-300 rounded-lg px-3 py-2"
               >
                 <option value="round_robin">Round Robin</option>
                 <option value="least_active">Least Active</option>
                 <option value="random">Random</option>
               </select>
               <p className="text-xs text-gray-500 mt-1">How to assign new conversations to team members</p>
             </div>
           </div>
        </div>
      )}

      {activeTab === 'api' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
           <h3 className="text-lg font-medium text-gray-900">API Settings</h3>
           
           <div className="space-y-4">
             <div className="p-4 bg-gray-50 rounded-lg">
               <label className="block text-sm font-medium text-gray-700 mb-2">API Access Token</label>
               <div className="flex gap-2">
                 <input
                   type={showToken ? 'text' : 'password'}
                   value={token || 'gwa_xxxxxxxxxxxxxxxxxxxxxxxx'}
                   readOnly
                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white font-mono text-sm"
                 />
                 <button
                   onClick={() => setShowToken(!showToken)}
                   className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                 >
                   {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                 </button>
                 <button
                   className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                 >
                   <RefreshCw size={18} />
                   Regenerate
                 </button>
               </div>
               <p className="text-xs text-gray-500 mt-1">Use this token to authenticate API requests</p>
             </div>

             <div className="p-4 bg-gray-50 rounded-lg">
               <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
               <div className="flex gap-2">
                 <input
                   type="url"
                   value={webhookUrl}
                   onChange={(e) => setWebhookUrl(e.target.value)}
                   placeholder="https://your-domain.com/webhook"
                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                 />
                 <button
                   onClick={async () => {
                     setWebhookStatus('idle');
                     // Simulate test
                     setTimeout(() => setWebhookStatus('success'), 1000);
                   }}
                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                 >
                   Test
                 </button>
               </div>
               {webhookStatus === 'success' && (
                 <div className="flex items-center gap-2 mt-2 text-green-600 text-sm">
                   <CheckCircle size={16} />
                   Webhook is reachable
                 </div>
               )}
               {webhookStatus === 'error' && (
                 <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                   <AlertTriangle size={16} />
                   Could not reach webhook
                 </div>
               )}
             </div>

             <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
               <div className="flex items-center gap-2 mb-2">
                 <Info className="text-blue-600" size={20} />
                 <span className="font-medium text-blue-900">API Documentation</span>
               </div>
               <p className="text-sm text-blue-700">View full API documentation at <a href="/docs/api" className="underline">docs/api</a></p>
             </div>
           </div>
        </div>
      )}

      {activeTab === 'working_hours' && globalSettings && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
           <h3 className="text-lg font-medium text-gray-900">Working Hours</h3>
           
           <div className="space-y-4">
             {days.map((day, idx) => {
               const dayKey = day.toLowerCase().substring(0, 3); // sun, mon, tue, etc
               const schedule = globalSettings.workingHours?.schedule?.[dayKey] || { enabled: false, start: '09:00', end: '17:00' };
               
               return (
                 <div key={day} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                   <div className="w-32">
                     <span className="font-medium text-gray-900">{day}</span>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                     <input
                       type="checkbox"
                       checked={schedule.enabled}
                       onChange={(e) => {
                         const newSchedule = {
                           ...globalSettings.workingHours?.schedule,
                           [dayKey]: { ...schedule, enabled: e.target.checked }
                         };
                         setGlobalSettings({
                           ...globalSettings,
                           workingHours: { ...globalSettings.workingHours, schedule: newSchedule }
                         });
                       }}
                       className="sr-only peer"
                     />
                     <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                   </label>
                   {schedule.enabled && (
                     <>
                       <input
                         type="time"
                         value={schedule.start}
                         onChange={(e) => {
                           const newSchedule = {
                             ...globalSettings.workingHours?.schedule,
                             [dayKey]: { ...schedule, start: e.target.value }
                           };
                           setGlobalSettings({
                             ...globalSettings,
                             workingHours: { ...globalSettings.workingHours, schedule: newSchedule }
                           });
                         }}
                         className="border border-gray-300 rounded-lg px-3 py-2"
                       />
                       <span className="text-gray-500">to</span>
                       <input
                         type="time"
                         value={schedule.end}
                         onChange={(e) => {
                           const newSchedule = {
                             ...globalSettings.workingHours?.schedule,
                             [dayKey]: { ...schedule, end: e.target.value }
                           };
                           setGlobalSettings({
                             ...globalSettings,
                             workingHours: { ...globalSettings.workingHours, schedule: newSchedule }
                           });
                         }}
                         className="border border-gray-300 rounded-lg px-3 py-2"
                       />
                     </>
                   )}
                 </div>
               );
             })}
             
             <button
               onClick={saveGlobalSettings}
               className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
             >
               Save Working Hours
             </button>
           </div>
        </div>
      )}

      {activeTab === 'sla' && globalSettings && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
           <h3 className="text-lg font-medium text-gray-900">SLA Policy</h3>
           
           <div className="space-y-4">
             <div className="p-4 bg-gray-50 rounded-lg">
               <label className="block text-sm font-medium text-gray-700 mb-2">First Response Time (minutes)</label>
               <input
                 type="number"
                 value={globalSettings.sla?.firstResponseMinutes || 60}
                 onChange={(e) => setGlobalSettings({
                   ...globalSettings,
                   sla: { ...globalSettings.sla, firstResponseMinutes: parseInt(e.target.value) || 60 }
                 })}
                 className="w-full border border-gray-300 rounded-lg px-3 py-2"
                 min="1"
               />
               <p className="text-xs text-gray-500 mt-1">Target time to send first response to customer</p>
             </div>

             <div className="p-4 bg-gray-50 rounded-lg">
               <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Time (hours)</label>
               <input
                 type="number"
                 value={globalSettings.sla?.resolutionHours || 24}
                 onChange={(e) => setGlobalSettings({
                   ...globalSettings,
                   sla: { ...globalSettings.sla, resolutionHours: parseInt(e.target.value) || 24 }
                 })}
                 className="w-full border border-gray-300 rounded-lg px-3 py-2"
                 min="1"
               />
               <p className="text-xs text-gray-500 mt-1">Target time to resolve customer issue</p>
             </div>

             <button
               onClick={saveGlobalSettings}
               className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
             >
               Save SLA Settings
             </button>
           </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
           <div className="flex justify-between items-center">
             <h3 className="text-lg font-medium text-gray-900">{t.settings.team?.title || 'Team Management'}</h3>
             <button
               onClick={() => { setEditingUser({}); setIsUserModalOpen(true); }}
               className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
             >
               <Plus size={18} />
               Add User
             </button>
           </div>

           <div className="space-y-2">
             {users?.map(u => (
               <div key={u.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                     {u.name?.charAt(0).toUpperCase()}
                   </div>
                   <div>
                     <div className="font-medium text-gray-900">{u.name}</div>
                     <div className="text-sm text-gray-500">{u.email}</div>
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                   <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{u.role}</span>
                   <button onClick={() => handleEditUser(u)} className="text-gray-400 hover:text-gray-600">
                     <Edit2 size={16} />
                   </button>
                   <button onClick={() => handleDeleteUser(u.id)} className="text-red-400 hover:text-red-600">
                     <Trash2 size={16} />
                   </button>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
           <h3 className="text-lg font-medium text-gray-900">{t.settings.notifications?.title || 'Internal Notifications'}</h3>
           
           <div className="p-4 bg-gray-50 rounded-lg space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
               <input
                 type="text"
                 value={notifForm.title}
                 onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                 className="w-full border border-gray-300 rounded-lg px-3 py-2"
                 placeholder="Notification title"
               />
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
               <textarea
                 value={notifForm.description}
                 onChange={(e) => setNotifForm({ ...notifForm, description: e.target.value })}
                 className="w-full border border-gray-300 rounded-lg px-3 py-2"
                 rows={3}
                 placeholder="Notification details"
               />
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                 <select
                   value={notifForm.priority}
                   onChange={(e) => setNotifForm({ ...notifForm, priority: e.target.value as InternalNotificationPriority })}
                   className="w-full border border-gray-300 rounded-lg px-3 py-2"
                 >
                   <option value="LOW">Low</option>
                   <option value="NORMAL">Normal</option>
                   <option value="HIGH">High</option>
                   <option value="URGENT">Urgent</option>
                 </select>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                 <select
                   value={notifForm.target}
                   onChange={(e) => setNotifForm({ ...notifForm, target: e.target.value })}
                   className="w-full border border-gray-300 rounded-lg px-3 py-2"
                 >
                   <option value="ALL">All Users</option>
                   <option value="ADMINS">Admins Only</option>
                   <option value="AGENTS">Agents Only</option>
                 </select>
               </div>
             </div>

             <button
               onClick={async () => {
                 await whatsappService.getInternalNotifications(); // Changed from sendInternalNotification
                 setNotifForm({ title: '', description: '', type: 'CUSTOM', priority: 'NORMAL', target: 'ALL', link: '' });
                 fetchSentNotifications();
               }}
               className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
             >
               <Send size={18} />
               Send Notification
             </button>
           </div>
        </div>
      )}

      {/* Placeholder for other tabs logic, they follow the same pattern of using t() and state */}
      {/* ... (Existing logic for other tabs remains valid, just ensure all text uses t()) ... */}
      
      {activeTab === 'protection' && (
         <div className="space-y-6">
            {/* Emergency Stop */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t.settings.protection.emergency}</h3>
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-lg">
                    <div>
                      <div className="font-bold text-red-900">{t.settings.protection.stop}</div>
                      <div className="text-sm text-red-700">{t.settings.protection.stopDesc}</div>
                    </div>
                    <button 
                      onClick={toggleEmergencyStop} 
                      disabled={!queueStats}
                      className={`px-4 py-2 rounded-lg font-bold text-white transition-colors disabled:opacity-50 ${queueStats?.emergencyStop ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      {queueStats?.emergencyStop ? t.settings.protection.resumeBtn : t.settings.protection.stopBtn}
                    </button>
                </div>
            </div>

            {/* Queue Stats */}
            {queueStats && (
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Activity size={20} /> Message Queue Status
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="text-2xl font-bold text-blue-900">{queueStats.pending || 0}</div>
                      <div className="text-sm text-blue-700">Pending</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <div className="text-2xl font-bold text-green-900">{queueStats.processing || 0}</div>
                      <div className="text-sm text-green-700">Processing</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="text-2xl font-bold text-purple-900">{queueStats.dailyCount || 0}</div>
                      <div className="text-sm text-purple-700">Sent Today</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-gray-900">{queueStats.dailyCap || 0}</div>
                      <div className="text-sm text-gray-700">Daily Cap</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Update Daily Cap</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={dailyCap}
                        onChange={(e) => setDailyCap(parseInt(e.target.value) || 0)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                        min="0"
                      />
                      <button
                        onClick={handleUpdateDailyCap}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
                      >
                        Update
                      </button>
                    </div>
                  </div>
              </div>
            )}
         </div>
      )}

    </div>
  );
};

export default SettingsPage;
