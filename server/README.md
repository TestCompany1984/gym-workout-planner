# Gym Workout Tracker API

A comprehensive backend API for a gym workout tracking application built with Hono.js, TypeScript, and Neon PostgreSQL. Features include user authentication, intelligent workout plan generation with progressive overload algorithms, exercise tracking, and detailed progress analytics.

## 🚀 Features

- **Authentication & User Management** - Secure user accounts with JWT tokens
- **Intelligent Workout Plan Generation** - AI-powered 4-week workout plans with progressive overload
- **Exercise Database** - 50+ exercises with detailed instructions and muscle group targeting
- **Session Tracking** - Real-time workout session logging with performance metrics
- **Progress Analytics** - Comprehensive strength and body composition tracking
- **Rate Limiting & Security** - Production-ready security and performance optimizations

## 🛠 Tech Stack

- **Framework:** Hono.js (lightweight, fast web framework)
- **Language:** TypeScript
- **Database:** Neon PostgreSQL (serverless PostgreSQL)
- **ORM:** Drizzle ORM
- **Authentication:** BetterAuth
- **Validation:** Zod
- **Testing:** Vitest + Supertest
- **Deployment:** Railway, Vercel, or self-hosted options

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Neon PostgreSQL database account

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/gym-workout-planner.git
cd gym-workout-planner/server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the server root:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Authentication
BETTER_AUTH_SECRET=your-super-secure-secret-key-here

# Server Configuration
NODE_ENV=development
PORT=3001

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 4. Database Setup

```bash
# Generate database migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with initial data (50 exercises, equipment, etc.)
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## 📚 API Documentation

### Health Check
```bash
curl http://localhost:3001/health
```

### API Endpoints Overview
- **Authentication:** `/api/auth/*` - User signup, signin, signout
- **User Profile:** `/profile`, `/account`, `/stats` - User management
- **Workout Plans:** `/workouts/plans/*` - Plan generation and management
- **Workout Sessions:** `/workouts/sessions/*` - Session tracking
- **Exercises:** `/exercises/*` - Exercise database and search
- **Progress:** `/progress/*` - Analytics and body tracking

For complete API documentation, see [docs/API.md](./docs/API.md)

## 🗃 Database Schema

The database uses a comprehensive schema designed for fitness tracking:

- **Users & Profiles** - User accounts and fitness preferences
- **Exercises** - Comprehensive exercise database with muscle groups
- **Workout Plans** - AI-generated 4-week progressive programs
- **Workout Sessions** - Individual workout tracking
- **Exercise Logs** - Detailed performance data
- **Progress Tracking** - Body measurements and strength gains
- **Achievements** - Gamification system

Key relationships:
- Users → Workout Plans (1:many)
- Workout Plans → Sessions (1:many) 
- Sessions → Exercise Logs (1:many)
- Exercises → Exercise Logs (1:many)

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

Tests cover:
- Authentication flows
- Workout plan generation
- Session management
- Exercise API endpoints
- Progress tracking
- Error handling
- Rate limiting

## 🏗 Core Features

### 1. Workout Plan Generation

The API uses intelligent algorithms to generate personalized 4-week workout plans:

```typescript
// Example plan generation request
POST /workouts/plans/generate
{
  "planName": "Muscle Building Program",
  "fitnessGoals": ["build_muscle", "get_stronger"],
  "availableEquipment": ["Barbell", "Dumbbells", "Bench"],
  "workoutsPerWeek": 4,
  "workoutDuration": 60
}
```

**Progressive Overload Algorithm:**
- Week 1: Foundation (higher reps, lower intensity)
- Week 2: Building (moderate reps, moderate intensity) 
- Week 3: Intensification (lower reps, higher intensity)
- Week 4: Peaking (lowest reps, highest intensity)

### 2. Exercise Database

50+ exercises with detailed information:
- Step-by-step instructions
- Primary and secondary muscle groups
- Equipment requirements
- Difficulty levels (1-5)
- Common mistakes and tips
- Exercise categories (compound, isolation, cardio, etc.)

### 3. Session Tracking

Real-time workout logging:
- Exercise performance (sets, reps, weight, RPE)
- Rest time tracking
- Session duration
- Workout notes and ratings
- Automatic volume calculations

### 4. Progress Analytics

Comprehensive tracking includes:
- Strength progression over time
- Body composition changes
- Workout consistency metrics
- Volume and intensity trends
- Personal record tracking

## 🛡 Security Features

- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - Prevents API abuse
- **Input Validation** - Zod schema validation
- **CORS Protection** - Configurable origin restrictions
- **Security Headers** - XSS, CSRF, and other protections
- **SQL Injection Prevention** - Parameterized queries via Drizzle ORM

## 📊 Performance Optimizations

- **Database Indexing** - Optimized queries for user data
- **Connection Pooling** - Efficient database connections
- **Response Caching** - Strategic caching headers
- **Pagination** - Efficient data loading
- **Query Optimization** - Minimal database round trips

## 🚀 Deployment

The API supports multiple deployment options:

### Railway (Recommended)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Self-Hosted
```bash
npm run build
npm start
```

For detailed deployment instructions, see [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

## 📁 Project Structure

```
server/
├── src/
│   ├── db/              # Database configuration and schemas
│   │   ├── schema/      # Drizzle schema definitions
│   │   ├── index.ts     # Database connection
│   │   ├── migrate.ts   # Migration runner
│   │   └── seed.ts      # Database seeding
│   ├── middleware/      # Custom middleware
│   │   ├── cors.ts      # CORS configuration
│   │   ├── error-handler.ts # Error handling
│   │   └── rate-limit.ts     # Rate limiting
│   ├── routes/          # API route handlers
│   │   ├── auth.ts      # Authentication routes
│   │   ├── workouts.ts  # Workout management
│   │   ├── exercises.ts # Exercise database
│   │   └── progress.ts  # Progress tracking
│   ├── services/        # Business logic
│   │   └── workout-generator.ts # Plan generation
│   ├── lib/             # Utilities and helpers
│   │   ├── auth.ts      # Auth configuration
│   │   └── validation.ts # Zod schemas
│   └── index.ts         # Application entry point
├── tests/               # Test suites
│   ├── api/             # API endpoint tests
│   └── setup.ts         # Test configuration
├── docs/                # Documentation
│   ├── API.md           # API documentation
│   └── DEPLOYMENT.md    # Deployment guide
└── package.json         # Dependencies and scripts
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages  
- Update documentation as needed
- Run linting before committing: `npm run lint`

## 📝 Scripts Reference

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start           # Start production server

# Database
npm run db:generate # Generate Drizzle migrations
npm run db:migrate  # Run database migrations
npm run db:seed     # Seed database with initial data
npm run db:studio   # Open Drizzle Studio

# Testing
npm test           # Run tests in watch mode
npm run test:run   # Run tests once
npm run test:coverage # Run tests with coverage
npm run test:ui    # Run tests with UI

# Code Quality
npm run lint       # Run ESLint
npm run type-check # Run TypeScript compiler check
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error:**
```bash
# Verify DATABASE_URL format
echo $DATABASE_URL

# Test connection
npm run db:migrate
```

**Authentication Issues:**
```bash
# Verify BETTER_AUTH_SECRET is set
echo $BETTER_AUTH_SECRET

# Check JWT token format in requests
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/profile
```

**Rate Limiting:**
```bash
# Check rate limit headers
curl -I http://localhost:3001/health

# Adjust limits in environment variables
RATE_LIMIT_MAX_REQUESTS=200
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- [Hono.js](https://hono.dev/) - Lightweight web framework
- [Drizzle ORM](https://orm.drizzle.team/) - Type-safe database toolkit
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [BetterAuth](https://better-auth.com/) - Authentication library

---

**Built with ❤️ for fitness enthusiasts and developers**

For questions or support, please open an issue or contact the development team.