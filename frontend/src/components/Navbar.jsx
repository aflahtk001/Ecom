import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';

const Navbar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="bg-green-600 text-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold tracking-wide">
        GramaBazaar
      </Link>
      
      <div className="flex items-center gap-6">
        {userInfo ? (
          <>
            {userInfo.role === 'user' && (
              <Link to="/cart" className="relative font-medium hover:text-green-200 transition flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                  </span>
                )}
              </Link>
            )}
            
            <Link to={`/${userInfo.role}-dashboard`} className="font-medium hover:text-green-200 transition">
              Dashboard
            </Link>
            
            <div className="flex items-center gap-4 border-l border-green-500 pl-4 ml-2">
              <span className="text-sm font-medium">{userInfo.name || userInfo.storeName}</span>
              <button 
                onClick={handleLogout}
                className="bg-white text-green-600 px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-green-50 transition shadow-sm"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="flex gap-4">
            <Link to="/login" className="font-medium hover:text-green-200 transition">Login</Link>
            <Link to="/register" className="bg-white text-green-600 px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-green-50 transition shadow-sm">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
