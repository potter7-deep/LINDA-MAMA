import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Home, 
  Baby, 
  Utensils, 
  Syringe, 
  AlertTriangle, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Heart,
  ChevronDown,
  User,
  Activity,
  Moon,
  Sun,
  Sparkles,
  Calendar,
  Smile,
  MessageCircle
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const motherLinks = [
    { path: '/app/dashboard', label: 'Dashboard', icon: Home },
    { path: '/app/pregnancy', label: 'Pregnancy', icon: Baby },
    { path: '/app/nutrition', label: 'Nutrition', icon: Utensils },
    { path: '/app/immunization', label: 'Immunization', icon: Syringe },
    { path: '/app/mood', label: 'Mood', icon: Smile },
    { path: '/app/appointments', label: 'Appointments', icon: Calendar },
    { path: '/app/chat', label: 'Messages', icon: MessageCircle },
    { path: '/app/emergency', label: 'Emergency', icon: AlertTriangle },
  ];

  const providerLinks = [
    { path: '/app/provider', label: 'Dashboard', icon: Activity },
    { path: '/app/dashboard', label: 'My Profile', icon: User },
  ];

  const adminLinks = [
    { path: '/app/admin', label: 'Admin Panel', icon: Settings },
    { path: '/app/provider', label: 'Provider Hub', icon: Users },
    { path: '/app/dashboard', label: 'My Profile', icon: User },
  ];

  const getLinks = () => {
    if (user?.role === 'admin') return adminLinks;
    if (user?.role === 'provider') return providerLinks;
    return motherLinks;
  };

  const links = getLinks();

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'admin': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'provider': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'mother': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
      {/* Header - Full Width */}
      <header className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 pt-[env(safe-area-inset-top)]">
            {/* Logo */}
            <NavLink to="/app/dashboard" className="flex items-center gap-3 group">
              <img 
                src="/img/logo.png" 
                alt="Linda Mama" 
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-contain shadow-lg group-hover:scale-105 transition-transform duration-200" 
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 via-secondary-500 to-purple-600 dark:from-primary-400 dark:via-secondary-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Linda Mama
                </h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-0.5">Maternal Healthcare</p>
              </div>
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
                    }`
                  }
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="relative p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300 group"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-warning-400 group-hover:rotate-180 transition-transform duration-500" />
                ) : (
                  <Moon className="w-5 h-5 text-primary-600 group-hover:-rotate-12 transition-transform duration-500" />
                )}
                {/* Glow effect */}
                <span className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                  isDarkMode ? 'opacity-100 shadow-lg shadow-warning-500/30' : 'opacity-0'
                }`} />
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-medium text-sm shadow-lg">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{user?.fullName}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 py-1 animate-fade-in">
                    <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-700">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{user?.fullName}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{user?.email}</p>
                      <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor()}`}>
                        {user?.role}
                      </span>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          navigate('/app/dashboard');
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 transition-transform min-w-[44px] min-h-[44px]"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
                ) : (
                  <Menu className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl animate-slide-up max-h-[70vh] overflow-y-auto z-50">
            <nav className="px-4 py-3 space-y-1">
              {links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`
                  }
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </NavLink>
              ))}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content - Full Width */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Floating Chat Button */}
      <NavLink
        to="/app/chat"
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-gradient-to-r from-primary-500 to-pink-500 rounded-full shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-110 transition-all duration-300 group"
      >
        <MessageCircle className="w-6 h-6 text-white group-hover:animate-pulse" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 rounded-full text-white text-xs flex items-center justify-center animate-pulse">
          !
        </span>
      </NavLink>

      {/* Click outside to close profile menu */}
      {isProfileMenuOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;

