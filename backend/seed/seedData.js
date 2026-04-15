
import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import path from 'path';

console.log('[Seed] (DEBUG) Current working directory:', process.cwd());
try {
  // Try to log the db path if possible
  if (db && db.name) {
    console.log('[Seed] (DEBUG) Database path:', db.name);
  } else {
    console.log('[Seed] (DEBUG) Database path property not available.');
  }
} catch (e) {
  console.log('[Seed] (DEBUG) Could not log db path:', e);
}

const seedDatabase = async () => {
  console.log('[Database] Seeding with transaction...');

  // (Removed explicit transaction for isolation test)

  try {
    // Clear child tables first, then parents (reverse dependency order)
    db.exec('DELETE FROM messages;');
    db.exec('DELETE FROM conversations;');
    db.exec('DELETE FROM emergency_reports;');
    db.exec('DELETE FROM immunization_schedules;');
    db.exec('DELETE FROM nutrition_plans;');
    db.exec('DELETE FROM health_conditions;');
    db.exec('DELETE FROM pregnancy_records;');
    db.exec('DELETE FROM users;');
    console.log('[Seed] (DEBUG) Ran DELETE FROM users');
    // ...existing code...
    // End of seeding logic

    // (Removed explicit commit for isolation test)
    console.log('Database seeded successfully!');
    console.log('\nTest Accounts:');
    console.log('Admin: admin@lindamama.ke / password123');
    console.log('Provider: provider@lindamama.ke / password123');
    console.log('Mother: grace@email.com / password123');
    console.log('Mother: faith@email.com / password123');
    console.log('Mother: mercy@email.com / password123');
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('Seeding failed:', err);
    console.error('[Seed] (DEBUG) ROLLBACK executed due to error above.');
  }
};

    // Reset auto-increment
    db.exec(`
      DELETE FROM sqlite_sequence WHERE name IN (
        'users', 'pregnancy_records', 'nutrition_plans', 
        'immunization_schedules', 'emergency_reports',
        'conversations', 'messages', 'health_conditions'
      );
    `);

    // Hash passwords
    const passwordHash = await bcrypt.hash('password123', 12);

    console.log('[Seed] Passwords hashed, creating users...');

    // Create users
  const admin = db.prepare(`
    INSERT INTO users (email, password, fullName, role, phone, dateOfBirth, address, region, hospitals, isDemo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'admin@lindamama.ke',
    passwordHash,
    'System Administrator',
    'admin',
    '+254700000001',
    '1985-05-15',
    'Nairobi, Kenya',
    'Nairobi',
    JSON.stringify(['Kenyatta National Hospital', 'Nairobi Hospital']),
    0
  );
  console.log('[Seed] Inserted admin:', admin);

  const provider = db.prepare(`
    INSERT INTO users (email, password, fullName, role, phone, dateOfBirth, address, region, hospitals, isDemo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'provider@lindamama.ke',
    passwordHash,
    'Dr. Sarah Johnson',
    'provider',
    '+254700000002',
    '1980-03-22',
    'Kenyatta National Hospital, Nairobi',
    'Nairobi',
    JSON.stringify(['Kenyatta National Hospital']),
    0
  );
  console.log('[Seed] Inserted provider:', provider);

  const mother1 = db.prepare(`
    INSERT INTO users (email, password, fullName, role, phone, dateOfBirth, address, region, hospitals, isDemo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'grace@email.com',
    passwordHash,
    'Grace Wanjiku',
    'mother',
    '+254700000010',
    '1995-08-10',
    'Kasarani, Nairobi',
    'Nairobi',
    null,
    1
  );
  console.log('[Seed] Inserted mother1:', mother1);

  const mother2 = db.prepare(`
    INSERT INTO users (email, password, fullName, role, phone, dateOfBirth, address, region, hospitals, isDemo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'faith@email.com',
    passwordHash,
    'Faith Achieng',
    'mother',
    '+254700000011',
    '1998-12-05',
    'Kisumu, Kenya',
    'Kisumu',
    null,
    1
  );

  const mother3 = db.prepare(`
    INSERT INTO users (email, password, fullName, role, phone, dateOfBirth, address, region, hospitals, isDemo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'mercy@email.com',
    passwordHash,
    'Mercy Nyong\'o',
    'mother',
    '+254700000012',
    '1997-04-18',
    'Mombasa, Kenya',
    'Mombasa',
    null,
    1
  );

  // ...remaining seeding code commented out for isolation test...
  console.log('Database seeded successfully!');
  console.log('\nTest Accounts:');
  console.log('Admin: admin@lindamama.ke / password123');
  console.log('Provider: provider@lindamama.ke / password123');
  console.log('Mother: grace@email.com / password123');
  console.log('Mother: faith@email.com / password123');
  console.log('Mother: mercy@email.com / password123');
seedDatabase().catch(console.error);

