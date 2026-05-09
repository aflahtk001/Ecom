import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useSelector } from 'react-redux';
import api from '../api';
import { SalesBarChart, RevenueLineChart, TopProductsDoughnut } from '../components/Charts';

const ShopkeeperDashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [activeChart, setActiveChart] = useState('sales'); // 'sales' | 'revenue'
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const links = [
    { name: 'Dashboard', path: '/shopkeeper-dashboard', icon: '📊' },
    { name: 'Products', path: '/shopkeeper-dashboard/products', icon: '🛒' },
    { name: 'Orders', path: '/shopkeeper-dashboard/orders', icon: '📦' },
    { name: 'Offers', path: '/shopkeeper-dashboard/offers', icon: '🏷️' },
    { name: 'Payments & Payouts', path: '/shopkeeper-dashboard/payouts', icon: '💸' },
  ];

  const fetchAISuggestions = async () => {
    if (!userInfo?.token) return;
    setLoadingSuggestions(true);
    try {
      const { data } = await api.get('/ai/suggestions');
      setSuggestions(data.suggestions || []);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch {
      setSuggestions([
        { product: 'Premium Rice', reason: 'Staple diet with consistent high demand.' },
        { product: 'Coconut Oil', reason: 'Essential for traditional Kerala cooking.' },
        { product: 'Fresh Cardamom', reason: 'Seasonal harvest yields better quality and sales.' }
      ]);
      setLastRefreshed(new Date().toLocaleTimeString() + ' (offline)');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const fetchStats = async () => {
    if (!userInfo?.token) return;
    setLoadingStats(true);
    try {
      const { data } = await api.get('/stores/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => { 
    fetchAISuggestions(); 
    fetchStats();
  }, [userInfo]);

  const statCards = [
    { label: 'Total Sales', value: stats ? `₹${stats.totalSales}` : '0', icon: '📈', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Orders', value: stats ? stats.activeOrders : '0', icon: '📦', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Products', value: stats ? stats.productCount : '0', icon: '🛍️', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Revenue', value: stats ? `₹${Number(stats.revenue).toFixed(2)}` : '₹0', icon: '💰', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar links={links} />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Shop Overview</h1>
              <p className="text-gray-400 text-sm mt-1">Welcome back, {userInfo?.storeName || 'Shopkeeper'}!</p>
            </div>
            {userInfo?.isApproved && (
              <a href="/shopkeeper-dashboard/products">
                <button className="bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition font-medium">
                  + Add Product
                </button>
              </a>
            )}
          </div>

          {/* Approval Pending Banner */}
          {userInfo?.isApproved === false && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-8 flex items-start gap-4">
              <span className="text-3xl">⏳</span>
              <div>
                <h2 className="font-semibold text-yellow-800">Your store is pending admin approval</h2>
                <p className="text-sm text-yellow-700 mt-1">Once approved, you can add products and receive orders. Please wait for admin review.</p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            {statCards.map((s, i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className={`${s.bg} w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Charts + AI Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

            {/* Sales / Revenue Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-800">Performance Analytics</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveChart('sales')}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition ${activeChart === 'sales' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    Sales
                  </button>
                  <button
                    onClick={() => setActiveChart('revenue')}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition ${activeChart === 'revenue' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    Revenue
                  </button>
                </div>
              </div>
              <div className="h-56">
                {activeChart === 'sales' ? (
                  <SalesBarChart chartData={stats?.charts?.sales} />
                ) : (
                  <RevenueLineChart chartData={stats?.charts?.revenue} />
                )}
              </div>
            </div>

            {/* Gemini AI Panel */}
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 rounded-xl shadow-sm border border-indigo-100">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">✨ AI Suggestions</h2>
                <button onClick={fetchAISuggestions} disabled={loadingSuggestions} className="text-xs text-indigo-600 hover:text-indigo-800 bg-white px-2 py-1 rounded-full border border-indigo-200 shadow-sm disabled:opacity-50 transition">
                  {loadingSuggestions ? '...' : '↻'}
                </button>
              </div>
              <p className="text-xs text-indigo-400 mb-4">Gemini AI · {lastRefreshed}</p>
              {loadingSuggestions ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse h-12 bg-white/60 rounded-lg" />)}</div>
              ) : (
                <ul className="space-y-3">
                  {suggestions.map((item, idx) => (
                    <li key={idx} className="bg-white/80 p-3 rounded-lg shadow-sm text-sm font-medium text-indigo-900 border-l-4 border-indigo-400 flex items-start gap-3">
                      <span className="text-xl leading-none mt-0.5">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                      <div>
                        <div className="font-bold">{item.product || item}</div>
                        {item.reason && <div className="text-xs text-indigo-500 font-normal mt-0.5 leading-snug">{item.reason}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-indigo-400 mt-4">Based on current Kerala season & festival trends.</p>
            </div>
          </div>

          {/* Top Products Doughnut */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">Top Selling Products</h2>
            <div className="max-w-xs mx-auto">
              <TopProductsDoughnut chartData={stats?.charts?.topProducts} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ShopkeeperDashboard;
