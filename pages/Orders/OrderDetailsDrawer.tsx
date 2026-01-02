
import React, { useState } from 'react';
import { Order, OrderItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { whatsappService } from '../../services/whatsappService';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle, XCircle, Clock, User, MessageSquare, ExternalLink, Shield, FileText, Download, RefreshCw, Truck, MapPin, Calculator, Save, Edit2 } from 'lucide-react';

interface OrderDetailsDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({ order, isOpen, onClose, onUpdate }) => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  
  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Order>>({});

  if (!order) return null;

  const canApprove = hasPermission('approve_orders') && order.approvalStatus === 'pending_approval';
  const isAdmin = user?.role === 'admin' || user?.role === 'supervisor';

  const handleApprove = async () => {
    if (!user) return;
    setProcessing(true);
    await whatsappService.updateOrderStatus(order.id, 'approve', user.id, user.name);
    setProcessing(false);
    onUpdate();
  };

  const handleReject = async () => {
    if (!user || !rejectReason) return;
    setProcessing(true);
    await whatsappService.updateOrderStatus(order.id, 'reject', user.id, user.name, rejectReason);
    setProcessing(false);
    setShowRejectInput(false);
    onUpdate();
  };

  const handleGenerateInvoice = async () => {
    setGeneratingInvoice(true);
    try {
      const url = await whatsappService.generateInvoice(order.id);
      window.open(url, '_blank');
      onUpdate();
    } catch (e) {
      alert("Failed to generate invoice");
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handleOpenChat = () => {
    navigate('/inbox', { state: { conversationId: order.conversationId } });
  };

  const startEdit = () => {
    setEditForm({
      fulfillment: { ...order.fulfillment },
      taxConfig: { ...order.taxConfig },
      discount: order.discount,
      items: order.items
    });
    setIsEditing(true);
  };

  const saveEdit = async () => {
    if (!user) return;
    setProcessing(true);
    await whatsappService.updateOrder(order.id, editForm, user.id, user.name);
    setProcessing(false);
    setIsEditing(false);
    onUpdate();
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      
      <div className={`fixed inset-y-0 right-0 max-w-full flex`}>
        <div className={`w-screen max-w-lg transform transition ease-in-out duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} bg-white shadow-xl flex flex-col`}>
          
          {/* Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Order #{order.orderNumber}</h2>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && !isEditing && (
                <button onClick={startEdit} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full" title="Edit Order">
                  <Edit2 size={18} />
                </button>
              )}
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500"><X size={24}/></button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Status Banner */}
            {order.approvalStatus === 'pending_approval' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <Clock className="text-yellow-600 mt-0.5" size={20} />
                <div>
                  <h3 className="font-bold text-yellow-800">Approval Required</h3>
                  <p className="text-sm text-yellow-700 mt-1">This order needs supervisor approval before payment link can be generated.</p>
                </div>
              </div>
            )}

            {/* Customer Info & Chat Link */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Customer</h4>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500"><User size={20}/></div>
                  <div>
                    <div className="font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-xs text-gray-500">{order.customerPhone}</div>
                  </div>
                </div>
                <button 
                  onClick={handleOpenChat}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700"
                >
                  <MessageSquare size={16}/> Open Chat
                </button>
              </div>
            </div>

            {/* Fulfillment Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                <Truck size={12}/> Fulfillment
              </h4>
              <div className="border border-gray-200 rounded-lg p-3">
                {isEditing ? (
                  <div className="space-y-3">
                    <select 
                      value={editForm.fulfillment?.type}
                      onChange={e => setEditForm({ ...editForm, fulfillment: { ...editForm.fulfillment, type: e.target.value as any } })}
                      className="w-full border rounded p-2 text-sm"
                    >
                      <option value="delivery">Delivery</option>
                      <option value="pickup">Store Pickup</option>
                      <option value="none">No Shipping</option>
                    </select>
                    {editForm.fulfillment?.type === 'pickup' && (
                      <input 
                        placeholder="Branch ID / Name"
                        value={editForm.fulfillment.branchId || ''}
                        onChange={e => setEditForm({ ...editForm, fulfillment: { ...editForm.fulfillment, branchId: e.target.value } })}
                        className="w-full border rounded p-2 text-sm"
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="font-medium capitalize flex items-center gap-2">
                      {order.fulfillment.type === 'pickup' ? <MapPin size={16} className="text-orange-500"/> : <Truck size={16} className="text-blue-500"/>}
                      {order.fulfillment.type}
                    </span>
                    {order.fulfillment.branchId && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{order.fulfillment.branchId}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Financials & Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Items & Pricing</h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Items List */}
                <div className="divide-y divide-gray-100">
                  {(isEditing ? editForm.items : order.items)?.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm text-gray-800">{item?.name}</div>
                        <div className="text-xs text-gray-500">{item?.quantity} x {item?.price} SAR</div>
                      </div>
                      <div className="font-bold text-gray-900">{item?.total} SAR</div>
                    </div>
                  ))}
                </div>

                {/* Financial Controls (Tax/Discount) */}
                <div className="p-3 bg-gray-50 space-y-2 border-t border-gray-200">
                  {/* Discount */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Discount</span>
                    {isEditing ? (
                      <input 
                        type="number" 
                        value={editForm.discount} 
                        onChange={e => setEditForm({ ...editForm, discount: parseFloat(e.target.value) })}
                        className="w-20 border rounded p-1 text-right"
                      />
                    ) : (
                      <span className="text-red-600">-{order.discount.toFixed(2)} SAR</span>
                    )}
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      VAT 
                      {isEditing && (
                        <input 
                          type="checkbox" 
                          checked={editForm.taxConfig?.enabled} 
                          onChange={e => setEditForm({ ...editForm, taxConfig: { ...editForm.taxConfig!, enabled: e.target.checked } })}
                          className="ml-2"
                        />
                      )}
                    </span>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input 
                          type="number" 
                          value={(editForm.taxConfig?.rate || 0) * 100} 
                          onChange={e => setEditForm({ ...editForm, taxConfig: { ...editForm.taxConfig!, rate: parseFloat(e.target.value) / 100, isOverride: true } })}
                          className="w-12 border rounded p-1 text-right"
                          disabled={!editForm.taxConfig?.enabled}
                        />
                        <span>%</span>
                      </div>
                    ) : (
                      <span>{order.tax.toFixed(2)} SAR ({order.taxConfig.rate * 100}%)</span>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-200 mt-2">
                    <span>Total</span>
                    <span>
                      {isEditing 
                       ? "Recalculating..." // In real app, calculate live
                       : `${order.total.toFixed(2)} SAR`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Actions */}
            {isEditing && (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={saveEdit} disabled={processing} className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex justify-center items-center gap-2">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            )}

            {/* Approval Actions */}
            {!isEditing && canApprove && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
                <h4 className="font-bold text-gray-800 flex items-center gap-2"><Shield size={16}/> Approval Actions</h4>
                {!showRejectInput ? (
                  <div className="flex gap-3">
                    <button 
                      onClick={handleApprove}
                      disabled={processing}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve Order
                    </button>
                    <button 
                      onClick={() => setShowRejectInput(true)}
                      disabled={processing}
                      className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg font-medium hover:bg-red-100"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea 
                      placeholder="Reason for rejection..." 
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowRejectInput(false)} className="text-gray-500 text-sm">Cancel</button>
                      <button onClick={handleReject} disabled={!rejectReason} className="bg-red-600 text-white px-4 py-1.5 rounded text-sm font-medium">Confirm Rejection</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* History Log */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Audit Log</h4>
              <div className="space-y-4 pl-4 border-l-2 border-gray-100">
                {order.history.map((entry, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] top-0 w-3 h-3 bg-gray-300 rounded-full border-2 border-white"></div>
                    <div className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString()}</div>
                    <div className="text-sm font-medium text-gray-800">
                      <span className="capitalize">{entry.action.replace('_', ' ')}</span> by {entry.userName}
                    </div>
                    {entry.notes && <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-1">{entry.notes}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Invoice & Payment Link */}
            {!isEditing && (
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {(order.invoice || order.status === 'completed') && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="text-blue-600" size={24} />
                      <div>
                        <h3 className="font-bold text-blue-900">Tax Invoice</h3>
                        <p className="text-xs text-blue-700">{order.invoice ? `#${order.invoice.number}` : 'Ready to generate'}</p>
                      </div>
                    </div>
                    {order.invoice ? (
                      <a href={order.invoice.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-bold text-blue-700 hover:underline">
                        <Download size={16} /> Download
                      </a>
                    ) : (
                      <button onClick={handleGenerateInvoice} disabled={generatingInvoice} className="flex items-center gap-1 text-sm font-bold text-blue-700 hover:underline disabled:opacity-50">
                        <RefreshCw size={16} className={generatingInvoice ? 'animate-spin' : ''} /> Generate
                      </button>
                    )}
                  </div>
                )}

                {order.paymentLink && order.status === 'pending-payment' && (
                  <a 
                    href={order.paymentLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 py-3 rounded-lg font-bold hover:bg-blue-100"
                  >
                    <ExternalLink size={18} /> Open Payment Link
                  </a>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
