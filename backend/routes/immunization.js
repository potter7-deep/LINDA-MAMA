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

// Standard immunization schedule
const standardVaccines = [
  { name: 'BCG', due: 'Birth', dose: 1, protection: 'Tuberculosis' },
  { name: 'Hepatitis B', due: 'Birth', dose: 1, protection: 'Hepatitis B' },
  { name: 'Polio (OPV)', due: '6 weeks', dose: 1, protection: 'Polio' },
  { name: 'DTaP', due: '6 weeks', dose: 1, protection: 'Diphtheria, Tetanus, Pertussis' },
  { name: 'Hib', due: '6 weeks', dose: 1, protection: 'Haemophilus influenzae type b' },
  { name: 'PCV', due: '6 weeks', dose: 1, protection: 'Pneumococcal disease' },
  { name: 'Rotavirus', due: '6 weeks', dose: 1, protection: 'Rotavirus' },
  { name: 'Hepatitis B', due: '6 weeks', dose: 2, protection: 'Hepatitis B' },
  { name: 'Polio (OPV)', due: '10 weeks', dose: 2, protection: 'Polio' },
  { name: 'DTaP', due: '10 weeks', dose: 2, protection: 'Diphtheria, Tetanus, Pertussis' },
  { name: 'Hib', due: '10 weeks', dose: 2, protection: 'Haemophilus influenzae type b' },
  { name: 'PCV', due: '10 weeks', dose: 2, protection: 'Pneumococcal disease' },
  { name: 'Rotavirus', due: '10 weeks', dose: 2, protection: 'Rotavirus' },
  { name: 'Polio (OPV)', due: '14 weeks', dose: 3, protection: 'Polio' },
  { name: 'DTaP', due: '14 weeks', dose: 3, protection: 'Diphtheria, Tetanus, Pertussis' },
  { name: 'Hib', due: '14 weeks', dose: 3, protection: 'Haemophilus influenzae type b' },
  { name: 'PCV', due: '14 weeks', dose: 3, protection: 'Pneumococcal disease' },
  { name: 'Rotavirus', due: '14 weeks', dose: 3, protection: 'Rotavirus' },
  { name: 'Hepatitis B', due: '6 months', dose: 3, protection: 'Hepatitis B' },
  { name: 'Vitamin A', due: '6 months', dose: 1, protection: 'Vitamin A deficiency' },
  { name: 'Measles', due: '9 months', dose: 1, protection: 'Measles' },
  { name: 'MR', due: '9 months', dose: 1, protection: 'Measles, Rubella' },
  { name: 'Japanese Encephalitis', due: '9 months', dose: 1, protection: 'Japanese Encephalitis' },
  { name: 'Vitamin A', due: '12 months', dose: 2, protection: 'Vitamin A deficiency' },
  { name: 'Yellow Fever', due: '12 months', dose: 1, protection: 'Yellow Fever' },
 { name: 'MMR', due: '15 months', dose: 1, protection: 'Measles, Mumps, Rubella' },
  { name: 'Varicella', due: '15 months', dose: 1, protection: 'Chickenpox' },
  { name: 'Hepatitis A', due: '18 months', dose: 1, protection: 'Hepatitis A' },
  { name: 'Booster: DTaP', due: '18 months', dose: 4, protection: 'Diphtheria, Tetanus, Pertussis' },
  { name: 'Booster: Polio', due: '18 months', dose: 4, protection: 'Polio' },
  { name: 'Booster: Hib', due: '18 months', dose: 4, protection: 'Haemophilus influenzae type b' },
  { name: 'Vitamin A', due: '24 months', dose: 3, protection: 'Vitamin A deficiency' },
  { name: 'Booster: MMR', due: '4-6 years', dose: 2, protection: 'Measles, Mumps, Rubella' },
  { name: 'Booster: DTaP', due: '4-6 years', dose: 5, protection: 'Diphtheria, Tetanus, Pertussis' },
  { name: 'Booster: Polio', due: '4-6 years', dose: 5, protection: 'Polio' },
  { name: 'TD', due: '10-16 years', dose: 1, protection: 'Tetanus, Diphtheria' }
];

// Get immunization schedules for a user
router.get('/:userId', authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only view their own schedules unless they're provider/admin
    if (req.user.role === 'mother' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const schedules = db.prepare(`
      SELECT * FROM immunization_schedules 
      WHERE userId = ? 
      ORDER BY createdAt DESC
    `).all(userId);

    res.json(schedules);
  } catch (error) {
    console.error('Get immunization schedules error:', error);
    res.status(500).json({ error: 'Failed to get immunization schedules' });
  }
});

// Get single immunization schedule
router.get('/schedule/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const schedule = db.prepare('SELECT * FROM immunization_schedules WHERE id = ?').get(id);
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Users can only view their own schedules unless they're provider/admin
    if (req.user.role === 'mother' && req.user.id !== schedule.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(schedule);
  } catch (error) {
    console.error('Get immunization schedule error:', error);
    res.status(500).json({ error: 'Failed to get immunization schedule' });
  }
});

// Create immunization schedule
router.post('/', authenticateToken, [
  body('userId').isInt(),
  body('childName').trim().notEmpty(),
  body('dateOfBirth').isISO8601(),
  body('vaccines').isJSON(),
  body('nextAppointment').optional().isISO8601(),
  body('completed').optional().isBoolean()
], validate, (req, res) => {
  try {
    const { userId, childName, dateOfBirth, vaccines, nextAppointment, completed } = req.body;

    // Mothers can only create schedules for themselves
    if (req.user.role === 'mother' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = db.prepare(`
      INSERT INTO immunization_schedules (userId, childName, dateOfBirth, vaccines, nextAppointment, completed)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, childName, dateOfBirth, typeof vaccines === 'string' ? vaccines : JSON.stringify(vaccines), nextAppointment || null, completed ? 1 : 0);

    const schedule = db.prepare('SELECT * FROM immunization_schedules WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(schedule);
  } catch (error) {
    console.error('Create immunization schedule error:', error);
    res.status(500).json({ error: 'Failed to create immunization schedule' });
  }
});

// Update immunization schedule
router.put('/:id', authenticateToken, [
  body('childName').optional().trim().notEmpty(),
  body('dateOfBirth').optional().isISO8601(),
  body('vaccines').optional().isJSON(),
  body('nextAppointment').optional().isISO8601(),
  body('completed').optional().isBoolean()
], validate, (req, res) => {
  try {
    const { id } = req.params;
    const { childName, dateOfBirth, vaccines, nextAppointment, completed } = req.body;

    const existing = db.prepare('SELECT * FROM immunization_schedules WHERE id = ?').get(id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Users can only update their own schedules unless they're provider/admin
    if (req.user.role === 'mother' && req.user.id !== existing.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = [];
    const values = [];

    if (childName !== undefined) {
      updates.push('childName = ?');
      values.push(childName);
    }
    if (dateOfBirth !== undefined) {
      updates.push('dateOfBirth = ?');
      values.push(dateOfBirth);
    }
    if (vaccines !== undefined) {
      updates.push('vaccines = ?');
      values.push(typeof vaccines === 'string' ? vaccines : JSON.stringify(vaccines));
    }
    if (nextAppointment !== undefined) {
      updates.push('nextAppointment = ?');
      values.push(nextAppointment);
    }
    if (completed !== undefined) {
      updates.push('completed = ?');
      values.push(completed ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    db.prepare(`UPDATE immunization_schedules SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const schedule = db.prepare('SELECT * FROM immunization_schedules WHERE id = ?').get(id);

    res.json(schedule);
  } catch (error) {
    console.error('Update immunization schedule error:', error);
    res.status(500).json({ error: 'Failed to update immunization schedule' });
  }
});

// Delete immunization schedule
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM immunization_schedules WHERE id = ?').get(id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Users can only delete their own schedules unless they're admin
    if (req.user.role === 'mother' && req.user.id !== existing.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    db.prepare('DELETE FROM immunization_schedules WHERE id = ?').run(id);

    res.json({ message: 'Immunization schedule deleted successfully' });
  } catch (error) {
    console.error('Delete immunization schedule error:', error);
    res.status(500).json({ error: 'Failed to delete immunization schedule' });
  }
});

// Get standard immunization schedule
router.get('/standards/schedule', authenticateToken, (req, res) => {
  try {
    res.json(standardVaccines);
  } catch (error) {
    console.error('Get standard schedule error:', error);
    res.status(500).json({ error: 'Failed to get standard schedule' });
  }
});

// Get upcoming immunizations for a child
router.get('/upcoming/:scheduleId', authenticateToken, (req, res) => {
  try {
    const { scheduleId } = req.params;
    
    const schedule = db.prepare('SELECT * FROM immunization_schedules WHERE id = ?').get(scheduleId);
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const birthDate = new Date(schedule.dateOfBirth);
    const today = new Date();
    const ageInMonths = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24 * 30));

    const upcomingVaccines = standardVaccines.filter(vaccine => {
      let dueMonth = 0;
      if (vaccine.due === 'Birth') dueMonth = 0;
      else if (vaccine.due.includes('weeks')) dueMonth = parseInt(vaccine.due) / 4;
      else if (vaccine.due.includes('months')) dueMonth = parseInt(vaccine.due);
      else if (vaccine.due.includes('years')) dueMonth = parseInt(vaccine.due) * 12;
      return dueMonth > ageInMonths && dueMonth <= ageInMonths + 6;
    });

    res.json(upcomingVaccines);
  } catch (error) {
    console.error('Get upcoming immunizations error:', error);
    res.status(500).json({ error: 'Failed to get upcoming immunizations' });
  }
});

export default router;

