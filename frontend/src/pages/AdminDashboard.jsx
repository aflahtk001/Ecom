import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { PlatformRevenueLineChart, StoreGrowthBarChart, UserRoleDoughnut } from '../components/Charts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingStores, setPendingStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useSelector(state => state.auth);

  useEffect(() => {
    if (!userInfo?.token) return;

    const fetchData = async () => {
      try {
        // Fetch stats
        const { data: statsData } = await api.get('/admin/stats');
        setStats(statsData);
        
        // Fetch pending stores
        const { data: storesData } = await api.get('/admin/stores/pending');
        setPendingStores(storesData);
      } catch (error) {
        console.error('Failed to load admin data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userInfo]);

  const handleAction = async (id, action) => {
    try {
      await api.put(`/admin/stores/${id}/status`, { status: action });
      toast.success(`Store ${action}d successfully`);
      setPendingStores(prev => prev.filter(store => store._id !== id));
    } catch (error) {
      toast.error(`Error processing action`);
    }
  };
  const links = [
    { name: 'Overview', path: '/admin-dashboard', icon: '📈' },
    { name: 'Manage Stores', path: '/admin-dashboard/stores', icon: '🏪' },
    { name: 'Manage Users', path: '/admin-dashboard/users', icon: '👥' },
    { name: 'Manage Orders', path: '/admin-dashboard/orders', icon: '📦' },
    { name: 'Categories', path: '/admin-dashboard/categories', icon: '📁' },
    { name: 'Payments & Payouts', path: '/admin-dashboard/payouts', icon: '💸' },
  ];

  // Convert live stats into display cards
  const statCards = stats ? [
    { label: 'Total Users', val: stats.totalUsers, color: 'text-blue-600', bg: 'bg-blue-50', icon: '👥' },
    { label: 'Total Stores', val: stats.totalStores, color: 'text-green-600', bg: 'bg-green-50', icon: '🏪' },
    { label: 'Total Orders', val: stats.totalOrders, color: 'text-purple-600', bg: 'bg-purple-50', icon: '📦' },
    { label: 'Platform Revenue', val: `₹${(Number(stats.platformRevenue) || 0).toFixed(2)}`, color: 'text-amber-600', bg: 'bg-amber-50', icon: '💰' },
  ] : [
    { label: 'Total Users', val: '--', color: 'text-blue-600', bg: 'bg-blue-50', icon: '👥' },
    { label: 'Total Stores', val: '--', color: 'text-green-600', bg: 'bg-green-50', icon: '🏪' },
    { label: 'Total Orders', val: '--', color: 'text-purple-600', bg: 'bg-purple-50', icon: '📦' },
    { label: 'Platform Revenue', val: '--', color: 'text-amber-600', bg: 'bg-amber-50', icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar links={links} />
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Platform Dashboard</h1>
          <p className="text-gray-400 text-sm mb-8">GramaBazaar · Admin Control Center</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            {statCards.map((s, i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className={`${s.bg} w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Platform Revenue Line - spans 2 cols */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-5">Platform Revenue Trends</h2>
              <div className="h-60">
                <PlatformRevenueLineChart chartData={stats?.charts?.revenueTrends} />
              </div>
            </div>

            {/* User Distribution Doughnut */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-5">User Distribution</h2>
              <div className="h-60 flex items-center justify-center">
                <UserRoleDoughnut chartData={stats?.charts?.userDistribution} />
              </div>
            </div>
          </div>

          {/* Charts Row 2 + Pending Approvals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Store Growth Bar */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-5">New Stores / Month</h2>
              <div className="h-48">
                <StoreGrowthBarChart chartData={stats?.charts?.storeGrowth} />
              </div>
            </div>

            {/* Pending Store Approvals Table */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-5">Pending Store Approvals</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-3 border-b">Store Name</th>
                      <th className="p-3 border-b">Owner</th>
                      <th className="p-3 border-b">Category</th>
                      <th className="p-3 border-b">Date</th>
                      <th className="p-3 border-b">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="5" className="p-6 text-center text-gray-400">Loading...</td></tr>
                    ) : pendingStores.length === 0 ? (
                      <tr><td colSpan="5" className="p-6 text-center text-gray-400">No pending approvals</td></tr>
                    ) : (
                      pendingStores.map((s) => (
                        <tr key={s._id} className="hover:bg-gray-50 transition">
                          <td className="p-3 border-b font-medium text-gray-800">{s.storeName}</td>
                          <td className="p-3 border-b text-gray-500">{s.ownerName}</td>
                          <td className="p-3 border-b">
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">{s.category?.name || 'General'}</span>
                          </td>
                          <td className="p-3 border-b text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 border-b">
                            <div className="flex gap-2">
                              <button onClick={() => handleAction(s._id, 'approve')} className="bg-green-600 text-white text-xs px-3 py-1 rounded-lg hover:bg-green-700 transition">Approve</button>
                              <button onClick={() => handleAction(s._id, 'reject')} className="bg-red-50 text-red-600 text-xs px-3 py-1 rounded-lg hover:bg-red-100 transition border border-red-200">Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
