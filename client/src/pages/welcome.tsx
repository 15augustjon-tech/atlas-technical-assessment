import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Clock, FileText, BookOpen, Award, AlertCircle } from "lucide-react";

export default function Welcome() {
  const [, setLocation] = useLocation();
  
  const handleStartTest = () => {
    setLocation("/test");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Atlas Technical Assessment
          </h1>
          <p className="text-muted-foreground text-base">
            Professional software engineering evaluation scored out of 2,000 points
          </p>
          <p className="text-sm text-muted-foreground">
            Top performers will be invited to technical interviews at leading AI and machine learning firms
          </p>
        </div>

        <Card className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-md">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">4 Questions</h3>
                <p className="text-sm text-muted-foreground">
                  Open-ended questions requiring detailed written responses
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-md">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">45 Minutes</h3>
                <p className="text-sm text-muted-foreground">
                  Timer auto-starts and locks the assessment when time expires
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-md">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Topics Covered</h3>
                <p className="text-sm text-muted-foreground">
                  Data Structures & Algorithms, System Design, Design Patterns, Problem Solving
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-md">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Assessment Format</h3>
                <p className="text-sm text-muted-foreground">
                  Professional evaluation with detailed submission review
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              size="lg"
              className="w-full text-lg h-auto py-4"
              onClick={handleStartTest}
              data-testid="button-start-test"
            >
              Begin Assessment
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="rules" className="border-none">
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Assessment Guidelines
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-4">
                <div className="space-y-2">
                  <p className="font-medium text-foreground">Response Requirements:</p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Provide detailed, thoughtful answers to each question</li>
                    <li>Demonstrate your technical knowledge and problem-solving approach</li>
                    <li>Use specific examples and technical terminology where appropriate</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-foreground">Assessment Guidelines:</p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Timer starts automatically when you begin the assessment</li>
                    <li>Navigate between questions and flag items for review as needed</li>
                    <li>Assessment auto-submits when the 45-minute timer expires</li>
                    <li>Tab switching is monitored throughout the assessment</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>
    </div>
  );
}
