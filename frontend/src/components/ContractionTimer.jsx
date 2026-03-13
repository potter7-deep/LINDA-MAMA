import { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, RotateCcw, Bell, TrendingUp, Timer } from 'lucide-react';

const ContractionTimer = () => {
  const [contractions, setContractions] = useState([]);
  const [isTiming, setIsTiming] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startContraction = () => {
    setIsTiming(true);
    setStartTime(Date.now());
    setCurrentDuration(0);
    
    intervalRef.current = setInterval(() => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      setCurrentDuration(duration);
    }, 100);
  };

  const endContraction = () => {
    if (startTime) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      
      // Calculate time since last contraction
      let timeSinceLast = 0;
      if (contractions.length > 0) {
        const lastContraction = contractions[contractions.length - 1];
        timeSinceLast = Math.floor((Date.now() - lastContraction.endTime) / 1000 / 60); // in minutes
      }
      
      const newContraction = {
        id: Date.now(),
        startTime: startTime,
        endTime: Date.now(),
        duration: duration,
        timeSinceLast: timeSinceLast
      };
      
      setContractions([...contractions, newContraction]);
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setIsTiming(false);
    setStartTime(null);
    setCurrentDuration(0);
  };

  const toggleTimer = () => {
    if (isTiming) {
      endContraction();
    } else {
      startContraction();
    }
  };

  const resetAll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsTiming(false);
    setStartTime(null);
    setCurrentDuration(0);
    setContractions([]);
    setElapsedTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate averages
  const getAverageDuration = () => {
    if (contractions.length === 0) return 0;
    const total = contractions.reduce((acc, c) => acc + c.duration, 0);
    return Math.round(total / contractions.length);
  };

  const getAverageInterval = () => {
    if (contractions.length < 2) return 0;
    const intervals = [];
    for (let i = 1; i < contractions.length; i++) {
      const interval = (contractions[i].startTime - contractions[i-1].startTime) / 1000 / 60;
      intervals.push(interval);
    }
    return Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
  };

  // Check if contractions are getting closer together (potential labor)
  const getTrend = () => {
    if (contractions.length < 3) return null;
    const recent = contractions.slice(-3);
    const intervals = [];
    for (let i = 1; i < recent.length; i++) {
      intervals.push((recent[i].startTime - recent[i-1].startTime) / 1000 / 60);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    if (avgInterval < 3) return 'active';
    if (avgInterval < 5) return 'progressing';
    return 'early';
  };

  const trend = getTrend();

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            isTiming 
              ? 'bg-gradient-to-br from-danger-400 to-danger-600 shadow-lg shadow-danger-500/30' 
              : 'bg-gradient-to-br from-primary-400 to-pink-500 shadow-lg shadow-primary-500/30'
          }`}>
            <Timer className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Contraction Timer</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Track your contractions
            </p>
          </div>
        </div>
        
        {trend && (
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            trend === 'active' ? 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300' :
            trend === 'progressing' ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300' :
            'bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-300'
          }`}>
            {trend === 'active' ? 'Active Labor' : trend === 'progressing' ? 'Progressing' : 'Early Labor'}
          </div>
        )}
      </div>

      {/* Main Timer Display */}
      <div className={`text-center py-8 mb-6 rounded-2xl transition-all duration-300 ${
        isTiming 
          ? 'bg-gradient-to-br from-danger-50 to-danger-100 dark:from-danger-900/30 dark:to-danger-800/20 contraction-timer-active' 
          : 'bg-neutral-50 dark:bg-neutral-800/50'
      }`}>
        <div className={`countdown-digit text-6xl mb-2 ${isTiming ? 'text-danger-600 dark:text-danger-400' : ''}`}>
          {formatTime(currentDuration)}
        </div>
        <p className="text-neutral-500 dark:text-neutral-400">
          {isTiming ? 'Contraction in progress...' : 'Ready to start'}
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={toggleTimer}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
            isTiming
              ? 'bg-gradient-to-r from-danger-500 to-danger-600 text-white hover:from-danger-600 hover:to-danger-700 shadow-lg shadow-danger-500/30'
              : 'btn-gradient-animated text-white px-8 py-3 rounded-xl font-semibold'
          }`}
        >
          {isTiming ? (
            <>
              <Pause className="w-5 h-5" />
              Stop Contraction
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Contraction
            </>
          )}
        </button>
        
        {contractions.length > 0 && (
          <button
            onClick={resetAll}
            className="btn-ghost rounded-xl"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Stats */}
      {contractions.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-primary-500" />
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Avg Duration</span>
            </div>
            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {formatTime(getAverageDuration())}
            </p>
          </div>
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-secondary-500" />
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Avg Interval</span>
            </div>
            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {getAverageInterval()} min
            </p>
          </div>
        </div>
      )}

      {/* Contraction History */}
      {contractions.length > 0 && (
        <div>
          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
            Contraction History
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {contractions.slice().reverse().map((contraction, index) => (
              <div 
                key={contraction.id} 
                className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl stagger-item"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-medium text-primary-600 dark:text-primary-400">
                    {contractions.length - index}
                  </span>
                  <div>
                    <p className="font-medium text-neutral-800 dark:text-neutral-200">
                      {formatTime(contraction.duration)}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {new Date(contraction.startTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {index < contractions.length - 1 && (
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    +{Math.round((contraction.startTime - contractions[contractions.length - 2 - index].startTime) / 1000 / 60)} min
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 bg-info-50 dark:bg-info-900/20 rounded-xl">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-info-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-info-700 dark:text-info-300">
            <p className="font-medium mb-1">Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-info-600 dark:text-info-400">
              <li>Time from the start of one contraction to the start of the next</li>
              <li>Average labor contractions last 30-70 seconds</li>
              <li>Contact your healthcare provider when contractions are 5 minutes apart</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractionTimer;

