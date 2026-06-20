import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getMe } from '../services/adminApi';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in with valid admin session
  useEffect(() => {
    const verifyAdminSession = async () => {
      try {
        const response = await getMe();
        if (response.success && response.user?.role === 'admin') {
          navigate('/admin/dashboard');
        }
      } catch {
        // no existing session, allow login
      }
    };

    verifyAdminSession();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login(email, password);
      if (response.success) {
        navigate('/admin/dashboard');
      } else {
        setError(response.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'An error occurred. Make sure backend is running.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-xl mb-3 shadow-md shadow-emerald-500/10">
            A
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Admin Portal
          </h1>
          <p className="text-slate-500 text-xs mt-1">Sign in to review and verify AI detections</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 transition"
              placeholder="admin@smokeplate.ai"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 transition"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl transition duration-200 mt-2 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Access Dashboard'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-xs text-slate-500 hover:text-slate-400 transition underline">
            Back to Public Homepage
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
