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

// Get pregnancy records for a user
router.get('/:userId', authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only view their own records unless they're provider/admin
    if (req.user.role === 'mother' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const records = db.prepare(`
      SELECT * FROM pregnancy_records 
      WHERE userId = ? 
      ORDER BY createdAt DESC
    `).all(userId);

    res.json(records);
  } catch (error) {
    console.error('Get pregnancy records error:', error);
    res.status(500).json({ error: 'Failed to get pregnancy records' });
  }
});

// Get single pregnancy record
router.get('/record/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const record = db.prepare('SELECT * FROM pregnancy_records WHERE id = ?').get(id);
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Users can only view their own records unless they're provider/admin
    if (req.user.role === 'mother' && req.user.id !== record.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(record);
  } catch (error) {
    console.error('Get pregnancy record error:', error);
    res.status(500).json({ error: 'Failed to get pregnancy record' });
  }
});

// Create pregnancy record
router.post('/', authenticateToken, [
  body('userId').isInt(),
  body('weeks').optional().isInt({ min: 1, max: 42 }),
  body('dueDate').optional().isISO8601(),
  body('milestones').optional().trim(),
  body('notes').optional().trim(),
  body('weight').optional().isFloat({ min: 0 }),
  body('bloodPressure').optional().trim(),
  body('symptoms').optional().trim()
], validate, (req, res) => {
  try {
    const { userId, weeks, dueDate, milestones, notes, weight, bloodPressure, symptoms } = req.body;

    // Mothers can only create records for themselves
    if (req.user.role === 'mother' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = db.prepare(`
      INSERT INTO pregnancy_records (userId, weeks, dueDate, milestones, notes, weight, bloodPressure, symptoms)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, weeks || 1, dueDate || null, milestones || null, notes || null, weight || null, bloodPressure || null, symptoms || null);

    const record = db.prepare('SELECT * FROM pregnancy_records WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(record);
  } catch (error) {
    console.error('Create pregnancy record error:', error);
    res.status(500).json({ error: 'Failed to create pregnancy record' });
  }
});

// Update pregnancy record
router.put('/:id', authenticateToken, [
  body('weeks').optional().isInt({ min: 1, max: 42 }),
  body('dueDate').optional().isISO8601(),
  body('milestones').optional().trim(),
  body('notes').optional().trim(),
  body('weight').optional().isFloat({ min: 0 }),
  body('bloodPressure').optional().trim(),
  body('symptoms').optional().trim()
], validate, (req, res) => {
  try {
    const { id } = req.params;
    const { weeks, dueDate, milestones, notes, weight, bloodPressure, symptoms } = req.body;

    const existing = db.prepare('SELECT * FROM pregnancy_records WHERE id = ?').get(id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Users can only update their own records unless they're provider/admin
    if (req.user.role === 'mother' && req.user.id !== existing.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = [];
    const values = [];

    if (weeks !== undefined) {
      updates.push('weeks = ?');
      values.push(weeks);
    }
    if (dueDate !== undefined) {
      updates.push('dueDate = ?');
      values.push(dueDate);
    }
    if (milestones !== undefined) {
      updates.push('milestones = ?');
      values.push(milestones);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }
    if (weight !== undefined) {
      updates.push('weight = ?');
      values.push(weight);
    }
    if (bloodPressure !== undefined) {
      updates.push('bloodPressure = ?');
      values.push(bloodPressure);
    }
    if (symptoms !== undefined) {
      updates.push('symptoms = ?');
      values.push(symptoms);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);

    db.prepare(`UPDATE pregnancy_records SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const record = db.prepare('SELECT * FROM pregnancy_records WHERE id = ?').get(id);

    res.json(record);
  } catch (error) {
    console.error('Update pregnancy record error:', error);
    res.status(500).json({ error: 'Failed to update pregnancy record' });
  }
});

// Delete pregnancy record
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM pregnancy_records WHERE id = ?').get(id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Users can only delete their own records unless they're admin
    if (req.user.role === 'mother' && req.user.id !== existing.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    db.prepare('DELETE FROM pregnancy_records WHERE id = ?').run(id);

    res.json({ message: 'Pregnancy record deleted successfully' });
  } catch (error) {
    console.error('Delete pregnancy record error:', error);
    res.status(500).json({ error: 'Failed to delete pregnancy record' });
  }
});

export default router;

