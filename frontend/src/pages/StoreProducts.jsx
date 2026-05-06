import api from '../api';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { addToCart } from '../redux/cartSlice';
import Navbar from '../components/Navbar';

const StoreProducts = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);

  const [products, setProducts] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: productsData } = await api.get(
          `/products/shop/${storeId}`
        );
        setProducts(productsData);

        // Try to fetch store details from the products data
        if (productsData.length > 0 && productsData[0].shopkeeperId) {
          const sk = productsData[0].shopkeeperId;
          setStore(typeof sk === 'object' ? sk : null);
        }
      } catch {
        toast.error('Failed to load products for this store');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [storeId]);

  const handleAdd = (product) => {
    const quantity = qty[product._id] || 1;
    dispatch(addToCart({ ...product, shopkeeperId: storeId, qty: quantity }));
    toast.success(`🛒 ${product.name} (x${quantity}) added to cart!`);
  };

  const cartCount = cartItems.reduce((acc, i) => acc + i.qty, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="max-w-5xl mx-auto w-full px-6 py-8 flex-1">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/user-dashboard')}
              className="text-sm text-green-600 hover:underline mb-1 flex items-center gap-1"
            >
              ← Back to Stores
            </button>
            <h1 className="text-3xl font-bold text-gray-800">
              {store?.storeName || 'Store Products'}
            </h1>
            {store?.category?.name && (
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold mt-1 inline-block">
                {store.category.name}
              </span>
            )}
          </div>

          {/* Cart Badge */}
          {cartCount > 0 && (
            <button
              onClick={() => navigate('/cart')}
              className="relative bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition shadow-md flex items-center gap-2"
            >
              🛒 View Cart
              <span className="bg-white text-green-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </button>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
                <div className="h-32 bg-gray-100 rounded-lg mb-4" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl border border-dashed border-gray-200">
            <span className="text-5xl block mb-3">📦</span>
            <h2 className="text-xl font-semibold text-gray-700">No products available</h2>
            <p className="text-gray-400 mt-1 text-sm">This store hasn't added any products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                {/* Image */}
                <div className="h-40 bg-green-50 flex items-center justify-center text-5xl border-b border-gray-100">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    '🛍️'
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">{product.name}</h3>
                  <p className="text-sm text-gray-400 mb-1">{product.malayalamName}</p>
                  {product.description && (
                    <p className="text-xs text-gray-400 mb-2 line-clamp-2">{product.description}</p>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-green-600 font-bold text-xl">₹{product.sellingCost}</span>
                    <span className="text-gray-300 text-sm line-through">₹{product.actualCost}</span>
                    <span className="text-xs text-gray-400">/ {product.unit}</span>
                  </div>

                  {/* Stock Badge */}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-3 inline-block ${
                    product.stockQuantity > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {product.stockQuantity > 0 ? `In Stock: ${product.stockQuantity} ${product.unit}` : 'Out of Stock'}
                  </span>

                  {/* Qty + Add to Cart */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setQty(prev => ({ ...prev, [product._id]: Math.max(1, (prev[product._id] || 1) - 1) }))}
                        className="px-2 py-1.5 text-gray-500 hover:bg-gray-100 transition text-sm font-bold"
                      >−</button>
                      <span className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-50 border-x border-gray-200">
                        {qty[product._id] || 1}
                      </span>
                      <button
                        onClick={() => setQty(prev => ({ ...prev, [product._id]: Math.min(product.stockQuantity, (prev[product._id] || 1) + 1) }))}
                        className="px-2 py-1.5 text-gray-500 hover:bg-gray-100 transition text-sm font-bold"
                      >+</button>
                    </div>
                    <button
                      onClick={() => handleAdd(product)}
                      disabled={product.stockQuantity === 0}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreProducts;
