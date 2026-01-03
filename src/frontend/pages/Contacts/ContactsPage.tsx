
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { whatsappService } from '../../services/whatsappService';
import { Contact, ContactList, ContactTag } from '../../types';
import { Plus, Search, Filter, Trash2, Edit2, User, MoreHorizontal, Mail } from 'lucide-react';
import { ContactModal } from './components/ContactModal';

const ContactsPage = () => {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [lists, setLists] = useState<ContactList[]>([]);
  const [tags, setTags] = useState<ContactTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [cData, lData, tData] = await Promise.all([
      whatsappService.getContacts(),
      whatsappService.getContactLists(),
      whatsappService.getContactTags()
    ]);
    setContacts(cData);
    setLists(lData);
    setTags(tData);
    setLoading(false);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(contacts.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) newSet.add(id);
    else newSet.delete(id);
    setSelectedIds(newSet);
  };

  const handleDelete = async (ids: string[]) => {
    if (window.confirm(t.common.confirmDelete)) {
      for (const id of ids) {
        await whatsappService.deleteContact(id);
      }
      setSelectedIds(new Set());
      fetchData();
    }
  };

  const handleSaveContact = async (contact: Partial<Contact>) => {
    await whatsappService.saveContact(contact);
    setIsModalOpen(false);
    fetchData();
  };

  // Helper to get tag details
  const getTagName = (id: string) => tags.find(t => t.id === id)?.name || id;
  const getTagColor = (id: string) => tags.find(t => t.id === id)?.color || '#gray';
  
  // Helper to get list names
  const getListNames = (listIds: string[]) => {
    return listIds.map(id => lists.find(l => l.id === id)?.name).filter(Boolean).join(', ');
  };

  const filteredContacts = contacts.filter(c => 
    c.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone?.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.contacts.title}</h1>
          <p className="text-gray-500 mt-1">{t.contacts.desc}</p>
        </div>
        <button 
          onClick={() => { setEditingContact(null); setIsModalOpen(true); }}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus size={20} className="mr-2 rtl:ml-2 rtl:mr-0" />
          {t.contacts.add}
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
        
        {selectedIds.size > 0 && (
          <button 
            onClick={() => handleDelete(Array.from(selectedIds))}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={18} /> {t.common.delete} ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size === filteredContacts.length && filteredContacts.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.contacts.table.name}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.contacts.table.status}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.contacts.table.tags}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.contacts.table.lists}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.contacts.table.created}
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">{t.common.actions}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-500">{t.common.loading}</td></tr>
              ) : filteredContacts.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-500">{t.common.noData}</td></tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(contact.id)}
                        onChange={(e) => handleSelectOne(contact.id, e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <User size={20} />
                          </div>
                        </div>
                        <div className="ml-4 rtl:ml-0 rtl:mr-4">
                          <div className="text-sm font-medium text-gray-900">{contact.firstName} {contact.lastName}</div>
                          <div className="text-sm text-gray-500">{contact.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        contact.status === 'SUBSCRIBED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {t.contacts.status[contact.status as 'SUBSCRIBED' | 'UNSUBSCRIBED'] || contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map(tagId => (
                          <span key={tagId} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800" style={{ borderLeft: `3px solid ${getTagColor(tagId)}` }}>
                            {getTagName(tagId)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getListNames(contact.lists)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingContact(contact); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-900">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete([contact.id])} className="text-red-600 hover:text-red-900">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ContactModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveContact}
        contact={editingContact}
        lists={lists}
        tags={tags}
      />
    </div>
  );
};

export default ContactsPage;
