import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  const activeClass = "flex items-center gap-3 bg-emerald-500/10 text-emerald-400 font-semibold px-4 py-3 rounded-lg border border-emerald-500/20 shadow-inner";
  const inactiveClass = "flex items-center gap-3 text-slate-400 hover:text-white hover:bg-slate-800/50 px-4 py-3 rounded-lg transition duration-150";

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-white h-[calc(100vh-64px)] fixed top-16 left-0 z-30 p-4 flex flex-col gap-2">
      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider px-3 mb-2 mt-4">
        Navigation
      </div>
      <NavLink
        to="/admin/dashboard"
        className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
        <span>Dashboard</span>
      </NavLink>
      
      <NavLink
        to="/admin/detections"
        className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <span>Detections Queue</span>
      </NavLink>
    </aside>
  );
};

export default AdminSidebar;
