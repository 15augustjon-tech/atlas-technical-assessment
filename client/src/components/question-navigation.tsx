import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Grid3x3, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuestionNavigationProps {
  totalQuestions: number;
  currentQuestion: number;
  answeredQuestions: Set<number>;
  flaggedQuestions: Set<number>;
  onNavigate: (questionIndex: number) => void;
}

export function QuestionNavigation({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  flaggedQuestions,
  onNavigate,
}: QuestionNavigationProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" data-testid="button-question-nav">
          <Grid3x3 className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Question Navigation</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-primary"></div>
              <span className="text-xs text-muted-foreground">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-accent"></div>
              <span className="text-xs text-muted-foreground">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm border-2 border-border"></div>
              <span className="text-xs text-muted-foreground">Unanswered</span>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: totalQuestions }, (_, i) => {
              const isCurrent = i === currentQuestion;
              const isAnswered = answeredQuestions.has(i);
              const isFlagged = flaggedQuestions.has(i);

              return (
                <div key={i} className="relative">
                  <Button
                    variant={isCurrent ? "default" : isAnswered ? "secondary" : "outline"}
                    size="icon"
                    className="w-full aspect-square relative"
                    onClick={() => onNavigate(i)}
                    data-testid={`nav-question-${i}`}
                  >
                    {i + 1}
                  </Button>
                  {isFlagged && (
                    <Flag className="w-3 h-3 text-destructive absolute -top-1 -right-1 fill-destructive" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Answered:</span>
              <span className="font-semibold text-foreground" data-testid="text-answered-count">
                {answeredQuestions.size} / {totalQuestions}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Flagged:</span>
              <span className="font-semibold text-foreground" data-testid="text-flagged-count">
                {flaggedQuestions.size}
              </span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
