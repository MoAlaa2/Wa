
import React, { useState, useEffect } from 'react';
import { Conversation, Tag, Order } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Clock, User, Phone, Shield, ShieldOff, Trash2, Calendar, AlertTriangle, Tag as TagIcon, Plus, X, Briefcase, Info, ShoppingBag, ExternalLink } from 'lucide-react';
import { whatsappService } from '../../services/whatsappService';

interface ConversationDetailsProps {
  conversation: Conversation;
  onBlock: () => void;
  onDelete: () => void;
  onUpdateTags: (tags: string[]) => void;
}

export const ConversationDetails: React.FC<ConversationDetailsProps> = ({ conversation, onBlock, onDelete, onUpdateTags }) => {
  const { t } = useLanguage();
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAddingTag, setIsAddingTag] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [tagsData, ordersData] = await Promise.all([
        whatsappService.getTags(),
        whatsappService.getOrders({ customerId: conversation.id })
      ]);
      setAllTags(tagsData);
      setOrders(ordersData);
    };
    loadData();
  }, [conversation.id]); // Reload when conversation changes

  const handleAddTag = async (tagId: string) => {
    const currentTags = conversation.tags || [];
    if (!currentTags.includes(tagId)) {
      const newTags = [...currentTags, tagId];
      onUpdateTags(newTags);
      
      const updatedConv = { ...conversation, tags: newTags };
      await whatsappService.updateConversation(updatedConv);
    }
    setIsAddingTag(false);
  };

  const handleRemoveTag = async (tagId: string) => {
    const newTags = (conversation.tags || []).filter(id => id !== tagId);
    onUpdateTags(newTags);

    const updatedConv = { ...conversation, tags: newTags };
    await whatsappService.updateConversation(updatedConv);
  };

  const getTagObject = (id: string) => allTags.find(t => t.id === id);

  // 24h Window Calculation
  const lastMsgTime = new Date(conversation.lastMessageTimestamp);
  const expiryTime = new Date(lastMsgTime.getTime() + 24 * 60 * 60 * 1000);
  const now = new Date();
  const isWindowOpen = now < expiryTime;
  
  const getRemainingTime = () => {
    if (!isWindowOpen) return null;
    const diffMs = expiryTime.getTime() - now.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const getOrderStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending-payment': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-80 border-l border-gray-200 bg-white flex flex-col h-full overflow-y-auto hidden lg:flex">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">{t.pages.inbox.details.title}</h3>
      </div>

      {/* Profile Info */}
      <div className="p-6 flex flex-col items-center text-center border-b border-gray-100">
        <div className="w-20 h-20 rounded-full bg-gray-200 mb-3 overflow-hidden">
          <img src={conversation.avatar || 'https://via.placeholder.com/150'} alt={conversation.contactName} className="w-full h-full object-cover" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">{conversation.contactName}</h2>
        <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
          <Phone size={12} /> {conversation.contactNumber}
        </p>
        
        {conversation.isBlocked && (
           <span className="mt-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded uppercase flex items-center gap-1">
             <AlertTriangle size={10} /> {t.pages.inbox.details.blockedBadge}
           </span>
        )}
      </div>

      {/* Campaign Context */}
      {conversation.context && (
        <div className="p-4 border-b border-gray-100 bg-blue-50/50">
          <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Briefcase size={12} /> Campaign Context
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name:</span>
              <span className="font-medium text-gray-800">{conversation.context.campaignName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Type:</span>
              <span className="font-bold text-blue-700">{conversation.context.campaignType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Source:</span>
              <span className="text-gray-800">{conversation.context.source}</span>
            </div>
          </div>
        </div>
      )}

      {/* Order History (NEW) */}
      <div className="p-4 border-b border-gray-100">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
          <ShoppingBag size={12} /> Recent Orders
        </h4>
        {orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-800">#{order.orderNumber}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${getOrderStatusColor(order.status)}`}>
                    {order.status === 'pending-payment' ? 'Pending' : order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className="font-medium text-gray-900">{order.total.toFixed(2)} SAR</span>
                </div>
                {order.paymentLink && order.status === 'pending-payment' && (
                  <a href={order.paymentLink} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1">
                    Payment Link <ExternalLink size={10} />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-400 italic text-center py-2">No recent orders</div>
        )}
      </div>

      {/* 24h Window Status */}
      <div className="p-4 border-b border-gray-100">
        <div className={`p-3 rounded-lg border ${isWindowOpen ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className={isWindowOpen ? 'text-green-600' : 'text-gray-500'} />
            <span className={`text-sm font-semibold ${isWindowOpen ? 'text-green-800' : 'text-gray-700'}`}>
              {isWindowOpen ? t.pages.inbox.details.windowOpen : t.pages.inbox.details.windowClosed}
            </span>
          </div>
          {isWindowOpen && (
            <p className="text-xs text-green-700 ml-6">
              {t.pages.inbox.details.expiresIn}: {getRemainingTime()}
            </p>
          )}
        </div>
      </div>

      {/* Tags Section */}
      <div className="p-4 border-b border-gray-100">
         <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.pages.inbox.details.tags}</h4>
            <button 
              onClick={() => setIsAddingTag(!isAddingTag)} 
              className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
            >
              <Plus size={12} className="mr-1" /> {t.pages.inbox.details.addTag}
            </button>
         </div>

         {/* System Tags */}
         {conversation.systemTags && conversation.systemTags.length > 0 && (
           <div className="flex flex-wrap gap-2 mb-2">
             {conversation.systemTags.map(tag => (
               <span key={tag.id} className="px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 text-white shadow-sm border border-white" style={{ backgroundColor: tag.color }}>
                  {tag.value}
               </span>
             ))}
           </div>
         )}

         {/* Manual Tag List */}
         <div className="flex flex-wrap gap-2 mb-3">
            {conversation.tags && conversation.tags.length > 0 ? (
               conversation.tags.map(tagId => {
                 const tag = getTagObject(tagId);
                 if (!tag) return null;
                 return (
                   <span key={tagId} className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 text-white shadow-sm" style={{ backgroundColor: tag.color }}>
                      {tag.name}
                      <button onClick={() => handleRemoveTag(tagId)} className="hover:text-black/50"><X size={10} /></button>
                   </span>
                 );
               })
            ) : (
               <span className="text-sm text-gray-400 italic">{t.pages.inbox.details.noTags}</span>
            )}
         </div>

         {/* Add Tag Dropdown */}
         {isAddingTag && (
           <div className="mt-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
             <div className="text-xs text-gray-500 mb-2">Select a tag:</div>
             <div className="flex flex-wrap gap-2">
               {allTags.filter(t => !(conversation.tags || []).includes(t.id)).map(tag => (
                 <button
                    key={tag.id}
                    onClick={() => handleAddTag(tag.id)}
                    className="px-2 py-1 rounded border bg-white hover:bg-gray-100 text-xs flex items-center gap-1"
                 >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }}></div>
                    {tag.name}
                 </button>
               ))}
             </div>
           </div>
         )}
      </div>

      {/* Actions */}
      <div className="p-4 space-y-2 mt-auto">
        <button 
          onClick={onBlock}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border
            ${conversation.isBlocked 
              ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' 
              : 'bg-white border-red-200 text-red-600 hover:bg-red-50'}`}
        >
          {conversation.isBlocked ? (
            <><ShieldOff size={16} /> {t.pages.inbox.details.unblock}</>
          ) : (
            <><Shield size={16} /> {t.pages.inbox.details.block}</>
          )}
        </button>

        <button 
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-red-600 transition-colors"
        >
          <Trash2 size={16} /> {t.pages.inbox.details.deleteChat}
        </button>
      </div>

    </div>
  );
};
