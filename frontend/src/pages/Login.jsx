import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Moon, Sun } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/app/admin');
      } else if (user.role === 'provider') {
        navigate('/app/provider');
      } else {
        navigate('/app/dashboard');
      }
    } catch (err) {
      setError(err.message || err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex dark-ambient-glow">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-neutral-900 transition-colors duration-300 relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="floating-particles absolute inset-0 pointer-events-none" />
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-warning-400" />
          ) : (
            <Moon className="w-5 h-5 text-primary-600" />
          )}
        </button>

        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8 group">
            <img 
              src="/img/logo.png" 
              alt="Linda Mama" 
              className="h-16 w-28 rounded-xl object-contain shadow-lg group-hover:scale-105 transition-transform duration-200" 
            />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent">
                Linda Mama
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Maternal Healthcare System</p>
            </div>
          </Link>

          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Welcome back</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8">Sign in to access your healthcare dashboard</p>

          {error && (
            <div className="flex items-center gap-2 p-4 mb-6 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-700 rounded-xl text-danger-700 dark:text-danger-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label dark:text-neutral-300">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input dark:input-dark pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label dark:text-neutral-300">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input dark:input-dark pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                Forgot password?
              </a>
            </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient-animated w-full py-3 flex items-center justify-center gap-2 text-white font-semibold rounded-xl"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-neutral-600 dark:text-neutral-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300">
                Register here
              </Link>
            </p>
          </div>

          {/* Demo Accounts */}
          {/* <div className="mt-8 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-3 uppercase tracking-wider">Demo Accounts</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Admin:</span>
                <span className="text-neutral-700 dark:text-neutral-300 font-mono">admin@lindamama.ke</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Provider:</span>
                <span className="text-neutral-700 dark:text-neutral-300 font-mono">provider@lindamama.ke</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Mother:</span>
                <span className="text-neutral-700 dark:text-neutral-300 font-mono">grace@email.com</span>
              </div>
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                <span className="text-neutral-500 dark:text-neutral-400">Password: </span>
                <span className="text-neutral-700 dark:text-neutral-300 font-mono">password123</span>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 items-center justify-center p-12 relative overflow-hidden">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 auth-bg-gradient opacity-90"></div>
        {/* Animated orbs */}
        <div className="floating-particles absolute inset-0 pointer-events-none" />
        <div className="max-w-lg text-center text-white">
          <div className="w-24 h-24 mx-auto mb-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
            <Heart className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Your Health, Our Priority
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Comprehensive maternal healthcare management system for expectant and nursing mothers.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">🤰</div>
              <p className="text-sm text-primary-100 mt-2">Pregnancy Tracking</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">🥗</div>
              <p className="text-sm text-primary-100 mt-2">Nutrition Plans</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">💉</div>
              <p className="text-sm text-primary-100 mt-2">Immunization</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">🏥</div>
              <p className="text-sm text-primary-100 mt-2">Emergency Care</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

