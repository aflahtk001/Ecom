import api from '../api';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const ManageOffers = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [offers, setOffers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', discountPercentage: '', expiryDate: '', bannerImage: ''
  });

  const fetchOffers = async () => {
    if (!userInfo?.token) return;
    try {
      const { data } = await api.get(`/offers/shop/${userInfo._id}`);
      setOffers(data);
    } catch (error) { console.error('Failed to load offers'); }
  };

  useEffect(() => { if (userInfo) fetchOffers(); }, [userInfo]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/offers', formData);
      toast.success('Offer created successfully');
      setShowForm(false);
      fetchOffers();
    } catch (error) { toast.error(error.response?.data?.message || 'Error creating offer'); }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await api.delete(`/offers/${id}`);
        toast.success('Offer deleted');
        fetchOffers();
      } catch (error) { toast.error('Error deleting offer'); }
    }
  };

  const links = [
    { name: 'Dashboard', path: '/shopkeeper-dashboard', icon: '📊' },
    { name: 'Products', path: '/shopkeeper-dashboard/products', icon: '🛒' },
    { name: 'Orders', path: '/shopkeeper-dashboard/orders', icon: '📦' },
    { name: 'Offers', path: '/shopkeeper-dashboard/offers', icon: '🏷️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar links={links} />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Manage Offers</h1>
            <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm">
              {showForm ? 'Close Form' : '+ Create Offer'}
            </button>
          </div>

          {showForm && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 animate-fade-in-down">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Create Promotional Offer</h2>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Offer Title</label><input type="text" name="title" required className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500" onChange={handleChange} placeholder="e.g. Eid Special Discount" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label><input type="number" name="discountPercentage" required className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500" onChange={handleChange} placeholder="e.g. 15" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label><input type="date" name="expiryDate" required className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500" onChange={handleChange} /></div>
                <div className="md:col-span-2 mt-2">
                  <button type="submit" className="w-full md:w-auto bg-indigo-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">Publish Offer</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.length === 0 ? (
              <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                <p>No active offers. Create one to attract more customers!</p>
              </div>
            ) : (
              offers.map(offer => (
                <div key={offer._id} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => handleDelete(offer._id)} className="bg-white/20 hover:bg-red-500 p-2 rounded-full backdrop-blur-sm transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 relative z-10">{offer.title}</h3>
                  <p className="text-5xl font-extrabold mb-4 relative z-10">{offer.discountPercentage}% OFF</p>
                  <p className="text-indigo-100 text-sm relative z-10">Valid until: {new Date(offer.expiryDate).toLocaleDateString()}</p>
                  
                  {/* Decorative element */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageOffers;
