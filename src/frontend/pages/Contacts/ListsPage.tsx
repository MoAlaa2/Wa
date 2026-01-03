
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { whatsappService } from '../../services/whatsappService';
import { ContactList } from '../../types';
import { Plus, Trash2, Edit2, Users, Star } from 'lucide-react';

const ListsPage = () => {
  const { t } = useLanguage();
  const [lists, setLists] = useState<ContactList[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<Partial<ContactList>>({});

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    const data = await whatsappService.getContactLists();
    setLists(data);
  };

  const handleSave = async () => {
    if (!editingList.name) return;
    await whatsappService.saveContactList(editingList);
    setIsModalOpen(false);
    fetchLists();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.common.confirmDelete)) {
      await whatsappService.deleteContactList(id);
      fetchLists();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.contacts.lists.title}</h1>
          <p className="text-gray-500 mt-1">{t.contacts.lists.desc}</p>
        </div>
        <button 
          onClick={() => { setEditingList({}); setIsModalOpen(true); }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
        >
          <Plus size={20} className="mr-2 rtl:ml-2 rtl:mr-0" />
          {t.contacts.createList}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists.map(list => (
          <div key={list.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Users size={24} />
              </div>
              {list.isDefault ? (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded flex items-center">
                  <Star size={12} className="mr-1 fill-current" /> {t.contacts.lists.default}
                </span>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { setEditingList(list); setIsModalOpen(true); }} className="text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(list.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{list.name}</h3>
            <p className="text-sm text-gray-500">{list.count} {t.contacts.lists.count}</p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">{editingList.id ? t.common.edit : t.contacts.createList}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.contacts.lists.name}</label>
                <input 
                  type="text" 
                  value={editingList.name || ''} 
                  onChange={e => setEditingList({...editingList, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500"
                />
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

export default ListsPage;
