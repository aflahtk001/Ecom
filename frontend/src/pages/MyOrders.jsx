import React, { useState, useEffect } from 'react';
import api, { API_URL } from '../api';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const STATUS_CONFIG = {
  placed:           { label: 'Order Placed',      color: 'bg-blue-100 text-blue-800',     dot: 'bg-blue-500',   step: 0 },
  confirmed:        { label: 'Confirmed',          color: 'bg-indigo-100 text-indigo-800', dot: 'bg-indigo-500', step: 1 },
  packed:           { label: 'Packed',             color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500', step: 2 },
  out_for_delivery: { label: 'Out for Delivery',   color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500', step: 3 },
  delivered:        { label: 'Delivered',          color: 'bg-green-100 text-green-800',   dot: 'bg-green-500',  step: 4 },
  cancelled:        { label: 'Cancelled',          color: 'bg-red-100 text-red-800',       dot: 'bg-red-500',    step: -1 },
};

const STEPS = ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered'];
const STEP_LABELS = ['Placed', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered'];

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
        setOrders(data.length ? data : MOCK_ORDERS);
      } catch {
        setOrders(MOCK_ORDERS);
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
            <div className="space-y-6">
              {orders.map(order => {
                const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG['placed'];
                const currentStep = STEPS.indexOf(order.orderStatus);

                return (
                  <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 bg-gray-50 gap-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-xs text-gray-400">#{order._id.toString().slice(-6).toUpperCase()}</span>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>🏪 {order.shopkeeperId?.storeName || 'Store'}</span>
                        <span className="font-bold text-green-600">₹{order.totalAmount}</span>
                      </div>
                    </div>

                    {/* Delivery Progress (stepper) */}
                    {order.orderStatus !== 'cancelled' && (
                      <div className="px-6 pt-5 pb-2">
                        <div className="flex items-center gap-0">
                          {STEPS.map((s, i) => {
                            const done = currentStep >= i;
                            const active = currentStep === i;
                            return (
                              <React.Fragment key={s}>
                                <div className="flex flex-col items-center flex-none">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${done ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 text-gray-400'} ${active ? 'ring-4 ring-green-200 scale-110' : ''}`}>
                                    {done ? '✓' : i + 1}
                                  </div>
                                  <p className={`text-xs mt-1.5 font-medium text-center max-w-[56px] leading-tight ${done ? 'text-green-600' : 'text-gray-400'}`}>{STEP_LABELS[i]}</p>
                                </div>
                                {i < STEPS.length - 1 && (
                                  <div className={`flex-1 h-1 mx-1 rounded-full mt-[-16px] transition-all ${currentStep > i ? 'bg-green-500' : 'bg-gray-200'}`} />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Order Details */}
                    <div className="px-6 py-5 grid sm:grid-cols-2 gap-6 border-t border-gray-50 mt-3">
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Items Ordered</p>
                        <ul className="space-y-1">
                          {order.products.map((p, i) => (
                            <li key={i} className="text-sm text-gray-700 flex justify-between">
                              <span>{p.productId?.name || 'Product'} × {p.quantity} {p.productId?.unit || ''}</span>
                              <span className="font-medium text-gray-500">₹{p.price * p.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Delivery Address</p>
                        <p className="text-sm text-gray-700 leading-relaxed">📍 {order.deliveryAddress}</p>
                        <p className="text-xs text-gray-400 mt-2">{new Date(order.createdAt).toLocaleString()}</p>
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

export default MyOrders;
