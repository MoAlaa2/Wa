
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { whatsappService } from '../../../services/whatsappService';
import { Product, OrderItem, Conversation } from '../../../types';
import { Search, Plus, Trash2, ShoppingCart, X, CreditCard, ChevronDown, Check, ShieldAlert, Package, AlertCircle } from 'lucide-react';

interface CreateOrderPanelProps {
  conversation: Conversation;
  agentId: string;
  onClose: () => void;
  onOrderCreated: (link: string, orderNumber: string) => void;
}

export const CreateOrderPanel: React.FC<CreateOrderPanelProps> = ({ conversation, agentId, onClose, onOrderCreated }) => {
  const { t } = useLanguage();
  const { user, hasPermission } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [customItem, setCustomItem] = useState({ name: '', price: '', quantity: '1' });
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 1) {
      whatsappService.getProducts(searchQuery).then(setProducts);
    } else {
      setProducts([]);
    }
  }, [searchQuery]);

  const addItem = (product: Product) => {
    if (product.manageStock && product.stock <= 0) {
      alert("Out of stock!");
      return;
    }

    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        // Check stock limit
        if (product.manageStock && existing.quantity + 1 > product.stock) {
          alert(`Cannot add more. Max stock is ${product.stock}`);
          return prev;
        }
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price } : i);
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        quantity: 1,
        price: product.price,
        total: product.price,
        isCustom: false
      }];
    });
    setSearchQuery('');
    setProducts([]);
  };

  const addCustomItem = () => {
    if (!customItem.name || !customItem.price) return;
    const price = parseFloat(customItem.price);
    const qty = parseInt(customItem.quantity);
    
    setItems(prev => [...prev, {
      name: customItem.name,
      price: price,
      quantity: qty,
      total: price * qty,
      isCustom: true
    }]);
    
    setCustomItem({ name: '', price: '', quantity: '1' });
    setIsCustomMode(false);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, delta: number) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        const newQty = Math.max(1, item.quantity + delta);
        
        // Stock Validation check (simplified)
        if (delta > 0 && item.productId && !item.isCustom) {
           // Should check stock here in production
        }

        return { ...item, quantity: newQty, total: newQty * item.price };
      }
      return item;
    }));
  };

  // Logic to determine if approval is needed
  const needsApproval = () => {
    // Training mode agents always require approval if they manage to submit (though UI restricts them)
    if (user?.agentMode === 'training') return true;

    // If agent is supervisor/admin, no approval needed
    if (hasPermission('approve_orders')) return false;
    
    // Check for custom items
    const hasCustom = items.some(i => i.isCustom);
    if (hasCustom) return true;

    return false;
  };

  const isApprovalRequired = needsApproval();
  const isTrainingMode = user?.agentMode === 'training';

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      const order = await whatsappService.createOrder({
        customerId: conversation.id,
        customerName: conversation.contactName,
        customerPhone: conversation.contactNumber,
        conversationId: conversation.id,
        agentId: agentId,
        agentName: user?.name || 'Agent',
        items: items,
        requiresApproval: isApprovalRequired
      });
      
      if (order.paymentLink) {
        onOrderCreated(order.paymentLink, order.orderNumber);
      } else {
        alert(t.inbox.orderPanel.orderSubmittedForApproval?.replace('{orderNumber}', order.orderNumber) || `Order #${order.orderNumber} submitted for approval.`);
        onClose();
      }
    } catch (e) {
      alert("Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = items.reduce((acc, i) => acc + i.total, 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 border-l border-gray-200">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center shadow-sm">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <ShoppingCart size={20} className="text-green-600" />
          {t.inbox.orderPanel.title}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Customer Info */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">{t.inbox.orderPanel.customer}</label>
          <div className="font-medium text-gray-900">{conversation.contactName}</div>
          <div className="text-sm text-gray-500">{conversation.contactNumber}</div>
        </div>

        {/* Training Mode Warning */}
        {isTrainingMode && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2 text-xs text-orange-800">
            <ShieldAlert size={14} className="mt-0.5 flex-shrink-0" />
            <p>{t.inbox.orderPanel.trainingWarning}</p>
          </div>
        )}

        {/* Product Search */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
             <label className="text-xs font-bold text-gray-400 uppercase">{t.inbox.orderPanel.items}</label>
             {!isTrainingMode && (
               <button 
                 onClick={() => setIsCustomMode(!isCustomMode)} 
                 className="text-xs text-blue-600 hover:text-blue-800 font-medium"
               >
                 {isCustomMode ? t.inbox.orderPanel.searchCatalog || 'Search Catalog' : t.inbox.orderPanel.customItem || '+ Custom Item'}
               </button>
             )}
          </div>

          {!isCustomMode ? (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              
              {/* Dropdown Results */}
              {products.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                  {products.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => addItem(p)}
                      className={`p-3 border-b border-gray-100 last:border-0 flex justify-between items-center ${p.stock <= 0 ? 'bg-gray-50 opacity-60 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={p.image} className="w-10 h-10 rounded object-cover bg-gray-100" alt="" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            {p.sku} 
                            {p.manageStock && (
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${p.stock > 10 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                {p.stock > 0 ? `${p.stock} in stock` : 'Out of Stock'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-green-600">{p.price} {t.common.currencySar || 'SAR'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <input 
                placeholder="Item Name" 
                value={customItem.name} 
                onChange={e => setCustomItem({...customItem, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
              />
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="Price" 
                  value={customItem.price} 
                  onChange={e => setCustomItem({...customItem, price: e.target.value})}
                  className="flex-1 border border-gray-300 rounded-lg p-2 text-sm"
                />
                <input 
                  type="number" 
                  placeholder="Qty" 
                  value={customItem.quantity} 
                  onChange={e => setCustomItem({...customItem, quantity: e.target.value})}
                  className="w-20 border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>
              <button 
                onClick={addCustomItem}
                disabled={!customItem.name || !customItem.price}
                className="w-full bg-blue-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Add Item
              </button>
            </div>
          )}

          {/* Cart Items */}
          <div className="space-y-2 mt-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex-1 min-w-0 mr-2">
                  <div className="text-sm font-medium truncate">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.price} {t.common.currencySar || 'SAR'} x {item.quantity}</div>
                  {item.isCustom && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1 rounded">Custom</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white border border-gray-300 rounded overflow-hidden">
                    <button onClick={() => updateQuantity(idx, -1)} className="px-2 py-0.5 hover:bg-gray-100">-</button>
                    <span className="text-xs w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(idx, 1)} className="px-2 py-0.5 hover:bg-gray-100">+</button>
                  </div>
                  <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
            {items.length === 0 && !isCustomMode && (
              <div className="text-center py-6 text-gray-400 text-sm">Cart is empty</div>
            )}
          </div>
        </div>

        {/* Totals */}
        {items.length > 0 && (
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)} {t.common.currencySar || 'SAR'}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>VAT (15%)</span>
              <span>{tax.toFixed(2)} {t.common.currencySar || 'SAR'}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-2 mt-2">
              <span>Total</span>
              <span>{total.toFixed(2)} {t.common.currencySar || 'SAR'}</span>
            </div>
          </div>
        )}

      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-white border-t border-gray-200">
        {isApprovalRequired && items.length > 0 && (
          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 text-sm text-yellow-800">
            <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
            <p>
              {isTrainingMode 
                ? 'Training Mode: Orders require supervisor approval.'
                : 'This order requires supervisor approval.'}
            </p>
          </div>
        )}

        <button 
          onClick={handleCreateOrder}
          disabled={items.length === 0 || loading}
          className={`w-full text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
            ${isApprovalRequired 
              ? 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-100' 
              : 'bg-green-600 hover:bg-green-700 shadow-green-100'
            }`}
        >
          {loading ? 'Processing...' : (
            isApprovalRequired ? (
              <>Submit for Approval</>
            ) : (
              <>
                <CreditCard size={20} />
                Create & Send Link
              </>
            )
          )}
        </button>
      </div>
    </div>
  );
};
