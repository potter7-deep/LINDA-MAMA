export const getUserId = (db, email) => {
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (!user) throw new Error(`User not found: ${email}`);
  return user.id;
};
