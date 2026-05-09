import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import VoiceOrderInput from '../components/VoiceOrderInput';
import { useSelector } from 'react-redux';

const UserDashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLoadingStores(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        fetchNearbyStores(latitude, longitude);
      },
      (error) => {
        setLocationError('Please allow location access to see nearby stores.');
        setLoadingStores(false);
      }
    );
  }, []);

  const fetchNearbyStores = async (lat, lng) => {
    try {
      const { data } = await api.get(`/stores/nearby?lat=${lat}&lng=${lng}`);
      setStores(data);
    } catch (err) {
      toast.error('Failed to fetch nearby stores');
    } finally {
      setLoadingStores(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {userInfo?.name || 'User'}!</h1>
          <p className="text-gray-500 mb-8">Discover fresh products from stores near you.</p>
          
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 flex flex-col items-center justify-center text-center">
              <h2 className="text-xl font-semibold mb-2 text-green-700">Quick Voice Order</h2>
              <p className="text-gray-500 mb-6 text-sm max-w-sm">
                Speak in Malayalam to automatically find the lowest priced product from nearby stores and add it to your cart.
              </p>
              {/* Pass actual coordinates if available */}
              {location ? (
                <VoiceOrderInput lat={location.lat} lng={location.lng} />
              ) : (
                <div className="bg-orange-50 text-orange-600 p-4 rounded-lg text-sm w-full font-medium">
                  Voice ordering requires location access to find stores near you.
                </div>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Stores in your area</h2>
              {locationError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-sm font-medium">
                  {locationError}
                </div>
              )}

              {loadingStores ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex space-x-4 border border-gray-100 p-4 rounded-lg">
                      <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                      <div className="flex-1 space-y-3 py-1">
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : stores.length === 0 && !locationError ? (
                <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <span className="text-4xl block mb-2">🧭</span>
                  <p className="text-gray-500 font-medium">No stores found within 10km of your location.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stores.map((store) => (
                    <div key={store._id} className="flex items-center space-x-4 border border-gray-100 p-4 rounded-lg hover:shadow-md transition bg-white">
                      <div className="rounded-full bg-green-50 h-12 w-12 flex items-center justify-center text-xl shadow-sm">
                        🏪
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg">{store.storeName}</h3>
                        <p className="text-sm text-gray-500">{store.category?.name || 'General Store'}</p>
                        <p className="text-xs text-gray-400 mt-1">📞 {store.phone}</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/store/${store._id}/products`)}
                        className="bg-gray-50 hover:bg-green-50 hover:text-green-600 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition border border-gray-200 hover:border-green-200"
                      >
                        View Products
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
