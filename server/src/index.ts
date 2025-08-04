import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { corsMiddleware } from './middleware/cors';
import { errorHandler, requestLogger, securityHeaders } from './middleware/error-handler';
import { generalRateLimit, authRateLimit, apiRateLimit } from './middleware/rate-limit';

// Import routes
import authRoutes from './routes/auth';
import workoutRoutes from './routes/workouts';
import exerciseRoutes from './routes/exercises';
import progressRoutes from './routes/progress';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
  } catch (error) {
    console.warn('dotenv not available, using system environment variables');
  }
}

const app = new Hono();

// Global middleware
app.use(corsMiddleware);
app.use(requestLogger);
app.use(errorHandler);
app.use(securityHeaders);

// Apply general rate limiting
app.use('*', generalRateLimit.middleware());

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// API documentation endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Gym Workout Tracker API',
    version: '1.0.0',
    description: 'Backend API for gym workout tracking and plan generation',
    endpoints: {
      health: 'GET /health',
      auth: {
        login: 'POST /api/auth/sign-in',
        register: 'POST /api/auth/sign-up',
        logout: 'POST /api/auth/sign-out',
        profile: 'GET /profile',
        updateProfile: 'PUT /profile',
        updateAccount: 'PUT /account',
        stats: 'GET /stats',
      },
      workouts: {
        plans: 'GET /workouts/plans',
        generatePlan: 'POST /workouts/plans/generate',
        startPlan: 'POST /workouts/plans/:id/start',
        sessions: 'GET /workouts/sessions',
        startSession: 'POST /workouts/sessions',
        completeSession: 'PUT /workouts/sessions/:id/complete',
        logExercise: 'POST /workouts/sessions/:id/logs',
      },
      exercises: {
        list: 'GET /exercises',
        search: 'GET /exercises?search=:query',
        details: 'GET /exercises/:id',
        muscleGroups: 'GET /exercises/muscle-groups',
        categories: 'GET /exercises/categories',
        equipment: 'GET /exercises/equipment',
      },
      progress: {
        metrics: 'GET /progress/metrics',
        strength: 'GET /progress/strength/:exerciseId',
        bodyProgress: 'GET /progress/body',
        logBody: 'POST /progress/body',
        volumeChart: 'GET /progress/charts/volume',
      },
    },
    documentation: 'https://api-docs.example.com',
  });
});

// Route handlers with specific rate limiting
app.route('/', authRoutes.use(authRateLimit.middleware())); // Auth routes with stricter limits
app.route('/workouts', workoutRoutes.use(apiRateLimit.middleware()));
app.route('/exercises', exerciseRoutes.use(apiRateLimit.middleware()));
app.route('/progress', progressRoutes.use(apiRateLimit.middleware()));

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: 'Not Found',
      message: 'The requested resource was not found',
      path: c.req.path,
    },
    404
  );
});

// Start server
const port = parseInt(process.env.PORT || '3001');

console.log(`🚀 Starting Gym Tracker API server...`);
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Server will run on: http://localhost:${port}`);

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

if (!process.env.BETTER_AUTH_SECRET) {
  console.error('❌ BETTER_AUTH_SECRET environment variable is required');
  process.exit(1);
}

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`✅ Server is running on http://localhost:${info.port}`);
  console.log(`📚 API documentation available at http://localhost:${info.port}`);
  console.log(`🏥 Health check available at http://localhost:${info.port}/health`);
});

export default app;