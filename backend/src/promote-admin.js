require('./loadEnv');
const username = process.argv[2];
if (!username) {
  console.error('Usage: node src/promote-admin.js <username>');
  process.exit(1);
}
const { getUserByUsername, setAdmin, pool } = require('./db');

(async () => {
  const u = await getUserByUsername(username);
  if (!u) {
    console.error('User not found:', username);
    process.exit(1);
  }
  const updated = await setAdmin(u.id, true);
  console.log('Admin OK:', updated.username, 'id=', updated.id);
  await pool.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
