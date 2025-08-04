import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Dumbbell, 
  Clock, 
  Target, 
  Play, 
  Heart,
  Info,
  Star
} from "lucide-react";
import type { Exercise, WorkoutExercise } from "@/lib/types";

interface ExerciseCardProps {
  exercise: Exercise;
  workoutExercise?: WorkoutExercise;
  variant?: 'default' | 'compact' | 'detailed';
  isActive?: boolean;
  isCompleted?: boolean;
  onStart?: () => void;
  onInfo?: () => void;
  onFavorite?: () => void;
  isFavorited?: boolean;
  showProgress?: boolean;
  progress?: {
    completed: number;
    total: number;
  };
  className?: string;
}

const difficultyColors = {
  1: "bg-green-500/20 text-green-400 border-green-500/30",
  2: "bg-green-500/20 text-green-400 border-green-500/30", 
  3: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  4: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  5: "bg-red-500/20 text-red-400 border-red-500/30",
};

const difficultyLabels = {
  1: "Beginner",
  2: "Easy", 
  3: "Moderate",
  4: "Hard",
  5: "Expert",
};

export function ExerciseCard({
  exercise,
  workoutExercise,
  variant = 'default',
  isActive = false,
  isCompleted = false,  
  onStart,
  onInfo,
  onFavorite,
  isFavorited = false,
  showProgress = false,
  progress,
  className,
}: ExerciseCardProps) {
  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  return (
    <Card className={cn(
      "exercise-card group relative overflow-hidden",
      isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      isCompleted && "opacity-75 bg-success/5 border-success/20",
      className
    )}>
      {/* Active/Completed Indicator */}
      {(isActive || isCompleted) && (
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1",
          isActive && "bg-primary",
          isCompleted && "bg-success"
        )} />
      )}

      <div className={cn(
        "p-4",
        isCompact && "p-3"
      )}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold text-foreground line-clamp-1",
              isCompact ? "text-sm" : "text-base"
            )}>
              {exercise.name}
            </h3>
            
            {!isCompact && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {exercise.description}
              </p>
            )}
          </div>

          {/* Favorite Button */}
          {onFavorite && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onFavorite}
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Heart className={cn(
                "h-4 w-4",
                isFavorited && "fill-red-500 text-red-500"
              )} />
            </Button>
          )}
        </div>

        {/* Workout Exercise Details */}
        {workoutExercise && (
          <div className="flex items-center space-x-4 mb-3 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Target className="h-4 w-4 mr-1" />
              {workoutExercise.sets} × {workoutExercise.reps}
            </div>
            
            {workoutExercise.weight && (
              <div className="flex items-center text-muted-foreground">
                <Dumbbell className="h-4 w-4 mr-1" />
                {workoutExercise.weight}lbs
              </div>
            )}
            
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              {Math.round(workoutExercise.restSeconds / 60)}m rest
            </div>
          </div>
        )}

        {/* Progress */}
        {showProgress && progress && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {progress.completed}/{progress.total} sets
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(progress.completed / progress.total) * 100}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Muscle Groups & Equipment */}
        {!isCompact && (
          <div className="flex flex-wrap gap-2 mb-3">
            {exercise.muscleGroups.slice(0, 3).map((muscle) => (
              <Badge 
                key={muscle.id} 
                variant="secondary" 
                className="text-xs"
              >
                {muscle.name}
              </Badge>
            ))}
            
            {exercise.equipment.slice(0, 2).map((eq) => (
              <Badge 
                key={eq.id} 
                variant="outline" 
                className="text-xs"
              >
                {eq.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Difficulty & Actions */}
        <div className="flex items-center justify-between">
          <Badge 
            className={cn(
              "text-xs font-medium",
              difficultyColors[exercise.difficulty as keyof typeof difficultyColors]
            )}
          >
            {difficultyLabels[exercise.difficulty as keyof typeof difficultyLabels]}
          </Badge>

          <div className="flex items-center space-x-2">
            {/* Info Button */}
            {onInfo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onInfo}
                className="h-8 w-8 p-0"
              >
                <Info className="h-4 w-4" />
              </Button>
            )}

            {/* Start Button */}
            {onStart && (
              <Button
                size="sm"
                onClick={onStart}
                disabled={isCompleted}
                className={cn(
                  "h-8",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                <Play className="h-3 w-3 mr-1" />
                {isActive ? "Current" : isCompleted ? "Done" : "Start"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Detailed View Additional Info */}
      {isDetailed && (
        <div className="border-t bg-muted/20 p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Primary Muscles:</span>
              <p className="font-medium">
                {exercise.muscleGroups
                  .filter(m => m.category === 'primary')
                  .map(m => m.name)
                  .join(', ')}
              </p>
            </div>
            
            <div>
              <span className="text-muted-foreground">Equipment:</span>
              <p className="font-medium">
                {exercise.equipment.map(e => e.name).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}