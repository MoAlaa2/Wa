
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Contact, ContactList, ContactTag } from '../../../types';
import { X, User, Phone, Mail, Save, Plus, Trash2, Building } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Partial<Contact>) => void;
  contact: Contact | null;
  lists: ContactList[];
  tags: ContactTag[];
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onSave, contact, lists, tags }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Partial<Contact>>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    status: 'SUBSCRIBED',
    lists: [],
    tags: [],
    customAttributes: {}
  });

  useEffect(() => {
    if (contact) {
      // Map backend fields to frontend fields
      setFormData({
        ...contact,
        firstName: contact.firstName || contact.name?.split(' ')[0] || '',
        lastName: contact.lastName || contact.name?.split(' ').slice(1).join(' ') || '',
        phone: contact.phone || contact.phoneNumber || '',
        email: contact.email || '',
        status: contact.status || 'SUBSCRIBED',
        lists: contact.lists || [],
        tags: contact.tags || [],
        customAttributes: contact.customAttributes || {}
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        status: 'SUBSCRIBED',
        lists: [],
        tags: [],
        customAttributes: {}
      });
    }
  }, [contact, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addAttribute = () => {
    setFormData(prev => ({
      ...prev,
      customAttributes: { ...prev.customAttributes, '': '' }
    }));
  };

  const updateAttribute = (oldKey: string, newKey: string, value: string) => {
    const newAttrs = { ...formData.customAttributes };
    if (oldKey !== newKey) {
      delete newAttrs[oldKey];
    }
    newAttrs[newKey] = value;
    setFormData({ ...formData, customAttributes: newAttrs });
  };

  const removeAttribute = (key: string) => {
    const newAttrs = { ...formData.customAttributes };
    delete newAttrs[key];
    setFormData({ ...formData, customAttributes: newAttrs });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50 transition-opacity">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-slideLeft">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">{contact ? t.common.edit : t.contacts.add}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="contactForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Personal Info */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                <User size={14}/> {t.contacts.modal.personal}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.contacts.modal.firstName}</label>
                  <input 
                    required
                    type="text" 
                    value={formData.firstName} 
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.contacts.modal.lastName}</label>
                  <input 
                    type="text" 
                    value={formData.lastName} 
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.contacts.modal.phone}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 text-gray-400 rtl:right-3 rtl:left-auto" size={18} />
                  <input 
                    required
                    type="tel" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 rtl:pr-10 rtl:pl-4"
                    placeholder="+97150..."
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.contacts.modal.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-400 rtl:right-3 rtl:left-auto" size={18} />
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 rtl:pr-10 rtl:pl-4"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Segmentation */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                <Building size={14}/> {t.contacts.modal.segmentation}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.contacts.table.status}</label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-green-500"
                >
                  <option value="SUBSCRIBED">{t.contacts.status.SUBSCRIBED}</option>
                  <option value="UNSUBSCRIBED">{t.contacts.status.UNSUBSCRIBED}</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.contacts.table.lists}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.lists?.map(listId => (
                    <span key={listId} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                      {lists.find(l => l.id === listId)?.name}
                      <button type="button" onClick={() => setFormData({...formData, lists: formData.lists?.filter(id => id !== listId)})} className="ml-1 hover:text-blue-900"><X size={12}/></button>
                    </span>
                  ))}
                </div>
                <select 
                  onChange={e => {
                    if (e.target.value && !formData.lists?.includes(e.target.value)) {
                      setFormData({...formData, lists: [...(formData.lists || []), e.target.value]});
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                  value=""
                >
                  <option value="" disabled>Add to list...</option>
                  {lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.contacts.table.tags}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags?.map(tagId => (
                    <span key={tagId} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center border border-gray-200">
                      {tags.find(t => t.id === tagId)?.name}
                      <button type="button" onClick={() => setFormData({...formData, tags: formData.tags?.filter(id => id !== tagId)})} className="ml-1 hover:text-gray-900"><X size={12}/></button>
                    </span>
                  ))}
                </div>
                <select 
                  onChange={e => {
                    if (e.target.value && !formData.tags?.includes(e.target.value)) {
                      setFormData({...formData, tags: [...(formData.tags || []), e.target.value]});
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                  value=""
                >
                  <option value="" disabled>Add tag...</option>
                  {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Custom Attributes */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase">{t.contacts.modal.attributes}</h3>
                <button type="button" onClick={addAttribute} className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                  <Plus size={12} className="mr-1"/> {t.contacts.modal.addAttr}
                </button>
              </div>
              <div className="space-y-2">
                {Object.entries(formData.customAttributes || {}).map(([key, value], idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder={t.contacts.modal.key}
                      value={key}
                      onChange={e => updateAttribute(key, e.target.value, value as string)}
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <input 
                      type="text" 
                      placeholder={t.contacts.modal.value}
                      value={value as string}
                      onChange={e => updateAttribute(key, key, e.target.value)}
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <button type="button" onClick={() => removeAttribute(key)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">
            {t.common.cancel}
          </button>
          <button type="submit" form="contactForm" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center">
            <Save size={18} className="mr-2 rtl:ml-2 rtl:mr-0"/>
            {t.common.save}
          </button>
        </div>

      </div>
    </div>
  );
};
