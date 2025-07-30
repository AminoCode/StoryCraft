import { useEffect, useRef, useState } from "react";
import { useWritingAssistant } from "@/hooks/use-writing-assistant";
import { Button } from "@/components/ui/button";
import { Lightbulb, X, Check } from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  documentId: string;
  projectId?: string;
}

interface AiSuggestion {
  type: string;
  originalText: string;
  suggestion: string;
  position: number;
  reason?: string;
}

export default function RichTextEditor({ content, onChange, documentId, projectId }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [writingPrompt, setWritingPrompt] = useState("");
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const { generateWritingPrompt, analyzeText } = useWritingAssistant();

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
      
      // Debounced AI analysis
      clearTimeout((window as any).aiAnalysisTimeout);
      (window as any).aiAnalysisTimeout = setTimeout(() => {
        analyzeSuggestions(newContent);
      }, 2000);
    }
  };

  const analyzeSuggestions = async (text: string) => {
    try {
      const result = await analyzeText(text, projectId);
      if (result?.suggestions) {
        setSuggestions(result.suggestions);
      }
      
      // If entities were auto-updated, refresh the sidebar data
      if (result?.autoUpdated && projectId) {
        // Import queryClient to invalidate story element queries
        const { queryClient } = await import("@/lib/queryClient");
        
        // Invalidate all story element queries for this project
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "characters"] });
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "locations"] });
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "timeline"] });
      }
    } catch (error) {
      console.error('Error analyzing text:', error);
    }
  };

  const handleGeneratePrompt = async () => {
    if (content) {
      try {
        const prompt = await generateWritingPrompt(content);
        setWritingPrompt(prompt);
        setShowPrompt(true);
      } catch (error) {
        console.error('Error generating prompt:', error);
      }
    }
  };

  const applySuggestion = (suggestion: AiSuggestion) => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML;
      const updatedContent = currentContent.replace(
        suggestion.originalText, 
        suggestion.suggestion
      );
      editorRef.current.innerHTML = updatedContent;
      onChange(updatedContent);
      
      // Remove the applied suggestion
      setSuggestions(prev => prev.filter(s => s !== suggestion));
    }
  };

  const dismissSuggestion = (suggestion: AiSuggestion) => {
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  return (
    <div className="h-full p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div
          ref={editorRef}
          className="prose prose-lg prose-gray max-w-none font-serif leading-relaxed min-h-96 focus:outline-none"
          contentEditable
          onInput={handleInput}
          style={{ fontSize: '18px', lineHeight: '1.7' }}
          suppressContentEditableWarning={true}
        />

        {/* AI Suggestions */}
        {suggestions.map((suggestion, index) => (
          <div key={index} className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs font-medium text-blue-700 capitalize">
                    {suggestion.type} Suggestion
                  </span>
                </div>
                <p className="text-sm text-blue-600 mb-2">
                  "{suggestion.originalText}" → "{suggestion.suggestion}"
                </p>
                {suggestion.reason && (
                  <p className="text-xs text-blue-500">{suggestion.reason}</p>
                )}
              </div>
              <div className="flex space-x-2 ml-4">
                <Button
                  size="sm"
                  className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700"
                  onClick={() => applySuggestion(suggestion)}
                >
                  <Check size={12} className="mr-1" />
                  Apply
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => dismissSuggestion(suggestion)}
                >
                  <X size={12} />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* AI Writing Prompt */}
        {showPrompt && (
          <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 bg-blue-50 my-6">
            <div className="flex items-center space-x-3 mb-3">
              <Lightbulb className="text-blue-500" size={20} />
              <span className="text-sm font-medium text-blue-700">AI Writing Prompt</span>
            </div>
            <p className="text-sm text-blue-600 mb-3">{writingPrompt}</p>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowPrompt(false)}
              >
                Use Suggestion
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 text-xs"
                onClick={() => setShowPrompt(false)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Generate Prompt Button */}
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={handleGeneratePrompt}
            className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
          >
            <Lightbulb size={16} className="mr-2" />
            Get AI Writing Prompt
          </Button>
        </div>
      </div>
    </div>
  );
}
