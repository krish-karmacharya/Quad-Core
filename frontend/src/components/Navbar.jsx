import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 pb-1' : 'text-gray-300 hover:text-white transition pb-1';
  };

  return (
    <nav className="bg-slate-950 border-b border-slate-800 text-white py-4 px-6 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950">
            S
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            SmokePlate AI
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className={isActive('/')}>
            Home
          </Link>
          <Link to="/history" className={isActive('/history')}>
            History
          </Link>
          <Link
            to="/admin/dashboard"
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-1.5 rounded-lg font-medium transition duration-200"
          >
            Admin Portal
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
