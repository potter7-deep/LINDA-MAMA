import { useState } from 'react';
import { 
  Award, 
  Star, 
  Trophy, 
  Medal, 
  Crown, 
  Zap, 
  Heart, 
  Baby,
  Calendar,
  Target,
  CheckCircle,
  Lock
} from 'lucide-react';

const achievements = [
  {
    id: 1,
    title: 'First Steps',
    description: 'Complete your profile registration',
    icon: Star,
    color: 'from-yellow-400 to-yellow-600',
    condition: (stats) => true,
    points: 10
  },
  {
    id: 2,
    title: 'Nutrition Master',
    description: 'Complete 5 nutrition plans',
    icon: Award,
    color: 'from-green-400 to-green-600',
    condition: (stats) => stats.nutritionPlans >= 5,
    points: 50
  },
  {
    id: 3,
    title: 'Healthcare Hero',
    description: 'Attend 3 appointments',
    icon: Crown,
    color: 'from-purple-400 to-purple-600',
    condition: (stats) => stats.appointments >= 3,
    points: 75
  },
  {
    id: 4,
    title: 'Mood Master',
    description: 'Log your mood for 7 days',
    icon: Heart,
    color: 'from-pink-400 to-pink-600',
    condition: (stats) => stats.moodLogs >= 7,
    points: 100
  },
  {
    id: 5,
    title: 'Immunization Champion',
    description: 'Complete all vaccinations',
    icon: Trophy,
    color: 'from-blue-400 to-blue-600',
    condition: (stats) => stats.immunizations >= 10,
    points: 150
  },
  {
    id: 6,
    title: 'Emergency Ready',
    description: 'Set up emergency contacts',
    icon: Zap,
    color: 'from-red-400 to-red-600',
    condition: (stats) => stats.emergencySet,
    points: 25
  },
  {
    id: 7,
    title: 'Week Warrior',
    description: 'Reach week 20 of pregnancy',
    icon: Baby,
    color: 'from-primary-400 to-primary-600',
    condition: (stats) => stats.weeks >= 20,
    points: 200
  },
  {
    id: 8,
    title: 'Goal Getter',
    description: 'Complete all your goals',
    icon: Target,
    color: 'from-secondary-400 to-secondary-600',
    condition: (stats) => stats.goalsCompleted >= 5,
    points: 300
  }
];

const AchievementBadges = ({ stats = {} }) => {
  const defaultStats = {
    nutritionPlans: 0,
    appointments: 0,
    moodLogs: 0,
    immunizations: 0,
    emergencySet: false,
    weeks: 0,
    goalsCompleted: 0,
    ...stats
  };

  const [selectedBadge, setSelectedBadge] = useState(null);

  const unlockedAchievements = achievements.filter(a => a.condition(defaultStats));
  const lockedAchievements = achievements.filter(a => !a.condition(defaultStats));
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Achievements</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {unlockedAchievements.length} / {achievements.length} unlocked
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-yellow-500">{totalPoints}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Points</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-neutral-600 dark:text-neutral-400">Progress</span>
          <span className="text-neutral-900 dark:text-neutral-100 font-medium">
            {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
          </span>
        </div>
        <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-4 gap-3">
        {achievements.map((achievement) => {
          const isUnlocked = achievement.condition(defaultStats);
          const Icon = achievement.icon;
          
          return (
            <button
              key={achievement.id}
              onClick={() => setSelectedBadge(achievement)}
              className={`relative group p-3 rounded-xl transition-all duration-300 ${
                isUnlocked 
                  ? `bg-gradient-to-br ${achievement.color} shadow-lg` 
                  : 'bg-neutral-100 dark:bg-neutral-700'
              }`}
            >
              {isUnlocked ? (
                <Icon className="w-6 h-6 text-white mx-auto" />
              ) : (
                <Lock className="w-6 h-6 text-neutral-400 dark:text-neutral-500 mx-auto" />
              )}
              
              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 dark:bg-neutral-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {achievement.title}
                <br />
                <span className="text-yellow-400">{achievement.points} pts</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Badge Modal */}
      {selectedBadge && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedBadge(null)}
        >
          <div 
            className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${selectedBadge.color} flex items-center justify-center shadow-lg`}>
              {selectedBadge.condition(defaultStats) ? (
                <CheckCircle className="w-10 h-10 text-white" />
              ) : (
                <Lock className="w-10 h-10 text-white/70" />
              )}
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              {selectedBadge.title}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              {selectedBadge.description}
            </p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-bold text-yellow-500">{selectedBadge.points} points</span>
            </div>
            <button
              onClick={() => setSelectedBadge(null)}
              className="btn-primary w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementBadges;

