import bcrypt from 'bcryptjs';
import db from '../config/database.js';

const seedDatabase = async () => {
  console.log('[Database] Seeding with transaction...');
  
  // Begin transaction for atomic seeding
  db.exec('BEGIN TRANSACTION;');
  
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

  // Add health conditions for demo users
  db.prepare(`
    INSERT INTO health_conditions (userId, conditionType, conditionName)
    VALUES (?, ?, ?)
  `).run(
    mother1.lastInsertRowid,
    'diabetes',
    'Gestational Diabetes'
  );

  db.prepare(`
    INSERT INTO health_conditions (userId, conditionType, conditionName)
    VALUES (?, ?, ?)
  `).run(
    mother2.lastInsertRowid,
    'anemia',
    'Iron Deficiency Anemia'
  );

  // Pregnancy records
  db.prepare(`
    INSERT INTO pregnancy_records (userId, weeks, dueDate, milestones, notes, weight, bloodPressure, symptoms)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    mother3.lastInsertRowid,
    24,
    '2024-09-15',
    JSON.stringify(['Baby can hear', 'Rapid brain development', 'Taste buds forming']),
    'Second trimester progressing well',
    62,
    '120/80',
    'Mild fatigue, occasional backache'
  );

  db.prepare(`
    INSERT INTO pregnancy_records (userId, weeks, dueDate, milestones, notes, weight, bloodPressure, symptoms)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    mother1.lastInsertRowid,
    32,
    '2024-06-20',
    JSON.stringify(['Baby responds to sounds', 'Lungs developing', 'Bone marrow making blood cells']),
    'Third trimester, weekly checkups',
    70,
    '118/75',
    'Heartburn, leg cramps'
  );

  db.prepare(`
    INSERT INTO pregnancy_records (userId, weeks, dueDate, milestones, notes, weight, bloodPressure, symptoms)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    mother2.lastInsertRowid,
    16,
    '2024-11-10',
    JSON.stringify(['Gender determination possible', 'Facial features developing']),
    'Everything progressing normally',
    55,
    '115/70',
    'Morning sickness subsiding'
  );

  // Create nutrition plans
  db.prepare(`
    INSERT INTO nutrition_plans (userId, trimester, mealPlan, recommendations, calories, focusNutrients)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    mother3.lastInsertRowid,
    2,
    JSON.stringify({
      breakfast: 'Oatmeal with fruits, fortified cereal with milk, orange juice',
      lunch: 'Grilled chicken salad with whole grains, vegetable soup',
      dinner: 'Baked fish with quinoa and steamed vegetables',
      snacks: 'Yogurt, nuts, fresh fruits, cheese'
    }),
    'Focus on calcium (1200mg), iron (27mg), protein (75g). Stay hydrated with 8-10 glasses of water daily.',
    2340,
    'Calcium, Iron, Vitamin D, Protein, Omega-3'
  );

  db.prepare(`
    INSERT INTO nutrition_plans (userId, trimester, mealPlan, recommendations, calories, focusNutrients)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    mother1.lastInsertRowid,
    3,
    JSON.stringify({
      breakfast: 'Eggs, whole grain toast, avocado, milk',
      lunch: 'Lean beef stir-fry with vegetables, brown rice',
      dinner: 'Grilled salmon, sweet potato, green salad',
      snacks: 'Protein shake, nuts, dried fruits'
    }),
    'Increase calories by 450. Focus on iron absorption with vitamin C. Omega-3 for brain development.',
    2450,
    'Iron, Calcium, Protein, Omega-3, Vitamin K'
  );

  db.prepare(`
    INSERT INTO nutrition_plans (userId, trimester, mealPlan, recommendations, calories, focusNutrients)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    mother2.lastInsertRowid,
    2,
    JSON.stringify({
      breakfast: 'Fruits, yogurt, whole grain cereal',
      lunch: 'Chicken sandwich with vegetables, soup',
      dinner: 'Pasta with lean meat sauce, salad',
      snacks: 'Nuts, fruits, cheese'
    }),
    'Continue prenatal vitamins. Small frequent meals to combat nausea.',
    2200,
    'Folate, Iron, Vitamin B6'
  );

  // Create immunization schedules
  db.prepare(`
    INSERT INTO immunization_schedules (userId, childName, dateOfBirth, vaccines, nextAppointment, completed)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    mother1.lastInsertRowid,
    'Baby Mwangi',
    '2023-06-15',
    JSON.stringify([
      { name: 'BCG', date: '2023-06-15', completed: true },
      { name: 'Hepatitis B (1)', date: '2023-06-15', completed: true },
      { name: 'Polio (1)', date: '2023-07-27', completed: true },
      { name: 'DTaP (1)', date: '2023-07-27', completed: true },
      { name: 'Hib (1)', date: '2023-07-27', completed: true },
      { name: 'PCV (1)', date: '2023-07-27', completed: true },
      { name: 'Rotavirus (1)', date: '2023-07-27', completed: true }
    ]),
    '2024-01-15',
    0
  );

  db.prepare(`
    INSERT INTO immunization_schedules (userId, childName, dateOfBirth, vaccines, nextAppointment, completed)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    mother2.lastInsertRowid,
    'Baby Ochieng',
    '2024-01-10',
    JSON.stringify([
      { name: 'BCG', date: '2024-01-10', completed: true },
      { name: 'Hepatitis B (1)', date: '2024-01-10', completed: true }
    ]),
    '2024-02-21',
    0
  );

  // Create emergency reports
  db.prepare(`
    INSERT INTO emergency_reports (userId, type, description, severity, status, providerNotes, location)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    mother1.lastInsertRowid,
    'reduced-movement',
    'Baby has reduced movement since yesterday morning',
    'high',
    'acknowledged',
    'Mother advised to come for immediate checkup. CTG monitoring required.',
    'Kasarani, Nairobi'
  );

  db.prepare(`
    INSERT INTO emergency_reports (userId, type, description, severity, status, providerNotes, location)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    mother3.lastInsertRowid,
    'bleeding',
    'Light bleeding noticed this morning',
    'medium',
    'resolved',
    'Examined - no cause for concern. Rest recommended.',
    'Kenyatta Hospital'
  );

  db.prepare(`
    INSERT INTO emergency_reports (userId, type, description, severity, status, providerNotes, location)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    mother2.lastInsertRowid,
    'fever',
    'High fever (39°C) since last night',
    'critical',
    'pending',
    null,
    'Kisumu'
  );

  console.log('Database seeded successfully!');
  console.log('\nTest Accounts:');
  console.log('Admin: admin@lindamama.ke / password123');
  console.log('Provider: provider@lindamama.ke / password123');
  console.log('Mother: grace@email.com / password123');
  console.log('Mother: faith@email.com / password123');
  console.log('Mother: mercy@email.com / password123');
};

seedDatabase().catch(console.error);

