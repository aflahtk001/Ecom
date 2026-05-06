import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials, setLocation } from '../redux/authSlice';
import api from '../api';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

const Register = () => {
  const [role, setRole] = useState('user'); // user, shopkeeper
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', 
    storeName: '', ownerName: '', category: ''
  });
  const [coords, setCoords] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
      } catch (error) { toast.error('Failed to load categories'); }
    };
    if (role === 'shopkeeper') fetchCategories();
  }, [role]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords([position.coords.longitude, position.coords.latitude]);
        dispatch(setLocation({ lng: position.coords.longitude, lat: position.coords.latitude }));
        toast.success('Location captured successfully');
      },
      () => toast.error('Unable to retrieve your location. Please enable location services.')
    );
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Shopkeepers must provide location
    if (role === 'shopkeeper' && !coords) {
      toast.error('Please capture your store location first');
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = `/auth/${role}/register`;
      const payload = role === 'user' 
        ? { name: formData.name, email: formData.email, phone: formData.phone, password: formData.password }
        : { storeName: formData.storeName, ownerName: formData.ownerName, email: formData.email, phone: formData.phone, password: formData.password, category: formData.category || categories[0]?._id, coordinates: coords };

      const { data } = await api.post(endpoint, payload);
      
      dispatch(setCredentials(data));
      toast.success('Registration successful!');
      navigate(`/${data.role}-dashboard`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900">Create an account</h2>
          </div>

          <div className="flex justify-center mb-6 bg-gray-100 p-1 rounded-lg">
            {['user', 'shopkeeper'].map((r) => (
              <button key={r} onClick={() => setRole(r)} className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition ${role === r ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {r}
              </button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {role === 'user' ? (
              <div><label className="block text-sm font-medium text-gray-700">Full Name</label><input type="text" name="name" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" onChange={handleChange} /></div>
            ) : (
              <>
                <div><label className="block text-sm font-medium text-gray-700">Store Name</label><input type="text" name="storeName" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" onChange={handleChange} /></div>
                <div><label className="block text-sm font-medium text-gray-700">Owner Name</label><input type="text" name="ownerName" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" onChange={handleChange} /></div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Store Category</label>
                  <select name="category" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                    <option value="">Select Category...</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <button type="button" onClick={handleLocation} className={`w-full py-2 border rounded-lg text-sm font-medium flex justify-center items-center gap-2 ${coords ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'} transition`}>
                  {coords ? '✅ Location Captured' : '📍 Capture Store Location (Required)'}
                </button>
              </>
            )}

            <div><label className="block text-sm font-medium text-gray-700">Email address</label><input type="email" name="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Phone Number</label><input type="text" name="phone" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Password</label><input type="password" name="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" onChange={handleChange} /></div>

            <button type="submit" disabled={isLoading} className={`w-full py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'} transition mt-6`}>
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="font-medium text-green-600 hover:text-green-500">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
