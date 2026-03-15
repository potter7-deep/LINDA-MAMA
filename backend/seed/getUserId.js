export const getUserId = (db, email) => {
  const stmt = db.prepare('SELECT id FROM users WHERE email = ?');
  const user = stmt.get(email);
  stmt.finalize();
  if (!user) throw new Error(`User not found: ${email}`);
  return user.id;
};
