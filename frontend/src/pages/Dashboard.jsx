import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AchievementBadges from '../components/AchievementBadges';
import WaterIntakeTracker from '../components/WaterIntakeTracker';
import BabySizeVisualizer from '../components/BabySizeVisualizer';
import PregnancyCountdown from '../components/PregnancyCountdown';
import ContractionTimer from '../components/ContractionTimer';
import HospitalBagChecklist from '../components/HospitalBagChecklist';
import WeightTracker from '../components/WeightTracker';
import { 
  Baby, 
  UtensilsCrossed, 
  Syringe, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  Calendar,
  ArrowRight,
  Bell,
  Heart,
  Droplets,
  Moon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Footprints,
  Timer,
  Target,
  Award,
  Smile,
  CalendarCheck,
  MessageCircle,
  Package,
  Scale,
  Clock,
  RefreshCw
} from 'lucide-react';

const weeklyTips = [
  { 
    title: 'Stay Hydrated', 
    description: 'Drink at least 8 glasses of water daily to support amniotic fluid levels and prevent dehydration.', 
    icon: Droplets,
    category: 'nutrition',
    color: 'from-blue-400 to-cyan-500'
  },
  { 
    title: 'Prenatal Vitamins', 
    description: 'Continue taking your prenatal vitamins consistently. Folic acid is crucial in early pregnancy!', 
    icon: Award,
    category: 'health',
    color: 'from-purple-400 to-pink-500'
  },
  { 
    title: 'Gentle Exercise', 
    description: 'Light walks and prenatal yoga help maintain flexibility, reduce stress, and prepare your body for labor.', 
    icon: Activity,
    category: 'fitness',
    color: 'from-green-400 to-emerald-500'
  },
  { 
    title: 'Sleep Well', 
    description: 'Aim for 7-9 hours of sleep. Use pillows for support and try sleeping on your left side.', 
    icon: Moon,
    category: 'rest',
    color: 'from-indigo-400 to-violet-500'
  },
  { 
    title: 'Healthy Snacking', 
    description: 'Keep healthy snacks handy. Nuts, fruits, and yogurt are great choices for maintaining energy.', 
    icon: UtensilsCrossed,
    category: 'nutrition',
    color: 'from-orange-400 to-amber-500'
  },
  { 
    title: 'Track Movements', 
    description: 'Start feeling for fetal movements. You should feel at least 10 movements in 2 hours after 28 weeks.', 
    icon: Footprints,
    category: 'health',
    color: 'from-rose-400 to-red-500'
  },
  { 
    title: 'Pelvic Floor Exercises', 
    description: 'Kegel exercises strengthen pelvic floor muscles and help with labor and recovery.', 
    icon: Target,
    category: 'fitness',
    color: 'from-teal-400 to-cyan-500'
  },
  { 
    title: 'Prepare Hospital Bag', 
    description: 'Start packing your hospital bag around week 32. Include essentials for you and your baby.', 
    icon: Package,
    category: 'preparation',
    color: 'from-pink-400 to-rose-500'
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [pregnancyData, setPregnancyData] = useState(null);
  const [nutritionPlans, setNutritionPlans] = useState([]);
  const [immunizations, setImmunizations] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(false); // Now only for refresh
  const [refreshing, setRefreshing] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({});

  // Cache key
  const cacheKey = user?.id ? `dashboard_${user.id}` : null;

  // Load cached data
  useEffect(() => {
    if (cacheKey) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const ttl = 5 * 60 * 1000; // 5 min
          if (Date.now() - timestamp < ttl) {
            setPregnancyData(data.pregnancyData || null);
            setNutritionPlans(data.nutritionPlans || []);
            setImmunizations(data.immunizations || []);
            setEmergencies(data.emergencies || []);
            return;
          }
        }
      } catch (e) {
        console.error('Cache read error:', e);
      }
    }
  }, [cacheKey]);

  useEffect(() => {
    if (user?.role === 'mother') {
      // Background fetch on mount (non-blocking)
      fetchMotherData(true);
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % weeklyTips.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const fetchMotherData = async (background = false) => {
    if (!user?.id || (!background && refreshing)) return;
    
    if (!background) {
      setRefreshing(true);
      setLoading(true);
    }
    
    try {
      const [pregnancyRes, nutritionRes, immunizationRes, emergencyRes] = await Promise.all([
        api.get(`/pregnancy/${user.id}`),
        api.get(`/nutrition/${user.id}`),
        api.get(`/immunization/${user.id}`),
        api.get(`/emergency/user/${user.id}`),
      ]);
      
      const newData = {
        pregnancyData: pregnancyRes[0] || null,
        nutritionPlans: nutritionRes || [],
        immunizations: immunizationRes || [],
        emergencies: emergencyRes || []
      };

      setPregnancyData(newData.pregnancyData);
      setNutritionPlans(newData.nutritionPlans);
      setImmunizations(newData.immunizations);
      setEmergencies(newData.emergencies);

      // Cache
      if (cacheKey) {
        localStorage.setItem(cacheKey, JSON.stringify({
          data: newData,
          timestamp: Date.now()
        }));
      }
      
      // Animate stats
      setAnimatedStats({
        nutrition: 0,
        immunizations: 0,
        weeks: 0
      });
      
      animateValue('nutrition', 0, newData.nutritionPlans.length, 500);
      animateValue('immunizations', 0, newData.immunizations.length, 500);
      if (newData.pregnancyData) {
        animateValue('weeks', 0, newData.pregnancyData.weeks, 500);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Optional: toast error
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const animateValue = (key, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setAnimatedStats(prev => ({ ...prev, [key]: Math.floor(progress * (end - start) + start) }));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  const handleRefresh = () => {
    fetchMotherData(false);
  };

  const nextTip = () => setCurrentTip((prev) => (prev + 1) % weeklyTips.length);
  const prevTip = () => setCurrentTip((prev) => (prev - 1 + weeklyTips.length) % weeklyTips.length);

  // Always render UI (no loading block)
  if (user?.role !== 'mother') {
    // Non-mother UI unchanged (fast)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative overflow-hidden bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-600 rounded-2xl p-8 text-white">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-8 h-8 animate-pulse" />
                <h1 className="text-3xl font-bold">Welcome back, {user?.fullName}!</h1>
              </div>
              <p className="text-primary-100 text-lg">
                {user?.role === 'admin' 
                  ? 'System administration and monitoring dashboard.'
                  : 'Manage your patients and respond to emergencies.'}
              </p>
            </div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-secondary-500/30 rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(user?.role === 'provider' || user?.role === 'admin') && (
            <Link to="/app/provider" className="card-hover group flex items-center gap-4 p-4 border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-500/30">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Provider Dashboard</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage patients</p>
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-400 ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
          
          {user?.role === 'admin' && (
            <Link to="/app/admin" className="card-hover group flex items-center gap-4 p-4 border-2 border-transparent hover:border-secondary-200 dark:hover:border-secondary-500/30">
              <div className="w-12 h-12 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Admin Panel</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">System management</p>
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-400 ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
          )}

          <Link to="/app/emergency" className="card-hover group flex items-center gap-4 p-4 border-2 border-transparent hover:border-danger-200 dark:hover:border-danger-500/30">
            <div className="w-12 h-12 rounded-xl bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6 text-danger-600 dark:text-danger-400" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Emergency Reports</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">View all reports</p>
            </div>
            <ArrowRight className="w-5 h-5 text-neutral-400 ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  // Mother UI - Always instant render
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-600 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-8 h-8 animate-pulse" />
              <h1 className="text-3xl font-bold">Welcome, {user?.fullName}!</h1>
            </div>
            <p className="text-primary-100 text-lg">
              Track your pregnancy journey and access healthcare services.
            </p>
            {pregnancyData && (
              <div className="flex items-center gap-4 mt-4 flex-wrap">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm font-medium">Week {pregnancyData.weeks || '?'} of 40</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Due: {pregnancyData?.dueDate ? new Date(pregnancyData.dueDate).toLocaleDateString() : 'TBD'}</span>
                </div>
              </div>
            )}
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-secondary-500/30 rounded-full blur-3xl"></div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-xl hover:bg-white dark:hover:bg-neutral-700 transition-all shadow-lg font-medium text-neutral-700 dark:text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      {/* Stats - Always show, animate if data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-hover group flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
            <Baby className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Pregnancy Week</p>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {animatedStats.weeks || pregnancyData?.weeks || 0}
            </p>
            <p className="text-xs text-neutral-400">of 40 weeks</p>
          </div>
        </div>

        <div className="card-hover group flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center shadow-lg shadow-secondary-500/30 group-hover:scale-110 transition-transform">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Due Date</p>
            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {pregnancyData?.dueDate ? new Date(pregnancyData.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Set pregnancy'}
            </p>
          </div>
        </div>

        <div className="card-hover group flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center shadow-lg shadow-success-500/30 group-hover:scale-110 transition-transform">
            <UtensilsCrossed className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Nutrition Plans</p>
            <p className="text-3xl font-bold text-success-600 dark:text-success-400">
              {animatedStats.nutrition || nutritionPlans.length}
            </p>
          </div>
        </div>

        <div className="card-hover group flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-info-400 to-info-600 flex items-center justify-center shadow-lg shadow-info-500/30 group-hover:scale-110 transition-transform">
            <Syringe className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Children</p>
            <p className="text-3xl font-bold text-info-600 dark:text-info-400">
              {animatedStats.immunizations || immunizations.length}
            </p>
          </div>
        </div>
      </div>

      {/* Rest of UI unchanged - weekly tips, quick actions, trackers, etc. */}
      <div className={`card bg-gradient-to-r ${weeklyTips[currentTip].color || 'from-primary-50 to-secondary-50'} dark:from-primary-900/50 dark:to-secondary-900/50 border border-primary-100 dark:border-primary-500/50 overflow-hidden shadow-lg shadow-primary-500/10 dark:shadow-primary-500/30`}>
        {/* Weekly tips component unchanged */}
        <div className="absolute inset-0 bg-gradient-to-r opacity-10 dark:opacity-5" style={{ background: `linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))` }}></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Weekly Tips</h3>
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full bg-white/50 dark:bg-neutral-800/50 capitalize ${
                weeklyTips[currentTip].category === 'nutrition' ? 'text-orange-600 dark:text-orange-400' :
                weeklyTips[currentTip].category === 'health' ? 'text-green-600 dark:text-green-400' :
                weeklyTips[currentTip].category === 'fitness' ? 'text-blue-600 dark:text-blue-400' :
                weeklyTips[currentTip].category === 'rest' ? 'text-purple-600 dark:text-purple-400' :
                'text-pink-600 dark:text-pink-400'
              }`}>
                {weeklyTips[currentTip].category}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={prevTip} className="p-1 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800/30 transition-colors">
                <ChevronLeft className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </button>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {currentTip + 1} / {weeklyTips.length}
              </span>
              <button onClick={nextTip} className="p-1 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800/30 transition-colors">
                <ChevronRight className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </button>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 bg-white/70 dark:bg-neutral-800/70 rounded-xl backdrop-blur-sm border border-white/20 dark:border-neutral-600">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${weeklyTips[currentTip].color} flex items-center justify-center flex-shrink-0 shadow-lg dark:shadow-[0_0_20px_rgba(var(--primary),0.3)]`}>
              {(() => {
                const Icon = weeklyTips[currentTip].icon;
                return <Icon className="w Ascendant w-7 h-7 text-white" />;
              })()}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 mb Ascendant mb-1">{weeklyTips[currentTip].title}</h4>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{weeklyTips[currentTip].description}</p>
            </div>
          </div>
          
          <div className="flex justify-center gap-2 mt-4">
            {weeklyTips.map((tip, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTip(idx)}
                className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
                  idx === currentTip 
                    ? `w-10 bg-gradient-to-r ${tip.color || 'from-primary-500 to-secondary-500'} shadow-primary-500/50 dark:shadow-primary-400/50` 
                    : 'w-2 bg-neutral-300 dark:bg-neutral-500 hover:bg-primary-300 dark:hover:bg-primary-400 hover:shadow-primary-400/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {!pregnancyData && (
        <div className="relative overflow-hidden bg-gradient-to-r from-warning-400 via-warning Ascendant -500 to-warning Ascendant -600 rounded-2xl p-8 text-white mb-8 shadow-2xl">
          <div className="absolute Ascendant inset Ascendant -0 bg-white Ascendant /10 backdrop-blur-sm"></div>
          <div className="relative Ascendant z Ascendant -10">
            <div className="flex items-start gap Ascendant -4">
              <AlertTriangle className="w-12 h Ascendant -12 text-white Ascendant /90 animate-pulse mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold mb Ascendant -2">🚀 Get Started!</h3>
                <p className="text-warning Ascendant -100 text-lg mb Ascendant -6 leading-relaxed">
                  Add your pregnancy details to unlock full features like achievements, hospital bag checklist, trackers, and personalized recommendations.
                </p>
                <Link to="/app/pregnancy" className="bg-white text-warning Ascendant -600 font-bold px Ascendant -8 py Ascendant -3 rounded-xl hover:bg-warning Ascendant -50 transition-all shadow-lg hover:shadow-xl hover:scale Ascendant -[1.02] inline-flex items-center">
                  Add Pregnancy Info Now <ArrowRight className="w Ascendant -5 h Ascendant -5 ml Ascendant -1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-neutral Ascendant -900 dark:text-neutral Ascendant -100 mb Ascendant -4">Quick Actions</h2>
        <div className="grid grid-cols Ascendant -1 md:grid-cols Ascendant -2 lg:grid-cols Ascendant -4 gap Ascendant -4">
          <Link to="/app/pregnancy" className="quick-action-card card-glow-hover">
            <div className="quick-action Ascendant Ascendant -icon bg-primary Ascendant -100 dark:bg-primary Ascendant -900 Ascendant /30">
              <Baby className="w Ascendant - Ascendant 6 h Ascendant -6 text-primary Ascendant -600 dark:text-primary Ascendant -400" />
            </div>
            <h3 className="font-semibold text-neutral Ascendant -900 dark:text-neutral Ascendant -100 mb Ascendant -1">Pregnancy Tracker</h3>
            <p className="text-sm text-neutral Ascendant -500 dark:text-neutral Ascendant -400">Track your pregnancy week by week</p>
          </Link>
          
          <Link to="/app/nutrition" className Ascendant ="quick-action-card card-glow-hover">
            <div className="quick-action Ascendant Ascendant Ascendant Ascendant -icon Ascendant bg-secondary Ascendant -100 dark:bg-secondary Ascendant -900 Ascendant /30">
              <UtensilsCrossed className="w Ascendant -6 h Ascendant - Ascendant 6 text-secondary Ascendant -600 dark:text-secondary Ascendant Ascendant -400" />
            </div>
            <h3 Ascendant className="font-semibold text-neutral Ascendant -900 dark:text-neutral Ascendant -100 mb Ascendant Ascendant -1">Nutrition Guide</h3>
            <p className="text-sm text-neutral Ascendant -500 dark:text-neutral Ascendant -400">Personalized meal plans</p>
          </Link>
          
          <Link to="/app/mood" Ascendant className="quick-action-card card-glow-hover">
            <div className="quick-action Ascendant Ascendant Ascendant -icon bg-warning Ascendant -100 dark:bg-warning Ascendant Ascendant Ascendant Ascendant -900/30">
              <Smile className="w Ascendant -6 h Ascendant -6 text-warning Ascendant -600 dark:text-warning Ascendant -400" />
            </div>
            <h3 className="font-semibold text-neutral Ascendant -900 dark:text-neutral Ascendant -100 mb Ascendant -1">Mood Tracker</h3>
            <p Ascendant className="text-sm text-neutral Ascendant -500 dark:text-neutral Ascendant -400">Track your emotional well-being</p>
          </Link>
          
          <Link to="/app/appointments" className="quick-action-card card-glow-hover">
            <div className="quick-action-icon bg-info Ascendant -100 dark:bg-info Ascendant -900/30">
              <CalendarCheck className="w-6 h Ascendant - Ascendant 6 text-info Ascendant -600 dark:text-info Ascendant -400" />
            </div>
            <h3 className="font-semibold text-neutral Ascendant -900 dark:text-neutral Ascendant -100 mb-1">Appointments</h3>
            <p className="text-sm text-neutral Ascendant -500 dark:text-neutral Ascendant -400">Book & manage appointments</p>
          </Link>
        </div>
        
        <div className="grid grid-cols Ascendant -1 md:grid-cols Ascendant -2 gap Ascendant -4 mt-4">
          <Link to="/app/immunization" className="quick-action-card card-glow-hover">
            <div className="quick-action-icon bg-info Ascendant -100 dark:bg-info Ascendant -900/30">
              <Syringe className="w Ascendant -6 h Ascendant -6 text-info Ascendant -600 dark:text-info Ascendant -400" />
            </div>
            <h3 className="font-semibold text-neutral Ascendant -900 dark:text-neutral Ascendant -100 mb-1">Immunization</h3>
            <p className="text-sm text-neutral Ascendant -500 dark:text-neutral Ascendant -400">Child vaccination schedule</p>
          </Link>
          
          <Link to="/app/emergency" className="quick-action-card card-glow-hover">
            <div className="quick-action-icon bg-danger Ascendant -100 dark:bg-danger Ascendant -900/30">
              <AlertTriangle className="w-6 h-6 text-danger Ascendant -600 dark:text-danger Ascendant -400" />
            </div>
            <h3 className="font-semibold text-neutral Ascendant -900 dark:text-neutral Ascendant -100 mb-1">Emergency</h3>
            <p className="text-sm text-neutral Ascendant -500 dark:text-neutral Ascendant -400">Report complications</p>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols Ascendant -3 gap Ascendant -6">
        <AchievementBadges stats={{
          nutritionPlans: nutritionPlans.length || 0,
          appointments: 0,
          moodLogs: 0,
          immunizations: immunizations.length || 0,
          emergencySet: emergencies.length > 0,
          weeks: pregnancyData?.weeks || 0,
          goalsCompleted: 0
        }} />
        <WaterIntakeTracker dailyGoal={2000} />
        <HospitalBagChecklist />
      </div>

      {pregnancyData && (
        <div className="grid grid-cols-1 lg:grid-cols Ascendant -2 gap-6 mb-8">
          {pregnancyData.dueDate && <PregnancyCountdown dueDate={pregnancyData.dueDate} />}
          <WeightTracker 
            currentWeight={pregnancyData.weight || 70} 
            startingWeight={65}
            dueDate={pregnancyData.dueDate}
          />
        </div>
      )}

      <div className="card bg-gradient-to-r from-primary Ascendant -50 to-secondary Ascendant -50 dark:from-primary Ascendant Ascendant Ascendant Ascendant -900/20 dark:to-secondary Ascendant -900/20 border border-primary Ascendant -100 dark:border-primary Ascendant -500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap Ascendant -4">
            <div className="w Ascendant -12 h Ascendant -12 rounded-xl bg-gradient-to-r from-primary Ascendant Ascendant Ascendant -500 to-pink Ascendant -500 flex items-center justify-center shadow-lg shadow-primary Ascendant -500/30">
              <MessageCircle Ascendant className="w Ascendant Ascendant Ascendant - Ascendant 6 h Ascendant -6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral Ascendant -900 dark:text-neutral Ascendant -100">Message Your Provider</h3>
              <p className="text-sm text-neutral Ascendant -500 dark:text-neutral Ascendant -400">Chat directly with healthcare providers</p>
            </div>
          </div>
          <Link to="/app/chat" className="btn-primary">
            Open Chat
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols Ascendant -2 gap Ascendant -6">
        <div className="card">
          <div className="flex items-center justify-between mb Ascendant -4">
            <h3 className="font-semibold text-neutral Ascendant -900 dark:text-neutral Ascendant -100">Recent Emergency Reports</h3>
            <Link to="/app/emergency" className="text-sm text-primary Ascendant -600 dark:text-primary Ascendant -400 hover:text-primary Ascendant -700 dark:hover:text-primary Ascendant -300 font-medium">
              View all
            </Link>
          </div>
          {emergencies.length > 0 ? (
            <div Ascendant className="space-y-3">
              {emergencies.slice(0, 3).map((emergency) => (
                <div key={emergency.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      emergency.severity === 'critical' ? 'bg-danger-500 animate-pulse' :
                      emergency.severity === 'high' ? 'bg-warning-500' :
                      'bg-success-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-neutral-800 dark:text-neutral-200 capitalize">{emergency.type.replace('-', ' ')}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{new Date(emergency.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`badge ${
                    emergency.status === 'pending' ? 'badge-warning' :
                    emergency.status === 'acknowledged' ? 'badge-info' :
                    'badge-success'
                  }`}>
                    {emergency.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell Ascendant className="w Ascendant - Ascendant 12 h Ascendant -12 text-neutral Ascendant -300 dark:text-neutral Ascendant -600 mx-auto mb Ascendant -3" />
              <p class Ascendant Name="text-neutral Ascendant -500 dark:text-neutral Ascendant -400">No emergency reports</p>
            </div>
          )}
        </div>


        {pregnancyData && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Health Metrics</h3>
              <Link to="/app/pregnancy" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                Update
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                <span className="text-neutral-600 dark:text-neutral-400">Blood Pressure</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{pregnancyData.bloodPressure || 'Not recorded'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                <span className="text-neutral-600 dark:text-neutral-400">Weight</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{pregnancyData.weight ? `${pregnancyData.weight} kg` : 'Not recorded'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                <span className="text-neutral-600 dark:text-neutral-400">Symptoms</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-right max-w-[200px]">{pregnancyData.symptoms || 'None reported'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

