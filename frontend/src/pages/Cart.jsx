import api from '../api';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Cart = () => {
  const { cartItems, shopkeeperId } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [address, setAddress] = useState(userInfo?.deliveryAddress || '');

  const totalAmount = cartItems.reduce((acc, item) => acc + item.sellingCost * item.qty, 0);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (!address) {
      toast.error('Please enter a delivery address');
      return;
    }

    const res = await loadRazorpay();
    if (!res) {
      toast.error('Razorpay SDK failed to load');
      return;
    }

    try {
      // 1. Fetch Razorpay Public Key
      const { data: configData } = await api.get('/config/razorpay');
      
      // 2. Create Order in Backend
      const { data } = await api.post('/orders', {
        products: cartItems.map(i => ({ productId: i._id, quantity: i.qty, price: i.sellingCost })),
        totalAmount,
        deliveryAddress: address,
        shopkeeperId
      });

      const options = {
        key: configData.key,
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: 'GramaBazaar',
        description: 'Rural E-Commerce Transaction',
        order_id: data.razorpayOrder.id,
        handler: async function (response) {
          try {
            await api.post('/orders/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            
            toast.success('Payment Successful! Order Confirmed.');
            dispatch(clearCart());
            navigate('/user-dashboard/orders');
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: userInfo?.name || 'Guest User',
          email: userInfo?.email || 'guest@example.com',
          contact: userInfo?.phone || '9999999999'
        },
        theme: { color: '#16a34a' } // Tailwind green-600
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed. Make sure backend is running.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto w-full p-8 flex-1">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100">
            <span className="text-6xl mb-4 block">🛒</span>
            <h2 className="text-2xl font-semibold text-gray-700">Your cart is empty</h2>
            <button onClick={() => navigate('/user-dashboard')} className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition">Browse Nearby Stores</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-50 rounded-lg flex items-center justify-center text-green-400 text-2xl">
                      🛍️
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{item.name} <span className="text-sm text-gray-500">({item.malayalamName || 'N/A'})</span></h3>
                      <p className="text-gray-500 text-sm">₹{item.sellingCost} / {item.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium bg-gray-100 px-3 py-1 rounded">Qty: {item.qty}</span>
                    <button onClick={() => dispatch(removeFromCart(item._id))} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-24">
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-100 pb-4">Order Summary</h2>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between mb-4 pb-4 border-b border-gray-100">
                <span className="text-gray-600">Delivery</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between mb-6">
                <span className="text-xl font-bold text-gray-800">Total</span>
                <span className="text-xl font-bold text-green-600">₹{totalAmount}</span>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                <textarea 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-inner bg-gray-50" 
                  rows="3" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full rural delivery address"
                ></textarea>
              </div>
              
              <button 
                onClick={handleCheckout}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition shadow-md flex justify-center items-center gap-2"
              >
                <span>Proceed to Pay</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
