import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  max: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'success' | 'warning' | 'error';
  strokeWidth?: number;
  showPercentage?: boolean;
  showValue?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const sizeMap = {
  sm: { width: 60, height: 60, fontSize: 'text-xs' },
  md: { width: 80, height: 80, fontSize: 'text-sm' },
  lg: { width: 120, height: 120, fontSize: 'text-base' },
  xl: { width: 160, height: 160, fontSize: 'text-lg' },
};

const colorMap = {
  primary: 'stroke-primary-400',
  success: '[&>circle:last-child]:stroke-success',
  warning: '[&>circle:last-child]:stroke-warning',
  error: '[&>circle:last-child]:stroke-error',
};

export function ProgressRing({
  value,
  max,
  size = 'md',
  color = 'primary',
  strokeWidth = 8,
  showPercentage = false,
  showValue = false,
  className,
  children,
}: ProgressRingProps) {
  const { width, height, fontSize } = sizeMap[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / max) * 100, 100);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={width}
        height={height}
        className="transform -rotate-90"
        aria-label={`Progress: ${percentage.toFixed(1)}%`}
      >
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-progress-bg opacity-20"
        />
        
        {/* Progress circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={cn(
            "progress-ring transition-all duration-500 ease-out",
            colorMap[color]
          )}
        />
      </svg>
      
      {/* Center content */}
      <div className={cn(
        "absolute inset-0 flex flex-col items-center justify-center",
        fontSize
      )}>
        {children || (
          <>
            {showPercentage && (
              <span className="font-bold text-foreground">
                {percentage.toFixed(0)}%
              </span>
            )}
            {showValue && (
              <span className="text-muted-foreground text-xs">
                {value}/{max}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}