import { useState } from 'react';
import { Baby, ChevronLeft, ChevronRight, Sparkles, Ruler, Weight } from 'lucide-react';

const babySizes = [
  { week: 4, fruit: 'Poppy seed', size: '0.04 in', weight: 'less than 1g', emoji: '🌱' },
  { week: 5, fruit: 'Sesame seed', size: '0.1 in', weight: 'less than 1g', emoji: '🌱' },
  { week: 6, fruit: 'Lentil', size: '0.25 in', weight: 'less than 1g', emoji: '🫘' },
  { week: 7, fruit: 'Blueberry', size: '0.5 in', weight: 'less than 1g', emoji: '🫐' },
  { week: 8, fruit: 'Raspberry', size: '0.6 in', weight: 'less than 1g', emoji: '🍇' },
  { week: 9, fruit: 'Grape', size: '0.9 in', weight: '2g', emoji: '🍇' },
  { week: 10, fruit: 'Kumquat', size: '1.2 in', weight: '4g', emoji: '🍊' },
  { week: 11, fruit: 'Fig', size: '1.5 in', weight: '7g', emoji: '🍈' },
  { week: 12, fruit: 'Plum', size: '2 in', weight: '14g', emoji: '🫐' },
  { week: 13, fruit: 'Peapod', size: '2.9 in', weight: '23g', emoji: '🫛' },
  { week: 14, fruit: 'Lemon', size: '3.4 in', weight: '43g', emoji: '🍋' },
  { week: 15, fruit: 'Apple', size: '4 in', weight: '70g', emoji: '🍎' },
  { week: 16, fruit: 'Avocado', size: '4.6 in', weight: '100g', emoji: '🥑' },
  { week: 17, fruit: 'Pear', size: '5.4 in', weight: '140g', emoji: '🍐' },
  { week: 18, fruit: 'Bell pepper', size: '5.6 in', weight: '190g', emoji: '🫑' },
  { week: 19, fruit: 'Mango', size: '6 in', weight: '240g', emoji: '🥭' },
  { week: 20, fruit: 'Banana', size: '6.5 in', weight: '300g', emoji: '🍌' },
  { week: 21, fruit: 'Carrot', size: '7 in', weight: '360g', emoji: '🥕' },
  { week: 22, fruit: 'Papaya', size: '7.5 in', weight: '430g', emoji: '🍈' },
  { week: 23, fruit: 'Grapefruit', size: '8 in', weight: '500g', emoji: '🍊' },
  { week: 24, fruit: 'Cantaloupe', size: '8.5 in', weight: '600g', emoji: '🍈' },
  { week: 25, fruit: 'Cauliflower', size: '9 in', weight: '680g', emoji: '🥬' },
  { week: 26, fruit: 'Lettuce head', size: '9.5 in', weight: '760g', emoji: '🥬' },
  { week: 27, fruit: 'Rutabaga', size: '10 in', weight: '875g', emoji: '🥔' },
  { week: 28, fruit: 'Eggplant', size: '10.5 in', weight: '1kg', emoji: '🍆' },
  { week: 29, fruit: 'Butternut squash', size: '11 in', weight: '1.15kg', emoji: '🎃' },
  { week: 30, fruit: 'Cabbage', size: '11.5 in', weight: '1.3kg', emoji: '🥬' },
  { week: 31, fruit: 'Coconut', size: '12 in', weight: '1.5kg', emoji: '🥥' },
  { week: 32, fruit: 'Squash', size: '12.5 in', weight: '1.7kg', emoji: '🎃' },
  { week: 33, fruit: 'Pineapple', size: '13 in', weight: '1.9kg', emoji: '🍍' },
  { week: 34, fruit: 'Honeydew melon', size: '13.5 in', weight: '2.1kg', emoji: '🍈' },
  { week: 35, fruit: 'Cantaloupe', size: '14 in', weight: '2.4kg', emoji: '🍈' },
  { week: 36, fruit: 'Romaine lettuce', size: '14.5 in', weight: '2.6kg', emoji: '🥬' },
  { week: 37, fruit: 'Swiss chard', size: '15 in', weight: '2.9kg', emoji: '🥬' },
  { week: 38, fruit: 'Leek', size: '15.5 in', weight: '3.1kg', emoji: '🧅' },
  { week: 39, fruit: 'Watermelon', size: '16 in', weight: '3.3kg', emoji: '🍉' },
  { week: 40, fruit: 'Pumpkin', size: '16.5 in', weight: '3.5kg', emoji: '🎃' },
];

const BabySizeVisualizer = ({ currentWeek = 12 }) => {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  
  const weekData = babySizes.find(w => w.week === selectedWeek) || babySizes[0];
  const prevWeek = babySizes.find(w => w.week === selectedWeek - 1);
  const nextWeek = babySizes.find(w => w.week === selectedWeek + 1);

  const goToPrevWeek = () => {
    if (selectedWeek > 4) setSelectedWeek(selectedWeek - 1);
  };

  const goToNextWeek = () => {
    if (selectedWeek < 40) setSelectedWeek(selectedWeek + 1);
  };

  const progressPercentage = ((selectedWeek - 4) / (40 - 4)) * 100;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-pink-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Baby className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Baby Size</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Week {selectedWeek} of 40
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-3xl">{weekData.emoji}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-neutral-500">
          <span>Week 4</span>
          <span>Week 40</span>
        </div>
      </div>

      {/* Main Display */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary-100 to-pink-100 dark:from-primary-900/30 dark:to-pink-900/30 mb-4">
          <span className="text-6xl">{weekData.emoji}</span>
        </div>
        <h4 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
          Like a {weekData.fruit}
        </h4>
        <p className="text-primary-600 dark:text-primary-400 font-medium">
          Week {selectedWeek}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Ruler className="w-4 h-4 text-primary-500" />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Size</span>
          </div>
          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{weekData.size}</p>
        </div>
        <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Weight className="w-4 h-4 text-pink-500" />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Weight</span>
          </div>
          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{weekData.weight}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPrevWeek}
          disabled={selectedWeek <= 4}
          className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </button>

        <div className="flex gap-1">
          {[4, 12, 20, 28, 36, 40].map(w => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`w-2 h-2 rounded-full transition-colors ${
                selectedWeek === w 
                  ? 'bg-primary-500' 
                  : 'bg-neutral-300 dark:bg-neutral-600 hover:bg-primary-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={goToNextWeek}
          disabled={selectedWeek >= 40}
          className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </button>
      </div>

      {/* Week Comparison */}
      {prevWeek && nextWeek && (
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
            Last week: {prevWeek.emoji} {prevWeek.fruit} • Next week: {nextWeek.emoji} {nextWeek.fruit}
          </p>
        </div>
      )}

      {/* Milestone Tip */}
      {selectedWeek === 12 || selectedWeek === 20 || selectedWeek === 28 || selectedWeek === 36 ? (
        <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-start gap-2">
          <Sparkles className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-primary-700 dark:text-primary-300">
            {selectedWeek === 12 && "First trimester ending! Your baby's fingerprints are forming."}
            {selectedWeek === 20 && "Halfway there! You might be able to feel movements now."}
            {selectedWeek === 28 && "Third trimester begins! Baby can now dream."}
            {selectedWeek === 36 && "Almost there! Baby is gaining about an ounce a day."}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default BabySizeVisualizer;

