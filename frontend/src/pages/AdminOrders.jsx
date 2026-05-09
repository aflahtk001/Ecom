import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/admin');
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, nextStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: nextStatus });
      toast.success(`Order marked as ${nextStatus}`);
      fetchOrders(); // Refresh to get updated stats
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBulkStatusUpdate = async (razorpayOrderId, nextStatus) => {
    // Find all orders in this transaction and update them
    const txOrders = orders.filter(o => o.razorpayOrderId === razorpayOrderId);
    setUpdatingId(razorpayOrderId);
    try {
      await Promise.all(txOrders.map(o => api.put(`/orders/${o._id}/status`, { orderStatus: nextStatus })));
      toast.success(`Entire transaction marked as ${nextStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update bulk status');
    } finally {
      setUpdatingId(null);
    }
  };

  const groupOrders = (orders) => {
    const groups = {};
    orders.forEach(order => {
      const id = order.razorpayOrderId || `single_${order._id}`;
      if (!groups[id]) {
        groups[id] = {
          id,
          createdAt: order.createdAt,
          deliveryAddress: order.deliveryAddress,
          userId: order.userId,
          subOrders: [],
          totalAmount: 0
        };
      }
      groups[id].subOrders.push(order);
      groups[id].totalAmount += order.totalAmount;
    });
    return Object.values(groups).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getAggregateStatus = (subOrders) => {
    if (subOrders.every(o => o.orderStatus === 'delivered')) return 'delivered';
    if (subOrders.every(o => ['delivered', 'picked'].includes(o.orderStatus))) return 'picked';
    if (subOrders.every(o => ['delivered', 'picked', 'packed'].includes(o.orderStatus))) return 'packed';
    return 'received';
  };

  const links = [
    { name: 'Overview', path: '/admin-dashboard', icon: '📈' },
    { name: 'Manage Stores', path: '/admin-dashboard/stores', icon: '🏪' },
    { name: 'Manage Users', path: '/admin-dashboard/users', icon: '👥' },
    { name: 'Manage Orders', path: '/admin-dashboard/orders', icon: '📦' },
    { name: 'Categories', path: '/admin-dashboard/categories', icon: '📁' },
    { name: 'Payments & Payouts', path: '/admin-dashboard/payouts', icon: '💸' },
  ];

  const groupedTransactions = groupOrders(orders);

  const STATUS_CONFIG = {
    received: { label: 'Received', color: 'bg-blue-100 text-blue-800' },
    packed: { label: 'Packed', color: 'bg-yellow-100 text-yellow-800' },
    picked: { label: 'Picked up', color: 'bg-orange-100 text-orange-800' },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar links={links} />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Order Tracking</h1>
              <p className="text-gray-400 text-sm">Monitor multi-store orders and manage delivery stages</p>
            </div>
            <button onClick={fetchOrders} className="bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition">
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20">Loading orders...</div>
          ) : groupedTransactions.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
              No orders found.
            </div>
          ) : (
            <div className="space-y-6">
              {groupedTransactions.map(tx => {
                const aggregateStatus = getAggregateStatus(tx.subOrders);
                const packedCount = tx.subOrders.filter(o => ['packed', 'picked', 'delivered'].includes(o.orderStatus)).length;
                const totalShops = tx.subOrders.length;
                const isUpdating = updatingId === tx.id;

                return (
                  <div key={tx.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-gray-400">TX: {tx.id.slice(-8).toUpperCase()}</span>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_CONFIG[aggregateStatus]?.color || 'bg-gray-100'}`}>
                            {STATUS_CONFIG[aggregateStatus]?.label?.toUpperCase() || aggregateStatus.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mt-1">{tx.userId?.name} ({tx.userId?.phone})</p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">📍 {tx.deliveryAddress}</p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                         <p className="text-xl font-bold text-green-600">₹{tx.totalAmount}</p>
                         <div className="mt-2 flex gap-2">
                            {aggregateStatus === 'packed' && (
                                <button 
                                    disabled={isUpdating}
                                    onClick={() => handleBulkStatusUpdate(tx.id, 'picked')}
                                    className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-orange-600 transition shadow-sm"
                                >
                                    {isUpdating ? '...' : 'Mark Picked'}
                                </button>
                            )}
                            {aggregateStatus === 'picked' && (
                                <button 
                                    disabled={isUpdating}
                                    onClick={() => handleBulkStatusUpdate(tx.id, 'delivered')}
                                    className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-green-700 transition shadow-sm"
                                >
                                    {isUpdating ? '...' : 'Mark Delivered'}
                                </button>
                            )}
                         </div>
                      </div>
                    </div>

                    {/* Progress Stats */}
                    <div className="px-6 py-3 bg-white flex items-center justify-between border-b border-gray-50">
                        <div className="flex items-center gap-4">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Packing Progress</div>
                            <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-500 ${packedCount === totalShops ? 'bg-green-500' : 'bg-yellow-500'}`}
                                        style={{ width: `${(packedCount / totalShops) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs font-black text-gray-700">{packedCount}/{totalShops} Shops</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>

                    {/* Shop Breakdown */}
                    <div className="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tx.subOrders.map(sub => (
                            <div key={sub._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-bold text-sm text-gray-800">{sub.shopkeeperId?.storeName}</p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_CONFIG[sub.orderStatus]?.color || 'bg-gray-200 text-gray-700'}`}>
                                        {(STATUS_CONFIG[sub.orderStatus]?.label || sub.orderStatus).toUpperCase()}
                                    </span>
                                </div>
                                <ul className="text-xs text-gray-500 space-y-1">
                                    {sub.products.map((p, i) => (
                                        <li key={i}>{p.productId?.name} × {p.quantity}</li>
                                    ))}
                                </ul>
                                <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Shop Total</span>
                                    <span className="text-sm font-bold text-gray-700">₹{sub.totalAmount}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminOrders;
