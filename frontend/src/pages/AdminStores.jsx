import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const AdminStores = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const links = [
    { name: 'Overview', path: '/admin-dashboard', icon: '📈' },
    { name: 'Manage Stores', path: '/admin-dashboard/stores', icon: '🏪' },
    { name: 'Manage Users', path: '/admin-dashboard/users', icon: '👥' },
    { name: 'Categories', path: '/admin-dashboard/categories', icon: '📁' },
    { name: 'Payments & Payouts', path: '/admin-dashboard/payouts', icon: '💸' },
  ];

  const fetchStores = async () => {
    try {
      const { data } = await api.get('/admin/stores');
      setStores(data);
    } catch {
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (userInfo) fetchStores(); }, [userInfo]);

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const action = currentStatus ? 'reject' : 'approve';
      await api.put(`/admin/stores/${id}/status`, { status: action });
      toast.success(`Store ${action}d successfully`);
      fetchStores();
    } catch {
      toast.error('Failed to update store status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar links={links} />
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Manage Stores</h1>
          <p className="text-gray-400 text-sm mb-8">View and manage all registered shopkeeper stores.</p>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 border-b">Store Name</th>
                  <th className="p-4 border-b">Owner</th>
                  <th className="p-4 border-b">Category</th>
                  <th className="p-4 border-b">Email</th>
                  <th className="p-4 border-b">Phone</th>
                  <th className="p-4 border-b">Status</th>
                  <th className="p-4 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="p-8 text-center text-gray-400">Loading...</td></tr>
                ) : stores.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center text-gray-400">No stores registered yet.</td></tr>
                ) : (
                  stores.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50 transition">
                      <td className="p-4 border-b font-semibold text-gray-800">{s.storeName}</td>
                      <td className="p-4 border-b text-gray-600">{s.ownerName}</td>
                      <td className="p-4 border-b">
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                          {s.category?.name || 'General'}
                        </span>
                      </td>
                      <td className="p-4 border-b text-gray-500">{s.email}</td>
                      <td className="p-4 border-b text-gray-500">{s.phone}</td>
                      <td className="p-4 border-b">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {s.isApproved ? '✅ Approved' : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="p-4 border-b">
                        <button
                          onClick={() => handleStatusToggle(s._id, s.isApproved)}
                          className={`text-xs px-3 py-1 rounded-lg font-medium transition border ${s.isApproved ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-green-600 text-white border-green-600 hover:bg-green-700'}`}
                        >
                          {s.isApproved ? 'Revoke' : 'Approve'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminStores;
