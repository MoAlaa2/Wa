
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { whatsappService } from '../../services/whatsappService';
import { ContactTag } from '../../types';
import { Plus, Trash2, Edit2, Tag } from 'lucide-react';

const TagsPage = () => {
  const { t } = useLanguage();
  const [tags, setTags] = useState<ContactTag[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Partial<ContactTag>>({});

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const data = await whatsappService.getContactTags();
    setTags(data);
  };

  const handleSave = async () => {
    if (!editingTag.name) return;
    await whatsappService.saveContactTag(editingTag);
    setIsModalOpen(false);
    fetchTags();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.common.confirmDelete)) {
      await whatsappService.deleteContactTag(id);
      fetchTags();
    }
  };

  const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#EC4899', '#6B7280'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.contacts.tags.title}</h1>
          <p className="text-gray-500 mt-1">{t.contacts.tags.desc}</p>
        </div>
        <button 
          onClick={() => { setEditingTag({ color: '#3B82F6' }); setIsModalOpen(true); }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
        >
          <Plus size={20} className="mr-2 rtl:ml-2 rtl:mr-0" />
          {t.contacts.createTag}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase">{t.contacts.tags.name}</th>
              <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase">{t.contacts.lists.count}</th>
              <th className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase">{t.common.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tags.map(tag => (
              <tr key={tag.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-3 rtl:ml-3 rtl:mr-0" style={{ backgroundColor: tag.color }}></div>
                    <span className="font-medium text-gray-900">{tag.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{tag.count}</td>
                <td className="px-6 py-4 text-right rtl:text-left">
                  <button onClick={() => { setEditingTag(tag); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-800 mx-2"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(tag.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">{editingTag.id ? t.common.edit : t.contacts.createTag}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.contacts.tags.name}</label>
                <input 
                  type="text" 
                  value={editingTag.name || ''} 
                  onChange={e => setEditingTag({...editingTag, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.contacts.tags.color}</label>
                <div className="flex gap-2">
                  {colors.map(c => (
                    <button 
                      key={c}
                      onClick={() => setEditingTag({...editingTag, color: c})}
                      className={`w-8 h-8 rounded-full border-2 ${editingTag.color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">{t.common.cancel}</button>
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">{t.common.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagsPage;
