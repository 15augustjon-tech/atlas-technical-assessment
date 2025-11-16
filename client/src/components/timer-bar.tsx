import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";

interface TimerBarProps {
  startTime: number;
  duration: number; // in seconds
  onTimeUp: () => void;
}

export function TimerBar({ startTime, duration, onTimeUp }: TimerBarProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, duration, onTimeUp]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const percentage = (timeRemaining / duration) * 100;
  const isCritical = timeRemaining < 300; // Less than 5 minutes

  return (
    <div className="fixed top-0 left-0 right-0 bg-background border-b border-border z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground">Atlas Technical Assessment</h2>
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${isCritical ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
            <span className={`text-sm font-semibold ${isCritical ? 'text-destructive' : 'text-foreground'}`} data-testid="text-time-remaining">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
        <Progress 
          value={percentage} 
          className={`h-2 ${isCritical ? '[&>div]:bg-destructive' : ''}`}
          data-testid="progress-timer"
        />
      </div>
    </div>
  );
}
