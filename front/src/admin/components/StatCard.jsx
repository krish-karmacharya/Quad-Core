import React from 'react';

const StatCard = ({ title, value, icon, color = 'emerald' }) => {
  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    slate: 'bg-slate-500/10 text-slate-400 border-slate-700/20'
  };

  const ringColorMap = {
    emerald: 'border-emerald-500/30',
    blue: 'border-blue-500/30',
    amber: 'border-amber-500/30',
    rose: 'border-rose-500/30',
    orange: 'border-orange-500/30',
    slate: 'border-slate-500/30'
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-lg relative overflow-hidden group hover:scale-[1.01] transition duration-200`}>
      <div className="flex flex-col gap-1 z-10">
        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{title}</span>
        <span className="text-3xl font-black text-white mt-1">{value}</span>
      </div>
      <div className={`p-3 rounded-lg border ${colorMap[color] || colorMap.emerald} z-10`}>
        {icon}
      </div>
      <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full border-4 ${ringColorMap[color]} opacity-[0.03] group-hover:scale-110 transition duration-300`}></div>
    </div>
  );
};

export default StatCard;
