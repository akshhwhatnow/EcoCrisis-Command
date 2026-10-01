import dotenv from 'dotenv';
import { app } from './app.js';
import { checkConnection, checkPostGIS, pool } from './db/pool.js';

dotenv.config();

const PORT = process.env.PORT || 3001;

async function startServer() {
  console.log('🔄 Checking database connectivity...');
  const dbStatus = await checkConnection();
  if (dbStatus.connected) {
    console.log(`✅ PostgreSQL Connected: ${dbStatus.version}`);
    const postgisStatus = await checkPostGIS();
    if (postgisStatus.postgisAvailable) {
      console.log(`✅ PostGIS Available: ${postgisStatus.version}`);
    } else {
      console.log(`ℹ️ PostGIS Extension: ${postgisStatus.error || 'Unavailable'}`);
    }
  } else {
    console.warn(`⚠️ PostgreSQL connection not established (${dbStatus.error}). Running in standalone/fallback mode.`);
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 [EcoCrisis Command] Modular API v1 running on http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    console.log('\n🛑 Shutting down EcoCrisis Command server gracefully...');
    server.close(async () => {
      await pool.end();
      console.log('✅ PostgreSQL connection pool closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Only start the server if executed directly
if (process.argv[1] && (process.argv[1].endsWith('server/index.ts') || process.argv[1].endsWith('server\\index.ts') || process.argv[1].includes('index.ts'))) {
  startServer().catch((err) => {
    console.error('❌ Fatal error starting server:', err);
    process.exit(1);
  });
}

export { app, startServer };
