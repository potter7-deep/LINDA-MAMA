import { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles, Heart, Baby } from 'lucide-react';

const PregnancyCountdown = ({ dueDate }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    if (!dueDate) return null;
    
    const difference = new Date(dueDate) - new Date();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isDue: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isDue: false
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [dueDate]);

  if (!dueDate || !timeLeft) {
    return (
      <div className="card bg-neutral-50 dark:bg-neutral-800/50">
        <div className="text-center py-6">
          <Calendar className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-500 dark:text-neutral-400">No due date set</p>
        </div>
      </div>
    );
  }

  if (timeLeft.isDue) {
    return (
      <div className="card bg-gradient-to-r from-primary-50 to-pink-50 dark:from-primary-900/30 dark:to-pink-900/30 border-2 border-primary-200 dark:border-primary-700">
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-400 to-pink-500 flex items-center justify-center shadow-lg shadow-primary-500/30 animate-pulse">
            <Baby className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">
            Any Day Now! 🎉
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Your baby is ready to meet you!
          </p>
        </div>
      </div>
    );
  }

  const getMessage = () => {
    const days = timeLeft.days;
    if (days <= 7) return "Any day now!";
    if (days <= 14) return "Almost there!";
    if (days <= 30) return "Getting close!";
    if (days <= 90) return "Third trimester!";
    return "Keep going!";
  };

  const getMilestoneColor = () => {
    const days = timeLeft.days;
    if (days <= 7) return "from-danger-500 to-pink-500";
    if (days <= 14) return "from-warning-500 to-orange-500";
    if (days <= 30) return "from-primary-500 to-pink-500";
    return "from-secondary-500 to-primary-500";
  };

  return (
    <div className="card countdown-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getMilestoneColor()} flex items-center justify-center shadow-lg`}>
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Baby Countdown</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-primary-100 to-pink-100 dark:from-primary-900/30 dark:to-pink-900/30">
          <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
            {getMessage()}
          </span>
        </div>
      </div>

      {/* Countdown Display */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
          <div className="countdown-digit text-3xl mb-1">
            {timeLeft.days}
          </div>
          <div className="countdown-label">Days</div>
        </div>
        
        <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
          <div className="countdown-digit text-3xl mb-1">
            {timeLeft.hours}
          </div>
          <div className="countdown-label">Hours</div>
        </div>
        
        <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
          <div className="countdown-digit text-3xl mb-1">
            {timeLeft.minutes}
          </div>
          <div className="countdown-label">Minutes</div>
        </div>
        
        <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
          <div className="countdown-digit text-3xl mb-1">
            {timeLeft.seconds}
          </div>
          <div className="countdown-label">Seconds</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-2">
          <span>40 weeks</span>
          <span>{40 - Math.floor(timeLeft.days / 7)} weeks to go</span>
        </div>
        <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(95, 100 - (timeLeft.days / 280) * 100)}%` }}
          />
        </div>
      </div>

      {/* Milestone tip */}
      {timeLeft.days <= 14 && (
        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-start gap-2">
          <Sparkles className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-primary-700 dark:text-primary-300">
            {timeLeft.days <= 7 
              ? "Your baby is fully developed and could arrive any day now!"
              : "Your baby is gaining about an ounce a day now. Get ready!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default PregnancyCountdown;

