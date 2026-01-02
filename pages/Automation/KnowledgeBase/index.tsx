import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { whatsappService } from '../../../services/whatsappService';
import { KnowledgeArticle } from '../../../types';
import { BookOpen, Search, Plus, Tag, Edit2, Trash2, Save, X } from 'lucide-react';

const KnowledgeBasePage = () => {
  const { t, dir } = useLanguage();
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Partial<KnowledgeArticle>>({});

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const data = await whatsappService.getKnowledgeArticles();
    setArticles(data);
  };

  const handleEdit = (article: KnowledgeArticle) => {
    setCurrentArticle(article);
    setIsEditing(true);
  };

  const handleAdd = () => {
    setCurrentArticle({ tags: [] });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.common.confirmDelete)) {
      await whatsappService.deleteKnowledgeArticle(id);
      fetchArticles();
    }
  };

  const handleSave = async () => {
    if (!currentArticle.question || !currentArticle.answer) return;
    await whatsappService.saveKnowledgeArticle(currentArticle);
    setIsEditing(false);
    fetchArticles();
  };

  const filteredArticles = articles.filter(a => 
    a.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.pages.knowledgeBase.title}</h1>
          <p className="text-gray-500 mt-1">{t.pages.knowledgeBase.desc}</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors"
        >
          <Plus size={20} className="mr-2 rtl:mr-0 rtl:ml-2" />
          {t.pages.knowledgeBase.create}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input 
          type="text" 
          placeholder={t.common.search} 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent rtl:pl-4 rtl:pr-10"
        />
        <Search className="absolute left-3 top-3.5 text-gray-400 rtl:right-3 rtl:left-auto" size={20} />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredArticles.map(article => (
          <div key={article.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">{article.category}</span>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(article)} className="text-gray-400 hover:text-blue-500"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(article.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{article.question}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{article.answer}</p>
            <div className="flex items-center gap-2 mt-auto">
               <Tag size={14} className="text-gray-400" />
               <div className="flex flex-wrap gap-1">
                 {article.tags.map(tag => (
                   <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">#{tag}</span>
                 ))}
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{currentArticle.id ? t.pages.knowledgeBase.editArticle : t.pages.knowledgeBase.newArticle}</h2>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.pages.knowledgeBase.table.category}</label>
                <input 
                  type="text" 
                  value={currentArticle.category || ''}
                  onChange={(e) => setCurrentArticle({ ...currentArticle, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500"
                  placeholder={t.pages.knowledgeBase.placeholders.category}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.pages.knowledgeBase.table.question}</label>
                <input 
                  type="text" 
                  value={currentArticle.question || ''}
                  onChange={(e) => setCurrentArticle({ ...currentArticle, question: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500"
                  placeholder={t.pages.knowledgeBase.placeholders.question}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.pages.knowledgeBase.table.answer}</label>
                <textarea 
                  value={currentArticle.answer || ''}
                  onChange={(e) => setCurrentArticle({ ...currentArticle, answer: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500"
                  placeholder={t.pages.knowledgeBase.placeholders.answer}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">{t.common.cancel}</button>
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">{t.common.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBasePage;