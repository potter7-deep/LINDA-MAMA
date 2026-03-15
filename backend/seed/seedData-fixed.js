import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { getUserId } from './getUserId.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[Seed] Starting idempotent seed process...');

// Check if tables exist and create if missing (though database.js does this already)
const tablesExist = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();

if (!tablesExist) {
  console.log('[Seed] Tables missing, creating via database.js logic...');
  // The database.js import already ran and created tables, 
  // but if for some reason they are missing, we can force it or just fail.
  // Given we refactored database.js to be sync, they SHOULD be there.
  throw new Error('Tables were not created by database.js initialization');
}

// Check if seed needed
const demoEmails = [
  'admin@lindamama.com',
  'provider@lindamama.com', 
  'mother1@lindamama.com'
];

const row = db.prepare("SELECT COUNT(*) as count FROM users WHERE email IN (?, ?, ?)").get(demoEmails[0], demoEmails[1], demoEmails[2]);

if (row && row.count >= 3) {
  console.log('[Seed] Core demo users exist (count:', row.count, '), skipping...');
} else {
  console.log('[Seed] Creating demo data...');
  
  // Use a transaction for performance and atomicity
  const insertTransaction = db.transaction(() => {
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

    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (email, password, fullName, role, phone, region, isDemo)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);

    for (const user of users) {
      insertUser.run(...user);
    }

    // Get user IDs
    const mother1Id = getUserId(db, 'mother1@lindamama.com');
    const mother2Id = getUserId(db, 'mother2@demo.com');
    const providerId = getUserId(db, 'provider@lindamama.com');
    const mother3Id = getUserId(db, 'mother3@demo.com');

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

    // Conversations
    db.prepare(`INSERT OR IGNORE INTO conversations (participant1Id, participant2Id) VALUES (?, ?)`).run(mother1Id, providerId);
    
    const conv = db.prepare('SELECT id FROM conversations WHERE (participant1Id = ? AND participant2Id = ?) OR (participant1Id = ? AND participant2Id = ?)')
      .get(mother1Id, providerId, providerId, mother1Id);
    
    if (conv) {
      db.prepare(`INSERT OR IGNORE INTO messages (conversationId, senderId, content) VALUES (?, ?, 'Thank you doctor for the advice')`).run(conv.id, mother1Id);
      db.prepare(`INSERT OR IGNORE INTO messages (conversationId, senderId, content) VALUES (?, ?, 'You are welcome. Call if symptoms worsen')`).run(conv.id, providerId);
    }
  });

  try {
    insertTransaction();
    console.log('[Seed ✅] Demo data created successfully!');
    console.log('Login credentials:');
    console.log('• Admin: admin@lindamama.com / admin123');
    console.log('• Provider: provider@lindamama.com / provider123'); 
    console.log('• Mother1: mother1@lindamama.com / mother123');
    console.log('• Mother2: mother2@demo.com / mother223');
    console.log('• Mother3: mother3@demo.com / mother323');
  } catch (err) {
    console.error('[Seed FATAL] Transaction failed:', err.message);
  }
}
