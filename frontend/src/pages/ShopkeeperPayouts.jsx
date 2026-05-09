import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const ShopkeeperPayouts = () => {
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const { data } = await api.get('/stores/ledger');
        setLedgerData(data);
      } catch (error) {
        toast.error('Failed to load payout data');
      } finally {
        setLoading(false);
      }
    };
    fetchLedger();
  }, []);

  const links = [
    { name: 'Dashboard', path: '/shopkeeper-dashboard', icon: '📊' },
    { name: 'Products', path: '/shopkeeper-dashboard/products', icon: '🛒' },
    { name: 'Orders', path: '/shopkeeper-dashboard/orders', icon: '📦' },
    { name: 'Offers', path: '/shopkeeper-dashboard/offers', icon: '🏷️' },
    { name: 'Payments & Payouts', path: '/shopkeeper-dashboard/payouts', icon: '💸' },
  ];

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar links={links} />
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Financial Ledger</h1>
          <p className="text-gray-400 text-sm mb-8">Track your sales and payouts from the Admin</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Total Sales</p>
                <p className="text-3xl font-bold text-green-600 mt-2">₹{ledgerData?.totalSales || 0}</p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Total Paid By Admin</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">₹{ledgerData?.totalPaid || 0}</p>
              </div>
              <div className="text-4xl">💸</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-gray-100 flex items-center justify-between border-l-4 border-l-red-500">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Pending Balance</p>
                <p className="text-3xl font-bold text-red-500 mt-2">₹{ledgerData?.pendingBalance || 0}</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">Payout History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-3 border-b">Date</th>
                    <th className="p-3 border-b">Amount</th>
                    <th className="p-3 border-b">Transaction Ref</th>
                    <th className="p-3 border-b">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerData?.payouts?.map((payout) => (
                    <tr key={payout._id} className="hover:bg-gray-50 transition">
                      <td className="p-3 border-b text-gray-800">{new Date(payout.paymentDate).toLocaleDateString()} {new Date(payout.paymentDate).toLocaleTimeString()}</td>
                      <td className="p-3 border-b font-medium text-green-600">₹{payout.amount}</td>
                      <td className="p-3 border-b text-gray-500">{payout.transactionReference || 'N/A'}</td>
                      <td className="p-3 border-b">
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold uppercase">{payout.status}</span>
                      </td>
                    </tr>
                  ))}
                  {(!ledgerData?.payouts || ledgerData.payouts.length === 0) && (
                    <tr><td colSpan="4" className="p-6 text-center text-gray-400">No payouts recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ShopkeeperPayouts;
