import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const AdminUsers = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const links = [
    { name: 'Overview', path: '/admin-dashboard', icon: '📈' },
    { name: 'Manage Stores', path: '/admin-dashboard/stores', icon: '🏪' },
    { name: 'Manage Users', path: '/admin-dashboard/users', icon: '👥' },
    { name: 'Categories', path: '/admin-dashboard/categories', icon: '📁' },
  ];

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (userInfo) fetchUsers(); }, [userInfo]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success(`User "${name}" deleted`);
    } catch {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar links={links} />
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Manage Users</h1>
          <p className="text-gray-400 text-sm mb-8">View all registered customers on the platform.</p>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 border-b">Name</th>
                  <th className="p-4 border-b">Email</th>
                  <th className="p-4 border-b">Phone</th>
                  <th className="p-4 border-b">Joined</th>
                  <th className="p-4 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-400">No users registered yet.</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 transition group">
                      <td className="p-4 border-b">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-4 border-b text-gray-500">{u.email}</td>
                      <td className="p-4 border-b text-gray-500">{u.phone || '—'}</td>
                      <td className="p-4 border-b text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 border-b">
                        <button
                          onClick={() => handleDelete(u._id, u.name)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg text-xs font-medium transition border border-red-100"
                        >
                          Delete
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

export default AdminUsers;
