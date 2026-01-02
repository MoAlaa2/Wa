
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { whatsappService } from '../../../services/whatsappService';
import { AutoReply } from '../../../types';
import { Zap, Plus, Trash2, Clock, Power, Edit2, X, Save, AlignCenter } from 'lucide-react';

const AutoRepliesPage = () => {
  const { t, dir } = useLanguage();
  const [replies, setReplies] = useState<AutoReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReply, setEditingReply] = useState<Partial<AutoReply>>({});

  useEffect(() => {
    fetchReplies();
  }, []);

  const fetchReplies = async () => {
    const data = await whatsappService.getAutoReplies();
    setReplies(data);
    setLoading(false);
  };

  const toggleReply = async (id: string, currentStatus: boolean) => {
    setReplies(prev => prev.map(r => r.id === id ? { ...r, enabled: !currentStatus } : r));
    await whatsappService.toggleAutoReply(id, !currentStatus);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.common.confirmDelete)) {
      await whatsappService.deleteAutoReply(id);
      setReplies(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleEdit = (reply: AutoReply) => {
    setEditingReply(reply);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingReply({ 
      type: 'keyword', 
      enabled: true, 
      keywords: [], 
      matchType: 'contains',
      priority: 'medium'
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingReply.content) return;
    
    // Process keywords
    let processedKeywords = editingReply.keywords || [];
    if (typeof editingReply.trigger === 'string' && editingReply.trigger) {
       // Legacy support or direct input
       processedKeywords = editingReply.trigger.split(',').map(k => k.trim());
    }

    const replyToSave = {
      ...editingReply,
      keywords: processedKeywords,
      // Fallback for legacy
      trigger: processedKeywords.join(', ')
    } as AutoReply;

    const saved = await whatsappService.saveAutoReply(replyToSave);
    
    // Instant update
    if (editingReply.id) {
      setReplies(prev => prev.map(r => r.id === saved.id ? saved : r));
    } else {
      setReplies(prev => [...prev, saved]);
    }
    
    setIsModalOpen(false);
  };

  const eventReplies = replies.filter(r => r.type === 'welcome' || r.type === 'away');
  const keywordReplies = replies.filter(r => r.type === 'keyword');

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.pages.autoReplies.title}</h1>
        <p className="text-gray-500 mt-1">{t.pages.autoReplies.desc}</p>
      </div>

      {/* Events Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock size={20} className="text-blue-500" />
          {t.pages.autoReplies.sections.events}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eventReplies.map(reply => (
            <div key={reply.id} className={`p-5 rounded-xl border transition-all ${reply.enabled ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${reply.enabled ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    <Zap size={18} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{reply.name}</h3>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{reply.type}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(reply)} className="text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                  <button 
                    onClick={() => toggleReply(reply.id, reply.enabled)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${reply.enabled ? 'bg-green-500' : 'bg-gray-200'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${reply.enabled ? (dir === 'rtl' ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-100 mb-2">
                "{reply.content}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Keywords Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Zap size={20} className="text-orange-500" />
            {t.pages.autoReplies.sections.keywords}
          </h2>
          <button onClick={handleCreate} className="flex items-center text-sm font-medium text-green-600 hover:text-green-700">
            <Plus size={18} className="mr-1" />
            {t.pages.autoReplies.create}
          </button>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
           <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                   <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase">{t.pages.autoReplies.fields.trigger}</th>
                   <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase">Priority</th>
                   <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase">{t.pages.autoReplies.fields.content}</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {keywordReplies.map(reply => (
                  <tr key={reply.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(reply.keywords || [reply.trigger]).map((kw, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${getPriorityColor(reply.priority || 'medium')}`}>
                         {reply.priority || 'medium'}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-sm text-gray-600 truncate max-w-md">{reply.content}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex justify-center items-center gap-3">
                         <button onClick={() => toggleReply(reply.id, reply.enabled)} className={reply.enabled ? 'text-green-500' : 'text-gray-300'}>
                            <Power size={18} />
                         </button>
                         <button onClick={() => handleEdit(reply)} className="text-blue-400 hover:text-blue-600"><Edit2 size={18} /></button>
                         <button onClick={() => handleDelete(reply.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={18} />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
           {keywordReplies.length === 0 && (
             <div className="p-8 text-center text-gray-400">{t.pages.autoReplies.noKeywords}</div>
           )}
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{editingReply.id ? t.common.edit : t.pages.autoReplies.create}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            
            <div className="space-y-4">
              {editingReply.type === 'keyword' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.pages.autoReplies.fields.trigger} (comma separated)</label>
                    <input 
                      type="text" 
                      value={editingReply.trigger || editingReply.keywords?.join(', ') || ''}
                      onChange={e => setEditingReply({...editingReply, trigger: e.target.value})}
                      placeholder="hello, hi, greetings"
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="mt-1 text-xs text-gray-500">Case insensitive. Supports Arabic and English.</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Match Type</label>
                      <select 
                        value={editingReply.matchType || 'contains'}
                        onChange={e => setEditingReply({...editingReply, matchType: e.target.value as any})}
                        className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
                      >
                        <option value="contains">Contains (Partial)</option>
                        <option value="exact">Exact Match</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select 
                        value={editingReply.priority || 'medium'}
                        onChange={e => setEditingReply({...editingReply, priority: e.target.value as any})}
                        className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.pages.autoReplies.fields.content}</label>
                <textarea 
                  value={editingReply.content || ''}
                  onChange={e => setEditingReply({...editingReply, content: e.target.value})}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">{t.common.cancel}</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Save size={18} /> {t.common.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoRepliesPage;
