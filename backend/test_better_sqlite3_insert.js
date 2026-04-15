import Database from 'better-sqlite3';

const db = new Database('./linda_mama.db');

const result = db.prepare(`
  INSERT INTO users (email, password, fullName, role)
  VALUES (?, ?, ?, ?)
`).run(
  'testbetter@email.com',
  'testpass',
  'Better SQLite3 Test',
  'mother'
);

console.log('Insert result:', result);

const users = db.prepare('SELECT * FROM users;').all();
console.log('All users:', users);
