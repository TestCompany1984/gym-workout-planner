import { migrate } from 'drizzle-orm/neon-http/migrator';
import { db } from './index';

async function runMigrations() {
  console.log('🚀 Running database migrations...');
  
  try {
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}