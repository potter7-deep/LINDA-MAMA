import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use absolute path to ensure database is created in the correct location
const projectRoot = path.resolve(__dirname, '..');

// Database path - configurable via DB_PATH env var (Render: /opt/render/project/src/linda_mama.db)
const dbPath = process.env.DB_PATH || path.join(projectRoot, 'linda_mama.db');

// Render persistent disk handling
if (process.env.NODE_ENV === 'production' && !dbPath.startsWith('/opt/render')) {
  console.warn('[Database] For Render production, set DB_PATH=/opt/render/project/src/linda_mama.db and add persistent disk');
}

// Ensure the directory exists
const dbDirPath = path.dirname(dbPath);
if (!fs.existsSync(dbDirPath)) {
  fs.mkdirSync(dbDirPath, { recursive: true });
}

console.log('[Database] Using path:', dbPath, process.env.NODE_ENV === 'production' ? '(Production - ensure persistent disk!)' : '(Development)');

// Create database connection (synchronous in better-sqlite3)
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// === TABLES ===
// Use db.exec for multiple statements or just one. better-sqlite3 is synchronous.
try {
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password TEXT NOT NULL,
      fullName TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'mother' CHECK(role IN ('mother', 'provider', 'admin')),
      phone TEXT,
      dateOfBirth TEXT,
      address TEXT,
      isActive INTEGER DEFAULT 1,
      region TEXT,
      hospitals TEXT,
      isDemo INTEGER DEFAULT 0,
      lastLogin TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // pregnancy_records
  db.exec(`
    CREATE TABLE IF NOT EXISTS pregnancy_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      weeks INTEGER DEFAULT 1 CHECK(weeks >= 1 AND weeks <= 42),
      dueDate TEXT,
      milestones TEXT,
      notes TEXT,
      weight REAL CHECK(weight IS NULL OR weight > 0),
      bloodPressure TEXT,
      symptoms TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // health_conditions
  db.exec(`
    CREATE TABLE IF NOT EXISTS health_conditions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      conditionType TEXT NOT NULL CHECK(conditionType IN ('diabetes', 'hypertension', 'anemia', 'thyroid', 'heart_disease', 'asthma', 'none')),
      conditionName TEXT NOT NULL,
      isActive INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // nutrition_plans
  db.exec(`
    CREATE TABLE IF NOT EXISTS nutrition_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      trimester INTEGER NOT NULL CHECK(trimester >= 1 AND trimester <= 3),
      mealPlan TEXT NOT NULL,
      recommendations TEXT,
      calories INTEGER CHECK(calories IS NULL OR calories > 0),
      focusNutrients TEXT,
      isActive INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // immunization_schedules
  db.exec(`
    CREATE TABLE IF NOT EXISTS immunization_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      childName TEXT NOT NULL,
      dateOfBirth TEXT NOT NULL,
      vaccines TEXT NOT NULL,
      nextAppointment TEXT,
      completed INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // emergency_reports
  db.exec(`
    CREATE TABLE IF NOT EXISTS emergency_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('bleeding', 'severe-pain', 'high-blood-pressure', 'premature-labor', 'fever', 'reduced-movement', 'other')),
      description TEXT NOT NULL,
      severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'high', 'critical')),
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'acknowledged', 'resolved')),
      providerNotes TEXT,
      location TEXT,
      assignedProviderId INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolvedAt DATETIME,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (assignedProviderId) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // conversations
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant1Id INTEGER NOT NULL,
      participant2Id INTEGER NOT NULL,
      lastMessageAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (participant1Id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (participant2Id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT unique_conversation UNIQUE (participant1Id, participant2Id)
    )
  `);

  // messages
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversationId INTEGER NOT NULL,
      senderId INTEGER NOT NULL,
      content TEXT NOT NULL,
      isRead INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
      FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // exercise_logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS exercise_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('yoga', 'walking', 'kegels', 'swimming', 'stretching', 'strength', 'cardio', 'pilates')),
      duration INTEGER NOT NULL CHECK(duration >= 1 AND duration <= 180),
      intensity TEXT CHECK(intensity IN ('low', 'medium', 'high')),
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // === INDEXES ===
  db.exec("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_pregnancy_user ON pregnancy_records(userId)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_pregnancy_due ON pregnancy_records(dueDate)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_nutrition_user ON nutrition_plans(userId)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_nutrition_trimester ON nutrition_plans(trimester)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_immunization_user ON immunization_schedules(userId)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_emergency_user ON emergency_reports(userId)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_emergency_status ON emergency_reports(status)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_emergency_severity ON emergency_reports(severity)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_emergency_provider ON emergency_reports(assignedProviderId)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON conversations(participant1Id)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON conversations(participant2Id)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversationId)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(senderId)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(isRead)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_exercise_user ON exercise_logs(userId)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_exercise_date ON exercise_logs(date)");

  console.log('[Database] All tables and indexes created successfully.');
} catch (error) {
  console.error('[Database ERROR] Table creation failed:', error);
}

// Export the database instance
export default db;
