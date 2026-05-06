import api from '../api';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const ManageProducts = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isApproved, setIsApproved] = useState(null); // null = loading, true/false = status
  const [formData, setFormData] = useState({
    name: '', malayalamName: '', category: '',
    actualCost: '', sellingCost: '', stockQuantity: '', unit: 'kg', description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [translateSuggestions, setTranslateSuggestions] = useState([]);

  const fetchProducts = async () => {
    if (!userInfo?.token) return;
    try {
      const { data } = await api.get(`/products/shop/${userInfo._id}`);
      setProducts(data);
    } catch (error) { console.error('Failed to load products'); }
  };

  const fetchShopStatus = async () => {
    try {
      const { data } = await api.get('/auth/shopkeeper/me');
      setIsApproved(data.isApproved);
    } catch {
      setIsApproved(userInfo?.isApproved ?? true);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
      if(data.length > 0) setFormData(prev => ({ ...prev, category: data[0]._id }));
    } catch (error) { console.error('Failed to load categories'); }
  };

  useEffect(() => { 
    if (userInfo) {
      fetchProducts(); 
      fetchCategories();
      setIsApproved(userInfo?.isApproved ?? null);
    }
  }, [userInfo]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setImageFile(e.target.files[0]);

  const handleTranslate = async () => {
    if (!formData.name.trim()) {
      toast.warning('Please enter the English product name first');
      return;
    }
    setTranslating(true);
    setTranslateSuggestions([]);
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(formData.name)}&langpair=en|ml`
      );
      const data = await res.json();

      const suggestions = new Set();

      // Primary translation
      if (data?.responseData?.translatedText)
        suggestions.add(data.responseData.translatedText.trim());

      // Alternatives from matches array
      if (data?.matches) {
        data.matches
          .filter(m => m.translation && m['target-de-humanized'] === 'ml' || m.translation)
          .slice(0, 6)
          .forEach(m => {
            if (m.translation && m.translation.trim()) {
              suggestions.add(m.translation.trim());
            }
          });
      }

      const uniqueSuggestions = [...suggestions].slice(0, 5);

      if (uniqueSuggestions.length > 0) {
        setTranslateSuggestions(uniqueSuggestions);
        // Auto-fill the first suggestion
        setFormData(prev => ({ ...prev, malayalamName: uniqueSuggestions[0] }));
        toast.success(`${uniqueSuggestions.length} suggestion(s) found. Click one to select.`);
      } else {
        toast.error('Translation failed. Please enter manually.');
      }
    } catch {
      toast.error('Translation service unavailable. Please enter manually.');
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (imageFile) data.append('image', imageFile);

      await api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      toast.success('Product added successfully');
      setShowForm(false);
      setImageFile(null);
      fetchProducts();
    } catch (error) { toast.error(error.response?.data?.message || 'Error adding product'); }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Product deleted');
        fetchProducts();
      } catch (error) { toast.error('Error deleting product'); }
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
            <h1 className="text-3xl font-bold text-gray-800">Manage Products</h1>
            {isApproved && (
              <button onClick={() => setShowForm(!showForm)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm">
                {showForm ? 'Close Form' : '+ Add Product'}
              </button>
            )}
          </div>

          {/* Approval Pending Banner */}
          {isApproved === false && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8 flex items-start gap-4">
              <span className="text-3xl">⏳</span>
              <div>
                <h2 className="text-lg font-semibold text-yellow-800">Store Pending Admin Approval</h2>
                <p className="text-sm text-yellow-700 mt-1">
                  Your store registration is under review. Once an admin approves your store, you'll be able to add products and start selling.
                </p>
                <p className="text-xs text-yellow-500 mt-2">Please check back later or contact the platform administrator.</p>
              </div>
            </div>
          )}

          {showForm && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 animate-fade-in-down">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Product</h2>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (English)</label>
                  <input
                    type="text" name="name" required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                    onChange={handleChange} placeholder="e.g. Rice"
                    value={formData.name}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (Malayalam)</label>
                  <div className="flex gap-2">
                    <input
                      type="text" name="malayalamName" required
                      className="flex-1 p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                      onChange={handleChange}
                      value={formData.malayalamName}
                      placeholder="e.g. അരി"
                    />
                    <button
                      type="button"
                      onClick={handleTranslate}
                      disabled={translating}
                      title="Auto-translate English name to Malayalam"
                      className="px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 transition text-sm font-medium whitespace-nowrap disabled:opacity-50"
                    >
                      {translating ? '⏳' : '🔄 Suggest'}
                    </button>
                  </div>

                  {/* Multiple suggestions chips */}
                  {translateSuggestions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-400 mb-1.5">Click a suggestion to use it:</p>
                      <div className="flex flex-wrap gap-2">
                        {translateSuggestions.map((s, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, malayalamName: s }));
                              setTranslateSuggestions([]);
                            }}
                            className={`px-3 py-1 rounded-full text-sm border transition ${
                              formData.malayalamName === s
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:text-green-700'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {translateSuggestions.length === 0 && (
                    <p className="text-xs text-gray-400 mt-1">Type English name first, then click Suggest</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Category</label>
                  <select name="category" required onChange={handleChange} value={formData.category} className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500">
                    <option value="">Select Category...</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Actual Cost (₹)</label><input type="number" name="actualCost" required className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" onChange={handleChange} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Selling Cost (₹)</label><input type="number" name="sellingCost" required className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" onChange={handleChange} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label><input type="number" name="stockQuantity" required className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" onChange={handleChange} /></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select name="unit" className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" onChange={handleChange}>
                    <option value="kg">kg</option>
                    <option value="liter">liter</option>
                    <option value="packet">packet</option>
                    <option value="pieces">pieces</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label><input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-1.5 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" /></div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea name="description" rows="2" className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500" onChange={handleChange} placeholder="Brief details about the product"></textarea>
                </div>
                <div className="md:col-span-2 mt-2">
                  <button type="submit" className="w-full md:w-auto bg-green-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-green-700 transition">Save Product</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <tr>
                  <th className="p-4 border-b">Product Name</th>
                  <th className="p-4 border-b">Malayalam</th>
                  <th className="p-4 border-b">Price</th>
                  <th className="p-4 border-b">Stock</th>
                  <th className="p-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">No products found. Add some to start selling!</td></tr>
                ) : (
                  products.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50 transition">
                      <td className="p-4 border-b">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-md shadow-sm border border-gray-200" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-xl shadow-sm border border-gray-200">📦</div>
                          )}
                          <span className="font-medium text-gray-800">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-4 border-b text-gray-500">{p.malayalamName}</td>
                      <td className="p-4 border-b">
                        <span className="text-green-600 font-bold">₹{p.sellingCost}</span> 
                        <span className="text-gray-400 text-xs line-through ml-2">₹{p.actualCost}</span>
                      </td>
                      <td className="p-4 border-b">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${p.stockQuantity > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {p.stockQuantity} {p.unit}
                        </span>
                      </td>
                      <td className="p-4 border-b">
                        <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:text-red-700 font-medium text-sm">Delete</button>
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

export default ManageProducts;
