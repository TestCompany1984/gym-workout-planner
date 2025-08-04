"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Trophy, Star, Zap, Target } from "lucide-react";
import type { Achievement } from "@/lib/types";

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  isNew?: boolean;
  showProgress?: boolean;
  onClick?: () => void;
  className?: string;
}

const sizeMap = {
  sm: {
    container: "w-16 h-16",
    icon: "h-6 w-6",
    text: "text-xs",
    badge: "text-xs",
  },
  md: {
    container: "w-20 h-20", 
    icon: "h-8 w-8",
    text: "text-sm",
    badge: "text-xs",
  },
  lg: {
    container: "w-24 h-24",
    icon: "h-10 w-10", 
    text: "text-base",
    badge: "text-sm",
  },
};

const rarityColors = {
  common: {
    bg: "bg-gray-500/20 border-gray-500/30",
    icon: "text-gray-400",
    glow: "",
  },
  rare: {
    bg: "bg-blue-500/20 border-blue-500/30", 
    icon: "text-blue-400",
    glow: "shadow-blue-500/20",
  },
  epic: {
    bg: "bg-purple-500/20 border-purple-500/30",
    icon: "text-purple-400", 
    glow: "shadow-purple-500/20",
  },
  legendary: {
    bg: "bg-yellow-500/20 border-yellow-500/30",
    icon: "text-yellow-400",
    glow: "shadow-yellow-500/20 shadow-lg",
  },
};

const categoryIcons = {
  strength: Trophy,
  endurance: Zap,
  consistency: Target,
  milestone: Star,
};

export function AchievementBadge({
  achievement,
  size = 'md',
  isNew = false,
  showProgress = false,
  onClick,
  className,
}: AchievementBadgeProps) {
  const { container, icon, text, badge } = sizeMap[size];
  const colors = rarityColors[achievement.rarity];
  const IconComponent = categoryIcons[achievement.category];
  
  const isEarned = !!achievement.earnedAt;
  const progress = achievement.progress || 0;

  return (
    <div 
      className={cn(
        "relative group cursor-pointer transition-all duration-300",
        onClick && "hover:scale-105",
        className
      )}
      onClick={onClick}
    >
      {/* New Achievement Indicator */}
      {isNew && (
        <div className="absolute -top-1 -right-1 z-10">
          <div className="achievement-glow bg-achievement text-background rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
            !
          </div>
        </div>
      )}

      {/* Achievement Container */}
      <div className={cn(
        container,
        "relative flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-300",
        colors.bg,
        colors.glow,
        isEarned ? "opacity-100" : "opacity-50 grayscale",
        isNew && "achievement-glow"
      )}>
        {/* Progress Ring (for unearned achievements) */}
        {!isEarned && showProgress && progress > 0 && (
          <svg 
            className="absolute inset-0 w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50" 
              r="48"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-muted opacity-20"
            />
            <circle
              cx="50"
              cy="50"
              r="48" 
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 48}`}
              strokeDashoffset={`${2 * Math.PI * 48 * (1 - progress / 100)}`}
              className={colors.icon}
            />
          </svg>
        )}

        {/* Icon */}
        <IconComponent className={cn(icon, colors.icon, "mb-1")} />
        
        {/* Progress Text */}
        {!isEarned && showProgress && (
          <span className={cn(text, "font-semibold text-foreground")}>
            {progress}%
          </span>
        )}
      </div>

      {/* Achievement Info */}
      <div className="text-center mt-2">
        <h4 className={cn(text, "font-medium text-foreground line-clamp-1")}>
          {achievement.name}
        </h4>
        
        {/* Rarity Badge */}
        <Badge 
          variant="outline"
          className={cn(
            badge,
            "mt-1 capitalize",
            colors.bg,
            colors.icon
          )}
        >
          {achievement.rarity}
        </Badge>
      </div>

      {/* Tooltip on Hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
        <div className="bg-popover text-popover-foreground p-3 rounded-lg shadow-lg border max-w-xs">
          <h5 className="font-semibold mb-1">{achievement.name}</h5>
          <p className="text-sm text-muted-foreground mb-2">
            {achievement.description}
          </p>
          
          {/* Requirements */}
          <div className="space-y-1">
            {achievement.requirements.map((req, index) => (
              <div key={index} className="text-xs text-muted-foreground">
                • {req.description}
              </div>
            ))}
          </div>
          
          {/* Earned Date */}
          {achievement.earnedAt && (
            <div className="text-xs text-success mt-2">
              Earned {achievement.earnedAt.toLocaleDateString()}
            </div>
          )}
          
          {/* Progress */}
          {!isEarned && achievement.progress !== undefined && (
            <div className="text-xs text-primary mt-2">
              Progress: {achievement.progress}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}