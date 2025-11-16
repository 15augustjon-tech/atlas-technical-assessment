import { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface SecurityOverlayProps {
  onTabSwitch: () => void;
  tabSwitches: number;
}

export function SecurityOverlay({ onTabSwitch, tabSwitches }: SecurityOverlayProps) {
  useEffect(() => {
    // Monitor tab visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        onTabSwitch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onTabSwitch]);

  return (
    <>
      {/* Tab switch warning */}
      {tabSwitches > 0 && (
        <div className="fixed top-20 left-0 right-0 z-40 p-4">
          <div className="container mx-auto max-w-4xl">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription data-testid="text-tab-switches">
                Tab switching detected - {tabSwitches} incident{tabSwitches !== 1 ? 's' : ''} logged
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
    </>
  );
}
