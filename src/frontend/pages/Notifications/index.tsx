
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { whatsappService } from '../../services/whatsappService';
import { NotificationCampaign, CampaignStatus } from '../../types';
import { Plus, Search, Filter, Play, Pause, Trash2, Copy, BarChart2, Loader2, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'ALL'>('ALL');

  useEffect(() => {
    fetchCampaigns();
    // Simulate real-time updates for running campaigns
    const interval = setInterval(() => {
      fetchCampaigns(true); // Silent fetch
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCampaigns = async (silent = false) => {
    if (!silent) setLoading(true);
    const data = await whatsappService.getCampaigns();
    setCampaigns(data);
    if (!silent) setLoading(false);
  };

  const handleToggleStatus = async (id: string) => {
    await whatsappService.toggleCampaignStatus(id);
    fetchCampaigns(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.common.confirmDelete)) {
      await whatsappService.deleteCampaign(id);
      fetchCampaigns(true);
    }
  };

  const handleDuplicate = async (campaign: NotificationCampaign) => {
    const newCampaign = {
      ...campaign,
      id: undefined,
      title: `${campaign.title} (Copy)`,
      status: 'DRAFT' as CampaignStatus,
      stats: { total: campaign.stats.total, sent: 0, delivered: 0, read: 0, failed: 0 },
      createdAt: new Date().toISOString()
    };
    await whatsappService.saveCampaign(newCampaign);
    fetchCampaigns(true);
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? true;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: CampaignStatus) => {
    const styles = {
      DRAFT: "bg-gray-100 text-gray-800",
      RUNNING: "bg-blue-100 text-blue-800 animate-pulse",
      PAUSED: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-green-100 text-green-800"
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {t.notificationsPage.status[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.notificationsPage.title}</h1>
          <p className="text-gray-500 mt-1">{t.notificationsPage.desc}</p>
        </div>
        <button 
          onClick={() => navigate('/notifications/new')}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus size={20} className="mr-2 rtl:ml-2 rtl:mr-0" />
          {t.notificationsPage.create}
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 rtl:right-3 rtl:left-auto" size={20} />
          <input 
            type="text" 
            placeholder={t.common.search} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 rtl:pr-10 rtl:pl-4"
          />
        </div>
        <div className="flex gap-2">
           <select 
             className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm bg-white"
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | 'ALL')}
            >
             <option value="ALL">{t.common.all}</option>
             <option value="DRAFT">{t.notificationsPage.status.DRAFT}</option>
             <option value="RUNNING">{t.notificationsPage.status.RUNNING}</option>
             <option value="PAUSED">{t.notificationsPage.status.PAUSED}</option>
             <option value="COMPLETED">{t.notificationsPage.status.COMPLETED}</option>
           </select>
        </div>
      </div>

      {/* Grid / List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="animate-spin mb-4 text-green-600" size={32} />
            <p>{t.common.loading}</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center text-gray-500">
             <Megaphone size={48} className="text-gray-300 mb-4" />
             <p>{t.common.noData}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t.notificationsPage.table.title}</th>
                  <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t.notificationsPage.table.status}</th>
                  <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">{t.notificationsPage.table.progress}</th>
                  <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t.notificationsPage.table.created}</th>
                  <th className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{campaign.title}</div>
                      <div className="text-xs text-gray-500">{campaign.type} • {campaign.templateName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(campaign.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{((campaign.stats.sent / campaign.stats.total) * 100).toFixed(0)}% Sent</span>
                          <span>{campaign.stats.sent}/{campaign.stats.total}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${(campaign.stats.sent / campaign.stats.total) * 100}%` }}></div>
                        </div>
                        <div className="flex gap-2 text-[10px] mt-1 text-gray-400">
                           <span className="text-green-600 font-medium">{campaign.stats.read} Read</span>
                           <span>•</span>
                           <span className="text-red-500">{campaign.stats.failed} Failed</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {campaign.status === 'RUNNING' && (
                           <button onClick={() => handleToggleStatus(campaign.id)} className="text-yellow-600 hover:text-yellow-800 p-1" title="Pause"><Pause size={18} /></button>
                        )}
                        {(campaign.status === 'PAUSED' || campaign.status === 'DRAFT') && (
                           <button onClick={() => handleToggleStatus(campaign.id)} className="text-green-600 hover:text-green-800 p-1" title="Start/Resume"><Play size={18} /></button>
                        )}
                        <button onClick={() => handleDuplicate(campaign)} className="text-blue-600 hover:text-blue-800 p-1" title="Duplicate"><Copy size={18} /></button>
                        <button onClick={() => handleDelete(campaign.id)} className="text-red-600 hover:text-red-800 p-1" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
