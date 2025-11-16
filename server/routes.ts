import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { submitAnswerSchema, flagQuestionSchema, logTabSwitchSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all questions
  app.get("/api/questions", async (req, res) => {
    try {
      const questions = await storage.getAllQuestions();
      // All question fields are safe to send to frontend
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  // Start a new test session
  app.post("/api/session/start", async (req, res) => {
    try {
      const session = await storage.createSession();
      // Convert Map and Set to serializable format
      res.json({
        id: session.id,
        startTime: session.startTime,
        currentQuestion: session.currentQuestion,
        answers: Object.fromEntries(session.answers),
        flagged: Array.from(session.flagged),
        tabSwitches: session.tabSwitches,
        completed: session.completed,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to start session" });
    }
  });

  // Get session data
  app.get("/api/session/:sessionId", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json({
        id: session.id,
        startTime: session.startTime,
        currentQuestion: session.currentQuestion,
        answers: Object.fromEntries(session.answers),
        flagged: Array.from(session.flagged),
        tabSwitches: session.tabSwitches,
        completed: session.completed,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  // Submit an answer
  app.post("/api/session/answer", async (req, res) => {
    try {
      const parsed = submitAnswerSchema.parse(req.body);
      await storage.updateSessionAnswer(parsed.sessionId, parsed.questionIndex, parsed.answer);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Flag a question for review
  app.post("/api/session/flag", async (req, res) => {
    try {
      const parsed = flagQuestionSchema.parse(req.body);
      await storage.updateSessionFlag(parsed.sessionId, parsed.questionIndex, parsed.flagged);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Log tab switch
  app.post("/api/session/tab-switch", async (req, res) => {
    try {
      const parsed = logTabSwitchSchema.parse(req.body);
      await storage.incrementTabSwitches(parsed.sessionId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Submit test and calculate results
  app.post("/api/session/submit", async (req, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      await storage.completeSession(sessionId);
      const results = await storage.calculateResults(sessionId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit test" });
    }
  });

  // Get test results
  app.get("/api/results/:sessionId", async (req, res) => {
    try {
      let results = await storage.getResults(req.params.sessionId);
      
      // If results don't exist yet, calculate them
      if (!results) {
        results = await storage.calculateResults(req.params.sessionId);
      }
      
      if (!results) {
        return res.status(404).json({ error: "Results not found" });
      }

      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
