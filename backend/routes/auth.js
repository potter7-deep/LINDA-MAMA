import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import db from '../config/database.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').trim().notEmpty(),
  body('role').isIn(['mother', 'provider', 'admin']),
  body('phone').optional().trim(),
  body('dateOfBirth').optional().isISO8601(),
  body('address').optional().trim(),
  body('region').optional(),
  body('hospitals').optional().isArray()
], validate, async (req, res) => {
  try {
    const { email, password, fullName, role, phone, dateOfBirth, address } = req.body;

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user
    const result = db.prepare(`
      INSERT INTO users (email, password, fullName, role, phone, dateOfBirth, address, region, hospitals, isDemo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(email, hashedPassword, fullName, role, phone || null, dateOfBirth || null, address || null, req.body.region || null, req.body.hospitals || null, 0);

    const user = db.prepare('SELECT id, email, fullName, role, phone, dateOfBirth, createdAt, region, hospitals FROM users WHERE id = ?').get(result.lastInsertRowid);

    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }

});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    // Remove password from response
    delete user.password;

    res.json({
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }

});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = db.prepare(`
      SELECT id, email, fullName, role, phone, dateOfBirth, address, createdAt, region, hospitals
      FROM users WHERE id = ?
    `).get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error in /auth/me:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update profile
router.put('/profile', authenticateToken, [
  body('fullName').optional().trim().notEmpty(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('dateOfBirth').optional().isISO8601()
], validate, (req, res) => {
  try {
    const { fullName, phone, address, dateOfBirth } = req.body;
    
    const updates = [];
    const values = [];

    if (fullName) {
      updates.push('fullName = ?');
      values.push(fullName);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }
    if (dateOfBirth) {
      updates.push('dateOfBirth = ?');
      values.push(dateOfBirth);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.user.id);

    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const user = db.prepare(`
      SELECT id, email, fullName, role, phone, dateOfBirth, address, createdAt 
      FROM users WHERE id = ?
    `).get(req.user.id);

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }

});

// Change password
router.put('/password', authenticateToken, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], validate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, req.user.id);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }

});

// Get user's health conditions
router.get('/health-conditions', authenticateToken, (req, res) => {
  try {
    const conditions = db.prepare(`
      SELECT id, conditionType, conditionName, isActive, createdAt 
      FROM health_conditions 
      WHERE userId = ? AND isActive = 1
    `).all(req.user.id);
    
    res.json(conditions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get health conditions' });
  }

});

// Add health condition
router.post('/health-conditions', authenticateToken, [
  body('conditionType').isIn(['diabetes', 'hypertension', 'anemia', 'thyroid', 'heart_disease', 'asthma', 'none']),
  body('conditionName').trim().notEmpty()
], validate, (req, res) => {
  try {
    const { conditionType, conditionName } = req.body;
    
    // If adding a condition other than 'none', first deactivate any existing conditions
    if (conditionType !== 'none') {
      db.prepare('UPDATE health_conditions SET isActive = 0 WHERE userId = ?').run(req.user.id);
    }
    
    const result = db.prepare(`
      INSERT INTO health_conditions (userId, conditionType, conditionName)
      VALUES (?, ?, ?)
    `).run(req.user.id, conditionType, conditionName);
    
    const condition = db.prepare('SELECT * FROM health_conditions WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(condition);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add health condition' });
  }

});

// Update health condition
router.put('/health-conditions/:id', authenticateToken, [
  body('conditionType').optional().isIn(['diabetes', 'hypertension', 'anemia', 'thyroid', 'heart_disease', 'asthma', 'none']),
  body('conditionName').optional().trim().notEmpty()
], validate, (req, res) => {
  try {
    const { id } = req.params;
    const { conditionType, conditionName } = req.body;
    
    // Verify ownership
    const existing = db.prepare('SELECT * FROM health_conditions WHERE id = ? AND userId = ?').get(id, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Health condition not found' });
    }
    
    const updates = [];
    const values = [];
    
    if (conditionType) {
      updates.push('conditionType = ?');
      values.push(conditionType);
    }
    if (conditionName) {
      updates.push('conditionName = ?');
      values.push(conditionName);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    db.prepare(`UPDATE health_conditions SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    
    const condition = db.prepare('SELECT * FROM health_conditions WHERE id = ?').get(id);
    
    res.json(condition);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update health condition' });
  }

});

// Delete health condition
router.delete('/health-conditions/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify ownership
    const existing = db.prepare('SELECT * FROM health_conditions WHERE id = ? AND userId = ?').get(id, req.user.id);
    if (!existing) {
      return res.status(404).json({ error: 'Health condition not found' });
    }
    
    db.prepare('UPDATE health_conditions SET isActive = 0 WHERE id = ?').run(id);
    
    res.json({ message: 'Health condition removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete health condition' });
  }

});

export default router;

