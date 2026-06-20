import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout as logoutUser } from '../services/authApi';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isAuthenticated = Boolean(user);

  const isActive = (path) => {
    return location.pathname === path
      ? 'text-white font-semibold'
      : 'text-blue-100 hover:text-white transition';
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <nav className="bg-[#788bff] border-b border-[#5465ff] py-4 px-5 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center gap-6">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-semibold tracking-tight text-white">
            SmokePlate
          </span>
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <Link to="/" className={isActive('/')}>
            Home
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/history" className={isActive('/history')}>
                History
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-blue-100 hover:text-white transition cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive('/login')}>
                Login
              </Link>
              <Link to="/register" className={isActive('/register')}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
