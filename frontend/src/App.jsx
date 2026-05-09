import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import UserDashboard from './pages/UserDashboard';
import ShopkeeperDashboard from './pages/ShopkeeperDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import ManageProducts from './pages/ManageProducts';
import ManageOffers from './pages/ManageOffers';
import ManageOrders from './pages/ManageOrders';
import MyOrders from './pages/MyOrders';
import UserProfile from './pages/UserProfile';
import ManageCategories from './pages/ManageCategories';
import AdminStores from './pages/AdminStores';
import AdminUsers from './pages/AdminUsers';
import AdminPayouts from './pages/AdminPayouts';
import ShopkeeperPayouts from './pages/ShopkeeperPayouts';
import StoreProducts from './pages/StoreProducts';

const Home = () => (
  <div className="flex flex-col min-h-screen bg-gray-50">
    <Navbar />
    <div className="flex flex-1 items-center justify-center text-center px-4">
      <div className="max-w-2xl bg-white p-10 rounded-2xl shadow-xl border border-green-100">
        <h1 className="text-5xl font-extrabold text-green-700 mb-6 drop-shadow-sm">GramaBazaar</h1>
        <p className="text-xl text-gray-600 mb-8 font-medium">Empowering Rural Commerce through AI and Voice Technology.</p>
        <div className="flex gap-4 justify-center">
           <span className="px-6 py-3 bg-green-50 text-green-700 rounded-lg font-semibold border border-green-200 shadow-sm">Please use the Navbar to Login/Sign Up</span>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/user-dashboard/*" element={<UserDashboard />} />
        <Route path="/shopkeeper-dashboard/*" element={<ShopkeeperDashboard />} />
        <Route path="/shopkeeper-dashboard/products" element={<ManageProducts />} />
        <Route path="/shopkeeper-dashboard/offers" element={<ManageOffers />} />
        <Route path="/shopkeeper-dashboard/orders" element={<ManageOrders />} />
        <Route path="/shopkeeper-dashboard/payouts" element={<ShopkeeperPayouts />} />
        <Route path="/user-dashboard/orders" element={<MyOrders />} />
        <Route path="/user-dashboard/profile" element={<UserProfile />} />
        <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
        <Route path="/admin-dashboard/categories" element={<ManageCategories />} />
        <Route path="/admin-dashboard/stores" element={<AdminStores />} />
        <Route path="/admin-dashboard/users" element={<AdminUsers />} />
        <Route path="/admin-dashboard/payouts" element={<AdminPayouts />} />
        <Route path="/store/:storeId/products" element={<StoreProducts />} />
      </Routes>
      <ToastContainer position="bottom-right" />
    </Router>
  );
}

export default App;
