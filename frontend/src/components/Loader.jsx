const Loader = ({ message = "Analyzing image. Please wait..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-12 h-12 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-400 font-medium text-center animate-pulse">{message}</p>
    </div>
  );
};

export default Loader;
