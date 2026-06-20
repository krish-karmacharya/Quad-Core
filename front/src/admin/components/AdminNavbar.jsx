import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../services/adminApi';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white h-16 px-6 flex justify-between items-center fixed top-0 left-0 right-0 z-40 shadow-md">
      <div className="flex items-center gap-4">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950">
            A
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent hidden sm:inline">
            SmokePlate AI <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider ml-1">Admin</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <Link to="/" className="text-sm text-slate-400 hover:text-white transition">
          View Website
        </Link>
        {user && (
          <div className="hidden md:flex flex-col text-right text-xs">
            <span className="font-semibold text-slate-200">{user.name}</span>
            <span className="text-slate-500">{user.email}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 text-sm font-semibold px-4 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
