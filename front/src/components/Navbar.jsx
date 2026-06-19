import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  return (
    <nav className="bg-gray-100 p-4 flex justify-between">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-bold">Reporter</Link>
        {user && user.role === 'gov' && <Link to="/gov" className="text-sm">Gov Dashboard</Link>}
        {user && <Link to="/my-reports" className="text-sm">My Reports</Link>}
      </div>
      <div>
        {!user ? <Link to="/login" className="text-sm">Login</Link> : <button onClick={logout} className="text-sm">Logout</button>}
      </div>
    </nav>
  );
}
