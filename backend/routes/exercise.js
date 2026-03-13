import express from 'express';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Get user's exercise logs
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const userIdNum = parseInt(userId);
    
    if (req.user.id !== userIdNum && !['provider', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [rows] = await db.execute(
      `SELECT * FROM exercise_logs 
       WHERE userId = ? 
       ORDER BY date DESC, createdAt DESC 
       LIMIT 50`,
      [userIdNum]
    );

    res.json(rows);
  } catch (error) {
    console.error('Get exercise logs error:', error);
    res.status(500).json({ error: 'Failed to get exercise logs' });
  }
});

// Create exercise log
router.post('/', authenticateToken, [
  body('userId').isInt(),
  body('date').optional().isISO8601(),
  body('type').isIn(['yoga', 'walking', 'kegels', 'swimming', 'stretching', 'strength', 'cardio', 'pilates']),
  body('duration').isInt({ min: 1, max: 180 }),
  body('intensity').optional().isIn(['low', 'medium', 'high']),
  body('notes').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const { userId, date = new Date().toISOString().split('T')[0], type, duration, intensity, notes } = req.body;
    const userIdNum = parseInt(userId);

    if (req.user.id !== userIdNum && !['provider', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [result] = await db.execute(
      `INSERT INTO exercise_logs (userId, date, type, duration, intensity, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [userIdNum, date, type, duration, intensity || null, notes || null]
    );

    const [log] = await db.execute(
      'SELECT * FROM exercise_logs WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(log[0]);
  } catch (error) {
    console.error('Create exercise log error:', error);
    res.status(500).json({ error: 'Failed to create exercise log' });
  }
});

// Update exercise log
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { duration, intensity, notes } = req.body;
    const idNum = parseInt(id);

    const [existing] = await db.execute(
      'SELECT * FROM exercise_logs WHERE id = ?',
      [idNum]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Exercise log not found' });
    }

    const log = existing[0];
    if (req.user.id !== log.userId && !['provider', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await db.execute(
      `UPDATE exercise_logs 
       SET duration = ?, intensity = ?, notes = ?, updatedAt = NOW()
       WHERE id = ?`,
      [duration, intensity || null, notes || null, idNum]
    );

const [updated] = await db.execute(
      'SELECT * FROM exercise_logs WHERE id = ?',
      [idNum]
    );

    res.json(updated[0]);
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

    const [existing] = await db.execute(
      'SELECT * FROM exercise_logs WHERE id = ?',
      [idNum]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Exercise log not found' });
    }

    const log = existing[0];
    if (req.user.id !== log.userId && !['provider', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await db.execute('DELETE FROM exercise_logs WHERE id = ?', [idNum]);
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

    const [total] = await db.execute(
      'SELECT COUNT(*) as total FROM exercise_logs WHERE userId = ?',
      [userIdNum]
    );
    const [weekly] = await db.execute(
      `SELECT COUNT(*) as weekly 
       FROM exercise_logs 
       WHERE userId = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)`,
      [userIdNum]
    );
    const [totalDuration] = await db.execute(
      `SELECT SUM(duration) as totalDuration FROM exercise_logs WHERE userId = ?`,
      [userIdNum]
    );

    res.json({
      total: total[0].total,
      weekly: weekly[0].weekly,
      totalDuration: totalDuration[0].totalDuration || 0,
      averageDuration: total[0].total > 0 ? Math.round((totalDuration[0].totalDuration || 0) / total[0].total) : 0
    });
  } catch (error) {
    console.error('Get exercise stats error:', error);
    res.status(500).json({ error: 'Failed to get exercise statistics' });
  }
});

export default router;
