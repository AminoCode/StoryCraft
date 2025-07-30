import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { writingAssistant } from "./services/writing-assistant";
import { 
  insertDocumentSchema, 
  insertCharacterSchema, 
  insertLocationSchema, 
  insertTimelineEventSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Document routes
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const parsed = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(parsed);
      res.json(document);
    } catch (error) {
      res.status(400).json({ error: "Invalid document data" });
    }
  });

  app.put("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.updateDocument(req.params.id, req.body);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  // Character routes
  app.get("/api/documents/:documentId/characters", async (req, res) => {
    try {
      const characters = await storage.getCharactersByDocument(req.params.documentId);
      res.json(characters);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch characters" });
    }
  });

  app.post("/api/characters", async (req, res) => {
    try {
      const parsed = insertCharacterSchema.parse(req.body);
      const character = await storage.createCharacter(parsed);
      res.json(character);
    } catch (error) {
      res.status(400).json({ error: "Invalid character data" });
    }
  });

  app.put("/api/characters/:id", async (req, res) => {
    try {
      const character = await storage.updateCharacter(req.params.id, req.body);
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      res.status(500).json({ error: "Failed to update character" });
    }
  });

  // Location routes
  app.get("/api/documents/:documentId/locations", async (req, res) => {
    try {
      const locations = await storage.getLocationsByDocument(req.params.documentId);
      res.json(locations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch locations" });
    }
  });

  app.post("/api/locations", async (req, res) => {
    try {
      const parsed = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(parsed);
      res.json(location);
    } catch (error) {
      res.status(400).json({ error: "Invalid location data" });
    }
  });

  // Timeline routes
  app.get("/api/documents/:documentId/timeline", async (req, res) => {
    try {
      const events = await storage.getTimelineEventsByDocument(req.params.documentId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch timeline events" });
    }
  });

  app.post("/api/timeline", async (req, res) => {
    try {
      const parsed = insertTimelineEventSchema.parse(req.body);
      const event = await storage.createTimelineEvent(parsed);
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid timeline event data" });
    }
  });

  // AI-powered routes
  app.post("/api/ai/extract-entities", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      
      const entities = await writingAssistant.extractEntities(text);
      res.json(entities);
    } catch (error) {
      res.status(500).json({ error: "Failed to extract entities" });
    }
  });

  app.post("/api/ai/synonyms", async (req, res) => {
    try {
      const { word, context } = req.body;
      if (!word || !context) {
        return res.status(400).json({ error: "Word and context are required" });
      }
      
      const synonyms = await writingAssistant.generateSynonyms(word, context);
      res.json({ synonyms });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate synonyms" });
    }
  });

  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      
      const suggestions = await writingAssistant.analyzeWriting(text);
      res.json({ suggestions });
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze text" });
    }
  });

  app.post("/api/ai/writing-prompt", async (req, res) => {
    try {
      const { text, context } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      
      const prompt = await writingAssistant.generateWritingPrompt(text, context);
      res.json({ prompt });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate writing prompt" });
    }
  });

  app.post("/api/ai/format-dialogue", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      
      const formattedText = await writingAssistant.formatDialogue(text);
      res.json({ formattedText });
    } catch (error) {
      res.status(500).json({ error: "Failed to format dialogue" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
