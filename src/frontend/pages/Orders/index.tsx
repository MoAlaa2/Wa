
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { whatsappService } from '../../services/whatsappService';
import { Order } from '../../types';
import { Search, Filter, ShoppingBag, CheckCircle, Clock, XCircle, ChevronRight, MessageSquare } from 'lucide-react';
import { OrderDetailsDrawer } from './OrderDetailsDrawer';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'unpaid' | 'paid' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    let filters: any = {};
    if (activeTab === 'pending') filters.approvalStatus = 'pending_approval';
    if (activeTab === 'rejected') filters.approvalStatus = 'rejected';
    if (activeTab === 'unpaid') filters.paymentStatus = 'unpaid';
    if (activeTab === 'paid') filters.paymentStatus = 'paid';

    const data = await whatsappService.getOrders(filters);
    setOrders(data);
    setLoading(false);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const handleOpenChat = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    navigate('/inbox', { state: { conversationId: order.conversationId } });
  };

  const handleUpdate = () => {
    fetchOrders();
    setIsDrawerOpen(false);
  };

  const filteredOrders = orders.filter(o => 
    o.orderNumber.includes(searchQuery) ||
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerPhone.includes(searchQuery)
  );

  const getStatusBadge = (status: string, approval: string) => {
    if (approval === 'pending_approval') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock size={12} className="mr-1"/> {t.orders.status.pendingApproval}</span>;
    if (approval === 'rejected') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle size={12} className="mr-1"/> {t.orders.status.rejected}</span>;
    if (status === 'completed') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} className="mr-1"/> {t.orders.status.paid}</span>;
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{t.orders.status.pendingPayment}</span>;
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><ShoppingBag className="text-green-600" /> {t.orders.title}</h1>
          <p className="text-gray-500 mt-1">{t.orders.desc}</p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 rtl:space-x-reverse overflow-x-auto">
          {['all', 'pending', 'unpaid', 'paid', 'rejected'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              {t.orders.tabs[tab as keyof typeof t.orders.tabs]}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 rtl:right-3 rtl:left-auto" size={20} />
          <input type="text" placeholder={t.orders.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 rtl:pr-10 rtl:pl-4" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"><Filter size={18} /> {t.common.filter}</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase">{t.orders.table.orderNum}</th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase">{t.orders.table.customer}</th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase">{t.orders.table.total}</th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase">{t.orders.table.status}</th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase">{t.orders.table.date}</th>
                <th className="px-6 py-3 text-center">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (<tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">{t.common.loading}</td></tr>) : 
               filteredOrders.length === 0 ? (<tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">{t.common.noData}</td></tr>) : 
               (filteredOrders.map((order) => (
                  <tr key={order.id} onClick={() => handleOrderClick(order)} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 font-medium text-gray-900">#{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500">{order.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.total.toFixed(2)} {t.common.currencySar || 'SAR'}</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status, order.approvalStatus)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={(e) => handleOpenChat(e, order)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" title={t.orders.drawer.openChat}>
                        <MessageSquare size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailsDrawer order={selectedOrder} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onUpdate={handleUpdate} />
    </div>
  );
};

export default OrdersPage;
