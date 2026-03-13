import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, 
  Smile, 
  Meh, 
  Frown, 
  Calendar, 
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  Moon,
  Sun,
  CloudRain,
  Zap,
  Activity,
  BookOpen,
  MessageCircle,
  Coffee
} from 'lucide-react';

const moodOptions = [
  { id: 'happy', label: 'Happy', icon: Smile, color: 'bg-success-500', shadow: 'shadow-success-500/30' },
  { id: 'excited', label: 'Excited', icon: Zap, color: 'bg-warning-500', shadow: 'shadow-warning-500/30' },
  { id: 'calm', label: 'Calm', icon: Sun, color: 'bg-info-500', shadow: 'shadow-info-500/30' },
  { id: 'neutral', label: 'Neutral', icon: Meh, color: 'bg-neutral-500', shadow: 'shadow-neutral-500/30' },
  { id: 'anxious', label: 'Anxious', icon: CloudRain, color: 'bg-secondary-500', shadow: 'shadow-secondary-500/30' },
  { id: 'sad', label: 'Sad', icon: Frown, color: 'bg-blue-500', shadow: 'shadow-blue-500/30' },
];

const wellnessTips = [
  { mood: 'happy', tips: ['Keep doing what makes you happy!', 'Share your joy with loved ones', 'Consider journaling about what\'s bringing you joy'] },
  { mood: 'excited', tips: ['Channel that energy into prenatal activities', 'Plan something exciting for after pregnancy', 'Share your excitement with your baby'] },
  { mood: 'calm', tips: ['This is a great time for gentle prenatal yoga', 'Practice deep breathing exercises', 'Enjoy this peaceful moment'] },
  { mood: 'neutral', tips: ['Try a relaxing prenatal massage', 'Listen to calming music', 'Take a gentle walk outdoors'] },
  { mood: 'anxious', tips: ['Talk to someone about your feelings', 'Practice the 3-3-3 rule for anxiety', 'Try gentle stretching exercises'] },
  { mood: 'sad', tips: ['It\'s okay to feel emotional during pregnancy', 'Reach out to your support system', 'Consider talking to a counselor'] },
];

const activities = [
  { id: 'exercise', label: 'Exercise', icon: Activity },
  { id: 'meditation', label: 'Meditation', icon: Moon },
  { id: 'reading', label: 'Reading', icon: BookOpen },
  { id: 'social', label: 'Socializing', icon: MessageCircle },
  { id: 'rest', label: 'Rest/Nap', icon: Coffee },
];

const MoodTracker = () => {
  const { user } = useAuth();
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Simulate loading mood data
    setLoading(false);
    // In production, this would be an API call
    const savedMoods = localStorage.getItem('moodHistory');
    if (savedMoods) {
      setMoodHistory(JSON.parse(savedMoods));
    }
  }, [user]);

  const saveMood = () => {
    if (!selectedMood) return;

    const newEntry = {
      id: Date.now(),
      date: selectedDate,
      mood: selectedMood,
      activities: selectedActivities,
      notes,
    };

    const updatedHistory = [newEntry, ...moodHistory];
    setMoodHistory(updatedHistory);
    localStorage.setItem('moodHistory', JSON.stringify(updatedHistory));

    setSelectedMood(null);
    setSelectedActivities([]);
    setNotes('');
    setShowForm(false);
  };

  const toggleActivity = (activityId) => {
    setSelectedActivities(prev => 
      prev.includes(activityId) 
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const getCurrentMoodTip = () => {
    if (!selectedMood) return null;
    return wellnessTips.find(t => t.mood === selectedMood);
  };

  const getMoodStats = () => {
    if (moodHistory.length === 0) return null;
    
    const moodCounts = moodHistory.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});

    const mostCommon = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      total: moodHistory.length,
      mostCommon: mostCommon ? moodOptions.find(m => m.id === mostCommon[0]) : null,
      streak: calculateStreak(),
    };
  };

  const calculateStreak = () => {
    if (moodHistory.length === 0) return 0;
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const dates = [...new Set(moodHistory.map(m => m.date))].sort().reverse();
    
    if (dates[0] === today || dates[0] === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
      streak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diff = (prevDate - currDate) / (1000 * 60 * 60 * 24);
        if (diff === 1) streak++;
        else break;
      }
    }
    
    return streak;
  };

  const getMoodForDate = (date) => {
    return moodHistory.find(m => m.date === date);
  };

  const stats = getMoodStats();
  const currentTip = getCurrentMoodTip();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Mood Tracker
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary-glow"
        >
          {showForm ? 'Cancel' : 'Log Mood'}
        </button>
      </div>

      {/* Mood Form */}
      {showForm && (
        <div className="card animate-scale-in">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            How are you feeling today?
          </h2>
          
          <div className="mb-4">
            <label className="input-label dark:text-neutral-300">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input dark:input-dark"
            />
          </div>

          {/* Mood Selection */}
          <div className="mb-4">
            <label className="input-label dark:text-neutral-300 mb-3">Select your mood</label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {moodOptions.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 ${
                    selectedMood === mood.id
                      ? `${mood.color} text-white ${mood.shadow} scale-105`
                      : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  <mood.icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div className="mb-4">
            <label className="input-label dark:text-neutral-300 mb-3">What have you been doing? (Optional)</label>
            <div className="flex flex-wrap gap-2">
              {activities.map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => toggleActivity(activity.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedActivities.includes(activity.id)
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  <activity.icon className="w-4 h-4" />
                  {activity.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="input-label dark:text-neutral-300">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input dark:input-dark"
              rows="3"
              placeholder="How was your day? What's on your mind?"
            />
          </div>

          {/* Tips based on mood */}
          {currentTip && (
            <div className="mb-4 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl border border-primary-100 dark:border-primary-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <h3 className="font-medium text-primary-800 dark:text-primary-300">Wellness Tips</h3>
              </div>
              <ul className="space-y-1">
                {currentTip.tips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-primary-700 dark:text-primary-400 flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={saveMood}
            disabled={!selectedMood}
            className="btn-primary-glow w-full"
          >
            Save Mood Entry
          </button>
        </div>
      )}

      {/* Stats Overview */}
      {moodHistory.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-hover flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Entries</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats?.total}</p>
            </div>
          </div>

          <div className="card-hover flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center shadow-lg shadow-success-500/30">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Most Common</p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats?.mostCommon ? stats.mostCommon.label : 'N/A'}
              </p>
            </div>
          </div>

          <div className="card-hover flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-warning-400 to-warning-600 flex items-center justify-center shadow-lg shadow-warning-500/30">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Current Streak</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats?.streak} days</p>
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      <div className="card">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          Mood Calendar
        </h3>
        
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 py-2">
              {day}
            </div>
          ))}
          
          {/* Generate calendar for current month */}
          {Array.from({ length: 35 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - 14 + i);
            const dateStr = date.toISOString().split('T')[0];
            const moodEntry = getMoodForDate(dateStr);
            const mood = moodEntry ? moodOptions.find(m => m.id === moodEntry.mood) : null;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            
            return (
              <div
                key={i}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm transition-all ${
                  isToday 
                    ? 'ring-2 ring-primary-500' 
                    : mood 
                      ? '' 
                      : 'bg-neutral-50 dark:bg-neutral-800/50'
                } ${
                  mood 
                    ? mood.color + ' text-white' 
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {mood ? (
                  <mood.icon className="w-5 h-5" />
                ) : (
                  date.getDate()
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          {moodOptions.slice(0, 4).map((mood) => (
            <div key={mood.id} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${mood.color}`}></div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">{mood.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Mood History */}
      {moodHistory.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Recent Mood Entries</h3>
          <div className="space-y-3">
            {moodHistory.slice(0, 7).map((entry) => {
              const mood = moodOptions.find(m => m.id === entry.mood);
              return (
                <div 
                  key={entry.id} 
                  className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-xl ${mood?.color} flex items-center justify-center shadow-lg ${mood?.shadow}`}>
                    {mood && <mood.icon className="w-6 h-6 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">{mood?.label}</p>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {new Date(entry.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    {entry.activities.length > 0 && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {entry.activities.map(a => activities.find(act => act.id === a)?.label).join(', ')}
                      </p>
                    )}
                    {entry.notes && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 italic">"{entry.notes}"</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {moodHistory.length === 0 && !showForm && (
        <div className="card text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center">
            <Heart className="w-10 h-10 text-primary-500 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-2">Start Tracking Your Mood</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">
            Understanding your emotional well-being is important during pregnancy.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary-glow inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Log Your First Mood
          </button>
        </div>
      )}
    </div>
  );
};

export default MoodTracker;

