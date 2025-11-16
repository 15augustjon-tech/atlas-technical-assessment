import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TimerBar } from "@/components/timer-bar";
import { QuestionCard } from "@/components/question-card";
import { QuestionNavigation } from "@/components/question-navigation";
import { SecurityOverlay } from "@/components/security-overlay";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, Flag, Send } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { QuestionPublic, TestSession } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Test() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const { data: questions, isLoading } = useQuery<QuestionPublic[]>({
    queryKey: ['/api/questions'],
  });

  const { data: session } = useQuery<TestSession>({
    queryKey: ['/api/session', sessionId],
    enabled: !!sessionId,
  });

  const submitAnswerMutation = useMutation({
    mutationFn: (data: { questionIndex: number; answer: string }) =>
      apiRequest('POST', '/api/session/answer', {
        sessionId,
        questionIndex: data.questionIndex,
        answer: data.answer,
      }),
  });

  const flagQuestionMutation = useMutation({
    mutationFn: (data: { questionIndex: number; flagged: boolean }) =>
      apiRequest('POST', '/api/session/flag', {
        sessionId,
        questionIndex: data.questionIndex,
        flagged: data.flagged,
      }),
  });

  const logTabSwitchMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/session/tab-switch', { sessionId }),
  });

  const submitTestMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/session/submit', { sessionId });
      return response.json();
    },
    onSuccess: (data) => {
      setLocation(`/results?sessionId=${sessionId}`);
    },
  });

  useEffect(() => {
    const startSession = async () => {
      try {
        const response = await apiRequest('POST', '/api/session/start', {});
        const data = await response.json();
        setSessionId(data.id);
      } catch (error) {
        console.error('Failed to start session:', error);
      }
    };
    startSession();
  }, []);

  const handleSelectAnswer = (answer: string) => {
    const newAnswers = new Map(answers);
    newAnswers.set(currentQuestion, answer);
    setAnswers(newAnswers);
    
    submitAnswerMutation.mutate({
      questionIndex: currentQuestion,
      answer,
    });
  };

  const handleToggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentQuestion)) {
      newFlagged.delete(currentQuestion);
    } else {
      newFlagged.add(currentQuestion);
    }
    setFlagged(newFlagged);
    
    flagQuestionMutation.mutate({
      questionIndex: currentQuestion,
      flagged: !flagged.has(currentQuestion),
    });
  };

  const handleTabSwitch = () => {
    const newCount = tabSwitches + 1;
    setTabSwitches(newCount);
    logTabSwitchMutation.mutate();
  };

  const handleTimeUp = () => {
    submitTestMutation.mutate();
  };

  const handleSubmit = () => {
    setShowSubmitDialog(true);
  };

  const confirmSubmit = () => {
    submitTestMutation.mutate();
  };

  const handleNavigate = (index: number) => {
    setCurrentQuestion(index);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNext = () => {
    if (questions && currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  if (isLoading || !questions || !sessionId) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-24 px-6">
        <div className="container mx-auto max-w-4xl space-y-6">
          <Card className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const answeredQuestions = new Set(answers.keys());

  return (
    <div className="min-h-screen bg-background">
      {session && (
        <>
          <TimerBar
            startTime={session.startTime}
            duration={45 * 60}
            onTimeUp={handleTimeUp}
          />
          <SecurityOverlay
            onTabSwitch={handleTabSwitch}
            tabSwitches={tabSwitches}
          />
        </>
      )}

      <div className="pt-24 pb-24 px-6">
        <div className="container mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">
              Atlas Assessment - Question {currentQuestion + 1} of {questions.length}
            </h1>
            <QuestionNavigation
              totalQuestions={questions.length}
              currentQuestion={currentQuestion}
              answeredQuestions={answeredQuestions}
              flaggedQuestions={flagged}
              onNavigate={handleNavigate}
            />
          </div>

          <QuestionCard
            question={currentQ}
            questionNumber={currentQuestion + 1}
            totalQuestions={questions.length}
            selectedAnswer={answers.get(currentQuestion)}
            onSelectAnswer={handleSelectAnswer}
          />

          <div className="flex items-center justify-between gap-4 pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              data-testid="button-previous"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button
              variant={flagged.has(currentQuestion) ? "default" : "outline"}
              onClick={handleToggleFlag}
              data-testid="button-flag"
            >
              <Flag className={`w-4 h-4 mr-2 ${flagged.has(currentQuestion) ? 'fill-current' : ''}`} />
              {flagged.has(currentQuestion) ? 'Flagged' : 'Flag for Review'}
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                data-testid="button-submit-test"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Assessment
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                data-testid="button-next"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answers.size} out of {questions.length} questions.
              {answers.size < questions.length && (
                <span className="block mt-2 text-destructive font-medium">
                  {questions.length - answers.size} question{questions.length - answers.size !== 1 ? 's' : ''} unanswered
                </span>
              )}
              <span className="block mt-2">
                Are you sure you want to submit your assessment? This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit} data-testid="button-confirm-submit">
              Submit Assessment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
