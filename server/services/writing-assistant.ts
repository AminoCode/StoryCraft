import OpenAI from "openai";
import { openai } from "./openai";

export interface EntityExtractionResult {
  characters: Array<{
    name: string;
    role?: string;
    traits?: string;
    context: string;
  }>;
  locations: Array<{
    name: string;
    type?: string;
    description?: string;
    context: string;
  }>;
  events: Array<{
    title: string;
    description?: string;
    context: string;
  }>;
}

export interface WritingSuggestion {
  type: 'synonym' | 'grammar' | 'style' | 'plot';
  originalText: string;
  suggestion: string;
  position: number;
  reason?: string;
}

export class WritingAssistantService {
  private openai: OpenAI;

  constructor() {
    this.openai = openai;
  }

  async extractEntities(text: string): Promise<EntityExtractionResult> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an expert at analyzing narrative text and extracting story elements. 
            Extract characters, locations, and events from the provided text. 
            For characters, identify names, potential roles (protagonist, antagonist, etc.), personality traits, and context.
            For locations, identify names, types (mansion, library, etc.), descriptions, and context.
            For events, identify significant plot points, actions, or story developments.
            Respond with JSON in this exact format: {
              "characters": [{"name": "string", "role": "string", "traits": "string", "context": "string"}],
              "locations": [{"name": "string", "type": "string", "description": "string", "context": "string"}],
              "events": [{"title": "string", "description": "string", "context": "string"}]
            }`
          },
          {
            role: "user",
            content: text
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result as EntityExtractionResult;
    } catch (error) {
      console.error('Error extracting entities:', error);
      return { characters: [], locations: [], events: [] };
    }
  }

  async generateSynonyms(word: string, context: string): Promise<string[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `Provide contextually appropriate synonyms for the given word within the provided context. 
            Consider tone, formality, and narrative style. Return 3-5 suitable alternatives.
            Respond with JSON: {"synonyms": ["word1", "word2", "word3"]}`
          },
          {
            role: "user",
            content: `Word: "${word}"\nContext: "${context}"`
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"synonyms": []}');
      return result.synonyms || [];
    } catch (error) {
      console.error('Error generating synonyms:', error);
      return [];
    }
  }

  async analyzeWriting(text: string): Promise<WritingSuggestion[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `Analyze the provided text for writing improvements. Look for:
            1. Grammar and punctuation errors
            2. Style improvements (word choice, sentence structure)
            3. Plot consistency issues
            4. Opportunities for better word choices
            
            For each suggestion, provide the original text, suggested improvement, approximate position (character index), and type.
            Respond with JSON: {
              "suggestions": [
                {
                  "type": "grammar|style|plot|synonym",
                  "originalText": "text to replace",
                  "suggestion": "improved text",
                  "position": 0,
                  "reason": "explanation"
                }
              ]
            }`
          },
          {
            role: "user",
            content: text
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
      return result.suggestions || [];
    } catch (error) {
      console.error('Error analyzing writing:', error);
      return [];
    }
  }

  async generateWritingPrompt(text: string, context?: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a creative writing coach. Based on the provided text, generate a helpful writing prompt or suggestion to continue the story. 
            Consider character development, plot advancement, sensory details, and narrative tension.
            Keep suggestions concise and actionable.`
          },
          {
            role: "user",
            content: `Current text: "${text}"\n${context ? `Context: ${context}` : ''}`
          }
        ],
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating writing prompt:', error);
      return '';
    }
  }

  async formatDialogue(text: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `Format the provided text with proper dialogue punctuation and structure. 
            Ensure correct use of quotation marks, commas, and paragraph breaks for dialogue.
            Maintain the original meaning and style while improving formatting.`
          },
          {
            role: "user",
            content: text
          }
        ],
      });

      return response.choices[0].message.content || text;
    } catch (error) {
      console.error('Error formatting dialogue:', error);
      return text;
    }
  }
}

export const writingAssistant = new WritingAssistantService();
