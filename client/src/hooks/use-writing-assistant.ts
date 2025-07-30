import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface WritingSuggestion {
  type: 'synonym' | 'grammar' | 'style' | 'plot';
  originalText: string;
  suggestion: string;
  position: number;
  reason?: string;
}

export interface AnalysisResult {
  suggestions: WritingSuggestion[];
}

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

export function useWritingAssistant() {
  const extractEntitiesMutation = useMutation({
    mutationFn: async (text: string): Promise<EntityExtractionResult> => {
      const response = await apiRequest("POST", "/api/ai/extract-entities", { text });
      return response.json();
    },
  });

  const generateSynonymsMutation = useMutation({
    mutationFn: async ({ word, context }: { word: string; context: string }): Promise<{ synonyms: string[] }> => {
      const response = await apiRequest("POST", "/api/ai/synonyms", { word, context });
      return response.json();
    },
  });

  const analyzeTextMutation = useMutation({
    mutationFn: async (text: string): Promise<AnalysisResult> => {
      const response = await apiRequest("POST", "/api/ai/analyze", { text });
      return response.json();
    },
  });

  const generateWritingPromptMutation = useMutation({
    mutationFn: async (text: string, context?: string): Promise<string> => {
      const response = await apiRequest("POST", "/api/ai/writing-prompt", { text, context });
      const result = await response.json();
      return result.prompt;
    },
  });

  const formatDialogueMutation = useMutation({
    mutationFn: async (text: string): Promise<string> => {
      const response = await apiRequest("POST", "/api/ai/format-dialogue", { text });
      const result = await response.json();
      return result.formattedText;
    },
  });

  return {
    extractEntities: (text: string) => extractEntitiesMutation.mutateAsync(text),
    generateSynonyms: (word: string, context: string) => 
      generateSynonymsMutation.mutateAsync({ word, context }),
    analyzeText: (text: string) => analyzeTextMutation.mutateAsync(text),
    generateWritingPrompt: (text: string, context?: string) => 
      generateWritingPromptMutation.mutateAsync(text),
    formatDialogue: (text: string) => formatDialogueMutation.mutateAsync(text),
    
    // Loading states
    isExtractingEntities: extractEntitiesMutation.isPending,
    isGeneratingSynonyms: generateSynonymsMutation.isPending,
    isAnalyzingText: analyzeTextMutation.isPending,
    isGeneratingPrompt: generateWritingPromptMutation.isPending,
    isFormattingDialogue: formatDialogueMutation.isPending,
  };
}
