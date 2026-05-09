import React, { useState, useEffect } from 'react';
import api, { API_URL } from '../api';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const STATUS_CONFIG = {
  received:         { label: 'Order Received',     color: 'bg-blue-100 text-blue-800',     dot: 'bg-blue-500',   step: 0 },
  packed:           { label: 'Packed',             color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500', step: 1 },
  picked:           { label: 'Picked up',          color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500', step: 2 },
  delivered:        { label: 'Delivered',          color: 'bg-green-100 text-green-800',   dot: 'bg-green-500',  step: 3 },
  cancelled:        { label: 'Cancelled',          color: 'bg-red-100 text-red-800',       dot: 'bg-red-500',    step: -1 },
};

const STEPS = ['received', 'packed', 'picked', 'delivered'];
const STEP_LABELS = ['Received', 'Packed', 'Picked', 'Delivered'];

const MOCK_ORDERS = [
  {
    _id: 'myorder001',
    createdAt: new Date().toISOString(),
    orderStatus: 'out_for_delivery',
    paymentStatus: 'completed',
    totalAmount: 450,
    deliveryAddress: 'Kanjikuzhi, Kottayam, Kerala - 686004',
    shopkeeperId: { storeName: "Rajan's Provisions" },
    products: [
      { productId: { name: 'Rice', unit: 'kg' }, quantity: 3, price: 60 },
      { productId: { name: 'Coconut Oil', unit: 'liter' }, quantity: 2, price: 165 },
    ],
  },
  {
    _id: 'myorder002',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    orderStatus: 'delivered',
    paymentStatus: 'completed',
    totalAmount: 210,
    deliveryAddress: 'Vaikom, Kottayam, Kerala - 686141',
    shopkeeperId: { storeName: 'Green Leaf Store' },
    products: [
      { productId: { name: 'Banana Chips', unit: 'packet' }, quantity: 5, price: 42 },
    ],
  },
];

const links = [
  { name: 'Nearby Stores', path: '/user-dashboard',         icon: '🏪' },
  { name: 'My Orders',     path: '/user-dashboard/orders',  icon: '📦' },
  { name: 'Profile',       path: '/user-dashboard/profile', icon: '👤' },
];

const MyOrders = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userInfo?.token) return;
      try {
        const { data } = await api.get('/orders/my');
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders', err);
        setOrders([]); // Show empty state if actual fetch fails, or keep MOCK_ORDERS only for local dev
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userInfo]);

  // Socket.io Real-time Setup
  useEffect(() => {
    if (!userInfo) return;

    // Connect to Socket.IO server using production-aware URL
    const socket = io(API_URL);

    // Join room using user's ID
    socket.emit('join', userInfo._id || 'temp_user_id');

    // Listen for order status updates
    socket.on('orderStatusUpdated', (updatedOrder) => {
      const statusLabel = STATUS_CONFIG[updatedOrder.orderStatus]?.label || updatedOrder.orderStatus;
      toast.info(`📦 Order Update: Your order is now "${statusLabel}"`);
      
      // Update the specific order in the local state
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => {
      socket.disconnect();
    };
  }, [userInfo]);

  // Group orders by razorpayOrderId (Transaction)
  const groupOrders = (orders) => {
    const groups = {};
    orders.forEach(order => {
      const id = order.razorpayOrderId || `single_${order._id}`;
      if (!groups[id]) {
        groups[id] = {
          id,
          createdAt: order.createdAt,
          deliveryAddress: order.deliveryAddress,
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
    if (subOrders.some(o => o.orderStatus === 'cancelled')) {
        // If all are cancelled, show cancelled, otherwise show the lowest active status
        if (subOrders.every(o => o.orderStatus === 'cancelled')) return 'cancelled';
    }
    return 'received';
  };

  const groupedTransactions = groupOrders(orders);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar links={links} />
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Orders</h1>
          <p className="text-gray-400 text-sm mb-8">Track the status of your rural deliveries</p>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="animate-pulse bg-white h-48 rounded-xl border border-gray-100" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
              <p className="text-5xl mb-4">🛍️</p>
              <h2 className="text-xl font-semibold text-gray-700">No orders yet</h2>
              <p className="text-gray-500 mt-2 mb-6">Use Voice Ordering to quickly add products from nearby stores.</p>
              <a href="/user-dashboard" className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition inline-block">
                Start Shopping
              </a>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedTransactions.map(tx => {
                const aggregateStatus = getAggregateStatus(tx.subOrders);
                const cfg = STATUS_CONFIG[aggregateStatus] || STATUS_CONFIG['received'];
                const currentStep = STEPS.indexOf(aggregateStatus);

                return (
                  <div key={tx.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    {/* Transaction Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 bg-gray-50/50 border-b border-gray-100 gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Transaction</span>
                          <span className="font-mono text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                            {tx.id.replace('order_', '').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-medium text-gray-400 uppercase">Total Amount</p>
                          <p className="text-xl font-black text-green-600">₹{tx.totalAmount}</p>
                        </div>
                        <span className={`text-sm font-bold px-4 py-1.5 rounded-full shadow-sm flex items-center gap-2 ${cfg.color}`}>
                          <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
                          {cfg.label}
                        </span>
                      </div>
                    </div>

                    {/* Progress Stepper */}
                    {aggregateStatus !== 'cancelled' && (
                      <div className="px-8 pt-8 pb-4">
                        <div className="flex items-center relative">
                          {STEPS.map((s, i) => {
                            const done = currentStep >= i;
                            const active = currentStep === i;
                            return (
                              <React.Fragment key={s}>
                                <div className="flex flex-col items-center relative z-10">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${done ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-gray-100 text-gray-400'} ${active ? 'ring-4 ring-green-100 scale-110' : ''}`}>
                                    {done ? '✓' : i + 1}
                                  </div>
                                  <p className={`text-[10px] mt-2 font-bold uppercase tracking-tighter text-center w-16 ${done ? 'text-green-600' : 'text-gray-400'}`}>
                                    {STEP_LABELS[i]}
                                  </p>
                                </div>
                                {i < STEPS.length - 1 && (
                                  <div className="flex-1 px-2 mb-6">
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full bg-green-500 transition-all duration-700 ${currentStep > i ? 'w-full' : 'w-0'}`} />
                                    </div>
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Sub-Orders (Shops) */}
                    <div className="px-6 py-6 border-t border-gray-50 bg-white">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Items from {tx.subOrders.length} {tx.subOrders.length > 1 ? 'Shops' : 'Shop'}</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {tx.subOrders.map(sub => (
                          <div key={sub._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/30 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{sub.shopkeeperId?.storeName || 'Local Store'}</p>
                                <p className="text-[10px] text-gray-400 font-mono uppercase">Order #{sub._id.slice(-6)}</p>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${STATUS_CONFIG[sub.orderStatus]?.color || 'bg-gray-100'}`}>
                                {STATUS_CONFIG[sub.orderStatus]?.label || sub.orderStatus}
                              </span>
                            </div>
                            <ul className="space-y-1 mb-3">
                              {sub.products.map((p, i) => (
                                <li key={i} className="text-xs text-gray-600 flex justify-between">
                                  <span>{p.productId?.name} × {p.quantity}</span>
                                  <span className="font-medium">₹{p.price * p.quantity}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="pt-2 border-t border-gray-100 flex justify-between items-center mt-auto">
                                <span className="text-xs font-bold text-gray-800">Shop Total</span>
                                <span className="text-sm font-black text-green-600">₹{sub.totalAmount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="text-lg">📍</span>
                            <p className="italic">Delivering to: <span className="font-medium text-gray-700">{tx.deliveryAddress}</span></p>
                        </div>
                        {aggregateStatus === 'packed' && (
                            <p className="text-[10px] font-bold text-indigo-500 animate-pulse">Waiting for Admin pickup...</p>
                        )}
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

export default MyOrders;
