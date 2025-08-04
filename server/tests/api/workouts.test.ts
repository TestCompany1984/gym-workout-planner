import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';

describe('Workouts API', () => {
  let authToken: string;
  let userId: string;
  let workoutPlanId: string;
  let workoutSessionId: string;

  beforeAll(async () => {
    // Create test user and authenticate
    const signUpResponse = await request(app)
      .post('/api/auth/sign-up')
      .send({
        email: 'workout-test@example.com',
        password: 'TestPassword123!',
        name: 'Workout Test User',
      });

    authToken = signUpResponse.body.token;
    userId = signUpResponse.body.user.id;

    // Create user profile
    await request(app)
      .put('/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        fitnessLevel: 'intermediate',
        primaryGoals: ['build_muscle', 'get_stronger'],
        availableEquipment: ['Barbell', 'Dumbbells', 'Bench'],
        workoutsPerWeek: 4,
        workoutDuration: 60,
        age: 28,
        weight: 75,
        height: 180,
      });
  });

  describe('POST /workouts/plans/generate', () => {
    const planRequest = {
      planName: 'Test Muscle Building Plan',
      fitnessGoals: ['build_muscle', 'get_stronger'],
      availableEquipment: ['Barbell', 'Dumbbells', 'Bench'],
      workoutsPerWeek: 4,
      workoutDuration: 60,
    };

    it('should generate a new workout plan', async () => {
      const response = await request(app)
        .post('/workouts/plans/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(planRequest)
        .expect(201);

      expect(response.body).toHaveProperty('plan');
      expect(response.body.plan).toHaveProperty('id');
      expect(response.body.plan).toHaveProperty('planStructure');
      expect(response.body.plan.name).toBe(planRequest.planName);
      expect(response.body.plan.planStructure.weeks).toHaveLength(4);

      workoutPlanId = response.body.plan.id;
    });

    it('should return 400 for invalid plan request', async () => {
      const response = await request(app)
        .post('/workouts/plans/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          planName: '', // Invalid empty name
          workoutsPerWeek: 10, // Invalid number
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/workouts/plans/generate')
        .send(planRequest)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /workouts/plans', () => {
    it('should retrieve user workout plans', async () => {
      const response = await request(app)
        .get('/workouts/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('plans');
      expect(Array.isArray(response.body.plans)).toBe(true);
      expect(response.body.plans.length).toBeGreaterThan(0);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/workouts/plans')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /workouts/plans/:id/start', () => {
    it('should start a workout plan', async () => {
      const response = await request(app)
        .post(`/workouts/plans/${workoutPlanId}/start`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('startedAt');
    });

    it('should return 404 for non-existent plan', async () => {
      const response = await request(app)
        .post('/workouts/plans/non-existent-id/start')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post(`/workouts/plans/${workoutPlanId}/start`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /workouts/sessions', () => {
    const sessionRequest = {
      planId: '', // Will be set in test
      week: 1,
      day: 1,
    };

    it('should start a new workout session', async () => {
      sessionRequest.planId = workoutPlanId;

      const response = await request(app)
        .post('/workouts/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sessionRequest)
        .expect(201);

      expect(response.body).toHaveProperty('session');
      expect(response.body.session).toHaveProperty('id');
      expect(response.body.session.status).toBe('active');

      workoutSessionId = response.body.session.id;
    });

    it('should return 400 for invalid session request', async () => {
      const response = await request(app)
        .post('/workouts/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          planId: 'invalid-id',
          week: 0, // Invalid week
          day: 8, // Invalid day
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/workouts/sessions')
        .send(sessionRequest)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /workouts/sessions/:id/logs', () => {
    const exerciseLog = {
      exerciseId: '', // Will be set after getting exercise
      sets: [
        { reps: 10, weight: 135, restTime: 60 },
        { reps: 8, weight: 145, restTime: 60 },
        { reps: 6, weight: 155, restTime: 90 },
      ],
      notes: 'Felt strong today, good form throughout',
    };

    beforeAll(async () => {
      // Get available exercises to use in logs
      const exerciseResponse = await request(app)
        .get('/exercises?search=Barbell Bench Press')
        .set('Authorization', `Bearer ${authToken}`);
      
      if (exerciseResponse.body.exercises && exerciseResponse.body.exercises.length > 0) {
        exerciseLog.exerciseId = exerciseResponse.body.exercises[0].id;
      }
    });

    it('should log exercise performance in session', async () => {
      const response = await request(app)
        .post(`/workouts/sessions/${workoutSessionId}/logs`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(exerciseLog)
        .expect(201);

      expect(response.body).toHaveProperty('log');
      expect(response.body.log).toHaveProperty('id');
      expect(response.body.log.sets).toHaveLength(3);
    });

    it('should return 400 for invalid exercise log', async () => {
      const response = await request(app)
        .post(`/workouts/sessions/${workoutSessionId}/logs`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          exerciseId: 'invalid-id',
          sets: [], // Empty sets array
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent session', async () => {
      const response = await request(app)
        .post('/workouts/sessions/non-existent-id/logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(exerciseLog)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post(`/workouts/sessions/${workoutSessionId}/logs`)
        .send(exerciseLog)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /workouts/sessions/:id/complete', () => {
    const sessionCompletion = {
      notes: 'Great workout! Hit all target reps and weights.',
      rating: 4,
    };

    it('should complete a workout session', async () => {
      const response = await request(app)
        .put(`/workouts/sessions/${workoutSessionId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(sessionCompletion)
        .expect(200);

      expect(response.body).toHaveProperty('session');
      expect(response.body.session.status).toBe('completed');
      expect(response.body.session.completedAt).toBeTruthy();
    });

    it('should return 400 for invalid completion data', async () => {
      const response = await request(app)
        .put(`/workouts/sessions/${workoutSessionId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rating: 6, // Invalid rating (should be 1-5)
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent session', async () => {
      const response = await request(app)
        .put('/workouts/sessions/non-existent-id/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sessionCompletion)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put(`/workouts/sessions/${workoutSessionId}/complete`)
        .send(sessionCompletion)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /workouts/sessions', () => {
    it('should retrieve user workout sessions', async () => {
      const response = await request(app)
        .get('/workouts/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('sessions');
      expect(Array.isArray(response.body.sessions)).toBe(true);
      expect(response.body.sessions.length).toBeGreaterThan(0);
    });

    it('should filter sessions by status', async () => {
      const response = await request(app)
        .get('/workouts/sessions?status=completed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('sessions');
      expect(response.body.sessions.every((session: any) => session.status === 'completed')).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/workouts/sessions')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});