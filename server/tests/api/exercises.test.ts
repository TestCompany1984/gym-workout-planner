import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';

describe('Exercises API', () => {
  let authToken: string;

  beforeAll(async () => {
    // Create test user and authenticate
    const signUpResponse = await request(app)
      .post('/api/auth/sign-up')
      .send({
        email: 'exercise-test@example.com',
        password: 'TestPassword123!',
        name: 'Exercise Test User',
      });

    authToken = signUpResponse.body.token;
  });

  describe('GET /exercises', () => {
    it('should retrieve all exercises', async () => {
      const response = await request(app)
        .get('/exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('exercises');
      expect(Array.isArray(response.body.exercises)).toBe(true);
      expect(response.body.exercises.length).toBeGreaterThan(0);
      
      // Check exercise structure
      const exercise = response.body.exercises[0];
      expect(exercise).toHaveProperty('id');
      expect(exercise).toHaveProperty('name');
      expect(exercise).toHaveProperty('description');
      expect(exercise).toHaveProperty('primaryMuscleGroups');
      expect(exercise).toHaveProperty('equipmentNeeded');
      expect(exercise).toHaveProperty('difficulty');
    });

    it('should filter exercises by muscle group', async () => {
      const response = await request(app)
        .get('/exercises?muscleGroup=Chest')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('exercises');
      expect(response.body.exercises.length).toBeGreaterThan(0);
      
      // All exercises should target chest
      response.body.exercises.forEach((exercise: any) => {
        expect(exercise.primaryMuscleGroups.some((mg: any) => mg.name === 'Chest')).toBe(true);
      });
    });

    it('should filter exercises by equipment', async () => {
      const response = await request(app)
        .get('/exercises?equipment=Bodyweight Only')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('exercises');
      expect(response.body.exercises.length).toBeGreaterThan(0);
      
      // All exercises should use bodyweight only
      response.body.exercises.forEach((exercise: any) => {
        expect(exercise.equipmentNeeded.some((eq: any) => eq.name === 'Bodyweight Only')).toBe(true);
      });
    });

    it('should search exercises by name', async () => {
      const response = await request(app)
        .get('/exercises?search=push')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('exercises');
      expect(response.body.exercises.length).toBeGreaterThan(0);
      
      // All exercises should contain 'push' in name or description
      response.body.exercises.forEach((exercise: any) => {
        const containsPush = exercise.name.toLowerCase().includes('push') || 
                            exercise.description.toLowerCase().includes('push');
        expect(containsPush).toBe(true);
      });
    });

    it('should filter exercises by difficulty', async () => {
      const response = await request(app)
        .get('/exercises?difficulty=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('exercises');
      
      // All exercises should have difficulty 1
      response.body.exercises.forEach((exercise: any) => {
        expect(exercise.difficulty).toBe(1);
      });
    });

    it('should filter compound exercises', async () => {
      const response = await request(app)
        .get('/exercises?compound=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('exercises');
      
      // All exercises should be compound
      response.body.exercises.forEach((exercise: any) => {
        expect(exercise.isCompound).toBe(true);
      });
    });

    it('should apply pagination', async () => {
      const response = await request(app)
        .get('/exercises?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('exercises');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.exercises.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/exercises')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /exercises/:id', () => {
    let exerciseId: string;

    beforeAll(async () => {
      // Get an exercise ID for testing
      const exercisesResponse = await request(app)
        .get('/exercises')
        .set('Authorization', `Bearer ${authToken}`);
      
      if (exercisesResponse.body.exercises && exercisesResponse.body.exercises.length > 0) {
        exerciseId = exercisesResponse.body.exercises[0].id;
      }
    });

    it('should retrieve specific exercise details', async () => {
      const response = await request(app)
        .get(`/exercises/${exerciseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('exercise');
      
      const exercise = response.body.exercise;
      expect(exercise).toHaveProperty('id');
      expect(exercise).toHaveProperty('name');
      expect(exercise).toHaveProperty('description');
      expect(exercise).toHaveProperty('instructions');
      expect(exercise).toHaveProperty('primaryMuscleGroups');
      expect(exercise).toHaveProperty('secondaryMuscleGroups');
      expect(exercise).toHaveProperty('equipmentNeeded');
      expect(exercise).toHaveProperty('commonMistakes');
      expect(exercise).toHaveProperty('tips');
      expect(exercise).toHaveProperty('difficulty');
      expect(exercise).toHaveProperty('isCompound');
    });

    it('should return 404 for non-existent exercise', async () => {
      const response = await request(app)
        .get('/exercises/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get(`/exercises/${exerciseId}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /exercises/muscle-groups', () => {
    it('should retrieve all muscle groups', async () => {
      const response = await request(app)
        .get('/exercises/muscle-groups')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('muscleGroups');
      expect(Array.isArray(response.body.muscleGroups)).toBe(true);
      expect(response.body.muscleGroups.length).toBeGreaterThan(0);
      
      // Check muscle group structure
      const muscleGroup = response.body.muscleGroups[0];
      expect(muscleGroup).toHaveProperty('id');
      expect(muscleGroup).toHaveProperty('name');
      expect(muscleGroup).toHaveProperty('category');
      expect(muscleGroup).toHaveProperty('description');
    });

    it('should filter muscle groups by category', async () => {
      const response = await request(app)
        .get('/exercises/muscle-groups?category=primary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('muscleGroups');
      
      // All muscle groups should be primary
      response.body.muscleGroups.forEach((muscleGroup: any) => {
        expect(muscleGroup.category).toBe('primary');
      });
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/exercises/muscle-groups')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /exercises/categories', () => {
    it('should retrieve all exercise categories', async () => {
      const response = await request(app)
        .get('/exercises/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('categories');
      expect(Array.isArray(response.body.categories)).toBe(true);
      expect(response.body.categories.length).toBeGreaterThan(0);
      
      // Check category structure
      const category = response.body.categories[0];
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('description');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/exercises/categories')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /exercises/equipment', () => {
    it('should retrieve all equipment types', async () => {
      const response = await request(app)
        .get('/exercises/equipment')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('equipment');
      expect(Array.isArray(response.body.equipment)).toBe(true);
      expect(response.body.equipment.length).toBeGreaterThan(0);
      
      // Check equipment structure
      const equipment = response.body.equipment[0];
      expect(equipment).toHaveProperty('id');
      expect(equipment).toHaveProperty('name');
      expect(equipment).toHaveProperty('category');
      expect(equipment).toHaveProperty('description');
    });

    it('should filter equipment by category', async () => {
      const response = await request(app)
        .get('/exercises/equipment?category=weights')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('equipment');
      
      // All equipment should be weights category
      response.body.equipment.forEach((equipment: any) => {
        expect(equipment.category).toBe('weights');
      });
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/exercises/equipment')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});