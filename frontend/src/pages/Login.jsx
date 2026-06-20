import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authApi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login(email, password);
      if (response.success) {
        localStorage.setItem('user', JSON.stringify(response.user));

        if (response.user?.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        setError(response.message || 'Unable to login. Please check your credentials.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'An error occurred while signing in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-61px)] bg-slate-950 text-white flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h1 className="text-2xl font-semibold mb-6">Sign in</h1>

        {error && (
          <div className="mb-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">Email address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/30"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/30"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="minimal-primary w-full rounded-2xl px-4 py-3 font-semibold transition disabled:opacity-50"
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-400">
          Don’t have an account?{' '}
          <Link to="/register" className="font-semibold text-emerald-300 hover:text-emerald-200">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
