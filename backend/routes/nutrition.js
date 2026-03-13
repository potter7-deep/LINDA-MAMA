import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get nutrition plans for a user
router.get('/:userId', authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only view their own plans unless they're provider/admin
    if (req.user.role === 'mother' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const plans = db.prepare(`
      SELECT * FROM nutrition_plans 
      WHERE userId = ? 
      ORDER BY trimester ASC, createdAt DESC
    `).all(userId);

    res.json(plans);
  } catch (error) {
    console.error('Get nutrition plans error:', error);
    res.status(500).json({ error: 'Failed to get nutrition plans' });
  }
});

// Get single nutrition plan
router.get('/plan/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const plan = db.prepare('SELECT * FROM nutrition_plans WHERE id = ?').get(id);
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Users can only view their own plans unless they're provider/admin
    if (req.user.role === 'mother' && req.user.id !== plan.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Get nutrition plan error:', error);
    res.status(500).json({ error: 'Failed to get nutrition plan' });
  }
});

// Create nutrition plan
router.post('/', authenticateToken, [
  body('userId').isInt(),
  body('trimester').isInt({ min: 1, max: 3 }),
  body('mealPlan').trim().notEmpty(),
  body('recommendations').optional().trim(),
  body('calories').optional().isInt({ min: 0 }),
  body('focusNutrients').optional().trim()
], validate, (req, res) => {
  try {
    const { userId, trimester, mealPlan, recommendations, calories, focusNutrients } = req.body;

    // Mothers can only create plans for themselves
    if (req.user.role === 'mother' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = db.prepare(`
      INSERT INTO nutrition_plans (userId, trimester, mealPlan, recommendations, calories, focusNutrients)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, trimester, mealPlan, recommendations || null, calories || null, focusNutrients || null);

    const plan = db.prepare('SELECT * FROM nutrition_plans WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(plan);
  } catch (error) {
    console.error('Create nutrition plan error:', error);
    res.status(500).json({ error: 'Failed to create nutrition plan' });
  }
});

// Update nutrition plan
router.put('/:id', authenticateToken, [
  body('trimester').optional().isInt({ min: 1, max: 3 }),
  body('mealPlan').optional().trim().notEmpty(),
  body('recommendations').optional().trim(),
  body('calories').optional().isInt({ min: 0 }),
  body('focusNutrients').optional().trim()
], validate, (req, res) => {
  try {
    const { id } = req.params;
    const { trimester, mealPlan, recommendations, calories, focusNutrients } = req.body;

    const existing = db.prepare('SELECT * FROM nutrition_plans WHERE id = ?').get(id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Users can only update their own plans unless they're provider/admin
    if (req.user.role === 'mother' && req.user.id !== existing.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = [];
    const values = [];

    if (trimester !== undefined) {
      updates.push('trimester = ?');
      values.push(trimester);
    }
    if (mealPlan !== undefined) {
      updates.push('mealPlan = ?');
      values.push(mealPlan);
    }
    if (recommendations !== undefined) {
      updates.push('recommendations = ?');
      values.push(recommendations);
    }
    if (calories !== undefined) {
      updates.push('calories = ?');
      values.push(calories);
    }
    if (focusNutrients !== undefined) {
      updates.push('focusNutrients = ?');
      values.push(focusNutrients);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    db.prepare(`UPDATE nutrition_plans SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const plan = db.prepare('SELECT * FROM nutrition_plans WHERE id = ?').get(id);

    res.json(plan);
  } catch (error) {
    console.error('Update nutrition plan error:', error);
    res.status(500).json({ error: 'Failed to update nutrition plan' });
  }
});

// Delete nutrition plan
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM nutrition_plans WHERE id = ?').get(id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Users can only delete their own plans unless they're admin
    if (req.user.role === 'mother' && req.user.id !== existing.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    db.prepare('DELETE FROM nutrition_plans WHERE id = ?').run(id);

    res.json({ message: 'Nutrition plan deleted successfully' });
  } catch (error) {
    console.error('Delete nutrition plan error:', error);
    res.status(500).json({ error: 'Failed to delete nutrition plan' });
  }
});

// Get recommended nutrition for trimester (auto-generate)
router.get('/recommendations/:trimester', authenticateToken, (req, res) => {
  try {
    const { trimester } = req.params;
    
    const recommendations = {
      1: {
        trimester: 1,
        title: 'First Trimester Nutrition (Weeks 1-12)',
        focus: 'Folate, Iron, Vitamin B6',
        calorieIncrease: 0,
        mealPlan: {
          breakfast: 'Folate-rich foods like leafy greens, fortified cereals, citrus fruits',
          lunch: 'Lean protein with whole grains, beans, and vegetables',
          dinner: 'Iron-rich foods like lean meats, spinach, and legumes',
          snacks: 'Nuts, seeds, yogurt, and fresh fruits'
        },
        recommendations: [
          'Take 400-600 mcg of folic acid daily',
          'Stay hydrated with 8-10 glasses of water',
          'Eat small, frequent meals to combat nausea',
          'Avoid raw fish, unpasteurized cheeses, and deli meats',
          'Limit caffeine to 200mg per day'
        ],
        foodsToAvoid: ['Raw fish', 'High-mercury fish', 'Unpasteurized dairy', 'Raw sprouts', 'Deli meats']
      },
      2: {
        trimester: 2,
        title: 'Second Trimester Nutrition (Weeks 13-26)',
        focus: 'Calcium, Vitamin D, Iron, Protein',
        calorieIncrease: 340,
        mealPlan: {
          breakfast: 'Calcium-rich foods like yogurt, fortified orange juice',
          lunch: 'Protein-rich meal with lean meats, eggs, or legumes',
          dinner: 'Balanced meal with whole grains, vegetables, and healthy fats',
          snacks: 'Cheese, nuts, fruits, and protein bars'
        },
        recommendations: [
          'Increase calorie intake by about 340 calories daily',
          'Consume 1000mg of calcium per day',
          'Continue taking prenatal vitamins',
          'Eat iron-rich foods with vitamin C for absorption',
          'Include omega-3 fatty acids for baby brain development'
        ],
        foodsToAvoid: ['Excessive mercury fish', 'Unpasteurized cheeses', 'Raw eggs', 'Excessive caffeine']
      },
      3: {
        trimester: 3,
        title: 'Third Trimester Nutrition (Weeks 27-40)',
        focus: 'Iron, Vitamin K, Omega-3, Protein',
        calorieIncrease: 450,
        mealPlan: {
          breakfast: 'Iron-rich breakfast with eggs, whole grains, and fruits',
          lunch: 'Protein-focused meal with fish, chicken, or plant proteins',
          dinner: 'Nutrient-dense meal with vegetables, whole grains, and healthy fats',
          snacks: 'Nuts, seeds, dried fruits, and protein shakes'
        },
        recommendations: [
          'Increase calorie intake by about 450 calories daily',
          'Continue iron supplementation as prescribed',
          'Get adequate vitamin K from leafy greens',
          'Stay active with gentle exercises',
          'Monitor weight gain and eat nutritious foods'
        ],
        foodsToAvoid: ['High-sodium foods', 'Processed foods', 'Excessive sugar', 'Raw fish']
      }
    };

    const plan = recommendations[trimester];
    if (!plan) {
      return res.status(404).json({ error: 'Invalid trimester' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

export default router;

