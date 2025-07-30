import { 
  type Project,
  type Chapter,
  type Document, 
  type Character, 
  type Location, 
  type TimelineEvent, 
  type AiSuggestion,
  type InsertProject,
  type InsertChapter,
  type InsertDocument, 
  type InsertCharacter, 
  type InsertLocation, 
  type InsertTimelineEvent, 
  type InsertAiSuggestion 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Project operations
  getAllProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  
  // Chapter operations
  getChaptersByProject(projectId: string): Promise<Chapter[]>;
  getChapter(id: string): Promise<Chapter | undefined>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter | undefined>;
  deleteChapter(id: string): Promise<boolean>;
  
  // Document operations (keeping for compatibility)
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;
  
  // Character operations
  getCharactersByProject(projectId: string): Promise<Character[]>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: string, updates: Partial<Character>): Promise<Character | undefined>;
  deleteCharacter(id: string): Promise<boolean>;
  
  // Location operations
  getLocationsByProject(projectId: string): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: string, updates: Partial<Location>): Promise<Location | undefined>;
  deleteLocation(id: string): Promise<boolean>;
  
  // Timeline operations
  getTimelineEventsByProject(projectId: string): Promise<TimelineEvent[]>;
  createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent>;
  updateTimelineEvent(id: string, updates: Partial<TimelineEvent>): Promise<TimelineEvent | undefined>;
  deleteTimelineEvent(id: string): Promise<boolean>;
  
  // AI Suggestions operations
  getAiSuggestionsByProject(projectId: string): Promise<AiSuggestion[]>;
  createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion>;
  updateAiSuggestion(id: string, updates: Partial<AiSuggestion>): Promise<AiSuggestion | undefined>;
  deleteAiSuggestion(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private chapters: Map<string, Chapter>;
  private documents: Map<string, Document>;
  private characters: Map<string, Character>;
  private locations: Map<string, Location>;
  private timelineEvents: Map<string, TimelineEvent>;
  private aiSuggestions: Map<string, AiSuggestion>;

  constructor() {
    this.projects = new Map();
    this.chapters = new Map();
    this.documents = new Map();
    this.characters = new Map();
    this.locations = new Map();
    this.timelineEvents = new Map();
    this.aiSuggestions = new Map();
    
    // Create default project and chapters for demo
    const defaultProject: Project = {
      id: "default-project",
      title: "The Mansion Mystery",
      description: "A supernatural thriller set in an old Victorian mansion",
      genre: "Thriller",
      lastOpened: new Date(),
      createdAt: new Date(),
    };
    this.projects.set(defaultProject.id, defaultProject);

    const defaultChapter: Chapter = {
      id: "default-chapter",
      projectId: "default-project",
      title: "Chapter 3: The Mysterious Letter",
      content: `Sarah walked through the dimly lit corridor, her footsteps echoing against the marble floors. The old mansion held secrets that she was determined to uncover.

"I know you're hiding something," she whispered to the empty hallway, her voice barely audible above the wind that rattled the windows.

As she approached the library door, Sarah noticed something peculiar. The doorknob was warm to the touch, despite the cold temperature throughout the rest of the house. She turned it slowly, and the door creaked open to reveal—`,
      wordCount: 847,
      order: 3,
      lastSaved: new Date(),
      createdAt: new Date(),
    };
    this.chapters.set(defaultChapter.id, defaultChapter);

    // Keep the old document for compatibility
    const defaultDoc: Document = {
      id: "default-doc",
      title: "Chapter 3: The Mysterious Letter",
      content: defaultChapter.content,
      wordCount: 847,
      lastSaved: new Date(),
      createdAt: new Date(),
    };
    this.documents.set(defaultDoc.id, defaultDoc);
  }

  // Project operations
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort((a, b) => 
      new Date(b.lastOpened || 0).getTime() - new Date(a.lastOpened || 0).getTime()
    );
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      ...insertProject,
      id,
      lastOpened: new Date(),
      createdAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updated = { ...project, ...updates, lastOpened: new Date() };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Chapter operations
  async getChaptersByProject(projectId: string): Promise<Chapter[]> {
    return Array.from(this.chapters.values())
      .filter((chapter) => chapter.projectId === projectId)
      .sort((a, b) => a.order - b.order);
  }

  async getChapter(id: string): Promise<Chapter | undefined> {
    return this.chapters.get(id);
  }

  async createChapter(insertChapter: InsertChapter): Promise<Chapter> {
    const id = randomUUID();
    const chapter: Chapter = {
      ...insertChapter,
      id,
      content: insertChapter.content || "",
      wordCount: insertChapter.wordCount || 0,
      lastSaved: new Date(),
      createdAt: new Date(),
    };
    this.chapters.set(id, chapter);
    return chapter;
  }

  async updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter | undefined> {
    const chapter = this.chapters.get(id);
    if (!chapter) return undefined;
    
    const updated = { ...chapter, ...updates, lastSaved: new Date() };
    this.chapters.set(id, updated);
    return updated;
  }

  async deleteChapter(id: string): Promise<boolean> {
    return this.chapters.delete(id);
  }

  // Document operations
  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = {
      ...insertDocument,
      id,
      content: insertDocument.content || "",
      wordCount: insertDocument.wordCount || 0,
      lastSaved: new Date(),
      createdAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updated = { ...document, ...updates, lastSaved: new Date() };
    this.documents.set(id, updated);
    return updated;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Character operations
  async getCharactersByProject(projectId: string): Promise<Character[]> {
    return Array.from(this.characters.values()).filter(
      (character) => character.projectId === projectId,
    );
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const id = randomUUID();
    const character: Character = { 
      ...insertCharacter, 
      id,
      role: insertCharacter.role || null,
      age: insertCharacter.age || null,
      appearance: insertCharacter.appearance || null,
      traits: insertCharacter.traits || null,
      relationships: insertCharacter.relationships || null,
      lastMentioned: insertCharacter.lastMentioned || null,
      chapterId: insertCharacter.chapterId || null,
    };
    this.characters.set(id, character);
    return character;
  }

  async updateCharacter(id: string, updates: Partial<Character>): Promise<Character | undefined> {
    const character = this.characters.get(id);
    if (!character) return undefined;
    
    const updated = { ...character, ...updates };
    this.characters.set(id, updated);
    return updated;
  }

  async deleteCharacter(id: string): Promise<boolean> {
    return this.characters.delete(id);
  }

  // Location operations
  async getLocationsByProject(projectId: string): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(
      (location) => location.projectId === projectId,
    );
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = randomUUID();
    const location: Location = { 
      ...insertLocation, 
      id,
      type: insertLocation.type || null,
      description: insertLocation.description || null,
      keyFeatures: insertLocation.keyFeatures || null,
      firstMentioned: insertLocation.firstMentioned || null,
      chapterId: insertLocation.chapterId || null,
    };
    this.locations.set(id, location);
    return location;
  }

  async updateLocation(id: string, updates: Partial<Location>): Promise<Location | undefined> {
    const location = this.locations.get(id);
    if (!location) return undefined;
    
    const updated = { ...location, ...updates };
    this.locations.set(id, updated);
    return updated;
  }

  async deleteLocation(id: string): Promise<boolean> {
    return this.locations.delete(id);
  }

  // Timeline operations
  async getTimelineEventsByProject(projectId: string): Promise<TimelineEvent[]> {
    return Array.from(this.timelineEvents.values())
      .filter((event) => event.projectId === projectId)
      .sort((a, b) => a.order - b.order);
  }

  async createTimelineEvent(insertEvent: InsertTimelineEvent): Promise<TimelineEvent> {
    const id = randomUUID();
    const event: TimelineEvent = { 
      ...insertEvent, 
      id,
      chapter: insertEvent.chapter || null,
      chapterId: insertEvent.chapterId || null,
      description: insertEvent.description || null,
    };
    this.timelineEvents.set(id, event);
    return event;
  }

  async updateTimelineEvent(id: string, updates: Partial<TimelineEvent>): Promise<TimelineEvent | undefined> {
    const event = this.timelineEvents.get(id);
    if (!event) return undefined;
    
    const updated = { ...event, ...updates };
    this.timelineEvents.set(id, updated);
    return updated;
  }

  async deleteTimelineEvent(id: string): Promise<boolean> {
    return this.timelineEvents.delete(id);
  }

  // AI Suggestions operations
  async getAiSuggestionsByProject(projectId: string): Promise<AiSuggestion[]> {
    return Array.from(this.aiSuggestions.values()).filter(
      (suggestion) => suggestion.projectId === projectId,
    );
  }

  async createAiSuggestion(insertSuggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const id = randomUUID();
    const suggestion: AiSuggestion = { 
      ...insertSuggestion, 
      id,
      applied: insertSuggestion.applied || false,
      chapterId: insertSuggestion.chapterId || null,
    };
    this.aiSuggestions.set(id, suggestion);
    return suggestion;
  }

  async updateAiSuggestion(id: string, updates: Partial<AiSuggestion>): Promise<AiSuggestion | undefined> {
    const suggestion = this.aiSuggestions.get(id);
    if (!suggestion) return undefined;
    
    const updated = { ...suggestion, ...updates };
    this.aiSuggestions.set(id, updated);
    return updated;
  }

  async deleteAiSuggestion(id: string): Promise<boolean> {
    return this.aiSuggestions.delete(id);
  }
}

export const storage = new MemStorage();
