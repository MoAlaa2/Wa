import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { whatsappService } from '../../../services/whatsappService';
import { Template, TemplateStatus, TemplateCategory } from '../../../types';
import { TemplateDrawer } from './TemplateDrawer';
import { Plus, Search, Filter, MoreVertical, FileText, CheckCircle, AlertCircle, Clock, Ban, Loader2 } from 'lucide-react';

const TemplatesPage = () => {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | 'ALL'>('ALL');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    const data = await whatsappService.getTemplates();
    setTemplates(data);
    setLoading(false);
  };

  const handleRowClick = (template: Template) => {
    setSelectedTemplate(template);
    setDrawerOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(t.common.confirmDelete)) {
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
        {t.pages.templates.status[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.pages.templates.title}</h1>
          <p className="text-gray-500 mt-1">{t.pages.templates.desc}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-200">
             {t.pages.templates.workingBadge}
          </span>
          <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm">
            <Plus size={20} className="mr-2 rtl:ml-2 rtl:mr-0" />
            {t.pages.templates.create}
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
             <option value="ALL">{t.pages.templates.allStatus}</option>
             <option value="APPROVED">{t.pages.templates.status.APPROVED}</option>
             <option value="PENDING">{t.pages.templates.status.PENDING}</option>
             <option value="REJECTED">{t.pages.templates.status.REJECTED}</option>
             <option value="DRAFT">{t.pages.templates.status.DRAFT}</option>
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
                    {t.pages.templates.table.name}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.pages.templates.table.category}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.pages.templates.table.language}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.pages.templates.table.status}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.pages.templates.table.lastUpdated}
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
                             className="text-red-600 hover:text-red-900"
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
                      {t.pages.templates.noTemplates}
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
    </div>
  );
};

export default TemplatesPage;