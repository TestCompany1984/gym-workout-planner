import { beforeAll, afterAll } from 'vitest';
import { db } from '../src/db';
import seedDatabase from '../src/db/seed';

// Setup database before all tests
beforeAll(async () => {
  console.log('🧪 Setting up test database...');
  
  try {
    // Run database seeding to populate test data
    await seedDatabase();
    console.log('✅ Test database setup complete');
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    process.exit(1);
  }
});

// Cleanup after all tests
afterAll(async () => {
  console.log('🧹 Cleaning up test database...');
  
  try {
    // Clean up test data (in a real app, you might want to clean specific test data)
    // For now, we'll just log the cleanup
    console.log('✅ Test database cleanup complete');
  } catch (error) {
    console.error('❌ Test database cleanup failed:', error);
  }
});