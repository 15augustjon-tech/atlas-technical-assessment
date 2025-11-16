import { type User, type InsertUser, type Question, type TestSession, type TestResult, type QuestionResult } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Question methods
  getAllQuestions(): Promise<Question[]>;
  
  // Session methods
  createSession(): Promise<TestSession>;
  getSession(id: string): Promise<TestSession | undefined>;
  updateSessionAnswer(sessionId: string, questionIndex: number, answer: string): Promise<void>;
  updateSessionFlag(sessionId: string, questionIndex: number, flagged: boolean): Promise<void>;
  incrementTabSwitches(sessionId: string): Promise<void>;
  completeSession(sessionId: string): Promise<void>;
  
  // Results methods
  calculateResults(sessionId: string): Promise<TestResult>;
  getResults(sessionId: string): Promise<TestResult | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private questions: Question[];
  private sessions: Map<string, TestSession>;
  private results: Map<string, TestResult>;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.results = new Map();
    this.questions = this.initializeQuestions();
  }

  private initializeQuestions(): Question[] {
    return [
      {
        id: "q1",
        text: "Describe a real-world scenario where you would choose a hash table over a binary search tree. Explain your reasoning, including the trade-offs involved in this decision.",
        topic: "Data Structures & Algorithms",
        guidanceNotes: "Consider time complexity, memory usage, and specific use case requirements in your answer."
      },
      {
        id: "q2",
        text: "Explain the concept of eventual consistency in distributed systems. Provide an example of a real-world application where eventual consistency is acceptable and describe the trade-offs.",
        topic: "System Design",
        guidanceNotes: "Address CAP theorem implications and discuss scenarios where consistency can be relaxed."
      },
      {
        id: "q3",
        text: "Compare and contrast the Observer and Pub/Sub design patterns. When would you use one over the other? Provide concrete examples from software you've worked with or designed.",
        topic: "Software Design Patterns",
        guidanceNotes: "Consider coupling, scalability, and message delivery guarantees in your comparison."
      },
      {
        id: "q4",
        text: "Describe your approach to debugging a production issue where API response times have suddenly increased from 100ms to 5 seconds. What tools and methodology would you use?",
        topic: "Problem Solving & Debugging",
        guidanceNotes: "Consider monitoring, profiling, database queries, network latency, and systematic elimination."
      }
    ];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllQuestions(): Promise<Question[]> {
    return this.questions;
  }

  async createSession(): Promise<TestSession> {
    const session: TestSession = {
      id: randomUUID(),
      startTime: Date.now(),
      currentQuestion: 0,
      answers: new Map(),
      flagged: new Set(),
      tabSwitches: 0,
      completed: false,
    };
    this.sessions.set(session.id, session);
    return session;
  }

  async getSession(id: string): Promise<TestSession | undefined> {
    return this.sessions.get(id);
  }

  async updateSessionAnswer(sessionId: string, questionIndex: number, answer: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.answers.set(questionIndex, answer);
    }
  }

  async updateSessionFlag(sessionId: string, questionIndex: number, flagged: boolean): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      if (flagged) {
        session.flagged.add(questionIndex);
      } else {
        session.flagged.delete(questionIndex);
      }
    }
  }

  async incrementTabSwitches(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.tabSwitches++;
    }
  }

  async completeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.completed = true;
      session.endTime = Date.now();
    }
  }

  async calculateResults(sessionId: string): Promise<TestResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const questionResults: QuestionResult[] = [];

    this.questions.forEach((question, index) => {
      const submittedAnswer = session.answers.get(index);

      questionResults.push({
        questionId: question.id,
        question: question.text,
        code: question.code,
        submittedAnswer,
        topic: question.topic,
        guidanceNotes: question.guidanceNotes,
      });
    });

    const timeTaken = session.endTime 
      ? Math.floor((session.endTime - session.startTime) / 1000)
      : Math.floor((Date.now() - session.startTime) / 1000);

    const result: TestResult = {
      id: sessionId,
      totalQuestions: this.questions.length,
      timeTaken,
      questionResults,
    };

    this.results.set(sessionId, result);
    return result;
  }

  async getResults(sessionId: string): Promise<TestResult | undefined> {
    return this.results.get(sessionId);
  }
}

export const storage = new MemStorage();
