import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { getUserId } from './getUserId.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[Seed] Starting idempotent seed process...');

// Wait for DB to be ready and ensure tables exist
function ensureTables(callback) {
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
    if (err) {
      console.error('[Seed ERROR] DB check failed:', err);
      return callback(err);
    }
    if (!row) {
      console.log('[Seed] Tables missing, recreating...');
      // Re-run table creations from database.js logic (simplified)
      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL COLLATE NOCASE,
            password TEXT NOT NULL,
            fullName TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'mother' CHECK(role IN ('mother', 'provider', 'admin')),
            phone TEXT,
            region TEXT,
            isDemo INTEGER DEFAULT 0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        // Add other tables as needed
        db.run(`
          CREATE TABLE IF NOT EXISTS health_conditions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            conditionType TEXT NOT NULL,
            conditionName TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
          )
        `);
        db.run(`
          CREATE TABLE IF NOT EXISTS pregnancy_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            weeks INTEGER,
            dueDate TEXT,
            weight REAL,
            notes TEXT,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
          )
        `);
        db.run(`
          CREATE TABLE IF NOT EXISTS nutrition_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            trimester INTEGER,
            mealPlan TEXT,
            calories INTEGER,
            focusNutrients TEXT,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
          )
        `);
        db.run(`
          CREATE TABLE IF NOT EXISTS emergency_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            type TEXT,
            description TEXT,
            severity TEXT,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
          )
        `);
        db.run(`
          CREATE TABLE IF NOT EXISTS immunization_schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            childName TEXT,
            dateOfBirth TEXT,
            vaccines TEXT,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
          )
        `);
        db.run(`
          CREATE TABLE IF NOT EXISTS exercise_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            date TEXT,
            type TEXT,
            duration INTEGER,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
          )
        `);
        db.run('PRAGMA foreign_keys = ON');
        callback(null);
      });
    } else {
      console.log('[Seed] Tables exist, proceeding...');
      callback(null);
    }
  });
}

// Check if seed needed
const demoEmails = [
  'admin@lindamama.com',
  'provider@lindamama.com', 
  'mother1@lindamama.com',
  'mother2@demo.com',
  'mother3@demo.com'
];

ensureTables((err) => {
  if (err) {
    console.error('[Seed FATAL]', err);
    return;
  }

  db.get("SELECT COUNT(*) as count FROM users WHERE email IN (?, ?, ?)", ['admin@lindamama.com', 'provider@lindamama.com', 'mother1@lindamama.com'], (err, row) => {
    if (err) {
      console.error('[Seed ERROR]', err);
      return;
    }
    
    if (row.count >= 3) {
      console.log('[Seed] Core demo users exist (count:', row.count, '), skipping...');
      return;
    }

    console.log('[Seed] Creating demo data...');
    
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      try {
        // Pre-hash passwords
        const saltRounds = 12;
        const passwords = {
          admin: bcrypt.hashSync('admin123', saltRounds),
          provider: bcrypt.hashSync('provider123', saltRounds),
          mother1: bcrypt.hashSync('mother123', saltRounds),
          mother2: bcrypt.hashSync('mother223', saltRounds),
          mother3: bcrypt.hashSync('mother323', saltRounds)
        };

        // Users
        const users = [
          ['admin@lindamama.com', passwords.admin, 'Admin User', 'admin', '+254700123456', 'Nairobi'],
          ['provider@lindamama.com', passwords.provider, 'Dr. Jane Doe', 'provider', '+254711234567', 'Nairobi'],
          ['mother1@lindamama.com', passwords.mother1, 'Amina Hassan', 'mother', '+254722345678', 'Nairobi'],
          ['mother2@demo.com', passwords.mother2, 'Fatima Ali', 'mother', '+254733456789', 'Kisumu'],
          ['mother3@demo.com', passwords.mother3, 'Zainab Omar', 'mother', '+254744567890', 'Mombasa']
        ];

        users.forEach(([email, password, fullName, role, phone, region]) => {
          db.prepare(`
            INSERT OR IGNORE INTO users (email, password, fullName, role, phone, region, isDemo)
            VALUES (?, ?, ?, ?, ?, ?, 1)
          `).run(email, password, fullName, role, phone, region);
        });

        // Get user IDs safely after inserts (no timeout needed with serialize)
        let mother1Id, mother2Id, providerId, mother3Id;
        try {
          mother1Id = getUserId(db, 'mother1@lindamama.com');
          mother2Id = getUserId(db, 'mother2@demo.com');
          providerId = getUserId(db, 'provider@lindamama.com');
          mother3Id = getUserId(db, 'mother3@demo.com');
        } catch (e) {
          console.error('[Seed] User ID lookup failed:', e.message);
          db.run('ROLLBACK');
          return;
        }

        // Health conditions
        db.prepare(`INSERT OR IGNORE INTO health_conditions (userId, conditionType, conditionName) VALUES (?, 'anemia', 'Mild anemia (Hb 10.2)')`).run(mother1Id);
        db.prepare(`INSERT OR IGNORE INTO health_conditions (userId, conditionType, conditionName) VALUES (?, 'none', 'Healthy')`).run(mother2Id);

        // Pregnancy records
        db.prepare(`INSERT OR IGNORE INTO pregnancy_records (userId, weeks, dueDate, weight, notes) VALUES (?, 35, '2025-03-10', 72.5, 'Third trimester, regular checkups')`).run(mother1Id);
        db.prepare(`INSERT OR IGNORE INTO pregnancy_records (userId, weeks, dueDate, weight, notes) VALUES (?, 28, '2025-01-15', 68.0, 'Second trimester, good progress')`).run(mother2Id);
        db.prepare(`INSERT OR IGNORE INTO pregnancy_records (userId, weeks, dueDate, weight, notes) VALUES (?, 12, '2025-08-20', 58.2, 'First trimester, morning sickness')`).run(mother3Id);

        // Nutrition plans
        db.prepare(`INSERT OR IGNORE INTO nutrition_plans (userId, trimester, mealPlan, calories, focusNutrients) VALUES (?, 3, 'Balanced prenatal meals', 2500, 'iron,calcium,protein')`).run(mother1Id);
        db.prepare(`INSERT OR IGNORE INTO nutrition_plans (userId, trimester, mealPlan, calories, focusNutrients) VALUES (?, 2, 'High protein diet', 2300, 'protein,folic-acid')`).run(mother2Id);

        // Emergency reports
        db.prepare(`INSERT OR IGNORE INTO emergency_reports (userId, type, description, severity) VALUES (?, 'reduced-movement', 'Baby movements reduced today', 'medium')`).run(mother1Id);
        db.prepare(`INSERT OR IGNORE INTO emergency_reports (userId, type, description, severity) VALUES (?, 'high-blood-pressure', 'BP 150/95, headache', 'high')`).run(mother3Id);

        // Immunization
        db.prepare(`INSERT OR IGNORE INTO immunization_schedules (userId, childName, dateOfBirth, vaccines) VALUES (?, 'Baby Omar', '2024-06-15', 'TT1, TT2, HepB')`).run(mother3Id);

        // Exercise logs
        db.prepare(`INSERT OR IGNORE INTO exercise_logs (userId, date, type, duration) VALUES (?, '2024-12-01', 'walking', 30)`).run(mother1Id);
        db.prepare(`INSERT OR IGNORE INTO exercise_logs (userId, date, type, duration) VALUES (?, '2024-12-02', 'yoga', 20)`).run(mother2Id);

        // Conversations (mother1 <-> provider)
        db.prepare(`INSERT OR IGNORE INTO conversations (participant1Id, participant2Id) VALUES (?, ?)`).run(mother1Id, providerId);
        const convId = db.prepare('SELECT id FROM conversations WHERE participant1Id = ? AND participant2Id = ?').get(Math.min(mother1Id, providerId), Math.max(mother1Id, providerId))?.id;
        if (convId) {
          db.prepare(`INSERT OR IGNORE INTO messages (conversationId, senderId, content) VALUES (?, ?, 'Thank you doctor for the advice')`).run(convId, mother1Id);
          db.prepare(`INSERT OR IGNORE INTO messages (conversationId, senderId, content) VALUES (?, ?, 'You are welcome. Call if symptoms worsen')`).run(convId, providerId);
        }

        console.log('[Seed ✅] Demo data created successfully!');
        console.log('Login credentials:');
        console.log('• Admin: admin@lindamama.com / admin123');
        console.log('• Provider: provider@lindamama.com / provider123'); 
        console.log('• Mother1: mother1@lindamama.com / mother123');
        console.log('• Mother2: mother2@demo.com / mother223');
        console.log('• Mother3: mother3@demo.com / mother323');

        db.run('COMMIT');
      } catch (error) {
        console.error('[Seed ERROR]', error);
        db.run('ROLLBACK');
      }
    });
  });
});

      } catch (error) {
        console.error('[Seed ERROR]', error);
        db.run('ROLLBACK');
      }
    });
  });
});
