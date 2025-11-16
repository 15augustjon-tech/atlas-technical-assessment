import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { QuestionPublic } from "@shared/schema";

interface QuestionCardProps {
  question: QuestionPublic;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: string;
  onSelectAnswer: (answer: string) => void;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
}: QuestionCardProps) {
  return (
    <Card className="p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Badge variant="secondary" className="text-sm px-4 py-2 rounded-full">
          Question {questionNumber} of {totalQuestions}
        </Badge>
        <Badge variant="outline" className="text-sm px-3 py-1">
          {question.topic}
        </Badge>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium text-foreground leading-relaxed" data-testid="text-question">
          {question.text}
        </h2>

        {question.code && (
          <div className="bg-muted rounded-md p-4 border-l-4 border-primary">
            <pre className="text-sm font-mono leading-relaxed overflow-x-auto">
              <code>{question.code}</code>
            </pre>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {question.guidanceNotes && (
          <div className="bg-muted/50 rounded-md p-3 border-l-2 border-primary/50">
            <p className="text-sm text-muted-foreground italic">
              <span className="font-medium text-foreground">Guidance: </span>
              {question.guidanceNotes}
            </p>
          </div>
        )}
        
        <Textarea
          value={selectedAnswer || ''}
          onChange={(e) => onSelectAnswer(e.target.value)}
          placeholder="Type your detailed answer here..."
          className="min-h-[300px] text-base leading-relaxed resize-y"
          data-testid="textarea-answer"
        />
        
        <p className="text-sm text-muted-foreground">
          Provide a comprehensive answer demonstrating your technical knowledge and problem-solving approach.
        </p>
      </div>
    </Card>
  );
}
