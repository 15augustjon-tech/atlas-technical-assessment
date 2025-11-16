import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Home, Clock, FileText } from "lucide-react";
import type { TestResult } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Results() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('sessionId');

  const { data: result, isLoading } = useQuery<TestResult>({
    queryKey: ['/api/results', sessionId],
    enabled: !!sessionId,
  });

  if (isLoading || !result) {
    return (
      <div className="min-h-screen bg-background py-12 px-6">
        <div className="container mx-auto max-w-5xl space-y-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const minutes = Math.floor(result.timeTaken / 60);
  const seconds = result.timeTaken % 60;
  const answeredCount = result.questionResults.filter(qr => qr.submittedAnswer && qr.submittedAnswer.trim() !== '').length;

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="container mx-auto max-w-5xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Atlas Assessment Submitted</h1>
          <p className="text-muted-foreground">
            Your responses will be reviewed and scored out of 2,000 points by our technical team
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium">Top performers will be invited to technical interviews at leading AI and machine learning firms</p>
          </div>
        </div>

        <Card className="p-8 text-center space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-foreground">Submission Complete</span>
            </div>
            <p className="text-muted-foreground">
              Thank you for completing the Atlas Technical Assessment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">Questions Answered</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {answeredCount} / {result.totalQuestions}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">Time Taken</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {minutes}:{String(seconds).padStart(2, '0')}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Your Responses</h2>
            <Badge variant="outline">
              {answeredCount} / {result.totalQuestions} answered
            </Badge>
          </div>

          <Accordion type="multiple" className="w-full">
            {result.questionResults.map((qr, index) => (
              <AccordionItem key={index} value={`question-${index}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    {qr.submittedAnswer && qr.submittedAnswer.trim() !== '' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">Question {index + 1}</span>
                        <Badge variant="outline" className="text-xs">
                          {qr.topic}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-base text-foreground leading-relaxed font-medium">{qr.question}</p>
                      {qr.code && (
                        <div className="mt-3 bg-muted rounded-md p-4 border-l-4 border-primary">
                          <pre className="text-sm font-mono leading-relaxed overflow-x-auto">
                            <code>{qr.code}</code>
                          </pre>
                        </div>
                      )}
                    </div>

                    {qr.guidanceNotes && (
                      <div className="bg-muted/50 rounded-md p-3 border-l-2 border-primary/50">
                        <p className="text-sm text-muted-foreground italic">
                          <span className="font-medium text-foreground">Guidance: </span>
                          {qr.guidanceNotes}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Your Response:</p>
                      {qr.submittedAnswer && qr.submittedAnswer.trim() !== '' ? (
                        <div className="p-4 rounded-md bg-muted border-l-4 border-primary">
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                            {qr.submittedAnswer}
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 rounded-md bg-muted/50 border-l-4 border-muted-foreground">
                          <p className="text-sm text-muted-foreground italic">No response provided</p>
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        <div className="flex justify-center pt-4">
          <Button size="lg" onClick={() => setLocation('/')} data-testid="button-home">
            <Home className="w-4 h-4 mr-2" />
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
