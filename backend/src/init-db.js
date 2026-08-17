require('./loadEnv');
const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function main() {
  const schemaPath = path.join(__dirname, '..', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  console.log('Connecting...', process.env.DATABASE_URL || 'postgres://pulse:pulse@localhost:5432/pulse_games');
  await pool.query(sql);
  console.log('Schema applied OK');
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
