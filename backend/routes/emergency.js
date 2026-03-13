import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all emergencies (provider/admin only)
router.get('/', authenticateToken, requireRole('provider', 'admin'), (req, res) => {
  try {
    const { status, severity } = req.query;
    
    let query = `
      SELECT e.*, u.fullName as userName, u.phone as userPhone 
      FROM emergency_reports e
      JOIN users u ON e.userId = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }

    if (severity) {
      query += ' AND e.severity = ?';
      params.push(severity);
    }

    query += ' ORDER BY e.createdAt DESC';

    const emergencies = db.prepare(query).all(...params);

    res.json(emergencies);
  } catch (error) {
    console.error('Get emergencies error:', error);
    res.status(500).json({ error: 'Failed to get emergencies' });
  }
});

// Get user's own emergencies
router.get('/user/:userId', authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own emergencies
    if (req.user.role === 'mother' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const emergencies = db.prepare(`
      SELECT * FROM emergency_reports 
      WHERE userId = ? 
      ORDER BY createdAt DESC
    `).all(userId);

    res.json(emergencies);
  } catch (error) {
    console.error('Get user emergencies error:', error);
    res.status(500).json({ error: 'Failed to get emergencies' });
  }
});

// Get single emergency
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const emergency = db.prepare(`
      SELECT e.*, u.fullName as userName, u.phone as userPhone 
      FROM emergency_reports e
      JOIN users u ON e.userId = u.id
      WHERE e.id = ?
    `).get(id);
    
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    // Users can only view their own emergencies unless they're provider/admin
    if (req.user.role === 'mother' && req.user.id !== emergency.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(emergency);
  } catch (error) {
    console.error('Get emergency error:', error);
    res.status(500).json({ error: 'Failed to get emergency' });
  }
});

// Create emergency report
router.post('/', authenticateToken, [
  body('userId').isInt(),
  body('type').isIn(['bleeding', 'severe-pain', 'high-blood-pressure', 'premature-labor', 'fever', 'reduced-movement', 'other']),
  body('description').trim().notEmpty(),
  body('severity').isIn(['low', 'medium', 'high', 'critical']),
  body('location').optional().trim()
], validate, (req, res) => {
  try {
    const { userId, type, description, severity, location } = req.body;

    // Mothers can only create emergencies for themselves
    if (req.user.role === 'mother' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = db.prepare(`
      INSERT INTO emergency_reports (userId, type, description, severity, location)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, type, description, severity, location || null);

    const emergency = db.prepare('SELECT * FROM emergency_reports WHERE id = ?').get(result.lastInsertRowid);

    // TODO: In production, send SMS/email alert to healthcare providers

    res.status(201).json(emergency);
  } catch (error) {
    console.error('Create emergency error:', error);
    res.status(500).json({ error: 'Failed to create emergency report' });
  }
});

// Update emergency (provider/admin only) - status and notes
router.put('/:id', authenticateToken, requireRole('provider', 'admin'), [
  body('status').optional().isIn(['pending', 'acknowledged', 'resolved']),
  body('providerNotes').optional().trim()
], validate, (req, res) => {
  try {
    const { id } = req.params;
    const { status, providerNotes } = req.body;

    const existing = db.prepare('SELECT * FROM emergency_reports WHERE id = ?').get(id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    const updates = [];
    const values = [];

    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
      
      if (status === 'resolved') {
        updates.push('resolvedAt = CURRENT_TIMESTAMP');
      }
    }
    if (providerNotes !== undefined) {
      updates.push('providerNotes = ?');
      values.push(providerNotes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    db.prepare(`UPDATE emergency_reports SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const emergency = db.prepare(`
      SELECT e.*, u.fullName as userName, u.phone as userPhone 
      FROM emergency_reports e
      JOIN users u ON e.userId = u.id
      WHERE e.id = ?
    `).get(id);

    res.json(emergency);
  } catch (error) {
    console.error('Update emergency error:', error);
    res.status(500).json({ error: 'Failed to update emergency' });
  }
});

// Get emergency statistics (admin/provider)
router.get('/stats/summary', authenticateToken, requireRole('provider', 'admin'), (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM emergency_reports').get().count;
    const pending = db.prepare("SELECT COUNT(*) as count FROM emergency_reports WHERE status = 'pending'").get().count;
    const acknowledged = db.prepare("SELECT COUNT(*) as count FROM emergency_reports WHERE status = 'acknowledged'").get().count;
    const resolved = db.prepare("SELECT COUNT(*) as count FROM emergency_reports WHERE status = 'resolved'").get().count;
    const critical = db.prepare("SELECT COUNT(*) as count FROM emergency_reports WHERE severity = 'critical' AND status != 'resolved'").get().count;

    const byType = db.prepare(`
      SELECT type, COUNT(*) as count 
      FROM emergency_reports 
      GROUP BY type
    `).all();

    const bySeverity = db.prepare(`
      SELECT severity, COUNT(*) as count 
      FROM emergency_reports 
      GROUP BY severity
    `).all();

    res.json({
      total,
      pending,
      acknowledged,
      resolved,
      critical,
      byType,
      bySeverity
    });
  } catch (error) {
    console.error('Get emergency stats error:', error);
    res.status(500).json({ error: 'Failed to get emergency statistics' });
  }
});

export default router;

