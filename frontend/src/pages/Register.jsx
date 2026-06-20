import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authApi';

const Register = () => {
  const [name, setName] = useState('');
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
      const response = await register(name, email, password);
      if (response.success) {
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        navigate('/');
      } else {
        setError(response.message || 'Unable to register. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'An error occurred while creating the account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-61px)] bg-slate-950 text-white flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h1 className="text-2xl font-semibold mb-6">Create account</h1>

        {error && (
          <div className="mb-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-300 mb-2">Full name</label>
            <input
              id="name"
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/30"
            />
          </div>

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
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-300 hover:text-emerald-200">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
