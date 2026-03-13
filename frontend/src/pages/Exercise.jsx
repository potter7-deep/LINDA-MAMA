import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Activity, 
  Plus, 
  Clock, 
  Flame, 
  TrendingUp, 
  BarChart3, 
  Download, 
  Edit, 
  Trash2,
  ChevronLeft,
  Check,
  Award,
  Zap,
  HeartPulse,
  Waves,
  Users
} from 'lucide-react';

const exerciseTypes = [
  { id: 'yoga', label: 'Prenatal Yoga', icon: HeartPulse, color: 'from-purple-400 to-pink-500', description: 'Gentle stretching and breathing' },
  { id: 'walking', label: 'Brisk Walking', icon: Users, color: 'from-green-400 to-emerald-500', description: '30-45 min daily walk' },
  { id: 'kegels', label: 'Kegel Exercises', icon: Zap, color: 'from-orange-400 to-red-500', description: 'Pelvic floor strengthening' },
  { id: 'swimming', label: 'Swimming', icon: Waves, color: 'from-blue-400 to-cyan-500', description: 'Low-impact cardio' },
  { id: 'stretching', label: 'Stretching', icon: Activity, color: 'from-indigo-400 to-violet-500', description: 'Full body stretches' },
  { id: 'strength', label: 'Light Strength', icon: Flame, color: 'from-yellow-400 to-amber-500', description: 'Resistance bands/bodyweight' },
  { id: 'cardio', label: 'Stationary Bike', icon: TrendingUp, color: 'from-rose-400 to-red-500', description: 'Low resistance cycling' },
  { id: 'pilates', label: 'Prenatal Pilates', icon: Award, color: 'from-emerald-400 to-teal-500', description: 'Core stability focus' },
];

const Exercise = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'yoga',
    duration: 30,
    intensity: 'medium',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userLogs, userStats] = await Promise.all([
        api.get(`/exercise/${user.id}`),
        api.get(`/exercise/${user.id}/stats`)
      ]);
      setLogs(userLogs || []);
      setStats(userStats || {});
    } catch (error) {
      console.error('Error fetching exercise data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.duration || formData.duration < 1) return;

    try {
      setSaving(true);
      await api.post('/exercise', { 
        ...formData, 
        userId: user.id 
      });
      setShowForm(false);
      setFormData({
        type: 'yoga',
        duration: 30,
        intensity: 'medium',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (error) {
      console.error('Error saving exercise:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteLog = async (id) => {
    if (!confirm('Delete this workout log?')) return;
    try {
      await api.delete(`/exercise/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting log:', error);
    }
  };

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'low': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'high': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type) => {
    const typeInfo = exerciseTypes.find(t => t.id === type);
    return typeInfo?.icon || Activity;
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded-lg w-64 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-neutral-200 dark:bg-neutral-700 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Exercise Tracker</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Stay active during pregnancy with safe exercises
          </p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Log Workout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <Activity className="w-12 h-12 text-primary-600 mx-auto mb-3" />
          <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stats.total || 0}</div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Workouts</p>
        </div>
        <div className="card p-6 text-center">
          <TrendingUp className="w-12 h-12 text-success-600 mx-auto mb-3" />
          <div className="text-3xl font-bold text-success-600 dark:text-success-400">{stats.weekly || 0}</div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">This Week</p>
        </div>
        <div className="card p-6 text-center">
          <Clock className="w-12 h-12 text-secondary-600 mx-auto mb-3" />
          <div className="text-3xl font-bold text-secondary-600 dark:text-secondary-400">
            {Math.floor((stats.totalDuration || 0) / 60)}h
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Time</p>
        </div>
      </div>

      {/* Log Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Log Workout</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg">
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Exercise Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {exerciseTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                          formData.type === type.id
                            ? `border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-md shadow-primary-500/10`
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center shadow-sm`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Intensity</label>
                <select
                  value={formData.intensity}
                  onChange={(e) => setFormData(prev => ({ ...prev, intensity: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select intensity</option>
                  <option value="low">Low 🟢</option>
                  <option value="medium">Medium 🟡</option>
                  <option value="high">High 🔴</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Notes (optional)</label>
                <textarea
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="How did you feel? Any discomfort?..."
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
                  maxLength="500"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full btn-primary-glow flex items-center justify-center gap-2 py-3"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Save Workout
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Recent Workouts */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Recent Workouts</h2>
          {logs.length > 5 && (
            <button 
              onClick={fetchData}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <BarChart3 className="w-4 h-4" />
              Refresh
            </button>
          )}
        </div>
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No workouts logged yet</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">Start tracking your prenatal exercise routine</p>
            <button 
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Log First Workout
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.slice(0, 10).map((log) => {
              const Icon = getTypeIcon(log.type);
              const TypeInfo = exerciseTypes.find(t => t.id === log.type);
              return (
                <div key={log.id} className="group p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${TypeInfo?.color || 'from-gray-400 to-gray-500'} flex items-center justify-center shadow-sm flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{TypeInfo?.label || log.type}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntensityColor(log.intensity)}`}>
                            {log.intensity?.toUpperCase() || 'N/A'}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1 truncate">{log.date}</p>
                        {log.notes && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">{log.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 text-right">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{log.duration}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">min</div>
                      <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteLog(log.id)}
                          className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-danger-500 hover:text-danger-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Exercise;

