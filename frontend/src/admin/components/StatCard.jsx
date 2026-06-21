const StatCard = ({ title, value }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-1">
      <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</span>
      <span className="text-3xl font-semibold text-white mt-1">{value}</span>
    </div>
  );
};

export default StatCard;
