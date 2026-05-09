import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const AdminPayouts = () => {
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [period, setPeriod] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [transactionRef, setTransactionRef] = useState('');

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const params = { period };
      if (period === 'day') params.date = selectedDate;
      if (period === 'month') params.month = selectedMonth;
      if (period === 'year') params.year = selectedYear;

      const { data } = await api.get('/admin/ledger', { params });
      setLedgerData(data);
    } catch (error) {
      toast.error('Failed to load ledger data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [period, selectedDate, selectedMonth, selectedYear]);

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/payouts', {
        shopkeeperId: selectedStore.shopkeeperId,
        amount: Number(payoutAmount),
        transactionReference: transactionRef
      });
      toast.success('Payout recorded successfully');
      setShowModal(false);
      setPayoutAmount('');
      setTransactionRef('');
      fetchLedger(); // Refresh
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payout failed');
    }
  };

  const openPayoutModal = (store) => {
    setSelectedStore(store);
    setPayoutAmount(store.pendingBalance);
    setShowModal(true);
  };

  const links = [
    { name: 'Overview', path: '/admin-dashboard', icon: '📈' },
    { name: 'Manage Stores', path: '/admin-dashboard/stores', icon: '🏪' },
    { name: 'Manage Users', path: '/admin-dashboard/users', icon: '👥' },
    { name: 'Manage Orders', path: '/admin-dashboard/orders', icon: '📦' },
    { name: 'Categories', path: '/admin-dashboard/categories', icon: '📁' },
    { name: 'Payments & Payouts', path: '/admin-dashboard/payouts', icon: '💸' },
  ];

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar links={links} />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">Payments & Payouts Ledger</h1>
              <p className="text-gray-400 text-sm">Track unified payments and disburse funds to shopkeepers</p>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                {['', 'day', 'month', 'year'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      period === p
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {p === '' ? 'All Time' : p === 'day' ? 'Day' : p === 'month' ? 'Month' : 'Year'}
                  </button>
                ))}
              </div>

              {/* Specific Period Pickers */}
              <div className="flex items-center gap-2">
                {period === 'day' && (
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                )}
                {period === 'month' && (
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                )}
                {period === 'year' && (
                  <input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    min="2020"
                    max="2100"
                    className="w-24 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Total Payments Received</p>
                <p className="text-3xl font-bold text-green-600 mt-2">₹{ledgerData?.totalReceived || 0}</p>
              </div>
              <div className="text-4xl">💳</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Total Payouts Disbursed</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">₹{ledgerData?.totalPayouts || 0}</p>
              </div>
              <div className="text-4xl">💸</div>
            </div>
          </div>

          {/* Store Ledger Table */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">Shopkeeper Balances</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-3 border-b">Store Name</th>
                    <th className="p-3 border-b">Owner</th>
                    <th className="p-3 border-b">Total Sales</th>
                    <th className="p-3 border-b">Total Paid</th>
                    <th className="p-3 border-b font-bold text-red-500">Pending Balance</th>
                    <th className="p-3 border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerData?.storeLedger?.map((store) => (
                    <tr key={store.shopkeeperId} className="hover:bg-gray-50 transition">
                      <td className="p-3 border-b font-medium text-gray-800">{store.storeName}</td>
                      <td className="p-3 border-b text-gray-500">{store.ownerName}</td>
                      <td className="p-3 border-b text-green-600">₹{store.totalSales}</td>
                      <td className="p-3 border-b text-blue-600">₹{store.totalPaid}</td>
                      <td className="p-3 border-b font-bold text-red-500">₹{store.pendingBalance}</td>
                      <td className="p-3 border-b">
                        <button 
                          onClick={() => openPayoutModal(store)}
                          disabled={store.pendingBalance <= 0}
                          className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${store.pendingBalance > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        >
                          Pay Now
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!ledgerData?.storeLedger || ledgerData.storeLedger.length === 0) && (
                    <tr><td colSpan="6" className="p-6 text-center text-gray-400">No stores found with sales data.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Payout Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Record Payout</h2>
            <p className="text-gray-600 mb-6">Paying <span className="font-semibold text-gray-800">{selectedStore?.storeName}</span></p>
            
            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  max={selectedStore?.pendingBalance}
                  value={payoutAmount} 
                  onChange={(e) => setPayoutAmount(e.target.value)} 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
                  required 
                />
                <p className="text-xs text-gray-500 mt-1">Max pending: ₹{selectedStore?.pendingBalance}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Ref (Optional)</label>
                <input 
                  type="text" 
                  value={transactionRef} 
                  onChange={(e) => setTransactionRef(e.target.value)} 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
                  placeholder="e.g. UTR number"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">Record Payout</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayouts;
