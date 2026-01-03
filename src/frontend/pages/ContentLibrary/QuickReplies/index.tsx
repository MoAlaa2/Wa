
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { whatsappService } from '../../../services/whatsappService';
import { QuickReply } from '../../../types';
import { MessageCircle, Plus, Search, Trash2, Edit2, Zap, X, Save, Tag } from 'lucide-react';

const QuickRepliesPage = () => {
  const { t } = useLanguage();
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReply, setEditingReply] = useState<Partial<QuickReply>>({});

  useEffect(() => {
    fetchReplies();
  }, []);

  const fetchReplies = async () => {
    const data = await whatsappService.getQuickReplies();
    setReplies(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.common.confirmDelete)) {
      await whatsappService.deleteQuickReply(id);
      setReplies(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleSave = async () => {
    if (!editingReply.content || !editingReply.shortcut) return;
    const saved = await whatsappService.saveQuickReply(editingReply);
    
    if (editingReply.id) {
      setReplies(prev => prev.map(r => r.id === saved.id ? saved : r));
    } else {
      setReplies(prev => [...prev, saved]);
    }
    setIsModalOpen(false);
  };

  const filteredReplies = replies.filter(r => 
    r.shortcut?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.quickReplies.title}</h1>
          <p className="text-gray-500 mt-1">{t.quickReplies.desc}</p>
        </div>
        <button 
          onClick={() => { setEditingReply({ category: 'General' }); setIsModalOpen(true); }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
        >
          <Plus size={20} className="mr-2 rtl:ml-2 rtl:mr-0" />
          {t.quickReplies.create}
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 rtl:right-3 rtl:left-auto" size={20} />
          <input 
            type="text" 
            placeholder="Search shortcuts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 rtl:pr-10 rtl:pl-4"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReplies.map(reply => (
          <div key={reply.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono font-bold">/{reply.shortcut}</span>
              <div className="flex gap-2">
                <button onClick={() => { setEditingReply(reply); setIsModalOpen(true); }} className="text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(reply.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-3 mb-3 min-h-[40px]">{reply.content}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400 border-t pt-2 mt-2">
              <Tag size={12} /> {reply.category || 'General'}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">{editingReply.id ? 'Edit Quick Reply' : 'New Quick Reply'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shortcut</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-mono">/</span>
                  <input 
                    type="text" 
                    value={editingReply.shortcut || ''} 
                    onChange={e => setEditingReply({...editingReply, shortcut: e.target.value.replace(/\s+/g, '')})}
                    className="w-full pl-6 border border-gray-300 rounded-lg p-2.5 font-mono text-sm"
                    placeholder="thanks"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
                <textarea 
                  value={editingReply.content || ''} 
                  onChange={e => setEditingReply({...editingReply, content: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={editingReply.category || ''} 
                    onChange={e => setEditingReply({...editingReply, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 pl-8"
                    placeholder="Sales, Support..."
                  />
                  <Tag size={16} className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <Save size={18} /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickRepliesPage;
