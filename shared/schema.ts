import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Question schema
export interface Question {
  id: string;
  text: string;
  code?: string;
  topic: string;
  guidanceNotes?: string;
}

// Question without answer (for frontend during test) - same as Question for open-ended
export interface QuestionPublic {
  id: string;
  text: string;
  code?: string;
  topic: string;
  guidanceNotes?: string;
}

// Test session schema
export interface TestSession {
  id: string;
  startTime: number;
  endTime?: number;
  currentQuestion: number;
  answers: Map<number, string>;
  flagged: Set<number>;
  tabSwitches: number;
  completed: boolean;
}

// Test result schema
export interface TestResult {
  id: string;
  totalQuestions: number;
  timeTaken: number;
  questionResults: QuestionResult[];
}

export interface QuestionResult {
  questionId: string;
  question: string;
  code?: string;
  submittedAnswer?: string;
  topic: string;
  guidanceNotes?: string;
}

// Insert schemas for API validation
export const submitAnswerSchema = z.object({
  sessionId: z.string(),
  questionIndex: z.number(),
  answer: z.string(),
});

export const flagQuestionSchema = z.object({
  sessionId: z.string(),
  questionIndex: z.number(),
  flagged: z.boolean(),
});

export const logTabSwitchSchema = z.object({
  sessionId: z.string(),
});

export type SubmitAnswer = z.infer<typeof submitAnswerSchema>;
export type FlagQuestion = z.infer<typeof flagQuestionSchema>;
export type LogTabSwitch = z.infer<typeof logTabSwitchSchema>;
