"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { cn } from "@/lib/utils";
import { Pause, Play, Plus, SkipForward } from "lucide-react";

interface WorkoutTimerProps {
  initialTime: number; // seconds
  isActive: boolean;
  type: 'rest' | 'exercise';
  canSkip?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  onAddTime?: (seconds: number) => void;
  onPause?: () => void;
  onResume?: () => void;
  className?: string;
}

export function WorkoutTimer({
  initialTime,
  isActive,
  type,
  canSkip = true,
  onComplete,
  onSkip,
  onAddTime,
  onPause,
  onResume,
  className,
}: WorkoutTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isPaused, setIsPaused] = useState(!isActive);

  useEffect(() => {
    setTimeRemaining(initialTime);
  }, [initialTime]);

  useEffect(() => {
    setIsPaused(!isActive);
  }, [isActive]);

  useEffect(() => {
    if (isPaused || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          onComplete?.();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeRemaining, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      onResume?.();
    } else {
      setIsPaused(true);
      onPause?.();
    }
  };

  const handleAddTime = (seconds: number) => {
    setTimeRemaining(prev => prev + seconds);
    onAddTime?.(seconds);
  };

  const progress = initialTime > 0 ? ((initialTime - timeRemaining) / initialTime) * 100 : 0;
  const isRestTimer = type === 'rest';

  return (
    <div className={cn(
      "flex flex-col items-center justify-center space-y-6 p-8",
      "bg-card/50 backdrop-blur-sm rounded-2xl border",
      isRestTimer && "rest-timer-pulse",
      className
    )}>
      {/* Timer Display */}
      <div className="flex flex-col items-center space-y-2">
        <h3 className={cn(
          "text-lg font-semibold capitalize",
          isRestTimer ? "text-warning" : "text-primary"
        )}>
          {type} Time
        </h3>
        
        <ProgressRing
          value={initialTime - timeRemaining}
          max={initialTime}
          size="xl"
          color={isRestTimer ? "warning" : "primary"}
          showPercentage={false}
        >
          <div className="text-center">
            <div className="workout-timer-display">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm text-muted-foreground">
              {isRestTimer ? "Rest up" : "Keep going"}
            </div>
          </div>
        </ProgressRing>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center space-x-4">
        {/* Pause/Resume */}
        <Button
          variant="outline"
          size="lg"
          onClick={handlePauseResume}
          className="h-12 w-12 rounded-full"
        >
          {isPaused ? (
            <Play className="h-5 w-5" />
          ) : (
            <Pause className="h-5 w-5" />
          )}
        </Button>

        {/* Add Time (Rest only) */}
        {isRestTimer && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddTime(30)}
              className="h-10 px-3"
            >
              <Plus className="h-4 w-4 mr-1" />
              30s
            </Button>
            <Button
              variant="ghost"
              size="sm"  
              onClick={() => handleAddTime(60)}
              className="h-10 px-3"
            >
              <Plus className="h-4 w-4 mr-1" />
              1m
            </Button>
          </>
        )}

        {/* Skip (if allowed) */}
        {canSkip && (
          <Button
            variant="secondary"
            size="lg"
            onClick={onSkip}
            className="h-12 px-6"
          >
            <SkipForward className="h-5 w-5 mr-2" />
            Skip
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-sm">
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={cn(
              "h-2 rounded-full transition-all duration-1000 ease-linear",
              isRestTimer ? "bg-warning" : "bg-primary"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0:00</span>
          <span>{formatTime(initialTime)}</span>
        </div>
      </div>
    </div>
  );
}