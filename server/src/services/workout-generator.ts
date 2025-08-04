import { db, Exercise, WorkoutPlan, NewWorkoutPlan } from '../db';
import { exercises, workoutPlans } from '../db/schema';
import { eq, inArray, sql } from 'drizzle-orm';

export interface PlanGenerationRequest {
  userId: string;
  fitnessGoals: string[]; // goal IDs
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  availableEquipment: string[]; // equipment IDs
  workoutsPerWeek: number;
  timePerWorkout: number; // minutes
}

export interface GeneratedWorkout {
  day: number;
  name: string;
  estimatedDuration: number;
  exercises: {
    exerciseId: string;
    sets: number;
    reps: string;
    weight?: number;
    restSeconds: number;
    notes?: string;
  }[];
}

export interface GeneratedWeek {
  weekNumber: number;
  theme: string;
  workouts: GeneratedWorkout[];
}

export class WorkoutPlanGenerator {
  private exercisePool: Exercise[] = [];
  
  constructor() {}

  private async loadExercisePool(equipmentIds: string[]): Promise<void> {
    // Load exercises that match available equipment
    this.exercisePool = await db
      .select()
      .from(exercises)
      .where(
        sql`${exercises.isActive} = true AND ${exercises.equipmentNeeded} && ${equipmentIds}`
      );
  }

  private getExercisesByMuscleGroup(muscleGroupIds: string[]): Exercise[] {
    return this.exercisePool.filter(exercise =>
      exercise.primaryMuscleGroups.some(mgId => muscleGroupIds.includes(mgId))
    );
  }

  private calculateSetsAndReps(
    experienceLevel: 'beginner' | 'intermediate' | 'advanced',
    goalType: string,
    weekNumber: number
  ): { sets: number; reps: string } {
    const baseProgression = {
      beginner: { sets: 3, reps: '8-12' },
      intermediate: { sets: 4, reps: '6-10' },
      advanced: { sets: 4, reps: '4-8' },
    };

    let config = baseProgression[experienceLevel];

    // Adjust based on goals
    if (goalType === 'strength') {
      config = { sets: config.sets, reps: '3-6' };
    } else if (goalType === 'hypertrophy') {
      config = { sets: config.sets + 1, reps: '8-15' };
    } else if (goalType === 'endurance') {
      config = { sets: config.sets, reps: '12-20' };
    }

    // Progressive overload by week
    const weekProgression = Math.floor((weekNumber - 1) / 2);
    config.sets = Math.min(config.sets + weekProgression, 6);

    return config;
  }

  private calculateRestPeriods(exerciseType: 'compound' | 'isolation', goalType: string): number {
    const restPeriods = {
      strength: { compound: 180, isolation: 120 },
      hypertrophy: { compound: 90, isolation: 60 },
      endurance: { compound: 60, isolation: 45 },
    };

    return restPeriods[goalType as keyof typeof restPeriods]?.[exerciseType] || 90;
  }

  private generateWorkoutSplit(
    workoutsPerWeek: number,
    experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  ): { name: string; muscleGroups: string[] }[] {
    const splits = {
      2: [
        { name: 'Upper Body', muscleGroups: ['chest', 'back', 'shoulders', 'arms'] },
        { name: 'Lower Body', muscleGroups: ['legs', 'glutes', 'calves'] },
      ],
      3: [
        { name: 'Push (Chest, Shoulders, Triceps)', muscleGroups: ['chest', 'shoulders', 'triceps'] },
        { name: 'Pull (Back, Biceps)', muscleGroups: ['back', 'biceps'] },
        { name: 'Legs (Quads, Hamstrings, Glutes)', muscleGroups: ['legs', 'glutes', 'calves'] },
      ],
      4: [
        { name: 'Chest & Triceps', muscleGroups: ['chest', 'triceps'] },
        { name: 'Back & Biceps', muscleGroups: ['back', 'biceps'] },
        { name: 'Shoulders & Core', muscleGroups: ['shoulders', 'core'] },
        { name: 'Legs & Glutes', muscleGroups: ['legs', 'glutes', 'calves'] },
      ],
      5: [
        { name: 'Chest', muscleGroups: ['chest'] },
        { name: 'Back', muscleGroups: ['back'] },
        { name: 'Shoulders', muscleGroups: ['shoulders'] },
        { name: 'Arms', muscleGroups: ['biceps', 'triceps'] },
        { name: 'Legs', muscleGroups: ['legs', 'glutes', 'calves'] },
      ],
    };

    return splits[workoutsPerWeek as keyof typeof splits] || splits[3];
  }

  private selectExercisesForWorkout(
    muscleGroups: string[],
    timeLimit: number,
    experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  ): Exercise[] {
    const availableExercises = this.getExercisesByMuscleGroup(muscleGroups);
    
    // Prioritize compound movements for beginners
    const compoundExercises = availableExercises.filter(ex => ex.isCompound);
    const isolationExercises = availableExercises.filter(ex => !ex.isCompound);

    const selectedExercises: Exercise[] = [];
    const exerciseCount = experienceLevel === 'beginner' ? 4 : experienceLevel === 'intermediate' ? 6 : 8;

    // Add compound exercises first
    const compoundCount = Math.min(compoundExercises.length, Math.ceil(exerciseCount * 0.6));
    selectedExercises.push(...compoundExercises.slice(0, compoundCount));

    // Fill remaining slots with isolation exercises
    const remainingSlots = exerciseCount - selectedExercises.length;
    selectedExercises.push(...isolationExercises.slice(0, remainingSlots));

    return selectedExercises.slice(0, exerciseCount);
  }

  async generatePlan(request: PlanGenerationRequest): Promise<WorkoutPlan> {
    await this.loadExercisePool(request.availableEquipment);

    const templateType = this.determineTemplateType(request.fitnessGoals);
    const workoutSplit = this.generateWorkoutSplit(request.workoutsPerWeek, request.experienceLevel);
    
    const weeks: GeneratedWeek[] = [];

    // Generate 4 weeks of workouts
    for (let weekNum = 1; weekNum <= 4; weekNum++) {
      const weekTheme = this.getWeekTheme(weekNum, templateType);
      const workouts: GeneratedWorkout[] = [];

      for (let dayNum = 1; dayNum <= request.workoutsPerWeek; dayNum++) {
        const splitIndex = (dayNum - 1) % workoutSplit.length;
        const dayMuscleGroups = workoutSplit[splitIndex].muscleGroups;
        const dayName = workoutSplit[splitIndex].name;

        const selectedExercises = this.selectExercisesForWorkout(
          dayMuscleGroups,
          request.timePerWorkout,
          request.experienceLevel
        );

        const workout: GeneratedWorkout = {
          day: dayNum,
          name: dayName,
          estimatedDuration: request.timePerWorkout,
          exercises: selectedExercises.map(exercise => {
            const { sets, reps } = this.calculateSetsAndReps(
              request.experienceLevel,
              templateType,
              weekNum
            );
            const restSeconds = this.calculateRestPeriods(
              exercise.isCompound ? 'compound' : 'isolation',
              templateType
            );

            return {
              exerciseId: exercise.id,
              sets,
              reps,
              restSeconds,
              notes: weekNum === 1 ? 'Focus on form and technique' : undefined,
            };
          }),
        };

        workouts.push(workout);
      }

      weeks.push({
        weekNumber: weekNum,
        theme: weekTheme,
        workouts,
      });
    }

    // Create workout plan in database
    const planData: NewWorkoutPlan = {
      userId: request.userId,
      name: `${templateType.charAt(0).toUpperCase() + templateType.slice(1)} Training Plan`,
      description: `4-week ${templateType} focused training program`,
      duration: 4,
      workoutsPerWeek: request.workoutsPerWeek,
      templateType: templateType as 'strength' | 'hypertrophy' | 'endurance',
      planStructure: { weeks },
      isActive: true,
    };

    const [newPlan] = await db.insert(workoutPlans).values(planData).returning();
    return newPlan;
  }

  private determineTemplateType(fitnessGoals: string[]): string {
    // This would normally query the fitness goals table, but for now we'll use simple logic
    if (fitnessGoals.includes('get_stronger')) return 'strength';
    if (fitnessGoals.includes('build_muscle')) return 'hypertrophy';
    if (fitnessGoals.includes('improve_endurance')) return 'endurance';
    return 'hypertrophy'; // default
  }

  private getWeekTheme(weekNumber: number, templateType: string): string {
    const themes = {
      strength: [
        'Foundation Building',
        'Progressive Loading',
        'Peak Intensity', 
        'Power & Testing'
      ],
      hypertrophy: [
        'Muscle Activation',
        'Volume Increase',
        'Metabolic Stress',
        'Peak Hypertrophy'
      ],
      endurance: [
        'Base Building',
        'Aerobic Development',
        'Lactate Threshold',
        'Peak Endurance'
      ],
    };

    return themes[templateType as keyof typeof themes]?.[weekNumber - 1] || `Week ${weekNumber}`;
  }
}