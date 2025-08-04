# Gym Workout Tracker API Documentation

## Overview

The Gym Workout Tracker API is a comprehensive backend service built with Hono.js, TypeScript, and Neon PostgreSQL. It provides authentication, workout plan generation, exercise tracking, and progress monitoring capabilities.

**Base URL:** `http://localhost:3001`  
**API Version:** v1.0.0  
**Authentication:** Bearer Token (JWT)

## Table of Contents

- [Authentication](#authentication)
- [User Management](#user-management)
- [Workout Plans](#workout-plans)
- [Workout Sessions](#workout-sessions)
- [Exercises](#exercises)
- [Progress Tracking](#progress-tracking)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Authentication

All API endpoints require authentication except for signup and signin. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Sign Up

Create a new user account.

**Endpoint:** `POST /api/auth/sign-up`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "token": "jwt-token-here"
}
```

### Sign In

Authenticate existing user.

**Endpoint:** `POST /api/auth/sign-in`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token-here"
}
```

### Sign Out

Sign out current user.

**Endpoint:** `POST /api/auth/sign-out`  
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Successfully signed out"
}
```

## User Management

### Get Profile

Retrieve current user profile.

**Endpoint:** `GET /profile`  
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "profile": {
    "fitnessLevel": "intermediate",
    "primaryGoals": ["build_muscle", "get_stronger"],
    "availableEquipment": ["Barbell", "Dumbbells", "Bench"],
    "workoutsPerWeek": 4,
    "workoutDuration": 60,
    "age": 28,
    "weight": 75.5,
    "height": 180
  }
}
```

### Update Profile

Update user profile information.

**Endpoint:** `PUT /profile`  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fitnessLevel": "intermediate",
  "primaryGoals": ["build_muscle", "get_stronger"],
  "availableEquipment": ["Barbell", "Dumbbells", "Bench"],
  "workoutsPerWeek": 4,
  "workoutDuration": 60,
  "age": 28,
  "weight": 75.5,
  "height": 180
}
```

**Response (200):**
```json
{
  "profile": {
    "fitnessLevel": "intermediate",
    "primaryGoals": ["build_muscle", "get_stronger"],
    "availableEquipment": ["Barbell", "Dumbbells", "Bench"],
    "workoutsPerWeek": 4,
    "workoutDuration": 60,
    "age": 28,
    "weight": 75.5,
    "height": 180,
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get User Stats

Retrieve user workout statistics.

**Endpoint:** `GET /stats`  
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "stats": {
    "totalWorkouts": 45,
    "totalVolume": 125000,
    "currentStreak": 7,
    "longestStreak": 14,
    "averageWorkoutDuration": 62,
    "strengthProgression": {
      "benchPress": { "current": 185, "previous": 175, "change": 10 },
      "squat": { "current": 225, "previous": 215, "change": 10 }
    }
  }
}
```

## Workout Plans

### Generate Workout Plan

Generate a new 4-week workout plan based on user preferences.

**Endpoint:** `POST /workouts/plans/generate`  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "planName": "Muscle Building Program",
  "fitnessGoals": ["build_muscle", "get_stronger"],
  "availableEquipment": ["Barbell", "Dumbbells", "Bench"],
  "workoutsPerWeek": 4,
  "workoutDuration": 60
}
```

**Response (201):**
```json
{
  "plan": {
    "id": "uuid",
    "name": "Muscle Building Program",
    "status": "draft",
    "planStructure": {
      "weeks": [
        {
          "weekNumber": 1,
          "theme": "Foundation Building",
          "workouts": [
            {
              "day": 1,
              "name": "Upper Body Power",
              "exercises": [
                {
                  "exerciseId": "uuid",
                  "sets": 3,
                  "reps": "8-10",
                  "weight": "progressive",
                  "restTime": 90
                }
              ]
            }
          ]
        }
      ]
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get Workout Plans

Retrieve user's workout plans.

**Endpoint:** `GET /workouts/plans`  
**Headers:** `Authorization: Bearer <token>`  
**Query Parameters:**
- `status` (optional): Filter by plan status (`draft`, `active`, `completed`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "plans": [
    {
      "id": "uuid",
      "name": "Muscle Building Program",
      "status": "active",
      "startedAt": "2024-01-01T00:00:00Z",
      "progress": {
        "currentWeek": 2,
        "currentDay": 3,
        "completedWorkouts": 5,
        "totalWorkouts": 16
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

### Start Workout Plan

Activate a workout plan to begin tracking.

**Endpoint:** `POST /workouts/plans/:id/start`  
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Workout plan started successfully",
  "startedAt": "2024-01-01T00:00:00Z"
}
```

## Workout Sessions

### Start Workout Session

Begin a new workout session.

**Endpoint:** `POST /workouts/sessions`  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "planId": "uuid",
  "week": 1,
  "day": 1
}
```

**Response (201):**
```json
{
  "session": {
    "id": "uuid",
    "planId": "uuid",
    "week": 1,
    "day": 1,
    "status": "active",
    "startTime": "2024-01-01T10:00:00Z",
    "exercises": [
      {
        "exerciseId": "uuid",
        "exercise": {
          "name": "Barbell Bench Press",
          "primaryMuscleGroups": ["Chest"]
        },
        "targetSets": 3,
        "targetReps": "8-10",
        "targetWeight": 135
      }
    ]
  }
}
```

### Log Exercise Performance

Record exercise performance during a workout session.

**Endpoint:** `POST /workouts/sessions/:id/logs`  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "exerciseId": "uuid",
  "sets": [
    {
      "reps": 10,
      "weight": 135,
      "restTime": 90,
      "rpe": 7
    },
    {
      "reps": 8,
      "weight": 145,
      "restTime": 90,
      "rpe": 8
    }
  ],
  "notes": "Felt strong today, good form throughout"
}
```

**Response (201):**
```json
{
  "log": {
    "id": "uuid",
    "exerciseId": "uuid",
    "sets": [
      {
        "reps": 10,
        "weight": 135,
        "restTime": 90,
        "rpe": 7
      }
    ],
    "totalVolume": 1350,
    "notes": "Felt strong today, good form throughout",
    "loggedAt": "2024-01-01T10:15:00Z"
  }
}
```

### Complete Workout Session

Mark a workout session as completed.

**Endpoint:** `PUT /workouts/sessions/:id/complete`  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "notes": "Great workout! Hit all target reps and weights.",
  "rating": 4
}
```

**Response (200):**
```json
{
  "session": {
    "id": "uuid",
    "status": "completed",
    "completedAt": "2024-01-01T11:00:00Z",
    "duration": 60,
    "totalVolume": 8750,
    "exercisesCompleted": 5,
    "notes": "Great workout! Hit all target reps and weights.",
    "rating": 4
  }
}
```

### Get Workout Sessions

Retrieve user's workout sessions.

**Endpoint:** `GET /workouts/sessions`  
**Headers:** `Authorization: Bearer <token>`  
**Query Parameters:**
- `status` (optional): Filter by session status (`active`, `completed`, `skipped`)
- `planId` (optional): Filter by plan ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "planId": "uuid",
      "week": 1,
      "day": 1,
      "status": "completed",
      "startTime": "2024-01-01T10:00:00Z",
      "completedAt": "2024-01-01T11:00:00Z",
      "duration": 60,
      "totalVolume": 8750,
      "rating": 4
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

## Exercises

### Get Exercises

Retrieve exercises with filtering options.

**Endpoint:** `GET /exercises`  
**Headers:** `Authorization: Bearer <token>`  
**Query Parameters:**
- `search` (optional): Search by name or description
- `muscleGroup` (optional): Filter by muscle group
- `equipment` (optional): Filter by equipment
- `difficulty` (optional): Filter by difficulty level (1-5)
- `compound` (optional): Filter compound exercises (true/false)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response (200):**
```json
{
  "exercises": [
    {
      "id": "uuid",
      "name": "Barbell Bench Press",
      "description": "Classic compound chest exercise performed lying on a bench",
      "primaryMuscleGroups": [
        {
          "id": "uuid",
          "name": "Chest",
          "category": "primary"
        }
      ],
      "secondaryMuscleGroups": [
        {
          "id": "uuid",
          "name": "Triceps",
          "category": "secondary"
        }
      ],
      "equipmentNeeded": [
        {
          "id": "uuid",
          "name": "Barbell",
          "category": "weights"
        }
      ],
      "difficulty": 3,
      "isCompound": true,
      "category": {
        "id": "uuid",
        "name": "Compound Movements"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### Get Exercise Details

Retrieve detailed information about a specific exercise.

**Endpoint:** `GET /exercises/:id`  
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "exercise": {
    "id": "uuid",
    "name": "Barbell Bench Press",
    "description": "Classic compound chest exercise performed lying on a bench",
    "instructions": [
      "Lie flat on bench with feet planted on floor",
      "Grip barbell slightly wider than shoulder width",
      "Lower bar to chest with control",
      "Press bar up explosively",
      "Keep core tight throughout movement"
    ],
    "primaryMuscleGroups": [
      {
        "id": "uuid",
        "name": "Chest",
        "category": "primary",
        "description": "Pectoralis major and minor"
      }
    ],
    "secondaryMuscleGroups": [
      {
        "id": "uuid",
        "name": "Triceps",
        "category": "secondary",
        "description": "Triceps brachii"
      }
    ],
    "equipmentNeeded": [
      {
        "id": "uuid",
        "name": "Barbell",
        "category": "weights",
        "description": "Olympic barbell for compound movements"
      }
    ],
    "difficulty": 3,
    "isCompound": true,
    "category": {
      "id": "uuid",
      "name": "Compound Movements",
      "description": "Multi-joint exercises that work multiple muscle groups simultaneously"
    },
    "commonMistakes": [
      "Bouncing bar off chest",
      "Lifting feet off ground",
      "Flaring elbows too wide"
    ],
    "tips": [
      "Keep shoulder blades retracted",
      "Maintain arch in lower back",
      "Control the descent"
    ]
  }
}
```

### Get Muscle Groups

Retrieve all muscle groups.

**Endpoint:** `GET /exercises/muscle-groups`  
**Headers:** `Authorization: Bearer <token>`  
**Query Parameters:**
- `category` (optional): Filter by category (`primary`, `secondary`)

**Response (200):**
```json
{
  "muscleGroups": [
    {
      "id": "uuid",
      "name": "Chest",
      "category": "primary",
      "description": "Pectoralis major and minor"
    }
  ]
}
```

### Get Exercise Categories

Retrieve all exercise categories.

**Endpoint:** `GET /exercises/categories`  
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Compound Movements",
      "description": "Multi-joint exercises that work multiple muscle groups simultaneously"
    }
  ]
}
```

### Get Equipment Types

Retrieve all equipment types.

**Endpoint:** `GET /exercises/equipment`  
**Headers:** `Authorization: Bearer <token>`  
**Query Parameters:**
- `category` (optional): Filter by category (`weights`, `bodyweight`, `accessories`)

**Response (200):**
```json
{
  "equipment": [
    {
      "id": "uuid",
      "name": "Barbell",
      "category": "weights",
      "description": "Olympic barbell for compound movements"
    }
  ]
}
```

## Progress Tracking

### Get Progress Metrics

Retrieve comprehensive progress metrics.

**Endpoint:** `GET /progress/metrics`  
**Headers:** `Authorization: Bearer <token>`  
**Query Parameters:**
- `period` (optional): Time period (`week`, `month`, `year`, `all`)
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)

**Response (200):**
```json
{
  "metrics": {
    "totalWorkouts": 45,
    "totalVolume": 125000,
    "averageWorkoutDuration": 62,
    "workoutFrequency": 3.2,
    "strengthGains": {
      "benchPress": { "start": 135, "current": 185, "gain": 50 },
      "squat": { "start": 185, "current": 225, "gain": 40 }
    },
    "volumeProgression": [
      { "date": "2024-01-01", "volume": 2500 },
      { "date": "2024-01-02", "volume": 2750 }
    ],
    "consistencyScore": 87
  }
}
```

### Get Strength Progress

Retrieve strength progression for a specific exercise.

**Endpoint:** `GET /progress/strength/:exerciseId`  
**Headers:** `Authorization: Bearer <token>`  
**Query Parameters:**
- `period` (optional): Time period (`week`, `month`, `year`, `all`)

**Response (200):**
```json
{
  "exercise": {
    "id": "uuid",
    "name": "Barbell Bench Press"
  },
  "progression": [
    {
      "date": "2024-01-01",
      "maxWeight": 135,
      "totalVolume": 2025,
      "bestSet": { "reps": 10, "weight": 135 }
    },
    {
      "date": "2024-01-08",
      "maxWeight": 145,
      "totalVolume": 2175,
      "bestSet": { "reps": 8, "weight": 145 }
    }
  ],
  "statistics": {
    "startWeight": 135,
    "currentWeight": 185,
    "totalGain": 50,
    "averageGainPerWeek": 2.1,
    "personalRecord": { "reps": 5, "weight": 185, "date": "2024-01-15" }
  }
}
```

### Log Body Metrics

Record body measurements and weight.

**Endpoint:** `POST /progress/body`  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "weight": 75.5,
  "bodyFatPercentage": 12.5,
  "measurements": {
    "chest": 102,
    "waist": 81,
    "arms": 36,
    "thighs": 58
  },
  "notes": "Feeling leaner and stronger"
}
```

**Response (201):**
```json
{
  "log": {
    "id": "uuid",
    "weight": 75.5,
    "bodyFatPercentage": 12.5,
    "measurements": {
      "chest": 102,
      "waist": 81,
      "arms": 36,
      "thighs": 58
    },
    "notes": "Feeling leaner and stronger",
    "loggedAt": "2024-01-01T08:00:00Z"
  }
}
```

### Get Body Progress

Retrieve body measurement history.

**Endpoint:** `GET /progress/body`  
**Headers:** `Authorization: Bearer <token>`  
**Query Parameters:**
- `period` (optional): Time period (`week`, `month`, `year`, `all`)

**Response (200):**
```json
{
  "progress": [
    {
      "id": "uuid",
      "weight": 75.5,
      "bodyFatPercentage": 12.5,
      "measurements": {
        "chest": 102,
        "waist": 81,
        "arms": 36,
        "thighs": 58
      },
      "loggedAt": "2024-01-01T08:00:00Z"
    }
  ],
  "trends": {
    "weightChange": 2.5,
    "bodyFatChange": -1.2,
    "measurementChanges": {
      "chest": 3,
      "waist": -2,
      "arms": 2,
      "thighs": 1
    }
  }
}
```

## Error Handling

The API uses standard HTTP status codes and returns error details in JSON format.

**Error Response Format:**
```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "details": "Additional error context (in development mode)"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

**Example Error Response:**
```json
{
  "error": "Validation Error",
  "message": "Invalid request data",
  "details": {
    "field": "email",
    "issue": "Invalid email format"
  }
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse and ensure fair usage.

**Rate Limits:**
- **General API**: 100 requests per 15 minutes per IP/user
- **Authentication**: 5 attempts per 15 minutes per IP
- **Specific Endpoints**: 100 requests per minute per user

**Rate Limit Headers:**
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in window
- `X-RateLimit-Reset`: Time when rate limit resets

**Rate Limit Exceeded Response (429):**
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests, please try again later.",
  "retryAfter": 300
}
```

## Environment Variables

**Required Environment Variables:**
- `DATABASE_URL`: Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Secret key for authentication
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins
- `NODE_ENV`: Environment (`development`, `production`)

**Optional Environment Variables:**
- `PORT`: Server port (default: 3001)
- `RATE_LIMIT_WINDOW_MS`: Rate limit window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window

## Health Check

Check API health and status.

**Endpoint:** `GET /health`

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0",
  "environment": "production"
}
```

## Contact & Support

For API support and questions:
- GitHub Issues: [Repository Issues](https://github.com/your-repo/issues)
- Documentation: [API Docs](https://api-docs.example.com)

---

**Last Updated:** January 2024  
**API Version:** 1.0.0