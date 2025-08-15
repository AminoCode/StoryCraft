import { useEffect, useRef, useState } from "react";
import { useWritingAssistant } from "@/hooks/use-writing-assistant";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import GrammarSuggestionsPanel from "@/components/grammar-suggestions-panel";

export interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  documentId: string;
  projectId?: string;
  style?: React.CSSProperties;

}

interface AiSuggestion {
  type: string;
  originalText: string;
  suggestion: string;
  position: number;
  reason?: string;
}

export default function RichTextEditor({ 
  content, 
  onChange, 
  documentId, 
  projectId, 
  style,

}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [writingPrompt, setWritingPrompt] = useState("");

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
      // Suggestions are handled by parent component
      
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



  return (
    <div className="h-full bg-white">
      <div className="h-full overflow-y-auto">
        <div
          ref={editorRef}
          className="rich-text-editor prose max-w-none font-serif leading-relaxed focus:outline-none bg-white text-gray-900 p-8"
          contentEditable
          onInput={handleInput}
          style={{ 
            fontSize: style?.fontSize || '18px', 
            lineHeight: style?.lineHeight || '1.7',
            fontFamily: style?.fontFamily || 'serif',
            minHeight: '100vh',
            ...style
          }}
          suppressContentEditableWarning={true}
        />

        {/* AI Suggestions - Now handled by GrammarSuggestionsPanel at bottom */}

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
