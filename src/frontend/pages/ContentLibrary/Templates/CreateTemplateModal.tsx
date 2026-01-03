
import React, { useState } from 'react';
import { X, FileText, Globe, Tag, Save, Plus, Image as ImageIcon, Link, Phone, Copy } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { TemplateCategory } from '../../../types';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { t, dir } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    category: 'MARKETING' as TemplateCategory,
    language: 'ar',
    headerType: 'NONE' as 'NONE' | 'TEXT' | 'MEDIA',
    headerText: '',
    mediaType: 'IMAGE',
    body: '',
    footer: '',
    buttons: [] as { type: string, text: string, url?: string, phoneNumber?: string }[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.body) {
      setError(t.templates.createModal.validation.required);
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await onSubmit(formData);
      setFormData({ 
        name: '', category: 'MARKETING', language: 'ar', body: '', 
        headerType: 'NONE', headerText: '', mediaType: 'IMAGE', footer: '', buttons: [] 
      }); 
      onClose();
    } catch (err) {
      setError(t.templates.createModal.error);
    } finally {
      setLoading(false);
    }
  };

  const addButton = () => {
    if (formData.buttons.length >= 3) return;
    setFormData(prev => ({
      ...prev,
      buttons: [...prev.buttons, { type: 'QUICK_REPLY', text: '' }]
    }));
  };

  const removeButton = (index: number) => {
    setFormData(prev => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== index)
    }));
  };

  const updateButton = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      buttons: prev.buttons.map((b, i) => i === index ? { ...b, [field]: value } : b)
    }));
  };

  const variables = formData.body.match(/{{[0-9]+}}/g);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl ${dir === 'rtl' ? 'text-right' : ''}`}>
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
                {t.templates.createModal.title}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Side */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.templates.createModal.name}</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 sm:text-sm border p-2" placeholder="e.g. welcome_offer" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.templates.createModal.category}</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 sm:text-sm border p-2 bg-white">
                      <option value="MARKETING">Marketing</option>
                      <option value="UTILITY">Utility</option>
                      <option value="AUTHENTICATION">Authentication</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.templates.createModal.language}</label>
                    <select value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 sm:text-sm border p-2 bg-white">
                      <option value="ar">Arabic (ar)</option>
                      <option value="en">English (en)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.templates.createModal.header}</label>
                  <select value={formData.headerType} onChange={e => setFormData({ ...formData, headerType: e.target.value as any })} className="w-full border rounded p-2 mb-2 text-sm">
                    <option value="NONE">{t.templates.createModal.headerTypes.NONE}</option>
                    <option value="TEXT">{t.templates.createModal.headerTypes.TEXT}</option>
                    <option value="MEDIA">{t.templates.createModal.headerTypes.MEDIA}</option>
                  </select>
                  {formData.headerType === 'TEXT' && <input type="text" placeholder="Header Text" value={formData.headerText} onChange={e => setFormData({ ...formData, headerText: e.target.value })} className="w-full border rounded p-2 text-sm" />}
                  {formData.headerType === 'MEDIA' && (
                    <select value={formData.mediaType} onChange={e => setFormData({ ...formData, mediaType: e.target.value })} className="w-full border rounded p-2 text-sm">
                      <option value="IMAGE">Image</option>
                      <option value="VIDEO">Video</option>
                      <option value="DOCUMENT">Document</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.templates.createModal.body}</label>
                  <textarea rows={4} value={formData.body} onChange={e => setFormData({ ...formData, body: e.target.value })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 sm:text-sm border p-2" placeholder={t.templates.createModal.bodyPlaceholder} />
                  {variables && variables.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {variables.map((v, i) => (
                        <span key={i} className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">{v}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.templates.createModal.footer}</label>
                  <input type="text" value={formData.footer} onChange={e => setFormData({ ...formData, footer: e.target.value })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 sm:text-sm border p-2" />
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">{t.templates.createModal.buttons}</label>
                    <button type="button" onClick={addButton} className="text-xs text-blue-600 flex items-center"><Plus size={12}/> {t.templates.createModal.addButton}</button>
                  </div>
                  <div className="space-y-2">
                    {formData.buttons.map((btn, idx) => (
                      <div key={idx} className="flex flex-col gap-2 p-2 bg-white border rounded">
                        <div className="flex gap-2">
                          <select value={btn.type} onChange={e => updateButton(idx, 'type', e.target.value)} className="flex-1 border rounded p-1 text-xs">
                            <option value="QUICK_REPLY">{t.templates.createModal.buttonTypes.QUICK_REPLY}</option>
                            <option value="URL">{t.templates.createModal.buttonTypes.URL}</option>
                            <option value="PHONE_NUMBER">{t.templates.createModal.buttonTypes.PHONE_NUMBER}</option>
                            <option value="COPY_CODE">{t.templates.createModal.buttonTypes.COPY_CODE}</option>
                          </select>
                          <button type="button" onClick={() => removeButton(idx)} className="text-red-500"><X size={14}/></button>
                        </div>
                        <input placeholder="Button Text" value={btn.text} onChange={e => updateButton(idx, 'text', e.target.value)} className="w-full border rounded p-1 text-xs" />
                        {btn.type === 'URL' && <input placeholder="https://..." value={btn.url} onChange={e => updateButton(idx, 'url', e.target.value)} className="w-full border rounded p-1 text-xs" />}
                        {btn.type === 'PHONE_NUMBER' && <input placeholder="+966..." value={btn.phoneNumber} onChange={e => updateButton(idx, 'phoneNumber', e.target.value)} className="w-full border rounded p-1 text-xs" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button type="submit" disabled={loading} className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:col-start-2 disabled:opacity-50">
                    {loading ? t.common.loading : t.templates.createModal.submit}
                  </button>
                  <button type="button" onClick={onClose} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0">
                    {t.templates.createModal.cancel}
                  </button>
                </div>
              </form>

              {/* Preview Side */}
              <div className="hidden md:block bg-[#E5DDD5] rounded-xl p-4 border border-gray-300 relative overflow-hidden">
                 <div className="bg-white rounded-lg shadow-sm max-w-[85%] p-2 relative text-sm">
                    {formData.headerType === 'TEXT' && <div className="font-bold text-gray-800 mb-1">{formData.headerText}</div>}
                    {formData.headerType === 'MEDIA' && <div className="h-32 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400">{formData.mediaType}</div>}
                    <div className="text-gray-900 whitespace-pre-wrap">{formData.body || 'Message preview...'}</div>
                    {formData.footer && <div className="text-[10px] text-gray-400 mt-1">{formData.footer}</div>}
                    <div className="text-[10px] text-gray-400 text-right mt-1">10:30 AM</div>
                 </div>
                 <div className="mt-2 space-y-1 max-w-[85%]">
                   {formData.buttons.map((btn, i) => (
                     <div key={i} className="bg-white rounded text-center py-2 text-blue-500 font-medium text-xs shadow-sm flex items-center justify-center gap-1">
                       {btn.type === 'URL' && <Link size={12}/>}
                       {btn.type === 'PHONE_NUMBER' && <Phone size={12}/>}
                       {btn.type === 'COPY_CODE' && <Copy size={12}/>}
                       {btn.text || 'Button'}
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
