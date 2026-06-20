import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../services/adminApi';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    } finally {
      navigate('/login');
    }
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white h-16 px-5 flex justify-between items-center fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center gap-4">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg border border-slate-800 flex items-center justify-center font-semibold text-xs">
            A
          </div>
          <span className="text-sm font-semibold tracking-tight hidden sm:inline">
            SmokePlate <span className="text-xs text-slate-400 font-medium ml-1">Admin</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-5">
        <Link to="/" className="text-sm text-slate-400 hover:text-white transition">
          Public site
        </Link>
        {user && (
          <div className="hidden md:flex flex-col text-right text-xs">
            <span className="font-semibold text-slate-200">{user.name}</span>
            <span className="text-slate-500">{user.email}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="bg-slate-900 hover:bg-slate-800 text-rose-500 text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-800 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
