import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';

describe('Authentication API', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User',
  };

  let authToken: string;

  describe('POST /api/auth/sign-up', () => {
    it('should create a new user account', async () => {
      const response = await request(app)
        .post('/api/auth/sign-up')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body).toHaveProperty('token');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/sign-up')
        .send({
          ...testUser,
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/sign-up')
        .send({
          ...testUser,
          email: 'test2@example.com',
          password: '123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 409 for duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/sign-up')
        .send(testUser)
        .expect(409);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/sign-in', () => {
    it('should authenticate user with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/sign-in')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      authToken = response.body.token;
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/sign-in')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/sign-in')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /profile', () => {
    it('should return user profile when authenticated', async () => {
      const response = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /profile', () => {
    const profileUpdate = {
      fitnessLevel: 'intermediate' as const,
      primaryGoals: ['build_muscle', 'get_stronger'],
      availableEquipment: ['Barbell', 'Dumbbells', 'Bench'],
      workoutsPerWeek: 4,
      workoutDuration: 60,
      age: 28,
      weight: 75,
      height: 180,
    };

    it('should update user profile when authenticated', async () => {
      const response = await request(app)
        .put('/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileUpdate)
        .expect(200);

      expect(response.body).toHaveProperty('profile');
      expect(response.body.profile.fitnessLevel).toBe(profileUpdate.fitnessLevel);
      expect(response.body.profile.workoutsPerWeek).toBe(profileUpdate.workoutsPerWeek);
    });

    it('should return 400 for invalid profile data', async () => {
      const response = await request(app)
        .put('/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fitnessLevel: 'invalid',
          workoutsPerWeek: 'not-a-number',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put('/profile')
        .send(profileUpdate)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/sign-out', () => {
    it('should sign out user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/sign-out')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/auth/sign-out')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /stats', () => {
    beforeAll(async () => {
      // Re-authenticate for stats tests
      const authResponse = await request(app)
        .post('/api/auth/sign-in')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      authToken = authResponse.body.token;
    });

    it('should return user statistics when authenticated', async () => {
      const response = await request(app)
        .get('/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('totalWorkouts');
      expect(response.body.stats).toHaveProperty('totalVolume');
      expect(response.body.stats).toHaveProperty('currentStreak');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/stats')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});