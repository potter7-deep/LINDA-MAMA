import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Plus, 
  Minus, 
  Activity, 
  Calendar, 
  Weight, 
  Heart,
  Baby,
  Ruler,
  Clock,
  ChevronRight,
  Sparkles,
  Apple,
  Footprints
} from 'lucide-react';

const babySizes = {
  4: { size: 'poppy seed', length: '1 mm', weight: '< 1 g' },
  8: { size: 'raspberry', length: '1.6 cm', weight: '1 g' },
  12: { size: 'plum', length: '5.4 cm', weight: '14 g' },
  16: { size: 'avocado', length: '11.6 cm', weight: '100 g' },
  20: { size: 'banana', length: '25 cm', weight: '300 g' },
  24: { size: 'cantaloupe', length: '30 cm', weight: '600 g' },
  28: { size: 'eggplant', length: '37 cm', weight: '1 kg' },
  32: { size: 'squash', length: '42 cm', weight: '1.7 kg' },
  36: { size: 'romaine lettuce', length: '47 cm', weight: '2.4 kg' },
  40: { size: 'watermelon', length: '51 cm', weight: '3.3 kg' },
};

const pregnancyMilestones = {
  1: ['Week 1-2: Conception period'],
  4: ['Baby\'s heart begins to beat', 'Arm and leg buds forming'],
  8: ['All major organs formed', 'Fingers and toes forming', 'Can make tiny movements'],
  12: ['Can make facial expressions', 'Reflexes developing', 'Bone structure forming'],
  16: ['Skeleton hardening', 'Can hear sounds', 'Started kicking!'],
  20: ['Halfway point!', 'Gender detectable', 'Strong movements felt'],
  24: ['Lungs developing', 'Response to sounds', 'May suck thumb'],
  28: ['Eyes can open', 'Brain development rapid', 'Dreaming可能'],
  32: ['Five senses working', 'Practice breathing', 'Lots of stretching'],
  36: ['Gaining weight quickly', 'Head down position', 'Organs fully mature'],
  40: ['Full term - ready for birth!', 'Average 3.3 kg', 'Average 51 cm'],
};

const PregnancyTracker = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [kickCount, setKickCount] = useState(0);
  const [kickSessionActive, setKickSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const timerRef = useRef(null);
  const [formData, setFormData] = useState({
    weeks: 1,
    dueDate: '',
    milestones: '',
    notes: '',
    weight: '',
    bloodPressure: '',
    symptoms: '',
  });

  useEffect(() => {
    fetchRecords();
  }, [user]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await api.get(`/pregnancy/${user.id}`);
      // Data is already extracted by the API interceptor
      setRecords(response);
    } catch (error) {
      console.error('Error fetching pregnancy records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.dueDate) {
        const dueDate = new Date(formData.dueDate);
        const today = new Date();
        const weeks = Math.max(1, Math.floor((dueDate - today) / (7 * 24 * 60 * 60 * 1000)) + 40);
        formData.weeks = Math.min(weeks, 42);
      }
      
      await api.post('/pregnancy', {
        userId: user.id,
        ...formData,
      });
      setShowForm(false);
      setFormData({
        weeks: 1,
        dueDate: '',
        milestones: '',
        notes: '',
        weight: '',
        bloodPressure: '',
        symptoms: '',
      });
      fetchRecords();
    } catch (error) {
      console.error('Error creating record:', error);
    }
  };

  const startKickSession = () => {
    setKickCount(0);
    setKickSessionActive(true);
    setSessionStartTime(Date.now());
    setSessionDuration(0);
    
    timerRef.current = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);
  };

  const stopKickSession = () => {
    setKickSessionActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const recordKick = () => {
    if (kickSessionActive) {
      setKickCount(prev => prev + 1);
    }
  };

  const getCurrentWeekInfo = () => {
    if (records.length === 0) return null;
    const latest = records[0];
    return pregnancyMilestones[latest.weeks] || pregnancyMilestones[Math.floor(latest.weeks / 4) * 4 + 4] || [];
  };

  const getBabySize = () => {
    if (records.length === 0) return babySizes[4];
    const week = records[0].weeks;
    const closestWeek = Object.keys(babySizes)
      .map(Number)
      .reduce((prev, curr) => Math.abs(curr - week) < Math.abs(prev - week) ? curr : prev);
    return babySizes[closestWeek];
  };

  const getProgressPercentage = () => {
    if (records.length === 0) return 0;
    return Math.min((records[0].weeks / 40) * 100, 100);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  const currentRecord = records.length > 0 ? records[0] : null;
  const currentWeek = currentRecord?.weeks || 1;
  const babySize = getBabySize();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Pregnancy Tracker</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary-glow"
        >
          {showForm ? 'Cancel' : 'Add Record'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Add Pregnancy Record</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label dark:text-neutral-300">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="input dark:input-dark"
                />
              </div>
              <div>
                <label className="input-label dark:text-neutral-300">Current Week</label>
                <input
                  type="number"
                  value={formData.weeks}
                  onChange={(e) => setFormData({ ...formData, weeks: parseInt(e.target.value) })}
                  className="input dark:input-dark"
                  min="1"
                  max="42"
                />
              </div>
              <div>
                <label className="input-label dark:text-neutral-300">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="input dark:input-dark"
                  step="0.1"
                />
              </div>
              <div>
                <label className="input-label dark:text-neutral-300">Blood Pressure</label>
                <input
                  type="text"
                  value={formData.bloodPressure}
                  onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                  className="input dark:input-dark"
                  placeholder="e.g., 120/80"
                />
              </div>
            </div>
            <div>
              <label className="input-label dark:text-neutral-300">Symptoms</label>
              <textarea
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                className="input dark:input-dark"
                rows="2"
                placeholder="Any symptoms you're experiencing"
              />
            </div>
            <div>
              <label className="input-label dark:text-neutral-300">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input dark:input-dark"
                rows="2"
                placeholder="Any additional notes"
              />
            </div>
            <button type="submit" className="btn-primary-glow">Save Record</button>
          </form>
        </div>
      )}

      {/* Current Pregnancy Status */}
      {currentRecord ? (
        <div className="space-y-6">
          {/* Progress Ring and Week Info */}
          <div className="card bg-gradient-to-r from-primary-50 via-pink-50 to-secondary-50 dark:from-primary-900/20 dark:via-pink-900/20 dark:to-secondary-900/20 border border-primary-100 dark:border-primary-500/20">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Progress Ring */}
              <div className="relative">
                <svg className="w-32 h-32 progress-ring" viewBox="0 0 120 120">
                  <circle
                    className="text-neutral-200 dark:text-neutral-700"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="50"
                    cx="60"
                    cy="60"
                  />
                  <circle
                    className="progress-ring-circle text-primary-500"
                    strokeWidth="10"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="50"
                    cx="60"
                    cy="60"
                    style={{
                      strokeDasharray: 314,
                      strokeDashoffset: 314 - (314 * getProgressPercentage()) / 100,
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">{currentWeek}</span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">/40</span>
                  </div>
                </div>
              </div>

              {/* Week Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    Week {currentWeek} of Pregnancy
                  </h2>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Due Date: <span className="font-semibold">{new Date(currentRecord.dueDate).toLocaleDateString()}</span>
                </p>
                
                {/* Baby Size Card */}
                <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-neutral-800/60 rounded-xl">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center shadow-lg">
                    <Baby className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Baby is the size of a</p>
                    <p className="text-lg font-bold text-primary-600 dark:text-primary-400 capitalize">{babySize.size}</p>
                    <div className="flex gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                      <span className="flex items-center gap-1"><Ruler className="w-4 h-4" /> {babySize.length}</span>
                      <span className="flex items-center gap-1"><Weight className="w-4 h-4" /> {babySize.weight}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kick Counter */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Footprints className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Kick Counter</h3>
              </div>
              {!kickSessionActive ? (
                <button onClick={startKickSession} className="btn-primary-glow btn-sm">
                  Start Session
                </button>
              ) : (
                <button onClick={stopKickSession} className="btn-danger btn-sm">
                  Stop Session
                </button>
              )}
            </div>
            
            <div className="flex flex-col items-center">
              <button
                onClick={recordKick}
                disabled={!kickSessionActive}
                className={`kick-button ${!kickSessionActive ? 'opacity-50 cursor-not-allowed' : 'animate-pulse'}`}
              >
                <span className="kick-counter">{kickCount}</span>
              </button>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
                {kickSessionActive ? (
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Session: {formatDuration(sessionDuration)}
                  </span>
                ) : (
                  'Tap the button to count kicks'
                )}
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
                Recommended: Count 10 kicks within 2 hours
              </p>
            </div>
          </div>

          {/* Milestones */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">This Week's Milestones</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getCurrentWeekInfo()?.map((milestone, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                  <span className="text-neutral-700 dark:text-neutral-300">{milestone}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-hover flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center shadow-lg shadow-success-500/30">
                <Weight className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Weight</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{currentRecord.weight || 'N/A'} kg</p>
              </div>
            </div>

            <div className="card-hover flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-danger-400 to-danger-600 flex items-center justify-center shadow-lg shadow-danger-500/30">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Blood Pressure</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{currentRecord.bloodPressure || 'N/A'}</p>
              </div>
            </div>

            <div className="card-hover flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning-400 to-warning-600 flex items-center justify-center shadow-lg shadow-warning-500/30">
                <Apple className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Symptoms</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100 truncate">{currentRecord.symptoms || 'None'}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card bg-warning-50 dark:bg-warning-900/20 border-2 border-warning-200 dark:border-warning-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-warning-100 dark:bg-warning-900/50 flex items-center justify-center">
              <Baby className="w-8 h-8 text-warning-600 dark:text-warning-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-warning-800 dark:text-warning-300 mb-2">Get Started</h3>
              <p className="text-warning-700 dark:text-warning-400 mb-4">
                You haven't added your pregnancy information yet. Start tracking your pregnancy journey today.
              </p>
              <button onClick={() => setShowForm(true)} className="btn-warning">
                Add Pregnancy Details
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {records.length > 1 && (
        <div className="card">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Pregnancy History</h3>
          <div className="space-y-3">
            {records.slice(1).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800 dark:text-neutral-200">Week {record.weeks}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{new Date(record.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {record.notes && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-[200px] truncate">{record.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PregnancyTracker;

