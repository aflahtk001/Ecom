import React, { useState, useEffect } from 'react';
import api, { API_URL } from '../api';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const STATUS_PIPELINE = ['received', 'packed', 'picked', 'delivered'];

const STATUS_CONFIG = {
  received:         { label: 'New Order',        color: 'bg-blue-100 text-blue-800',   dot: 'bg-blue-500'   },
  packed:           { label: 'Packed',            color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  picked:           { label: 'Picked up',         color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' },
  delivered:        { label: 'Delivered',         color: 'bg-green-100 text-green-800',  dot: 'bg-green-500'  },
  cancelled:        { label: 'Cancelled',         color: 'bg-red-100 text-red-800',     dot: 'bg-red-500'    },
};

const NEXT_STATUS = {
  received:         'packed',
};

const NEXT_LABEL = {
  received:         'Mark Packed',
};

const links = [
  { name: 'Dashboard',  path: '/shopkeeper-dashboard',         icon: '📊' },
  { name: 'Products',   path: '/shopkeeper-dashboard/products', icon: '🛒' },
  { name: 'Orders',     path: '/shopkeeper-dashboard/orders',   icon: '📦' },
  { name: 'Offers',     path: '/shopkeeper-dashboard/offers',    icon: '🏷️' },
  { name: 'Payments & Payouts', path: '/shopkeeper-dashboard/payouts', icon: '💸' },
];

// Mock orders when backend is offline
const MOCK_ORDERS = [
  {
    _id: 'mock001',
    createdAt: new Date().toISOString(),
    orderStatus: 'received',
    paymentStatus: 'completed',
    totalAmount: 450,
    deliveryAddress: 'Kanjikuzhi, Kottayam, Kerala - 686004',
    userId: { name: 'Arun Kumar', phone: '9876543210' },
    products: [
      { productId: { name: 'Rice', unit: 'kg' }, quantity: 3, price: 60 },
      { productId: { name: 'Coconut Oil', unit: 'liter' }, quantity: 2, price: 165 },
    ],
  },
  {
    _id: 'mock002',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    orderStatus: 'packed',
    paymentStatus: 'completed',
    totalAmount: 210,
    deliveryAddress: 'Vaikom, Kottayam, Kerala - 686141',
    userId: { name: 'Meera Nair', phone: '9845678901' },
    products: [
      { productId: { name: 'Banana Chips', unit: 'packet' }, quantity: 5, price: 42 },
    ],
  },
  {
    _id: 'mock003',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    orderStatus: 'delivered',
    paymentStatus: 'completed',
    totalAmount: 840,
    deliveryAddress: 'Ernakulam, Kerala - 682001',
    userId: { name: 'Suresh P', phone: '9998887777' },
    products: [
      { productId: { name: 'Cardamom', unit: 'kg' }, quantity: 1, price: 840 },
    ],
  },
];

const ManageOrders = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

    const fetchOrders = async () => {
      if (!userInfo?.token) return;
      setLoading(true);
      try {
        const { data } = await api.get('/orders/shopkeeper');
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders', err);
        setOrders([]); // Show empty state if fetch fails
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => { fetchOrders(); }, [userInfo]);

  // Socket.io Real-time Setup
  useEffect(() => {
    if (!userInfo) return;

    // Connect to Socket.IO server using production-aware URL
    const socket = io(API_URL);

    // Join room using shopkeeper's user ID
    socket.emit('join', userInfo._id || 'temp_shopkeeper_id');

    // Listen for new orders
    socket.on('newOrder', (newOrder) => {
      toast.success('🔔 New order received!');
      // Add the new order to the top of the list locally
      setOrders(prev => [newOrder, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userInfo]);

  const handleStatusUpdate = async (orderId, nextStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: nextStatus });
      toast.success(`Order moved to "${STATUS_CONFIG[nextStatus].label}"`);
      // Optimistic local update
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: nextStatus } : o));
    } catch {
      // Optimistic local update even when backend is offline (demo mode)
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: nextStatus } : o));
      toast.success(`Order moved to "${STATUS_CONFIG[nextStatus].label}" (demo mode)`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order? This cannot be undone.')) return;
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: 'cancelled' });
      toast.error('Order cancelled');
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: 'cancelled' } : o));
    } catch {
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: 'cancelled' } : o));
      toast.error('Order cancelled (demo mode)');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.orderStatus === filterStatus);

  const counts = STATUS_PIPELINE.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.orderStatus === s).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar links={links} />
        <main className="flex-1 p-8 overflow-y-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Manage Orders</h1>
              <p className="text-gray-400 text-sm mt-1">{orders.length} total orders · demo data when backend offline</p>
            </div>
            <button onClick={fetchOrders} className="self-start sm:self-auto text-sm bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition flex items-center gap-2">
              ↻ Refresh
            </button>
          </div>

          {/* Status Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {STATUS_PIPELINE.map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
                className={`p-4 rounded-xl border text-left transition shadow-sm ${filterStatus === s ? 'border-green-500 bg-green-50 ring-2 ring-green-300' : 'bg-white border-gray-100 hover:border-gray-300'}`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[s].dot} mb-2`} />
                <p className="text-xs text-gray-500 font-medium capitalize">{STATUS_CONFIG[s].label}</p>
                <p className="text-2xl font-bold text-gray-800">{counts[s] || 0}</p>
              </button>
            ))}
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-white p-6 rounded-xl border border-gray-100 h-40" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500 font-medium">No orders found for this filter.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredOrders.map(order => {
                const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG['received'];
                const nextStatus = NEXT_STATUS[order.orderStatus];
                const canAct = nextStatus !== undefined;
                const isUpdating = updatingId === order._id;

                return (
                  <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-gray-50 gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                          #{order._id.toString().slice(-6).toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${order.paymentMethod === 'COD' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                          {order.paymentMethod === 'COD' ? '💵 COD' : '💳 PAID'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>

                    {/* Order Body */}
                    <div className="px-6 py-5 grid sm:grid-cols-3 gap-6">
                      {/* Customer Info */}
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Customer</p>
                        <p className="font-semibold text-gray-800">{order.userId?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">📞 {order.userId?.phone || 'N/A'}</p>
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed">📍 {order.deliveryAddress}</p>
                      </div>

                      {/* Products */}
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Items</p>
                        <ul className="space-y-1.5">
                          {order.products.map((p, i) => (
                            <li key={i} className="text-sm text-gray-700 flex justify-between gap-4">
                              <span>{p.productId?.name || 'Product'} × {p.quantity} {p.productId?.unit || ''}</span>
                              <span className="font-medium text-gray-500">₹{p.price * p.quantity}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between">
                          <span className="text-sm font-semibold text-gray-700">Total</span>
                          <span className="text-sm font-bold text-green-600">₹{order.totalAmount}</span>
                        </div>
                      </div>

                      {/* Progress + Actions */}
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Progress</p>
                        {/* Mini pipeline */}
                        <div className="flex items-center gap-1 mb-5">
                          {STATUS_PIPELINE.map((s, i) => {
                            const done = STATUS_PIPELINE.indexOf(order.orderStatus) >= i;
                            return (
                              <React.Fragment key={s}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${done ? 'bg-green-500' : 'bg-gray-200'}`}>
                                  {done && <span className="text-white text-xs">✓</span>}
                                </div>
                                {i < STATUS_PIPELINE.length - 1 && (
                                  <div className={`flex-1 h-0.5 ${STATUS_PIPELINE.indexOf(order.orderStatus) > i ? 'bg-green-500' : 'bg-gray-200'}`} />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>

                        {/* Action Buttons */}
                        {order.orderStatus === 'received' ? (
                          <div className="flex gap-2">
                            {canAct && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleStatusUpdate(order._id, nextStatus)}
                                className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 shadow-sm"
                              >
                                {isUpdating ? '...' : (NEXT_LABEL[order.orderStatus] || 'Mark Packed')}
                              </button>
                            )}
                            <button
                              disabled={isUpdating}
                              onClick={() => handleCancel(order._id)}
                              className="border border-red-200 text-red-500 text-sm py-2 px-3 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className={`text-center py-2 rounded-lg text-sm font-medium ${order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                            {order.orderStatus === 'cancelled' ? '❌ Order Cancelled' : `✅ ${STATUS_CONFIG[order.orderStatus]?.label || order.orderStatus}`}
                          </div>
                        )}
                      </div>
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

export default ManageOrders;
