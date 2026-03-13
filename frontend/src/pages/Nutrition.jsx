import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Droplets, 
  Plus, 
  Minus, 
  Coffee, 
  Utensils, 
  Target, 
  Clock,
  ChevronRight,
  Sparkles,
  Apple,
  Carrot,
  Leaf,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';

// Health condition-specific meal recommendations
const conditionMealRecommendations = {
  diabetes: {
    title: 'Diabetes-Friendly Nutrition',
    focus: 'Low Glycemic Index, High Fiber, Balanced Carbs',
    tips: [
      'Choose low glycemic index foods (whole grains, legumes, vegetables)',
      'Spread carbohydrate intake throughout the day',
      'Include protein with every meal to stabilize blood sugar',
      'Avoid sugary drinks and processed foods',
      'Eat plenty of fiber-rich foods (vegetables, whole grains)',
      'Monitor portion sizes carefully',
      'Check blood sugar levels as recommended by your provider',
      'Stay hydrated - water helps flush excess sugar from blood'
    ],
    good: ['Leafy greens', 'Whole grains', 'Legumes', 'Nuts', 'Berries', 'Lean proteins', 'Non-starchy vegetables', 'Quinoa', 'Brown rice', 'Sweet potatoes'],
    avoid: ['White bread', 'Sugary drinks', 'Candy', 'Processed snacks', 'White rice', 'Potatoes', 'Sweet fruits', 'Pastries', 'Ice cream'],
    mealIdeas: [
      { name: 'Breakfast', meal: 'Oatmeal with berries and nuts' },
      { name: 'Lunch', meal: 'Grilled chicken with quinoa and steamed vegetables' },
      { name: 'Dinner', meal: 'Baked salmon with brown rice and broccoli' },
      { name: 'Snack', meal: 'Apple slices with almond butter' }
    ]
  },
  gestational_diabetes: {
    title: 'Gestational Diabetes Nutrition',
    focus: 'Blood Sugar Control, Balanced Meals, Consistent Carbs',
    tips: [
      'Eat small, frequent meals throughout the day (3 main meals + 2-3 snacks)',
      'Choose complex carbohydrates over simple sugars',
      'Pair carbs with protein and healthy fats',
      'Monitor carbohydrate intake at each meal',
      'Increase fiber intake to slow glucose absorption',
      'Avoid fasting for long periods',
      'Keep a food and blood sugar diary',
      'Exercise lightly after meals to help lower blood sugar'
    ],
    good: ['Whole grain bread', 'Brown rice', 'Lentils', 'Beans', 'Non-starchy vegetables', 'Lean proteins', 'Greek yogurt', 'Nuts', 'Avocado', 'Berries'],
    avoid: ['White bread', 'White rice', 'Sugary cereals', 'Fruit juices', 'Soda', 'Candy', 'Pastries', 'Honey', 'Pancakes', 'White pasta'],
    mealIdeas: [
      { name: 'Breakfast', meal: 'Whole grain toast with eggs and avocado' },
      { name: 'Lunch', meal: 'Turkey wrap with vegetables and hummus' },
      { name: 'Dinner', meal: 'Grilled fish with quinoa and roasted vegetables' },
      { name: 'Snack', meal: 'Cheese with whole grain crackers' }
    ]
  },
  hypertension: {
    title: 'Hypertension-Friendly Nutrition',
    focus: 'Low Sodium, High Potassium, DASH Diet',
    tips: [
      'Limit sodium intake to less than 2300mg per day',
      'Increase potassium-rich foods (bananas, leafy greens)',
      'Follow DASH diet principles',
      'Avoid processed and canned foods',
      'Use herbs and spices instead of salt for flavor',
      'Include low-fat dairy products',
      'Limit caffeine intake',
      'Reduce alcohol consumption'
    ],
    good: ['Bananas', 'Leafy greens', 'Berries', 'Low-fat dairy', 'Whole grains', 'Lean meats', 'Fish', 'Potatoes', 'Tomatoes', 'Beans'],
    avoid: ['Salt', 'Processed meats', 'Canned soups', 'Fast food', 'Pickles', 'Soy sauce', 'Cheese', 'Bread', 'Pizza', 'Burger'],
    mealIdeas: [
      { name: 'Breakfast', meal: 'Banana smoothie with low-fat yogurt' },
      { name: 'Lunch', meal: 'Grilled chicken salad with olive oil dressing' },
      { name: 'Dinner', meal: 'Baked salmon with steamed vegetables' },
      { name: 'Snack', meal: 'Fresh fruit with almonds' }
    ]
  },
  anemia: {
    title: 'Anemia-Friendly Nutrition',
    focus: 'Iron, Vitamin C, Folate, Vitamin B12',
    tips: [
      'Eat iron-rich foods with vitamin C for better absorption',
      'Include red meat, poultry, and fish regularly',
      'Eat leafy green vegetables and legumes',
      'Consider prenatal vitamins with iron',
      'Avoid tea/coffee with meals (they reduce iron absorption)',
      'Include vitamin B12 sources (dairy, eggs, meat)',
      'Cook in cast iron cookware to increase iron content',
      'Space out calcium and iron-rich foods'
    ],
    good: ['Red meat', 'Chicken', 'Fish', 'Leafy greens', 'Lentils', 'Fortified cereals', 'Citrus fruits', 'Spinach', 'Beef liver', 'Eggs'],
    avoid: ['Tea', 'Coffee', 'Raw soy products', 'Unprocessed bran', 'Excessive dairy', 'Calcium supplements with iron'],
    mealIdeas: [
      { name: 'Breakfast', meal: 'Spinach omelet with orange slices' },
      { name: 'Lunch', meal: 'Lean beef stir-fry with peppers' },
      { name: 'Dinner', meal: 'Grilled chicken with lentils and broccoli' },
      { name: 'Snack', meal: 'Fortified cereal with strawberries' }
    ]
  },
  thyroid: {
    title: 'Thyroid-Friendly Nutrition',
    focus: 'Iodine, Selenium, Zinc, Iron',
    tips: [
      'Ensure adequate iodine intake (iodized salt, seaweed)',
      'Include selenium-rich foods (Brazil nuts, seafood)',
      'Eat zinc-rich foods (meat, legumes, seeds)',
      'Avoid goitrogenic foods in large amounts (raw cruciferous vegetables)',
      'Take thyroid medications separately from calcium/iron supplements',
      'Maintain balanced protein intake',
      'Limit soy products if on thyroid medication',
      'Get enough vitamin D'
    ],
    good: ['Seafood', 'Iodized salt', 'Brazil nuts', 'Eggs', 'Meat', 'Legumes', 'Dairy', 'Seaweed', 'Fish', 'Chicken'],
    avoid: ['Excessive soy', 'Raw cruciferous vegetables', 'Processed foods', 'Soy milk', 'Tofu', 'Edamame'],
    mealIdeas: [
      { name: 'Breakfast', meal: 'Scrambled eggs with toast' },
      { name: 'Lunch', meal: 'Grilled salmon with rice and vegetables' },
      { name: 'Dinner', meal: 'Chicken stir-fry with mixed vegetables' },
      { name: 'Snack', meal: 'Brazil nuts and dried fruit' }
    ]
  },
  heart_disease: {
    title: 'Heart-Healthy Nutrition',
    focus: 'Low Fat, High Omega-3, Fiber',
    tips: [
      'Choose lean proteins and low-fat dairy',
      'Include omega-3 fatty acids (fatty fish, walnuts)',
      'Limit saturated and trans fats',
      'Eat plenty of fiber-rich foods',
      'Reduce sodium intake',
      'Avoid processed meats and fried foods',
      'Limit cholesterol intake',
      'Eat fatty fish twice a week'
    ],
    good: ['Fatty fish', 'Oats', 'Berries', 'Leafy greens', 'Nuts', 'Olive oil', 'Legumes', 'Avocado', 'Whole grains', 'Dark chocolate'],
    avoid: ['Processed meats', 'Fried foods', 'Butter', 'Full-fat dairy', 'Sugary foods', 'Salt', 'Trans fats', 'Bacon', 'Sausage'],
    mealIdeas: [
      { name: 'Breakfast', meal: 'Oatmeal with blueberries and walnuts' },
      { name: 'Lunch', meal: 'Mediterranean salad with grilled chicken' },
      { name: 'Dinner', meal: 'Baked salmon with quinoa and asparagus' },
      { name: 'Snack', meal: 'Handful of mixed nuts' }
    ]
  },
  asthma: {
    title: 'Asthma-Friendly Nutrition',
    focus: 'Anti-inflammatory, Vitamin D, Antioxidants',
    tips: [
      'Eat anti-inflammatory foods (omega-3, fruits, vegetables)',
      'Ensure adequate vitamin D intake',
      'Include antioxidant-rich foods',
      'Identify and avoid food triggers',
      'Maintain healthy weight',
      'Stay hydrated',
      'Limit processed foods',
      'Eat foods rich in magnesium'
    ],
    good: ['Fatty fish', 'Fruits', 'Vegetables', 'Nuts', 'Seeds', 'Whole grains', 'Dairy', 'Spinach', 'Apples', 'Tomatoes'],
    avoid: ['Sulfites', 'Processed foods', 'Fast food', 'Food allergens', 'Dairy (if sensitive)', 'Eggs (if allergic)', 'Peanuts (if allergic)'],
    mealIdeas: [
      { name: 'Breakfast', meal: 'Greek yogurt with fruits and honey' },
      { name: 'Lunch', meal: 'Quinoa bowl with roasted vegetables' },
      { name: 'Dinner', meal: 'Grilled fish with steamed vegetables' },
      { name: 'Snack', meal: 'Apple slices with almond butter' }
    ]
  },
  pcos: {
    title: 'PCOS-Friendly Nutrition',
    focus: 'Low Glycemic, Anti-inflammatory, Balanced Hormones',
    tips: [
      'Choose low glycemic index foods to manage insulin resistance',
      'Include anti-inflammatory foods (olive oil, nuts, fatty fish)',
      'Eat high-fiber foods to help manage hormones',
      'Include lean proteins with every meal',
      'Limit processed foods and sugars',
      'Consider metformin if recommended by your doctor',
      'Eat regular meals to balance insulin',
      'Include omega-3 fatty acids'
    ],
    good: ['Leafy greens', 'Berries', 'Whole grains', 'Lean proteins', 'Nuts', 'Seeds', 'Avocado', 'Olive oil', 'Salmon', 'Legumes'],
    avoid: ['Processed foods', 'Sugary drinks', 'White bread', 'Candy', 'Pastries', 'Fried foods', 'Excess dairy', 'Refined carbs'],
    mealIdeas: [
      { name: 'Breakfast', meal: 'Berry smoothie with flaxseeds' },
      { name: 'Lunch', meal: 'Grilled chicken with quinoa and vegetables' },
      { name: 'Dinner', meal: 'Baked salmon with roasted sweet potato' },
      { name: 'Snack', meal: 'Mixed nuts and berries' }
    ]
  },
  iron_deficiency: {
    title: 'Iron Deficiency Nutrition',
    focus: 'Iron Absorption, Heme & Non-Heme Sources',
    tips: [
      'Combine heme (animal) and non-heme (plant) iron sources',
      'Eat vitamin C rich foods with iron for absorption',
      'Avoid tea/coffee within 1 hour of iron-rich meals',
      'Cook in cast iron cookware',
      'Include red meat 2-3 times per week',
      'Eat leafy greens daily',
      'Consider iron supplements if recommended',
      'Space calcium and iron intake throughout day'
    ],
    good: ['Red meat', 'Beef liver', 'Chicken', 'Sardines', 'Spinach', 'Lentils', 'Beans', 'Fortified cereals', 'Pumpkin seeds', 'Dark chocolate'],
    avoid: ['Tea', 'Coffee', 'Calcium supplements', 'Phytate-rich foods (raw grains)', 'Excessive fiber supplements'],
    mealIdeas: [
      { name: 'Breakfast', meal: 'Fortified cereal with strawberries' },
      { name: 'Lunch', meal: 'Beef and vegetable stir-fry' },
      { name: 'Dinner', meal: 'Grilled steak with spinach and potatoes' },
      { name: 'Snack', meal: 'Pumpkin seeds and dried apricots' }
    ]
  },
  vitamin_d_deficiency: {
    title: 'Vitamin D Deficiency Nutrition',
    focus: 'Vitamin D Rich Foods, Sun Exposure, Absorption',
    tips: [
      'Include fatty fish in your diet 2-3 times per week',
      'Eat fortified foods (milk, cereals, orange juice)',
      'Include egg yolks in your diet',
      'Get moderate sun exposure (10-15 minutes daily)',
      'Consider vitamin D supplements as recommended',
      'Pair vitamin D with fat for better absorption',
      'Include mushrooms exposed to UV light',
      'Check vitamin D levels regularly'
    ],
    good: ['Fatty fish (salmon, mackerel)', 'Cod liver oil', 'Fortified milk', 'Egg yolks', 'Fortified cereals', 'Mushrooms', 'Cheese', 'Beef liver', 'Tuna', 'Sardines'],
    avoid: ['Processed foods (low in vitamin D)', 'Excessive alcohol', 'Trans fats'],
    mealIdeas: [
      { name: 'Breakfast', meal: 'Fortified oatmeal with egg' },
      { name: 'Lunch', meal: 'Grilled salmon salad' },
      { name: 'Dinner', meal: 'Baked cod with vegetables' },
      { name: 'Snack', meal: 'Fortified yogurt' }
    ]
  },
  morning_sickness: {
    title: 'Morning Sickness Management',
    focus: 'Easy-to-Digest, Small Frequent Meals, Ginger',
    tips: [
      'Eat small, frequent meals (every 2-3 hours)',
      'Keep plain crackers by your bedside',
      'Ginger can help reduce nausea (tea, candies, supplements)',
      'Stay hydrated with small sips throughout the day',
      'Avoid strong-smelling foods',
      'Eat protein-rich snacks before bed',
      'Try bland foods (toast, rice, bananas)',
      'Avoid lying down after eating'
    ],
    good: ['Crackers', 'Toast', 'Rice', 'Bananas', 'Ginger', 'Lemon', 'Applesauce', 'Yogurt', 'Broth', 'Pretzels'],
    avoid: ['Strong-smelling foods', 'Spicy foods', 'Fried foods', 'Acidic foods', 'Coffee', 'Large meals', 'High-fat foods'],
    mealIdeas: [
      { name: 'Before Bed', meal: 'Crackers and cheese' },
      { name: 'Breakfast', meal: 'Toast with peanut butter' },
      { name: 'Lunch', meal: 'Rice with steamed vegetables' },
      { name: 'Snack', meal: 'Ginger tea and crackers' }
    ]
  },
  dehydration: {
    title: 'Pregnancy Hydration Guide',
    focus: 'Water Intake, Electrolytes, Avoiding Dehydration',
    tips: [
      'Drink at least 8-10 glasses of water daily',
      'Increase intake in hot weather or exercise',
      'Monitor urine color (should be pale yellow)',
      'Include electrolyte-rich beverages',
      'Eat water-rich fruits and vegetables',
      'Avoid excessive caffeine',
      'Signs of dehydration: dizziness, dark urine, headaches',
      'Increase fluid intake if experiencing vomiting'
    ],
    good: ['Water', 'Coconut water', 'Herbal teas', 'Watermelon', 'Cucumber', 'Oranges', 'Celery', 'Broth', 'Milk', 'Fruit-infused water'],
    avoid: ['Excessive caffeine', 'Sugary drinks', 'Soda', 'Energy drinks', 'Alcohol'],
    mealIdeas: [
      { name: 'Morning', meal: 'Glass of water with lemon' },
      { name: 'Throughout Day', meal: 'Fruit-infused water' },
      { name: 'Snack', meal: 'Watermelon and cucumber slices' },
      { name: 'Evening', meal: 'Herbal pregnancy tea' }
    ]
  }
};

const defaultTrimesterRecommendations = {
  1: {
    title: 'First Trimester Nutrition',
    focus: 'Folate, Iron, Vitamin B6',
    calorieIncrease: 0,
    tips: [
      'Take 400-800 mcg folic acid daily',
      'Eat small, frequent meals to combat nausea',
      'Stay hydrated with 8-10 glasses of water',
      'Include iron-rich foods like leafy greens and lean meat'
    ]
  },
  2: {
    title: 'Second Trimester Nutrition',
    focus: 'Calcium, Vitamin D, Iron, Protein',
    calorieIncrease: 340,
    tips: [
      'Increase calorie intake by 340 calories',
      'Get 1000mg calcium daily from dairy or fortified foods',
      'Include omega-3 fatty acids for baby brain development',
      'Continue taking prenatal vitamins'
    ]
  },
  3: {
    title: 'Third Trimester Nutrition',
    focus: 'Iron, Vitamin K, Omega-3, Protein',
    calorieIncrease: 450,
    tips: [
      'Increase calorie intake by 450 calories',
      'Focus on vitamin K for blood clotting',
      'Eat small, frequent meals to avoid heartburn',
      'Stay hydrated but watch for swelling'
    ]
  }
};

const foodRecommendations = {
  1: {
    good: ['Leafy greens', 'Citrus fruits', 'Whole grains', 'Legumes', 'Nuts'],
    avoid: ['Raw fish', 'Unpasteurized cheese', 'Deli meats', 'Excess caffeine']
  },
  2: {
    good: ['Dairy products', 'Lean meats', 'Eggs', 'Fish (low mercury)', 'Beans'],
    avoid: ['High-mercury fish', 'Raw sprouts', 'Uncooked eggs', 'Excess sugar']
  },
  3: {
    good: ['Iron-rich foods', 'Omega-3 sources', 'Fiber-rich foods', 'Vitamin K foods'],
    avoid: ['Sodium-rich foods', 'Spicy foods', 'Large meals', 'Carbonated drinks']
  }
};

const Nutrition = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTrimester, setSelectedTrimester] = useState(1);
  const [healthConditions, setHealthConditions] = useState([]);
  const [activeCondition, setActiveCondition] = useState(null);
  
  // Water tracking
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal] = useState(8); // glasses per day
  const waterUnit = 250; // ml per glass
  
  // Meal logging
  const [meals, setMeals] = useState([]);
  const [showMealForm, setShowMealForm] = useState(false);
  const [mealFormData, setMealFormData] = useState({
    type: 'breakfast',
    description: '',
    calories: ''
  });

  const [formData, setFormData] = useState({
    trimester: 1,
    mealPlan: '',
    recommendations: '',
    calories: '',
    focusNutrients: '',
  });

  useEffect(() => {
    fetchPlans();
    fetchHealthConditions();
  }, [user]);

  useEffect(() => {
    fetchRecommendations(selectedTrimester);
  }, [selectedTrimester]);

  const fetchPlans = async () => {
    try {
      const response = await api.get(`/nutrition/${user.id}`);
      // Data is already extracted by the API interceptor
      setPlans(response);
    } catch (error) {
      console.error('Error fetching nutrition plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthConditions = async () => {
    try {
      const response = await api.get('/auth/health-conditions');
      setHealthConditions(response);
      if (response && response.length > 0) {
        const active = response.find(c => c.isActive && c.conditionType !== 'none');
        setActiveCondition(active || null);
      }
    } catch (error) {
      console.error('Error fetching health conditions:', error);
    }
  };

  const fetchRecommendations = async (trimester) => {
    try {
      const response = await api.get(`/nutrition/recommendations/${trimester}`);
      // Data is already extracted by the API interceptor
      setRecommendations(response);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Fallback to local data
      setRecommendations(trimesterRecommendations[trimester]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/nutrition', {
        userId: user.id,
        ...formData,
      });
      setShowForm(false);
      setFormData({
        trimester: 1,
        mealPlan: '',
        recommendations: '',
        calories: '',
        focusNutrients: '',
      });
      fetchPlans();
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  const addWater = () => {
    setWaterIntake(prev => Math.min(prev + 1, 12));
  };

  const removeWater = () => {
    setWaterIntake(prev => Math.max(prev - 1, 0));
  };

  const handleMealSubmit = (e) => {
    e.preventDefault();
    setMeals([...meals, { ...mealFormData, id: Date.now(), time: new Date().toLocaleTimeString() }]);
    setShowMealForm(false);
    setMealFormData({ type: 'breakfast', description: '', calories: '' });
  };

  const getTotalCalories = () => {
    return meals.reduce((sum, meal) => sum + (parseInt(meal.calories) || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  const localRec = defaultTrimesterRecommendations[selectedTrimester];
  const foods = foodRecommendations[selectedTrimester];

  // Get condition-specific recommendations if available
  const conditionRec = activeCondition ? conditionMealRecommendations[activeCondition.conditionType] : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Nutrition Guidance</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary-glow"
        >
          {showForm ? 'Cancel' : 'Add Custom Plan'}
        </button>
      </div>

      {/* Trimester Selector */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((trimester) => (
          <button
            key={trimester}
            onClick={() => setSelectedTrimester(trimester)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              selectedTrimester === trimester
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/30'
                : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700'
            }`}
          >
            Trimester {trimester}
          </button>
        ))}
      </div>

      {/* Health Condition Banner */}
      {activeCondition && conditionRec && (
        <div className="card bg-gradient-to-r from-warning-50 to-orange-50 dark:from-warning-900/20 dark:to-orange-900/20 border border-warning-200 dark:border-warning-500/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-warning-800 dark:text-warning-300">
                  {conditionRec.title}
                </h3>
                <span className="px-2 py-0.5 bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300 text-xs rounded-full capitalize">
                  {activeCondition.conditionName}
                </span>
              </div>
              <p className="text-sm text-warning-700 dark:text-warning-400">
                Focus: {conditionRec.focus}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Prompt to add health condition if none set */}
      {!activeCondition && (
        <div className="card bg-gradient-to-r from-info-50 to-blue-50 dark:from-info-900/20 dark:to-blue-900/20 border border-info-100 dark:border-info-500/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-info-100 dark:bg-info-900/30 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-info-600 dark:text-info-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-info-800 dark:text-info-300 mb-1">
                Personalized Nutrition Available!
              </h3>
              <p className="text-sm text-info-700 dark:text-info-400">
                Have a health condition like diabetes, hypertension, or anemia? 
                Updating your profile with your health conditions will give you personalized meal recommendations tailored to your needs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Health Condition-Specific Recommendations */}
      {activeCondition && conditionRec && (
        <div className="card bg-gradient-to-r from-secondary-50 to-primary-50 dark:from-secondary-900/20 dark:to-primary-900/20 border border-secondary-100 dark:border-secondary-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Personalized Nutrition for {activeCondition.conditionName}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" /> Recommendations
              </h3>
              <ul className="space-y-2">
                {conditionRec.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-neutral-700 dark:text-neutral-300 mb-3">Food Recommendations</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-success-600 dark:text-success-400 mb-2 flex items-center gap-2">
                    <Leaf className="w-4 h-4" /> Good to Eat
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {conditionRec.good.map((food, idx) => (
                      <span key={idx} className="px-3 py-1 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 rounded-full text-sm">
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-danger-600 dark:text-danger-400 mb-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Avoid
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {conditionRec.avoid.map((food, idx) => (
                      <span key={idx} className="px-3 py-1 bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 rounded-full text-sm">
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Water Intake Tracker */}
      <div className="card bg-gradient-to-r from-info-50 to-blue-50 dark:from-info-900/20 dark:to-blue-900/20 border border-info-100 dark:border-info-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-info-600 dark:text-info-400" />
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Water Intake Tracker</h3>
          </div>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            Goal: {waterGoal} glasses ({waterGoal * waterUnit}ml)
          </span>
        </div>
        
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={removeWater}
            className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
          >
            <Minus className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
          </button>
          
          <div className="text-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-neutral-200 dark:text-neutral-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeLinecap="round"
                  className="text-info-500 transition-all duration-500"
                  style={{
                    strokeDasharray: 352,
                    strokeDashoffset: 352 - (352 * waterIntake) / waterGoal,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Droplets className="w-6 h-6 text-info-500 mb-1" />
                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{waterIntake}</span>
                <span className="text-xs text-neutral-500">glasses</span>
              </div>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              {waterIntake * waterUnit}ml / {waterGoal * waterUnit}ml
            </p>
          </div>
          
          <button
            onClick={addWater}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-info-500 to-blue-500 flex items-center justify-center hover:shadow-lg hover:shadow-info-500/30 transition-all"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-hover flex items-center gap-4">
<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center shadow-lg shadow-success-500/30">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Today's Calories</p>
            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{getTotalCalories()}</p>
          </div>
        </div>

        <div className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning-400 to-warning-600 flex items-center justify-center shadow-lg shadow-warning-500/30">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Meals Logged</p>
            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{meals.length}</p>
          </div>
        </div>

        <div className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Water (ml)</p>
            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{waterIntake * waterUnit}</p>
          </div>
        </div>
      </div>

      {/* Meal Logger */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Meal Log</h3>
          </div>
          <button
            onClick={() => setShowMealForm(!showMealForm)}
            className="btn-primary-glow btn-sm"
          >
            {showMealForm ? 'Cancel' : 'Log Meal'}
          </button>
        </div>

        {showMealForm && (
          <form onSubmit={handleMealSubmit} className="mb-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="input-label dark:text-neutral-300">Meal Type</label>
                <select
                  value={mealFormData.type}
                  onChange={(e) => setMealFormData({ ...mealFormData, type: e.target.value })}
                  className="input dark:input-dark"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
              <div>
                <label className="input-label dark:text-neutral-300">Description</label>
                <input
                  type="text"
                  value={mealFormData.description}
                  onChange={(e) => setMealFormData({ ...mealFormData, description: e.target.value })}
                  className="input dark:input-dark"
                  placeholder="What did you eat?"
                />
              </div>
              <div>
                <label className="input-label dark:text-neutral-300">Calories</label>
                <input
                  type="number"
                  value={mealFormData.calories}
                  onChange={(e) => setMealFormData({ ...mealFormData, calories: e.target.value })}
                  className="input dark:input-dark"
                  placeholder="e.g., 500"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary-glow">Save Meal</button>
          </form>
        )}

        {meals.length > 0 ? (
          <div className="space-y-2">
            {meals.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    meal.type === 'breakfast' ? 'bg-warning-100 dark:bg-warning-900/30' :
                    meal.type === 'lunch' ? 'bg-success-100 dark:bg-success-900/30' :
                    meal.type === 'dinner' ? 'bg-secondary-100 dark:bg-secondary-900/30' :
                    'bg-info-100 dark:bg-info-900/30'
                  }`}>
                    <Coffee className={`w-5 h-5 ${
                      meal.type === 'breakfast' ? 'text-warning-600 dark:text-warning-400' :
                      meal.type === 'lunch' ? 'text-success-600 dark:text-success-400' :
                      meal.type === 'dinner' ? 'text-secondary-600 dark:text-secondary-400' :
                      'text-info-600 dark:text-info-400'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800 dark:text-neutral-200 capitalize">{meal.type}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{meal.description}</p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">{meal.time}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  {meal.calories} kcal
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Utensils className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-500 dark:text-neutral-400">No meals logged today</p>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="card bg-gradient-to-r from-secondary-50 to-primary-50 dark:from-secondary-900/20 dark:to-primary-900/20 border border-secondary-100 dark:border-secondary-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{localRec?.title}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" /> Focus Nutrients: {localRec?.focus}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              Calorie Increase: <span className="font-semibold text-primary-600 dark:text-primary-400">+{localRec?.calorieIncrease} kcal/day</span>
            </p>
            <ul className="space-y-2">
              {localRec?.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-neutral-700 dark:text-neutral-300 mb-3">Food Recommendations</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-success-600 dark:text-success-400 mb-2 flex items-center gap-2">
                  <Leaf className="w-4 h-4" /> Good to Eat
                </p>
                <div className="flex flex-wrap gap-2">
                  {foods?.good.map((food, idx) => (
                    <span key={idx} className="px-3 py-1 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 rounded-full text-sm">
                      {food}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-danger-600 dark:text-danger-400 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> Avoid
                </p>
                <div className="flex flex-wrap gap-2">
                  {foods?.avoid.map((food, idx) => (
                    <span key={idx} className="px-3 py-1 bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 rounded-full text-sm">
                      {food}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Plan Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Add Custom Nutrition Plan</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label dark:text-neutral-300">Trimester</label>
                <select
                  value={formData.trimester}
                  onChange={(e) => setFormData({ ...formData, trimester: parseInt(e.target.value) })}
                  className="input dark:input-dark"
                >
                  <option value={1}>Trimester 1</option>
                  <option value={2}>Trimester 2</option>
                  <option value={3}>Trimester 3</option>
                </select>
              </div>
              <div>
                <label className="input-label dark:text-neutral-300">Daily Calories</label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  className="input dark:input-dark"
                  placeholder="e.g., 2000"
                />
              </div>
            </div>
            <div>
              <label className="input-label dark:text-neutral-300">Focus Nutrients</label>
              <input
                type="text"
                value={formData.focusNutrients}
                onChange={(e) => setFormData({ ...formData, focusNutrients: e.target.value })}
                className="input dark:input-dark"
                placeholder="e.g., Iron, Calcium, Vitamin D"
              />
            </div>
            <div>
              <label className="input-label dark:text-neutral-300">Recommendations</label>
              <textarea
                value={formData.recommendations}
                onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                className="input dark:input-dark"
                rows="2"
                placeholder="Additional recommendations"
              />
            </div>
            <button type="submit" className="btn-primary-glow">Save Plan</button>
          </form>
        </div>
      )}

      {/* Custom Plans */}
      {plans.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Your Custom Plans</h2>
          <div className="space-y-3">
            {plans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Carrot className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-800 dark:text-neutral-200">Trimester {plan.trimester}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{new Date(plan.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {plan.calories && (
                  <span className="px-3 py-1 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 rounded-full text-sm">
                    {plan.calories} kcal
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Nutrition;

