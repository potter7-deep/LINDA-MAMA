import { useState } from 'react';
import { Droplets, Plus, Minus, Check, Sparkles, Target } from 'lucide-react';

const WaterIntakeTracker = ({ 
  dailyGoal = 2000, 
  currentIntake = 0, 
  onUpdate = () => {} 
}) => {
  const [intake, setIntake] = useState(currentIntake);
  const glassSize = 250; // ml

  const addGlass = () => {
    const newIntake = intake + glassSize;
    setIntake(newIntake);
    onUpdate(newIntake);
  };

  const removeGlass = () => {
    const newIntake = Math.max(0, intake - glassSize);
    setIntake(newIntake);
    onUpdate(newIntake);
  };

  const setCustomAmount = (amount) => {
    setIntake(amount);
    onUpdate(amount);
  };

  const percentage = Math.min(100, (intake / dailyGoal) * 100);
  const glasses = Math.floor(intake / glassSize);
  const remaining = Math.max(0, dailyGoal - intake);

  const getMessage = () => {
    if (percentage === 0) return "Start drinking! 💧";
    if (percentage < 25) return "Great start! Keep going! 🌟";
    if (percentage < 50) return "You're doing well! 💪";
    if (percentage < 75) return "Almost halfway there! 🎯";
    if (percentage < 100) return "Almost done! Almost there! 🏆";
    return "Goal reached! Amazing! 🎉";
  };

  const getWaterColor = () => {
    if (percentage < 25) return 'from-blue-300 to-blue-400';
    if (percentage < 50) return 'from-blue-400 to-cyan-400';
    if (percentage < 75) return 'from-cyan-400 to-info-400';
    if (percentage < 100) return 'from-info-400 to-success-400';
    return 'from-success-400 to-green-400';
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Water Intake</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {glasses} glasses today
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-500">{intake}ml</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">of {dailyGoal}ml</p>
        </div>
      </div>

      {/* Water Visual */}
      <div className="relative mb-6">
        <div className="h-48 rounded-2xl bg-neutral-100 dark:bg-neutral-700 overflow-hidden relative">
          {/* Water fill */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${getWaterColor()} transition-all duration-500 ease-out`}
            style={{ height: `${percentage}%` }}
          >
            {/* Wave effect */}
            <div className="absolute top-0 left-0 right-0 h-4 opacity-50">
              <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="w-full h-full">
                <path 
                  d="M0 5 Q 25 0, 50 5 T 100 5 V 10 H 0 Z" 
                  fill="currentColor" 
                  className="text-white/30"
                />
              </svg>
            </div>
          </div>
          
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-white drop-shadow-lg">
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <Sparkles className="w-5 h-5 text-blue-500" />
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          {getMessage()}
        </span>
      </div>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[100, 200, 250, 500].map((amount) => (
          <button
            key={amount}
            onClick={() => setCustomAmount(intake + amount)}
            className="p-2 text-xs font-medium bg-neutral-100 dark:bg-neutral-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-neutral-700 dark:text-neutral-300"
          >
            +{amount}ml
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={removeGlass}
          disabled={intake === 0}
          className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50"
        >
          <Minus className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </button>
        
        <button
          onClick={addGlass}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Glass ({glassSize}ml)
        </button>
        
        <button
          onClick={() => setCustomAmount(dailyGoal)}
          disabled={intake >= dailyGoal}
          className="p-3 rounded-xl bg-success-100 dark:bg-success-900/30 hover:bg-success-200 dark:hover:bg-success-900/50 transition-colors disabled:opacity-50"
        >
          <Check className="w-5 h-5 text-success-600" />
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex justify-between text-sm">
          <div className="text-center">
            <Droplets className="w-5 h-5 mx-auto mb-1 text-blue-400" />
            <p className="text-neutral-600 dark:text-neutral-400">{glasses}</p>
            <p className="text-xs text-neutral-500">glasses</p>
          </div>
          <div className="text-center">
            <Target className="w-5 h-5 mx-auto mb-1 text-neutral-400" />
            <p className="text-neutral-600 dark:text-neutral-400">{dailyGoal}ml</p>
            <p className="text-xs text-neutral-500">goal</p>
          </div>
          <div className="text-center">
            <Sparkles className="w-5 h-5 mx-auto mb-1 text-info-400" />
            <p className="text-neutral-600 dark:text-neutral-400">{remaining}ml</p>
            <p className="text-xs text-neutral-500">remaining</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterIntakeTracker;

