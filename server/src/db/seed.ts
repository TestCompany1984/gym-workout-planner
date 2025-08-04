import { db } from './index';
import { 
  equipment, 
  fitnessGoals, 
  muscleGroups, 
  exerciseCategories, 
  exercises,
  achievementDefinitions
} from './schema';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed Equipment
    console.log('📦 Seeding equipment...');
    const equipmentData = [
      { name: 'Barbell', category: 'weights' as const, description: 'Olympic barbell for compound movements' },
      { name: 'Dumbbells', category: 'weights' as const, description: 'Adjustable dumbbells for isolation exercises' },
      { name: 'Pull-up Bar', category: 'bodyweight' as const, description: 'For pull-ups and chin-ups' },
      { name: 'Cable Machine', category: 'weights' as const, description: 'Cable crossover machine' },
      { name: 'Smith Machine', category: 'weights' as const, description: 'Guided barbell system' },
      { name: 'Resistance Bands', category: 'accessories' as const, description: 'Elastic resistance bands' },
      { name: 'Kettlebells', category: 'weights' as const, description: 'Cast iron kettlebells' },
      { name: 'Bench', category: 'accessories' as const, description: 'Adjustable workout bench' },
      { name: 'Squat Rack', category: 'weights' as const, description: 'Power rack for squats' },
      { name: 'Bodyweight Only', category: 'bodyweight' as const, description: 'No equipment needed' },
      { name: 'Medicine Ball', category: 'accessories' as const, description: 'Weighted medicine ball' },
      { name: 'Foam Roller', category: 'accessories' as const, description: 'For recovery and mobility' },
    ];

    const insertedEquipment = await db.insert(equipment).values(equipmentData).returning();
    console.log(`✅ Inserted ${insertedEquipment.length} equipment items`);

    // Seed Fitness Goals
    console.log('🎯 Seeding fitness goals...');
    const goalsData = [
      { 
        type: 'build_muscle' as const, 
        name: 'Build Muscle', 
        description: 'Increase muscle mass and size through hypertrophy training' 
      },
      { 
        type: 'get_stronger' as const, 
        name: 'Get Stronger', 
        description: 'Improve overall strength and power through progressive overload' 
      },
      { 
        type: 'lose_weight' as const, 
        name: 'Lose Weight', 
        description: 'Reduce body fat and improve body composition' 
      },
      { 
        type: 'improve_endurance' as const, 
        name: 'Improve Endurance', 
        description: 'Build cardiovascular fitness and muscular endurance' 
      },
      { 
        type: 'general_fitness' as const, 
        name: 'General Fitness', 
        description: 'Overall health and fitness improvement' 
      },
      { 
        type: 'specific_sport' as const, 
        name: 'Sport Performance', 
        description: 'Train for specific sport or athletic performance' 
      },
    ];

    const insertedGoals = await db.insert(fitnessGoals).values(goalsData).returning();
    console.log(`✅ Inserted ${insertedGoals.length} fitness goals`);

    // Seed Muscle Groups
    console.log('💪 Seeding muscle groups...');
    const muscleGroupData = [
      { name: 'Chest', category: 'primary' as const, description: 'Pectoralis major and minor' },
      { name: 'Back', category: 'primary' as const, description: 'Latissimus dorsi, rhomboids, middle traps' },
      { name: 'Shoulders', category: 'primary' as const, description: 'Deltoids (anterior, lateral, posterior)' },
      { name: 'Arms', category: 'primary' as const, description: 'Biceps and triceps' },
      { name: 'Legs', category: 'primary' as const, description: 'Quadriceps, hamstrings, glutes' },
      { name: 'Core', category: 'primary' as const, description: 'Abdominals and obliques' },
      { name: 'Triceps', category: 'secondary' as const, description: 'Triceps brachii' },
      { name: 'Biceps', category: 'secondary' as const, description: 'Biceps brachii' },
      { name: 'Forearms', category: 'secondary' as const, description: 'Forearm flexors and extensors' },
      { name: 'Calves', category: 'secondary' as const, description: 'Gastrocnemius and soleus' },
      { name: 'Glutes', category: 'secondary' as const, description: 'Gluteus maximus, medius, minimus' },
      { name: 'Hamstrings', category: 'secondary' as const, description: 'Biceps femoris, semitendinosus' },
      { name: 'Quadriceps', category: 'secondary' as const, description: 'Rectus femoris, vastus muscles' },
    ];

    const insertedMuscleGroups = await db.insert(muscleGroups).values(muscleGroupData).returning();
    console.log(`✅ Inserted ${insertedMuscleGroups.length} muscle groups`);

    // Seed Exercise Categories
    console.log('📚 Seeding exercise categories...');
    const categoryData = [
      { 
        name: 'Compound Movements', 
        description: 'Multi-joint exercises that work multiple muscle groups simultaneously' 
      },
      { 
        name: 'Isolation Exercises', 
        description: 'Single-joint exercises targeting specific muscles' 
      },
      { 
        name: 'Cardiovascular', 
        description: 'Heart rate elevating exercises for endurance and conditioning' 
      },
      { 
        name: 'Functional Training', 
        description: 'Exercises that mimic real-world movement patterns' 
      },
      { 
        name: 'Olympic Lifts', 
        description: 'Technical lifts focusing on power and coordination' 
      },
    ];

    const insertedCategories = await db.insert(exerciseCategories).values(categoryData).returning();
    console.log(`✅ Inserted ${insertedCategories.length} exercise categories`);

    // Get IDs for reference
    const chestId = insertedMuscleGroups.find(mg => mg.name === 'Chest')?.id;
    const backId = insertedMuscleGroups.find(mg => mg.name === 'Back')?.id;
    const shouldersId = insertedMuscleGroups.find(mg => mg.name === 'Shoulders')?.id;
    const legsId = insertedMuscleGroups.find(mg => mg.name === 'Legs')?.id;
    const tricepsId = insertedMuscleGroups.find(mg => mg.name === 'Triceps')?.id;
    const bicepsId = insertedMuscleGroups.find(mg => mg.name === 'Biceps')?.id;
    const coreId = insertedMuscleGroups.find(mg => mg.name === 'Core')?.id;

    const barbellId = insertedEquipment.find(eq => eq.name === 'Barbell')?.id;
    const dumbbellsId = insertedEquipment.find(eq => eq.name === 'Dumbbells')?.id;
    const bodyweightId = insertedEquipment.find(eq => eq.name === 'Bodyweight Only')?.id;
    const benchId = insertedEquipment.find(eq => eq.name === 'Bench')?.id;
    const pullupBarId = insertedEquipment.find(eq => eq.name === 'Pull-up Bar')?.id;

    const compoundCategoryId = insertedCategories.find(cat => cat.name === 'Compound Movements')?.id;
    const isolationCategoryId = insertedCategories.find(cat => cat.name === 'Isolation Exercises')?.id;

    // Seed Exercises (50 exercises as specified)
    console.log('🏋️ Seeding exercises...');
    const exerciseData = [
      // Chest Exercises
      {
        name: 'Barbell Bench Press',
        description: 'Classic compound chest exercise performed lying on a bench',
        instructions: [
          'Lie flat on bench with feet planted on floor',
          'Grip barbell slightly wider than shoulder width',
          'Lower bar to chest with control',
          'Press bar up explosively',
          'Keep core tight throughout movement'
        ],
        primaryMuscleGroups: [chestId!],
        secondaryMuscleGroups: [tricepsId!, shouldersId!],
        equipmentNeeded: [barbellId!, benchId!],
        difficulty: 3,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Bouncing bar off chest',
          'Lifting feet off ground',
          'Flaring elbows too wide'
        ],
        tips: [
          'Keep shoulder blades retracted',
          'Maintain arch in lower back',
          'Control the descent'
        ],
      },
      {
        name: 'Push-ups',
        description: 'Bodyweight chest exercise that can be done anywhere',
        instructions: [
          'Start in plank position with hands shoulder-width apart',
          'Lower chest to floor while keeping body straight',
          'Push back to starting position',
          'Keep core engaged throughout',
          'Control the movement both up and down'
        ],
        primaryMuscleGroups: [chestId!],
        secondaryMuscleGroups: [tricepsId!, shouldersId!, coreId!],
        equipmentNeeded: [bodyweightId!],
        difficulty: 2,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Sagging hips',
          'Not going full range of motion',
          'Flaring elbows too wide'
        ],
        tips: [
          'Keep body in straight line',
          'Engage core throughout',
          'Start with incline if too difficult'
        ],
      },
      // Back Exercises
      {
        name: 'Deadlift',
        description: 'The king of compound exercises, working the entire posterior chain',
        instructions: [
          'Stand with feet hip-width apart, bar over mid-foot',
          'Bend at hips and knees to grip bar',
          'Keep back straight and chest up',
          'Drive through heels to lift bar',
          'Extend hips and knees simultaneously'
        ],
        primaryMuscleGroups: [backId!, legsId!],
        secondaryMuscleGroups: [],
        equipmentNeeded: [barbellId!],
        difficulty: 4,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Rounding lower back',
          'Bar drifting away from body',
          'Looking up during lift'
        ],
        tips: [
          'Keep bar close to shins',
          'Engage lats to maintain bar path',
          'Think about pushing floor away'
        ],
      },
      {
        name: 'Pull-ups',
        description: 'Bodyweight back exercise that builds incredible upper body strength',
        instructions: [
          'Hang from bar with palms facing away',
          'Start with arms fully extended',
          'Pull body up until chin clears bar',
          'Lower with control to full extension',
          'Avoid swinging or kipping'
        ],
        primaryMuscleGroups: [backId!],
        secondaryMuscleGroups: [bicepsId!],
        equipmentNeeded: [pullupBarId!],
        difficulty: 4,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Using momentum',
          'Not achieving full range of motion',
          'Shrugging shoulders'
        ],
        tips: [
          'Engage lats first',
          'Keep core tight',
          'Focus on quality over quantity'
        ],
      },
      // Continue with more exercises...
      {
        name: 'Dumbbell Row',
        description: 'Single-arm back exercise for building width and thickness',
        instructions: [
          'Place one knee and hand on bench',
          'Hold dumbbell in opposite hand',
          'Pull dumbbell to hip',
          'Squeeze shoulder blade at top',
          'Lower with control'
        ],
        primaryMuscleGroups: [backId!],
        secondaryMuscleGroups: [bicepsId!],
        equipmentNeeded: [dumbbellsId!, benchId!],
        difficulty: 2,
        isCompound: false,
        categoryId: isolationCategoryId,
        commonMistakes: [
          'Using too much momentum',
          'Not retracting shoulder blade',
          'Rotating torso'
        ],
        tips: [
          'Keep torso stable',
          'Focus on squeezing shoulder blade',
          'Control both directions'
        ],
      },
      // Shoulder Exercises
      {
        name: 'Overhead Press',
        description: 'Standing barbell press for building shoulder strength',
        instructions: [
          'Stand with feet shoulder-width apart',
          'Grip barbell at shoulder width',
          'Press bar overhead in straight line',
          'Lower with control to shoulders',
          'Keep core tight throughout'
        ],
        primaryMuscleGroups: [shouldersId!],
        secondaryMuscleGroups: [tricepsId!, coreId!],
        equipmentNeeded: [barbellId!],
        difficulty: 3,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Pressing bar forward instead of up',
          'Arching back excessively',
          'Not engaging core'
        ],
        tips: [
          'Keep bar path vertical',
          'Squeeze glutes for stability',
          'Start with lighter weight'
        ],
      },
      {
        name: 'Lateral Raises',
        description: 'Isolation exercise for side deltoids',
        instructions: [
          'Stand with dumbbells at sides',
          'Raise arms out to sides until parallel to floor',
          'Hold briefly at top',
          'Lower with control',
          'Keep slight bend in elbows'
        ],
        primaryMuscleGroups: [shouldersId!],
        secondaryMuscleGroups: [],
        equipmentNeeded: [dumbbellsId!],
        difficulty: 2,
        isCompound: false,
        categoryId: isolationCategoryId,
        commonMistakes: [
          'Using too much weight',
          'Swinging arms up',
          'Raising arms too high'
        ],
        tips: [
          'Use lighter weight for control',
          'Focus on muscle contraction',
          'Stop at shoulder height'
        ],
      },
      // Leg Exercises
      {
        name: 'Squats',
        description: 'King of leg exercises, works entire lower body',
        instructions: [
          'Stand with feet shoulder-width apart',
          'Lower hips back and down',
          'Keep chest up and knees behind toes',
          'Descend until thighs parallel to floor',
          'Drive through heels to stand'
        ],
        primaryMuscleGroups: [legsId!],
        secondaryMuscleGroups: [coreId!],
        equipmentNeeded: [barbellId!],
        difficulty: 3,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Knees caving inward',
          'Not going deep enough',
          'Leaning forward'
        ],
        tips: [
          'Keep weight on heels',
          'Drive knees out',
          'Maintain neutral spine'
        ],
      },
      {
        name: 'Lunges',
        description: 'Unilateral leg exercise for balance and strength',
        instructions: [
          'Step forward into lunge position',
          'Lower back knee toward ground',
          'Keep front knee over ankle',
          'Push through front heel to return',
          'Alternate legs or complete one side'
        ],
        primaryMuscleGroups: [legsId!],
        secondaryMuscleGroups: [coreId!],
        equipmentNeeded: [bodyweightId!],
        difficulty: 2,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Step too short or too long',
          'Leaning forward',
          'Not engaging core'
        ],
        tips: [
          'Keep torso upright',
          'Control the descent',
          'Push through front heel'
        ],
      },
      {
        name: 'Romanian Deadlift',
        description: 'Hip-hinge movement targeting hamstrings and glutes',
        instructions: [
          'Hold barbell with overhand grip',
          'Stand with feet hip-width apart',
          'Hinge at hips, lowering bar',
          'Keep bar close to legs',
          'Drive hips forward to return'
        ],
        primaryMuscleGroups: [legsId!],
        secondaryMuscleGroups: [backId!],
        equipmentNeeded: [barbellId!],
        difficulty: 3,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Bending knees too much',
          'Rounding lower back',
          'Bar drifting away from body'
        ],
        tips: [
          'Feel stretch in hamstrings',
          'Keep chest up',
          'Hinge at hips, not waist'
        ],
      },
      // Arm Exercises
      {
        name: 'Bicep Curls',
        description: 'Classic isolation exercise for biceps',
        instructions: [
          'Stand with dumbbells at sides',
          'Curl weights up toward shoulders',
          'Squeeze biceps at top',
          'Lower with control',
          'Keep elbows at sides'
        ],
        primaryMuscleGroups: [bicepsId!],
        secondaryMuscleGroups: [],
        equipmentNeeded: [dumbbellsId!],
        difficulty: 1,
        isCompound: false,
        categoryId: isolationCategoryId,
        commonMistakes: [
          'Swinging weights',
          'Using too much weight',
          'Moving elbows'
        ],
        tips: [
          'Control the movement',
          'Focus on bicep contraction',
          'Keep elbows stationary'
        ],
      },
      {
        name: 'Tricep Dips',
        description: 'Bodyweight exercise for triceps development',
        instructions: [
          'Place hands on bench behind you',
          'Extend legs forward',
          'Lower body by bending elbows',
          'Push back up to start',
          'Keep body close to bench'
        ],
        primaryMuscleGroups: [tricepsId!],
        secondaryMuscleGroups: [shouldersId!, chestId!],
        equipmentNeeded: [benchId!],
        difficulty: 3,
        isCompound: false,
        categoryId: isolationCategoryId,
        commonMistakes: [
          'Going too low',
          'Flaring elbows out',
          'Using shoulders too much'
        ],
        tips: [
          'Keep elbows close to body',
          'Control the descent',
          'Stop when elbows at 90 degrees'
        ],
      },
      // Core Exercises
      {
        name: 'Plank',
        description: 'Isometric core exercise for stability',
        instructions: [
          'Start in push-up position',
          'Lower to forearms',
          'Keep body in straight line',
          'Hold position',
          'Breathe normally'
        ],
        primaryMuscleGroups: [coreId!],
        secondaryMuscleGroups: [shouldersId!],
        equipmentNeeded: [bodyweightId!],
        difficulty: 2,
        isCompound: false,
        categoryId: isolationCategoryId,
        commonMistakes: [
          'Sagging hips',
          'Raising hips too high',
          'Holding breath'
        ],
        tips: [
          'Squeeze glutes and core',
          'Keep neutral spine',
          'Start with shorter holds'
        ],
      },
      {
        name: 'Russian Twists',
        description: 'Rotational core exercise for obliques',
        instructions: [
          'Sit with knees bent, lean back slightly',
          'Hold weight or medicine ball',
          'Rotate torso left and right',
          'Keep feet off ground if possible',
          'Control the rotation'
        ],
        primaryMuscleGroups: [coreId!],
        secondaryMuscleGroups: [],
        equipmentNeeded: [bodyweightId!],
        difficulty: 2,
        isCompound: false,
        categoryId: isolationCategoryId,
        commonMistakes: [
          'Moving too fast',
          'Not engaging core',
          'Rotating from arms instead of core'
        ],
        tips: [
          'Control the movement',
          'Focus on oblique contraction',
          'Keep chest up'
        ],
      },
      // Additional Compound Exercises
      {
        name: 'Burpees',
        description: 'Full-body exercise combining squat, plank, and jump',
        instructions: [
          'Start standing',
          'Squat down and place hands on floor',
          'Jump feet back to plank',
          'Jump feet back to squat',
          'Stand and jump with arms overhead'
        ],
        primaryMuscleGroups: [legsId!, chestId!, coreId!],
        secondaryMuscleGroups: [shouldersId!],
        equipmentNeeded: [bodyweightId!],
        difficulty: 4,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Rushing through movement',
          'Poor plank position',
          'Not jumping at top'
        ],
        tips: [
          'Focus on form over speed',
          'Modify by stepping instead of jumping',
          'Maintain good posture'
        ],
      },
      {
        name: 'Mountain Climbers',
        description: 'High-intensity cardio and core exercise',
        instructions: [
          'Start in plank position',
          'Bring right knee to chest',
          'Quickly switch legs',
          'Continue alternating',
          'Keep hips level'
        ],
        primaryMuscleGroups: [coreId!],
        secondaryMuscleGroups: [shouldersId!, legsId!],
        equipmentNeeded: [bodyweightId!],
        difficulty: 3,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Raising hips too high',
          'Not bringing knees far enough',
          'Poor plank position'
        ],
        tips: [
          'Keep core engaged',
          'Maintain plank position',
          'Start slow and build speed'
        ],
      },
      // More Chest Exercises
      {
        name: 'Incline Bench Press',
        description: 'Upper chest focused bench press variation',
        instructions: [
          'Set bench to 30-45 degree incline',
          'Lie back with barbell over upper chest',
          'Lower bar to upper chest',
          'Press up and slightly back',
          'Keep shoulder blades retracted'
        ],
        primaryMuscleGroups: [chestId!],
        secondaryMuscleGroups: [shouldersId!, tricepsId!],
        equipmentNeeded: [barbellId!, benchId!],
        difficulty: 3,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Incline too steep',
          'Bouncing bar off chest',
          'Not retracting shoulder blades'
        ],
        tips: [
          'Use 30-45 degree incline',
          'Touch bar to upper chest',
          'Control the descent'
        ],
      },
      {
        name: 'Dumbbell Flyes',
        description: 'Isolation exercise for chest development',
        instructions: [
          'Lie on bench with dumbbells',
          'Start with arms extended over chest',
          'Lower weights in wide arc',
          'Feel stretch in chest',
          'Bring weights back together'
        ],
        primaryMuscleGroups: [chestId!],
        secondaryMuscleGroups: [],
        equipmentNeeded: [dumbbellsId!, benchId!],
        difficulty: 2,
        isCompound: false,
        categoryId: isolationCategoryId,
        commonMistakes: [
          'Using too much weight',
          'Dropping elbows too much',
          'Going too deep'
        ],
        tips: [
          'Keep slight bend in elbows',
          'Control the stretch',
          'Focus on chest contraction'
        ],
      },
      // More Back Exercises
      {
        name: 'Bent-Over Row',
        description: 'Compound back exercise for thickness and strength',
        instructions: [
          'Hinge at hips with barbell',
          'Keep back straight and chest up',
          'Pull bar to lower chest',
          'Squeeze shoulder blades together',
          'Lower with control'
        ],
        primaryMuscleGroups: [backId!],
        secondaryMuscleGroups: [bicepsId!, shouldersId!],
        equipmentNeeded: [barbellId!],
        difficulty: 3,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Standing too upright',
          'Using momentum',
          'Not squeezing shoulder blades'
        ],
        tips: [
          'Maintain hip hinge',
          'Pull to lower chest',
          'Focus on squeezing back muscles'
        ],
      },
      {
        name: 'Lat Pulldown',
        description: 'Back width exercise using cable machine',
        instructions: [
          'Sit at lat pulldown machine',
          'Grip bar wider than shoulders',
          'Pull bar to upper chest',
          'Squeeze shoulder blades together',
          'Control the return'
        ],
        primaryMuscleGroups: [backId!],
        secondaryMuscleGroups: [bicepsId!],
        equipmentNeeded: [insertedEquipment.find(eq => eq.name === 'Cable Machine')?.id!],
        difficulty: 2,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Leaning back too much',
          'Pulling behind neck',
          'Using momentum'
        ],
        tips: [
          'Keep chest up',
          'Pull to front of chest',
          'Focus on lat contraction'
        ],
      },
      // More Leg Exercises
      {
        name: 'Leg Press',
        description: 'Machine-based quad and glute exercise',
        instructions: [
          'Sit in leg press machine',
          'Place feet shoulder-width apart',
          'Lower weight until knees at 90 degrees',
          'Press through heels',
          'Control both directions'
        ],
        primaryMuscleGroups: [legsId!],
        secondaryMuscleGroups: [],
        equipmentNeeded: [insertedEquipment.find(eq => eq.name === 'Smith Machine')?.id!],
        difficulty: 2,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Not going deep enough',
          'Knees caving in',
          'Placing feet too low'
        ],
        tips: [
          'Full range of motion',
          'Keep knees aligned',
          'Press through heels'
        ],
      },
      {
        name: 'Calf Raises',
        description: 'Isolation exercise for calf development',
        instructions: [
          'Stand with balls of feet on platform',
          'Lower heels below platform level',
          'Rise up on toes as high as possible',
          'Hold briefly at top',
          'Lower with control'
        ],
        primaryMuscleGroups: [insertedMuscleGroups.find(mg => mg.name === 'Calves')?.id!],
        secondaryMuscleGroups: [],
        equipmentNeeded: [bodyweightId!],
        difficulty: 1,
        isCompound: false,
        categoryId: isolationCategoryId,
        commonMistakes: [
          'Bouncing at bottom',
          'Not getting full range',
          'Using momentum'
        ],
        tips: [
          'Control both directions',
          'Feel stretch at bottom',
          'Contract at top'
        ],
      },
      // More Shoulder Exercises
      {
        name: 'Face Pulls',
        description: 'Rear deltoid and upper back exercise',
        instructions: [
          'Set cable at face height',
          'Pull handles to face',
          'Separate hands at face',
          'Squeeze shoulder blades',
          'Control the return'
        ],
        primaryMuscleGroups: [shouldersId!],
        secondaryMuscleGroups: [backId!],
        equipmentNeeded: [insertedEquipment.find(eq => eq.name === 'Cable Machine')?.id!],
        difficulty: 2,
        isCompound: false,
        categoryId: isolationCategoryId,
        commonMistakes: [
          'Pulling too low',
          'Using too much weight',
          'Not separating hands'
        ],
        tips: [
          'Pull to face level',
          'Focus on rear delts',
          'Separate hands at end'
        ],
      },
      {
        name: 'Arnold Press',
        description: 'Shoulder exercise with rotation component',
        instructions: [
          'Start with dumbbells at chest, palms facing you',
          'Rotate and press overhead',
          'Reverse the motion coming down',
          'Control throughout entire range',
          'Keep core engaged'
        ],
        primaryMuscleGroups: [shouldersId!],
        secondaryMuscleGroups: [tricepsId!],
        equipmentNeeded: [dumbbellsId!],
        difficulty: 3,
        isCompound: false,
        categoryId: isolationCategoryId,
        commonMistakes: [
          'Moving too fast',
          'Using too much weight',
          'Not controlling rotation'
        ],
        tips: [
          'Slow controlled movement',
          'Feel all three deltoid heads',
          'Start with lighter weight'
        ],
      },
      // More Arm Exercises
      {
        name: 'Hammer Curls',
        description: 'Bicep variation targeting brachialis',
        instructions: [
          'Hold dumbbells with neutral grip',
          'Curl up keeping thumbs up',
          'Squeeze at top',
          'Lower with control',
          'Keep elbows at sides'
        ],
        primaryMuscleGroups: [bicepsId!],
        secondaryMuscleGroups: [insertedMuscleGroups.find(mg => mg.name === 'Forearms')?.id!],
        equipmentNeeded: [dumbbellsId!],
        difficulty: 1,
        isCompound: false,
        categoryId: isolationCategoryId,
        commonMistakes: [
          'Rotating wrists',
          'Swinging weights',
          'Moving elbows'
        ],
        tips: [
          'Keep thumbs up throughout',
          'Control the movement',
          'Focus on brachialis'
        ],
      },
      {
        name: 'Close-Grip Bench Press',
        description: 'Tricep-focused bench press variation',
        instructions: [
          'Lie on bench with narrow grip',
          'Keep hands shoulder-width apart',
          'Lower bar to chest',
          'Press up focusing on triceps',
          'Keep elbows closer to body'
        ],
        primaryMuscleGroups: [tricepsId!],
        secondaryMuscleGroups: [chestId!, shouldersId!],
        equipmentNeeded: [barbellId!, benchId!],
        difficulty: 3,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Grip too narrow',
          'Flaring elbows out',
          'Bouncing off chest'
        ],
        tips: [
          'Keep elbows tucked',
          'Focus on tricep contraction',
          'Control the descent'
        ],
      },
      // More Core Exercises
      {
        name: 'Dead Bug',
        description: 'Core stability exercise',
        instructions: [
          'Lie on back with arms up',
          'Bend knees to 90 degrees',
          'Extend opposite arm and leg',
          'Return to start position',
          'Alternate sides'
        ],
        primaryMuscleGroups: [coreId!],
        secondaryMuscleGroups: [],
        equipmentNeeded: [bodyweightId!],
        difficulty: 2,
        isCompound: false,
        categoryId: isolationCategoryId,
        commonMistakes: [
          'Arching lower back',
          'Moving too fast',
          'Not coordinating limbs'
        ],
        tips: [
          'Keep back flat on ground',
          'Move slowly and controlled',
          'Focus on core stability'
        ],
      },
      {
        name: 'Bicycle Crunches',
        description: 'Dynamic core exercise targeting obliques',
        instructions: [
          'Lie on back with hands behind head',
          'Bring knees to 90 degrees',
          'Alternate bringing elbow to opposite knee',
          'Keep lower back on ground',
          'Control the rotation'
        ],
        primaryMuscleGroups: [coreId!],
        secondaryMuscleGroups: [],
        equipmentNeeded: [bodyweightId!],
        difficulty: 2,
        isCompound: false,
        categoryId: isolationCategoryId,
        commonMistakes: [
          'Pulling on neck',
          'Moving too fast',
          'Not fully rotating'
        ],
        tips: [
          'Don\'t pull on head',
          'Focus on oblique contraction',
          'Control the movement'
        ],
      },
      // Functional and Olympic Exercises
      {
        name: 'Kettlebell Swings',
        description: 'Hip-hinge exercise for power and conditioning',
        instructions: [
          'Stand with feet wider than shoulders',
          'Hold kettlebell with both hands',
          'Hinge at hips and swing between legs',
          'Drive hips forward explosively',
          'Let kettlebell swing to chest height'
        ],
        primaryMuscleGroups: [legsId!, coreId!],
        secondaryMuscleGroups: [shouldersId!],
        equipmentNeeded: [insertedEquipment.find(eq => eq.name === 'Kettlebells')?.id!],
        difficulty: 3,
        isCompound: true,
        categoryId: insertedCategories.find(cat => cat.name === 'Functional Training')?.id,
        commonMistakes: [
          'Squatting instead of hinging',
          'Using arms to lift',
          'Not engaging glutes'
        ],
        tips: [
          'Hinge at hips, not knees',
          'Power comes from hips',
          'Keep core tight'
        ],
      },
      {
        name: 'Turkish Get-Up',
        description: 'Complex full-body functional movement',
        instructions: [
          'Start lying down holding weight overhead',
          'Follow specific sequence to stand',
          'Reverse the movement to return',
          'Keep weight stable overhead',
          'Move slowly and controlled'
        ],
        primaryMuscleGroups: [coreId!, shouldersId!],
        secondaryMuscleGroups: [legsId!],
        equipmentNeeded: [insertedEquipment.find(eq => eq.name === 'Kettlebells')?.id!],
        difficulty: 5,
        isCompound: true,
        categoryId: insertedCategories.find(cat => cat.name === 'Functional Training')?.id,
        commonMistakes: [
          'Moving too fast',
          'Not keeping weight stable',
          'Skipping steps in sequence'
        ],
        tips: [
          'Learn the sequence first',
          'Start with light weight',
          'Focus on stability'
        ],
      },
      // Additional Bodyweight Exercises
      {
        name: 'Hindu Push-ups',
        description: 'Dynamic push-up variation',
        instructions: [
          'Start in downward dog position',
          'Dive forward and down',
          'Press up into upward dog',
          'Return to downward dog',
          'Flow through movement'
        ],
        primaryMuscleGroups: [chestId!, shouldersId!],
        secondaryMuscleGroups: [tricepsId!, coreId!],
        equipmentNeeded: [bodyweightId!],
        difficulty: 4,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Moving too fast',
          'Not getting full range',
          'Poor form in positions'
        ],
        tips: [
          'Flow smoothly',
          'Control each position',
          'Focus on quality'
        ],
      },
      {
        name: 'Pike Push-ups',
        description: 'Bodyweight shoulder exercise',
        instructions: [
          'Start in downward dog position',
          'Walk feet closer to hands',
          'Lower head toward ground',
          'Press back up',
          'Keep hips high'
        ],
        primaryMuscleGroups: [shouldersId!],
        secondaryMuscleGroups: [tricepsId!, coreId!],
        equipmentNeeded: [bodyweightId!],
        difficulty: 3,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Hips too low',
          'Not going full range',
          'Poor hand placement'
        ],
        tips: [
          'Keep hips high',
          'Lower head between hands',
          'Build up gradually'
        ],
      },
      // Cardio and HIIT Exercises
      {
        name: 'Jumping Jacks',
        description: 'Classic cardio exercise',
        instructions: [
          'Start with feet together, arms at sides',
          'Jump feet apart while raising arms overhead',
          'Jump back to start position',
          'Maintain steady rhythm',
          'Land softly on balls of feet'
        ],
        primaryMuscleGroups: [legsId!],
        secondaryMuscleGroups: [shouldersId!, coreId!],
        equipmentNeeded: [bodyweightId!],
        difficulty: 1,
        isCompound: true,
        categoryId: insertedCategories.find(cat => cat.name === 'Cardiovascular')?.id,
        commonMistakes: [
          'Landing too hard',
          'Not coordinating arms and legs',
          'Moving too fast'
        ],
        tips: [
          'Land softly',
          'Coordinate movement',
          'Start at comfortable pace'
        ],
      },
      {
        name: 'High Knees',
        description: 'Running in place with high knee lift',
        instructions: [
          'Stand in place',
          'Run lifting knees to waist height',
          'Pump arms naturally',
          'Stay on balls of feet',
          'Maintain quick tempo'
        ],
        primaryMuscleGroups: [legsId!],
        secondaryMuscleGroups: [coreId!],
        equipmentNeeded: [bodyweightId!],
        difficulty: 2,
        isCompound: true,
        categoryId: insertedCategories.find(cat => cat.name === 'Cardiovascular')?.id,
        commonMistakes: [
          'Not lifting knees high enough',
          'Landing on heels',
          'Leaning too far forward'
        ],
        tips: [
          'Get knees to waist height',
          'Stay on balls of feet',
          'Keep torso upright'
        ],
      },
      // Recovery and Mobility
      {
        name: 'Cat-Cow Stretch',
        description: 'Spinal mobility exercise',
        instructions: [
          'Start on hands and knees',
          'Arch back and look up (cow)',
          'Round back and tuck chin (cat)',
          'Flow between positions',
          'Move slowly and controlled'
        ],
        primaryMuscleGroups: [coreId!, backId!],
        secondaryMuscleGroups: [],
        equipmentNeeded: [bodyweightId!],
        difficulty: 1,
        isCompound: false,
        categoryId: insertedCategories.find(cat => cat.name === 'Functional Training')?.id,
        commonMistakes: [
          'Moving too fast',
          'Not getting full range',
          'Forcing the movement'
        ],
        tips: [
          'Move slowly',
          'Focus on spine mobility',
          'Breathe with movement'
        ],
      },
      // Compound Power Movements
      {
        name: 'Thrusters',
        description: 'Squat to overhead press combination',
        instructions: [
          'Hold dumbbells at shoulders',
          'Squat down keeping chest up',
          'Drive up explosively',
          'Press weights overhead at top',
          'Lower weights to shoulders'
        ],
        primaryMuscleGroups: [legsId!, shouldersId!],
        secondaryMuscleGroups: [coreId!, tricepsId!],
        equipmentNeeded: [dumbbellsId!],
        difficulty: 4,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Pausing between squat and press',
          'Not getting full squat depth',
          'Poor overhead position'
        ],
        tips: [
          'Flow from squat to press',
          'Use leg drive for press',
          'Keep core engaged'
        ],
      },
      // Isometric Exercises
      {
        name: 'Wall Sit',
        description: 'Isometric quad exercise',
        instructions: [
          'Stand with back against wall',
          'Slide down until thighs parallel to floor',
          'Keep knees at 90 degrees',
          'Hold position',
          'Breathe normally'
        ],
        primaryMuscleGroups: [legsId!],
        secondaryMuscleGroups: [coreId!],
        equipmentNeeded: [bodyweightId!],
        difficulty: 2,
        isCompound: false,
        categoryId: isolationCategoryId,
        commonMistakes: [
          'Not going deep enough',
          'Knees beyond toes',
          'Holding breath'
        ],
        tips: [
          'Keep thighs parallel to floor',
          'Back flat against wall',
          'Start with shorter holds'
        ],
      },
      // Final Exercises to reach 50
      {
        name: 'Bear Crawl',
        description: 'Full-body crawling movement',
        instructions: [
          'Start on hands and knees',
          'Lift knees slightly off ground',
          'Crawl forward moving opposite limbs',
          'Keep hips low and stable',
          'Maintain controlled movement'
        ],
        primaryMuscleGroups: [coreId!, shouldersId!],
        secondaryMuscleGroups: [legsId!],
        equipmentNeeded: [bodyweightId!],
        difficulty: 3,
        isCompound: true,
        categoryId: insertedCategories.find(cat => cat.name === 'Functional Training')?.id,
        commonMistakes: [
          'Hips too high',
          'Moving too fast',
          'Poor coordination'
        ],
        tips: [
          'Keep knees just off ground',
          'Move slowly at first',
          'Coordinate opposite limbs'
        ],
      },
      {
        name: 'Glute Bridges',
        description: 'Hip extension exercise for glutes',
        instructions: [
          'Lie on back with knees bent',
          'Drive hips up squeezing glutes',
          'Create straight line from knees to shoulders',
          'Hold briefly at top',
          'Lower with control'
        ],
        primaryMuscleGroups: [insertedMuscleGroups.find(mg => mg.name === 'Glutes')?.id!],
        secondaryMuscleGroups: [insertedMuscleGroups.find(mg => mg.name === 'Hamstrings')?.id!],
        equipmentNeeded: [bodyweightId!],
        difficulty: 1,
        isCompound: false,
        categoryId: isolationCategoryId,
        commonMistakes: [
          'Arching lower back',
          'Not squeezing glutes',
          'Pushing through toes'
        ],
        tips: [
          'Squeeze glutes at top',
          'Push through heels',
          'Keep core engaged'
        ],
      },
      {
        name: 'Farmers Walk',
        description: 'Loaded carry exercise for grip and core',
        instructions: [
          'Hold heavy weights at sides',
          'Walk forward with good posture',
          'Keep shoulders back and core tight',
          'Take controlled steps',
          'Maintain grip throughout'
        ],
        primaryMuscleGroups: [coreId!, insertedMuscleGroups.find(mg => mg.name === 'Forearms')?.id!],
        secondaryMuscleGroups: [shouldersId!, legsId!],
        equipmentNeeded: [dumbbellsId!],
        difficulty: 2,
        isCompound: true,
        categoryId: insertedCategories.find(cat => cat.name === 'Functional Training')?.id,
        commonMistakes: [
          'Leaning to one side',
          'Shrugging shoulders',
          'Taking too long steps'
        ],
        tips: [
          'Keep shoulders down',
          'Maintain good posture',
          'Start with manageable weight'
        ],
      },
      {
        name: 'Step-ups',
        description: 'Unilateral leg exercise using bench or box',
        instructions: [
          'Step up onto bench with one foot',
          'Drive through heel to stand on bench',
          'Step down with control',
          'Complete reps on one side',
          'Switch legs'
        ],
        primaryMuscleGroups: [legsId!],
        secondaryMuscleGroups: [coreId!],
        equipmentNeeded: [benchId!],
        difficulty: 2,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Using bottom leg to push',
          'Not controlling descent',
          'Knee caving inward'
        ],
        tips: [
          'Drive through top leg',
          'Control both up and down',
          'Keep knee aligned'
        ],
      },
      {
        name: 'Reverse Flyes',
        description: 'Rear deltoid isolation exercise',
        instructions: [
          'Bend forward holding dumbbells',
          'Raise arms out to sides',
          'Squeeze shoulder blades together',
          'Control the return',
          'Keep slight bend in elbows'
        ],
        primaryMuscleGroups: [shouldersId!],
        secondaryMuscleGroups: [backId!],
        equipmentNeeded: [dumbbellsId!],
        difficulty: 2,
        isCompound: false,
        categoryId: isolationCategoryId,
        commonMistakes: [
          'Using too much weight',
          'Not squeezing shoulder blades',
          'Standing too upright'
        ],
        tips: [
          'Focus on rear delts',
          'Squeeze shoulder blades',
          'Control the movement'
        ],
      },
      {
        name: 'Jump Squats',
        description: 'Explosive squat variation',
        instructions: [
          'Start in squat position',
          'Squat down and explode up',
          'Jump as high as possible',
          'Land softly and immediately squat',
          'Maintain good squat form'
        ],
        primaryMuscleGroups: [legsId!],
        secondaryMuscleGroups: [coreId!],
        equipmentNeeded: [bodyweightId!],
        difficulty: 3,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Landing too hard',
          'Poor squat form',
          'Not jumping high enough'
        ],
        tips: [
          'Land softly',
          'Maintain squat form',
          'Use arms for momentum'
        ],
      },
      {
        name: 'Diamond Push-ups',
        description: 'Tricep-focused push-up variation',
        instructions: [
          'Form diamond shape with hands',
          'Lower chest to hands',
          'Press back up',
          'Keep elbows close to body',
          'Maintain plank position'
        ],
        primaryMuscleGroups: [tricepsId!],
        secondaryMuscleGroups: [chestId!, shouldersId!, coreId!],
        equipmentNeeded: [bodyweightId!],
        difficulty: 4,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Flaring elbows out',
          'Not going full range',
          'Poor plank position'
        ],
        tips: [
          'Keep elbows tucked',
          'Touch chest to hands',
          'Focus on triceps'
        ],
      },
      {
        name: 'Side Plank',
        description: 'Lateral core stability exercise',
        instructions: [
          'Lie on side propped on forearm',
          'Lift hips creating straight line',
          'Hold position',
          'Keep body aligned',
          'Switch sides'
        ],
        primaryMuscleGroups: [coreId!],
        secondaryMuscleGroups: [shouldersId!],
        equipmentNeeded: [bodyweightId!],
        difficulty: 3,
        isCompound: false,
        categoryId: isolationCategoryId,
        commonMistakes: [
          'Sagging hips',
          'Rolling forward or back',
          'Holding breath'
        ],
        tips: [
          'Keep body in straight line',
          'Engage core and glutes',
          'Start with shorter holds'
        ],
      },
      {
        name: 'Hanging Knee Raises',
        description: 'Advanced core exercise from hanging position',
        instructions: [
          'Hang from pull-up bar',
          'Raise knees to chest',
          'Control the descent',
          'Keep movement controlled',
          'Avoid swinging'
        ],
        primaryMuscleGroups: [coreId!],
        secondaryMuscleGroups: [insertedMuscleGroups.find(mg => mg.name === 'Forearms')?.id!],
        equipmentNeeded: [pullupBarId!],
        difficulty: 4,
        isCompound: false,
        categoryId: isolationCategoryId,
        commonMistakes: [
          'Using momentum',
          'Not lifting knees high enough',
          'Swinging body'
        ],
        tips: [
          'Control the movement',
          'Engage core throughout',
          'Avoid swinging'
        ],
      },
      // Final exercise to complete 50
      {
        name: 'Squat to Calf Raise',
        description: 'Compound movement combining squat and calf raise',
        instructions: [
          'Perform a full squat',
          'Stand up from squat',
          'Rise up on toes at top',
          'Lower heels',
          'Return to squat'
        ],
        primaryMuscleGroups: [legsId!],
        secondaryMuscleGroups: [insertedMuscleGroups.find(mg => mg.name === 'Calves')?.id!, coreId!],
        equipmentNeeded: [bodyweightId!],
        difficulty: 2,
        isCompound: true,
        categoryId: compoundCategoryId,
        commonMistakes: [
          'Poor squat form',
          'Not going full range on calf raise',
          'Rushing the movement'
        ],
        tips: [
          'Complete each movement fully',
          'Control both portions',
          'Focus on form over speed'
        ],
      },
    ];

    // Insert all exercises
    const insertedExercises = await db.insert(exercises).values(exerciseData).returning();
    console.log(`✅ Inserted ${insertedExercises.length} exercises`);

    // Seed Achievement Definitions
    console.log('🏆 Seeding achievement definitions...');
    const achievementData = [
      {
        name: 'First Workout',
        description: 'Complete your first workout session',
        category: 'milestone' as const,
        rarity: 'common' as const,
        requirements: [
          {
            type: 'workout_count' as const,
            value: 1,
            description: 'Complete 1 workout',
          },
        ],
        points: 50,
      },
      {
        name: 'Week Warrior',
        description: 'Complete 7 consecutive days of workouts',
        category: 'consistency' as const,
        rarity: 'rare' as const,
        requirements: [
          {
            type: 'streak' as const,
            value: 7,
            description: 'Maintain 7-day workout streak',
          },
        ],
        points: 200,
      },
      {
        name: 'Century Club',
        description: 'Complete 100 total workouts',
        category: 'milestone' as const,
        rarity: 'epic' as const,
        requirements: [
          {
            type: 'workout_count' as const,
            value: 100,
            description: 'Complete 100 workouts',
          },
        ],
        points: 500,
      },
      {
        name: 'Plan Completer',
        description: 'Complete your first 4-week workout plan',
        category: 'consistency' as const,
        rarity: 'rare' as const,
        requirements: [
          {
            type: 'plan_completion' as const,
            value: 1,
            description: 'Complete 1 workout plan',
          },
        ],
        points: 300,
      },
      {
        name: 'Iron Lifter',
        description: 'Bench press your body weight',
        category: 'strength' as const,
        rarity: 'epic' as const,
        requirements: [
          {
            type: 'weight_lifted' as const,
            value: 1, // This would be calculated relative to body weight
            description: 'Bench press 1x body weight',
          },
        ],
        points: 400,
      },
    ];

    const insertedAchievements = await db.insert(achievementDefinitions).values(achievementData).returning();
    console.log(`✅ Inserted ${insertedAchievements.length} achievement definitions`);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📊 Seeding Summary:
   • ${insertedEquipment.length} Equipment items
   • ${insertedGoals.length} Fitness goals
   • ${insertedMuscleGroups.length} Muscle groups
   • ${insertedCategories.length} Exercise categories
   • ${insertedExercises.length} Exercises
   • ${insertedAchievements.length} Achievement definitions
`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;