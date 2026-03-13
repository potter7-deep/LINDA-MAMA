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

// Get all users (admin only)
router.get('/users', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { role, search } = req.query;
    
    let query = 'SELECT id, email, fullName, role, phone, dateOfBirth, address, region, hospitals, isDemo, createdAt FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      query += ' AND (fullName LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY createdAt DESC';

    const users = db.prepare(query).all(...params);

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get single user (admin only)
router.get('/users/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { id } = req.params;
    
    const user = db.prepare(`
      SELECT id, email, fullName, role, phone, dateOfBirth, address, createdAt 
      FROM users WHERE id = ?
    `).get(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user role (admin only)
router.put('/users/:id/role', authenticateToken, requireRole('admin'), [
  body('role').isIn(['mother', 'provider', 'admin'])
], validate, (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);

    const user = db.prepare(`
      SELECT id, email, fullName, role, phone, dateOfBirth, address, createdAt 
      FROM users WHERE id = ?
    `).get(id);

    res.json(user);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get system statistics (admin only)
router.get('/stats', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    // User stats
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const mothers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'mother'").get().count;
    const providers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'provider'").get().count;
    const admins = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get().count;

    // Pregnancy records
    const totalPregnancies = db.prepare('SELECT COUNT(*) as count FROM pregnancy_records').get().count;

    // Nutrition plans
    const totalNutritionPlans = db.prepare('SELECT COUNT(*) as count FROM nutrition_plans').get().count;

    // Immunization schedules
    const totalImmunizations = db.prepare('SELECT COUNT(*) as count FROM immunization_schedules').get().count;

    // Emergency stats
    const totalEmergencies = db.prepare('SELECT COUNT(*) as count FROM emergency_reports').get().count;
    const pendingEmergencies = db.prepare("SELECT COUNT(*) as count FROM emergency_reports WHERE status = 'pending'").get().count;

    // Recent registrations (last 30 days)
    const recentUsers = db.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE createdAt >= datetime('now', '-30 days')
    `).get().count;

    res.json({
      users: {
        total: totalUsers,
        mothers,
        providers,
        admins,
        recentRegistrations: recentUsers
      },
      records: {
        totalPregnancies,
        totalNutritionPlans,
        totalImmunizations
      },
      emergencies: {
        total: totalEmergencies,
        pending: pendingEmergencies
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Get all patients for a provider
router.get('/patients', authenticateToken, requireRole('provider', 'admin'), (req, res) => {
  try {
    const { region } = req.query;
    let query = `
      SELECT DISTINCT u.id, u.email, u.fullName, u.phone, u.dateOfBirth, u.address, u.region, u.createdAt,
        (SELECT COUNT(*) FROM pregnancy_records WHERE userId = u.id) as pregnancyCount,
        (SELECT COUNT(*) FROM nutrition_plans WHERE userId = u.id) as nutritionCount,
        (SELECT COUNT(*) FROM immunization_schedules WHERE userId = u.id) as immunizationCount,
        (SELECT COUNT(*) FROM emergency_reports WHERE userId = u.id) as emergencyCount
      FROM users u
      WHERE u.role = 'mother' AND (u.isDemo = 0 OR ? = 1)
    `;
    const params = [req.user.role === 'admin' ? 1 : 0];
    
    if (region && req.user.role === 'provider') {
      query += ' AND u.region = ?';
      params.push(region);
    }
    
    query += ' ORDER BY u.createdAt DESC';
    
    const patients = db.prepare(query).all(...params);

    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Failed to get patients' });
  }
});

// Get patient details for provider
router.get('/patients/:id', authenticateToken, requireRole('provider', 'admin'), (req, res) => {
  try {
    const { id } = req.params;
    
    const user = db.prepare(`
      SELECT id, email, fullName, role, phone, dateOfBirth, address, createdAt 
      FROM users WHERE id = ? AND role = 'mother'
    `).get(id);
    
    if (!user) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Get related records
    const pregnancies = db.prepare('SELECT * FROM pregnancy_records WHERE userId = ? ORDER BY createdAt DESC').all(id);
    const nutritionPlans = db.prepare('SELECT * FROM nutrition_plans WHERE userId = ? ORDER BY createdAt DESC').all(id);
    const immunizations = db.prepare('SELECT * FROM immunization_schedules WHERE userId = ? ORDER BY createdAt DESC').all(id);
    const emergencies = db.prepare('SELECT * FROM emergency_reports WHERE userId = ? ORDER BY createdAt DESC').all(id);

    res.json({
      patient: user,
      pregnancies,
      nutritionPlans,
      immunizations,
      emergencies
    });
  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({ error: 'Failed to get patient details' });
  }
});

export default router;

