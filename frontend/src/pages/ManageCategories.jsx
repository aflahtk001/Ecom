import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const ManageCategories = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const links = [
    { name: 'Overview', path: '/admin-dashboard', icon: '📈' },
    { name: 'Manage Stores', path: '/admin-dashboard/stores', icon: '🏪' },
    { name: 'Manage Users', path: '/admin-dashboard/users', icon: '👥' },
    { name: 'Categories', path: '/admin-dashboard/categories', icon: '📁' },
    { name: 'Payments & Payouts', path: '/admin-dashboard/payouts', icon: '💸' },
  ];

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch {
      toast.error('Failed to load categories');
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/categories', { name: newCategory.trim() });
      setCategories(prev => [...prev, data]);
      setNewCategory('');
      toast.success(`"${data.name}" category added!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This will affect all stores in this category.`)) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(c => c._id !== id));
      toast.success(`"${name}" deleted`);
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const icons = { 'Grocery': '🛒', 'Bakery': '🥐', 'Stationery': '✏️' };
  const getIcon = (name) => icons[name] || '🏷️';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar links={links} />
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Manage Categories</h1>
          <p className="text-gray-400 text-sm mb-8">Add or remove store categories available to shopkeepers.</p>

          {/* Add New Category Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 max-w-xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">➕ Add New Category</h2>
            <form onSubmit={handleAdd} className="flex gap-3">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Electronics, Pharmacy..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
              />
              <button
                type="submit"
                disabled={loading || !newCategory.trim()}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
            </form>
          </div>

          {/* Category List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-xl">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-700">Current Categories ({categories.length})</h2>
            </div>
            {categories.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <span className="text-4xl block mb-2">📁</span>
                <p>No categories yet. Add one above!</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <li key={cat._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition group">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getIcon(cat.name)}</span>
                      <span className="font-medium text-gray-800">{cat.name}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(cat._id, cat.name)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg text-sm font-medium transition border border-red-100"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageCategories;
