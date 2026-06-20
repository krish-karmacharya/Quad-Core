const StatCard = ({ title, value, icon, color = 'emerald' }) => {
  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    slate: 'bg-slate-500/10 text-slate-400 border-slate-700/20'
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
      <div className="flex flex-col gap-1 z-10">
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</span>
        <span className="text-3xl font-semibold text-white mt-1">{value}</span>
      </div>
      <div className={`p-2.5 rounded-lg border ${colorMap[color] || colorMap.emerald} z-10`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
