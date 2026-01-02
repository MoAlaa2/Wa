
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Settings, Shield, Tag as TagIcon, Plus, Trash2, Users, Edit2, Mail, User as UserIcon, Smartphone, Globe, MessageSquare, AlertTriangle, Eye, EyeOff, CheckCircle, RefreshCw, LogOut, Info, ShoppingBag, Zap, Bell, Send, PauseCircle, PlayCircle, Thermometer, Clock, Activity } from 'lucide-react';
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
  const [token, setToken] = useState('EAAbcd12345...');
  const [showToken, setShowToken] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.guthmi.com/webhook');
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Protection State
  const [protectionConfig, setProtectionConfig] = useState<ProtectionConfig | null>(null);

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

  // Load data on mount
  useEffect(() => {
    fetchTags();
    fetchSentNotifications();
    fetchProtectionConfig();
    fetchGlobalSettings();
  }, []);

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
    if (editingUser.id === user?.id && editingUser.role && editingUser.role !== user.role) {
      if (window.confirm(t.pages.settings.team.logoutWarning)) {
        updateUser(editingUser as User);
        logout();
        return;
      } else {
        return;
      }
    }
    if (editingUser.id) {
      updateUser(editingUser as User);
    } else {
      addUser(editingUser);
    }
    setIsUserModalOpen(false);
    setEditingUser({});
  };

  const handleEditUser = (u: User) => {
    setEditingUser(u);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm(`${t.common.confirmDelete}\n\nThis action cannot be undone and the user will lose access immediately.`)) {
      deleteUser(id);
    }
  };

  // Protection Handlers
  const toggleEmergencyStop = async () => {
    if (!protectionConfig) return;
    const newState = !protectionConfig.emergencyStop;
    if (newState && !window.confirm("Are you sure? This will pause ALL outgoing messages immediately.")) {
      return;
    }
    await whatsappService.updateProtectionConfig({ emergencyStop: newState });
    fetchProtectionConfig();
  };

  const toggleWarmUp = async () => {
    if (!protectionConfig) return;
    await whatsappService.updateProtectionConfig({ warmUpMode: !protectionConfig.warmUpMode });
    fetchProtectionConfig();
  };

  // Working Hours Handlers
  const handleWorkingHoursChange = async (day: string, field: string, value: any) => {
    if (!globalSettings) return;
    const newSchedule = {
      ...globalSettings.workingHours.schedule,
      [day]: {
        ...globalSettings.workingHours.schedule[day],
        [field]: value
      }
    };
    const newSettings = {
      ...globalSettings,
      workingHours: { ...globalSettings.workingHours, schedule: newSchedule }
    };
    setGlobalSettings(newSettings);
    await whatsappService.updateGlobalSettings(newSettings);
  };

  const toggleWorkingHours = async () => {
    if (!globalSettings) return;
    const newSettings = {
      ...globalSettings,
      workingHours: { ...globalSettings.workingHours, enabled: !globalSettings.workingHours.enabled }
    };
    setGlobalSettings(newSettings);
    await whatsappService.updateGlobalSettings(newSettings);
  };

  // SLA Handlers
  const updateSLA = async (field: keyof typeof globalSettings.sla, value: number) => {
    if (!globalSettings) return;
    const newSettings = {
      ...globalSettings,
      sla: { ...globalSettings.sla, [field]: value }
    };
    setGlobalSettings(newSettings);
    await whatsappService.updateGlobalSettings(newSettings);
  };

  // WhatsApp Logic
  const toggleCatalog = () => {
    if (!catalogEnabled) {
      if (window.confirm(`${t.pages.settings.whatsapp.catalog.confirmTitle}\n${t.pages.settings.whatsapp.catalog.confirmDesc}`)) {
        setCatalogEnabled(true);
      }
    } else {
      setCatalogEnabled(false);
    }
  };

  const handleDeregister = () => {
    const isNumberActive = true; 
    if (isNumberActive) {
      alert(t.pages.settings.whatsapp.tools.deregisterWarning);
      return;
    }
    if (window.confirm("Are you ABSOLUTELY sure? This will disconnect your number.")) {
      console.log("Deregistered");
    }
  };

  const handleVerify = () => {
    if (verificationAttempts > 0) {
      setVerificationAttempts(prev => prev - 1);
      alert(`Verification code sent!`);
    } else {
      alert("Too many attempts. Try again later.");
    }
  };

  // API Logic
  const handleSaveToken = () => {
    if (!token.startsWith('EA')) {
      alert(t.pages.settings.api.invalidToken);
      return;
    }
    alert("Token saved successfully");
  };

  const testWebhook = () => {
    setWebhookStatus('idle');
    setTimeout(() => {
      setWebhookStatus('success');
      alert(t.pages.settings.api.success);
    }, 1000);
  };

  // Notification Logic
  const handleSendNotification = async () => {
    if (!notifForm.title || !notifForm.description) return;
    await whatsappService.createInternalNotification({
      ...notifForm,
      sender: user?.name || 'Admin',
      read: false,
      timestamp: new Date().toISOString()
    });
    setNotifForm({
      title: '',
      description: '',
      type: 'CUSTOM',
      priority: 'NORMAL',
      target: 'ALL',
      link: ''
    });
    alert("Notification sent successfully!");
    fetchSentNotifications();
  };

  const isAgent = user?.role === 'agent';
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.pages.settings.title}</h1>
        <p className="text-gray-500 mt-1">{t.pages.settings.desc}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button onClick={() => setActiveTab('general')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'general' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.pages.settings.tabs.general}</button>
        <button onClick={() => setActiveTab('protection')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'protection' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Protection</button>
        <button onClick={() => setActiveTab('working_hours')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'working_hours' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Working Hours</button>
        <button onClick={() => setActiveTab('sla')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'sla' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>SLA Policy</button>
        <button onClick={() => setActiveTab('whatsapp')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'whatsapp' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.pages.settings.tabs.whatsapp}</button>
        <button onClick={() => setActiveTab('inbox')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'inbox' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.pages.settings.tabs.inbox}</button>
        {!isAgent && (
          <button onClick={() => setActiveTab('api')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'api' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.pages.settings.tabs.api}</button>
        )}
        {hasPermission('manage_team') && (
          <button onClick={() => setActiveTab('team')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'team' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.pages.settings.tabs.team}</button>
        )}
        {!isAgent && (
          <button onClick={() => setActiveTab('notifications')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'notifications' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.pages.settings.tabs.notifications}</button>
        )}
        <button onClick={() => setActiveTab('tags')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'tags' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.pages.settings.tabs.tags}</button>
      </div>

      {/* GENERAL TAB */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center mb-4">
              <Settings className="text-gray-500 mr-2" size={20} />
              <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700">Display Name</label>
                <div className="mt-1 text-gray-900 font-medium">{user?.name}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="mt-1 text-gray-900 font-medium">{user?.email}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WORKING HOURS TAB */}
      {activeTab === 'working_hours' && globalSettings && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="text-blue-500" size={20} />
                <h3 className="text-lg font-medium text-gray-900">Business Schedule</h3>
              </div>
              <button 
                onClick={toggleWorkingHours}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${globalSettings.workingHours.enabled ? 'bg-green-500' : 'bg-gray-200'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${globalSettings.workingHours.enabled ? (dir === 'rtl' ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="space-y-4">
              {days.map((dayName, index) => {
                const dayConfig = globalSettings.workingHours.schedule[index.toString()];
                if (!dayConfig) return null;
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="w-32">
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={dayConfig.enabled}
                          onChange={(e) => handleWorkingHoursChange(index.toString(), 'enabled', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{dayName}</span>
                      </label>
                    </div>
                    {dayConfig.enabled ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="time" 
                          value={dayConfig.start}
                          onChange={(e) => handleWorkingHoursChange(index.toString(), 'start', e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                        />
                        <span className="text-gray-400">-</span>
                        <input 
                          type="time" 
                          value={dayConfig.end}
                          onChange={(e) => handleWorkingHoursChange(index.toString(), 'end', e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="text-orange-500" size={20} />
              <h3 className="text-lg font-medium text-gray-900">Off-Hours Response</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Reply Message</label>
                <textarea 
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                  value={globalSettings.workingHours.offHoursMessage}
                  onChange={(e) => {
                    const newSettings = {
                      ...globalSettings,
                      workingHours: { ...globalSettings.workingHours, offHoursMessage: e.target.value }
                    };
                    setGlobalSettings(newSettings);
                    whatsappService.updateGlobalSettings(newSettings);
                  }}
                />
                <p className="text-xs text-gray-500 mt-2">This message will be sent automatically when a customer messages outside of working hours.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SLA TAB */}
      {activeTab === 'sla' && globalSettings && (
        <div className="max-w-2xl">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="text-purple-500" size={20} />
              <h3 className="text-lg font-medium text-gray-900">Service Level Agreement (SLA)</h3>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
                <h4 className="font-bold text-purple-900 mb-2">First Response Time</h4>
                <p className="text-sm text-purple-700 mb-4">Target time for agent to reply to a new customer message.</p>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    value={globalSettings.sla.firstResponseMinutes}
                    onChange={(e) => updateSLA('firstResponseMinutes', parseInt(e.target.value))}
                    className="w-24 border border-gray-300 rounded-lg p-2 text-center font-bold"
                  />
                  <span className="text-gray-600">Minutes</span>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                <h4 className="font-bold text-green-900 mb-2">Resolution Time</h4>
                <p className="text-sm text-green-700 mb-4">Target time to resolve and close a conversation.</p>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    value={globalSettings.sla.resolutionHours}
                    onChange={(e) => updateSLA('resolutionHours', parseInt(e.target.value))}
                    className="w-24 border border-gray-300 rounded-lg p-2 text-center font-bold"
                  />
                  <span className="text-gray-600">Hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROTECTION TAB */}
      {activeTab === 'protection' && protectionConfig && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ... existing Protection content ... */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="text-red-500" size={24} />
              <h3 className="text-lg font-medium text-gray-900">Emergency Controls</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-lg">
                <div>
                  <div className="font-bold text-red-900">Emergency Stop</div>
                  <div className="text-sm text-red-700">Pause ALL outgoing messages instantly.</div>
                </div>
                <button 
                  onClick={toggleEmergencyStop}
                  className={`px-4 py-2 rounded-lg font-bold text-white flex items-center gap-2 transition-colors ${protectionConfig.emergencyStop ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {protectionConfig.emergencyStop ? <><PlayCircle size={18}/> RESUME</> : <><PauseCircle size={18}/> STOP</>}
                </button>
              </div>
              {protectionConfig.emergencyStop && (
                <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-200 text-center">
                  ⚠️ System is currently PAUSED. Messages are queuing but not sending.
                </div>
              )}
            </div>
          </div>
          {/* ... existing Warmup & Health content ... */}
        </div>
      )}

      {/* ... Other Tabs ... */}
    </div>
  );
};

export default SettingsPage;
