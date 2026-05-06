import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ links }) => {
  const location = useLocation();

  return (
    <div className="w-64 bg-white h-[calc(100vh-76px)] shadow-lg border-r border-gray-100 flex-col hidden md:flex sticky top-[76px]">
      <div className="p-6">
        <h2 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-4">Menu</h2>
        <nav className="space-y-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname === link.path 
                  ? 'bg-green-50 text-green-700 font-semibold shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="mr-3 text-xl">{link.icon}</span>
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
