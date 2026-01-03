
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { whatsappService } from '../../../services/whatsappService';
import { Template, TemplateStatus, TemplateCategory } from '../../../types';
import { TemplateDrawer } from './TemplateDrawer';
import { CreateTemplateModal } from './CreateTemplateModal';
import { Plus, Search, Filter, MoreVertical, FileText, CheckCircle, AlertCircle, Clock, Ban, Loader2, RefreshCw } from 'lucide-react';

const TemplatesPage = () => {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | 'ALL'>('ALL');
  
  // New States
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    const data = await whatsappService.getTemplates();
    setTemplates(data);
    setLoading(false);
  };

  const handleCreateTemplate = async (data: any) => {
    await whatsappService.createTemplate(data);
    alert(t.templates.createModal.success); // Simple toast replacement
    fetchTemplates();
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await whatsappService.syncTemplates();
      setLastSyncTime(new Date());
      fetchTemplates(); // Refresh list after sync
    } catch (error) {
      console.error("Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRowClick = (template: Template) => {
    setSelectedTemplate(template);
    setDrawerOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(t.templates.deleteModal.message)) {
      await whatsappService.deleteTemplate(id);
      fetchTemplates();
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || template.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: TemplateStatus) => {
    const styles = {
      APPROVED: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      REJECTED: "bg-red-100 text-red-800",
      DRAFT: "bg-gray-100 text-gray-800",
      PAUSED: "bg-orange-100 text-orange-800"
    };
    
    const icons = {
      APPROVED: <CheckCircle size={14} className="mr-1" />,
      PENDING: <Clock size={14} className="mr-1" />,
      REJECTED: <AlertCircle size={14} className="mr-1" />,
      DRAFT: <FileText size={14} className="mr-1" />,
      PAUSED: <Ban size={14} className="mr-1" />
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {t.templates.status[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.templates.title}</h1>
          <p className="text-gray-500 mt-1">{t.templates.desc}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-70"
          >
             <RefreshCw size={14} className={`mr-2 rtl:ml-2 rtl:mr-0 ${isSyncing ? 'animate-spin' : ''}`} />
             {isSyncing ? t.templates.sync.syncing : (lastSyncTime ? `${t.templates.sync.success} ${lastSyncTime.toLocaleTimeString()}` : t.templates.sync.button)}
          </button>
          
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <Plus size={20} className="mr-2 rtl:ml-2 rtl:mr-0" />
            {t.templates.create}
          </button>
        </div>
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
             onChange={(e) => setStatusFilter(e.target.value as TemplateStatus | 'ALL')}
            >
             <option value="ALL">{t.templates.allStatus}</option>
             <option value="APPROVED">{t.templates.status.APPROVED}</option>
             <option value="PENDING">{t.templates.status.PENDING}</option>
             <option value="REJECTED">{t.templates.status.REJECTED}</option>
             <option value="DRAFT">{t.templates.status.DRAFT}</option>
           </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="animate-spin mb-4 text-green-600" size={32} />
            <p>{t.common.loading}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.templates.table.name}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.templates.table.category}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.templates.table.language}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.templates.table.status}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.templates.table.lastUpdated}
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">{t.common.actions}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((template) => (
                    <tr 
                      key={template.id} 
                      onClick={() => handleRowClick(template)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{template.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{template.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 uppercase">{template.language}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(template.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(template.lastUpdated).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                           <button 
                             onClick={(e) => handleDelete(e, template.id)}
                             className="text-red-600 hover:text-red-900 px-3 py-1 hover:bg-red-50 rounded"
                           >
                             {t.common.delete}
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {t.templates.noTemplates}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TemplateDrawer 
        template={selectedTemplate} 
        isOpen={isDrawerOpen} 
        onClose={() => setDrawerOpen(false)} 
      />

      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateTemplate}
      />
    </div>
  );
};

export default TemplatesPage;
