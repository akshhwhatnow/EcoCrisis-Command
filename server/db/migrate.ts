import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, checkConnection, checkPostGIS } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(): Promise<void> {
  console.log('🔄 Checking database connection...');
  const connStatus = await checkConnection();
  if (!connStatus.connected) {
    throw new Error(`Failed to connect to PostgreSQL: ${connStatus.error}`);
  }
  console.log(`✅ Connected to: ${connStatus.version}`);

  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('🚀 Applying PostgreSQL + PostGIS schema migration...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('✅ Schema migration applied successfully.');

    const postgisStatus = await checkPostGIS();
    if (postgisStatus.postgisAvailable) {
      console.log(`✅ PostGIS Active: ${postgisStatus.version}`);
    } else {
      console.warn(`⚠️ PostGIS check returned: ${postgisStatus.error}`);
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed, rolled back.', error);
    throw error;
  } finally {
    client.release();
  }
}

// Direct execution CLI support
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error(err);
      await pool.end();
      process.exit(1);
    });
}
