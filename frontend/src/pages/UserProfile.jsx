import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const UserProfile = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const links = [
    { name: 'Nearby Stores', path: '/user-dashboard', icon: '🏪' },
    { name: 'My Orders', path: '/user-dashboard/orders', icon: '📦' },
    { name: 'Profile', path: '/user-dashboard/profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar links={links} />
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
            <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-4xl shadow-sm">
                👤
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{userInfo?.name || 'User'}</h2>
                <p className="text-gray-500 font-medium">{userInfo?.role?.toUpperCase() || 'USER'}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                <p className="font-medium text-gray-800">{userInfo?.email || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                <p className="font-medium text-gray-800">{userInfo?.phone || 'N/A'}</p>
              </div>

              {userInfo?.deliveryAddress && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Default Address</p>
                  <p className="font-medium text-gray-800">{userInfo?.deliveryAddress}</p>
                </div>
              )}
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100 flex gap-4">
              <button className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition shadow-sm">
                Edit Profile
              </button>
              <button 
                onClick={handleLogout}
                className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-6 py-2 rounded-lg font-medium transition shadow-sm ml-auto"
              >
                Log Out
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
