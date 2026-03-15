import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Get user's exercise logs
router.get('/:userId', authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;
    const userIdNum = parseInt(userId);
    
    if (req.user.id !== userIdNum && !['provider', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const rows = db.prepare(`
      SELECT * FROM exercise_logs 
      WHERE userId = ? 
      ORDER BY date DESC, createdAt DESC 
      LIMIT 50
    `).all(userIdNum);

    res.json(rows);
  } catch (error) {
    console.error('Get exercise logs error:', error);
    res.status(500).json({ error: 'Failed to get exercise logs' });
  }
});

// Create exercise log
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/', authenticateToken, [
  body('userId').isInt(),
  body('date').optional().isISO8601(),
  body('type').isIn(['yoga', 'walking', 'kegels', 'swimming', 'stretching', 'strength', 'cardio', 'pilates']),
  body('duration').isInt({ min: 1, max: 180 }),
  body('intensity').optional().isIn(['low', 'medium', 'high']),
  body('notes').optional().isLength({ max: 500 })
], validate, (req, res) => {
  try {
    const { userId, date = new Date().toISOString().split('T')[0], type, duration, intensity, notes } = req.body;
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    if (req.user.id !== userIdNum && !['provider', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = db.prepare(`
      INSERT INTO exercise_logs (userId, date, type, duration, intensity, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(userIdNum, date, type, duration, intensity || null, notes || null);

    const log = db.prepare('SELECT * FROM exercise_logs WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(log);
  } catch (error) {
    console.error('Create exercise log error:', error);
    res.status(500).json({ error: 'Failed to create exercise log' });
  }
});

// Update exercise log
router.put('/:id', authenticateToken, [
  body('duration').optional().isInt({ min: 1, max: 180 }),
  body('intensity').optional().isIn(['low', 'medium', 'high']),
  body('notes').optional().isLength({ max: 500 })
], validate, async (req, res) => {
  try {
    const { id } = req.params;
    const { duration, intensity, notes } = req.body;
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const existing = db.prepare('SELECT * FROM exercise_logs WHERE id = ?').get(idNum);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Exercise log not found' });
    }

    const log = existing[0];
    if (req.user.id !== log.userId && !['provider', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    db.prepare(`
      UPDATE exercise_logs 
      SET duration = ?, intensity = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(duration, intensity || null, notes || null, idNum);

    const updated = db.prepare('SELECT * FROM exercise_logs WHERE id = ?').get(idNum);

    res.json(updated);
  } catch (error) {
    console.error('Update exercise log error:', error);
    res.status(500).json({ error: 'Failed to update exercise log' });
  }
});

// Delete exercise log
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const existing = db.prepare('SELECT * FROM exercise_logs WHERE id = ?').get(idNum);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Exercise log not found' });
    }

    const log = existing[0];
    if (req.user.id !== log.userId && !['provider', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    db.prepare('DELETE FROM exercise_logs WHERE id = ?').run(idNum);
    res.json({ message: 'Exercise log deleted' });
  } catch (error) {
    console.error('Delete exercise log error:', error);
    res.status(500).json({ error: 'Failed to delete exercise log' });
  }
});

// Get exercise statistics
router.get('/:userId/stats', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const userIdNum = parseInt(userId);

    if (req.user.id !== userIdNum && !['provider', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const total = db.prepare('SELECT COUNT(*) as total FROM exercise_logs WHERE userId = ?').get(userIdNum);
    const weekly = db.prepare(`
      SELECT COUNT(*) as weekly 
      FROM exercise_logs 
      WHERE userId = ? AND date >= date('now', '-7 days')
    `).get(userIdNum);
    const totalDuration = db.prepare('SELECT SUM(duration) as totalDuration FROM exercise_logs WHERE userId = ?').get(userIdNum);

    res.json({
      total: total.total,
      weekly: weekly.weekly,
      totalDuration: totalDuration.totalDuration || 0,
      averageDuration: total.total > 0 ? Math.round((totalDuration.totalDuration || 0) / total.total) : 0
    });
  } catch (error) {
    console.error('Get exercise stats error:', error);
    res.status(500).json({ error: 'Failed to get exercise statistics' });
  }
});

export default router;
