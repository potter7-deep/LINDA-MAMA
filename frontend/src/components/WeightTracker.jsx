import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Weight, TrendingUp, TrendingDown, Minus, Calendar, Plus, AlertCircle } from 'lucide-react';

const WeightTracker = ({ currentWeight = 70, startingWeight = 65, dueDate }) => {
  const [weightHistory, setWeightHistory] = useState([
    { week: 8, weight: 65 },
    { week: 12, weight: 66 },
    { week: 16, weight: 68 },
    { week: 20, weight: 70 },
    { week: 24, weight: 72 },
    { week: 28, weight: 74 },
    { week: 32, weight: 76 },
    { week: 36, weight: 78 },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newWeek, setNewWeek] = useState('');

  // Calculate expected weight gain based on pregnancy week
  const getExpectedGain = (week) => {
    // General guidelines: 1-4 lbs in first trimester, ~1 lb/week in 2nd & 3rd
    if (week <= 13) return 1 + Math.random() * 3; // 1-4 lbs
    return 1 + (week - 13) * 1; // ~1 lb per week after
  };

  // Get current pregnancy week from due date if provided
  const getCurrentWeek = () => {
    if (!dueDate) return 36;
    const diff = new Date(dueDate) - new Date();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return Math.max(1, 40 - Math.floor(days / 7));
  };

  const currentWeek = getCurrentWeek();
  const totalGain = currentWeight - startingWeight;
  const expectedGain = getExpectedGain(currentWeek);
  
  const getTrend = () => {
    const diff = totalGain - expectedGain;
    if (diff > 3) return { icon: TrendingUp, color: 'text-warning-500', label: 'Above expected' };
    if (diff < -3) return { icon: TrendingDown, color: 'text-info-500', label: 'Below expected' };
    return { icon: Minus, color: 'text-success-500', label: 'On track' };
  };

  const trend = getTrend();
  const TrendIcon = trend.icon;

  const handleAddWeight = () => {
    if (newWeight && newWeek) {
      const exists = weightHistory.find(w => w.week === parseInt(newWeek));
      if (exists) {
        setWeightHistory(weightHistory.map(w => 
          w.week === parseInt(newWeek) ? { ...w, weight: parseFloat(newWeight) } : w
        ));
      } else {
        setWeightHistory([...weightHistory, { week: parseInt(newWeek), weight: parseFloat(newWeight) }]);
      }
      setNewWeight('');
      setNewWeek('');
      setShowForm(false);
    }
  };

  const getRecommendedRange = () => {
    const min = startingWeight + (currentWeek <= 13 ? 1 : (currentWeek - 13) * 0.5);
    const max = startingWeight + (currentWeek <= 13 ? 4 : (currentWeek - 13) * 1.5);
    return { min: min.toFixed(1), max: max.toFixed(1) };
  };

  const range = getRecommendedRange();
  const isInRange = currentWeight >= range.min && currentWeight <= range.max;

  const chartData = weightHistory.map(w => ({
    week: w.week,
    weight: w.weight,
    expected: startingWeight + getExpectedGain(w.week)
  })).sort((a, b) => a.week - b.week);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center shadow-lg shadow-secondary-500/30">
            <Weight className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Weight Tracker</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Track your pregnancy weight
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary-glow btn-sm"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Add Weight Form */}
      {showForm && (
        <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Add Weight Entry</h4>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-neutral-500 dark:text-neutral-400">Pregnancy Week</label>
              <input
                type="number"
                value={newWeek}
                onChange={(e) => setNewWeek(e.target.value)}
                className="input dark:input-dark"
                placeholder="Week"
                min="1"
                max="42"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500 dark:text-neutral-400">Weight (kg)</label>
              <input
                type="number"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="input dark:input-dark"
                placeholder="kg"
                step="0.1"
              />
            </div>
          </div>
          <button onClick={handleAddWeight} className="btn-primary w-full">
            Add Entry
          </button>
        </div>
      )}

      {/* Current Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Current</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{currentWeight} kg</p>
        </div>
        <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Total Gain</p>
          <p className={`text-2xl font-bold ${totalGain > 0 ? 'text-success-600 dark:text-success-400' : 'text-neutral-600 dark:text-neutral-400'}`}>
            {totalGain > 0 ? '+' : ''}{totalGain} kg
          </p>
        </div>
        <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Trend</p>
          <div className={`flex items-center justify-center gap-1 ${trend.color}`}>
            <TrendIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{trend.label}</span>
          </div>
        </div>
      </div>

      {/* Recommended Range */}
      <div className={`p-4 rounded-xl mb-6 ${isInRange ? 'bg-success-50 dark:bg-success-900/20' : 'bg-warning-50 dark:bg-warning-900/20'}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isInRange ? 'text-success-500' : 'text-warning-500'}`} />
          <div>
            <p className={`font-medium ${isInRange ? 'text-success-700 dark:text-success-300' : 'text-warning-700 dark:text-warning-300'}`}>
              {isInRange ? 'Great job!' : 'Check with your provider'}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Recommended gain for week {currentWeek}: {range.min} - {range.max} kg
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E11D8D" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#E11D8D" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis 
              dataKey="week" 
              stroke="#6B7280" 
              fontSize={12}
              tickFormatter={(value) => `W${value}`}
            />
            <YAxis 
              stroke="#6B7280" 
              fontSize={12}
              domain={['dataMin - 2', 'dataMax + 2']}
              tickFormatter={(value) => `${value}kg`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: 'none', 
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              labelStyle={{ color: '#9CA3AF' }}
              formatter={(value) => [`${value} kg`, 'Weight']}
              labelFormatter={(label) => `Week ${label}`}
            />
            <Area 
              type="monotone" 
              dataKey="weight" 
              stroke="#E11D8D" 
              strokeWidth={3}
              fill="url(#weightGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-500"></div>
          <span className="text-neutral-500 dark:text-neutral-400">Your weight</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary-500 opacity-50"></div>
          <span className="text-neutral-500 dark:text-neutral-400">Expected</span>
        </div>
      </div>
    </div>
  );
};

export default WeightTracker;

