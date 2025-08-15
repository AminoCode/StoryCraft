import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wand2 } from "lucide-react";
import { useWritingAssistant } from "@/hooks/use-writing-assistant";

interface AiModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  projectId?: string;
}

interface Suggestion {
  type: string;
  title: string;
  description: string;
  action?: () => void;
}

export default function AiModal({ isOpen, onClose, content, projectId }: AiModalProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { analyzeText } = useWritingAssistant();

  useEffect(() => {
    if (isOpen && content) {
      generateSuggestions();
    }
  }, [isOpen, content]);

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      const analysis = await analyzeText(content);
      
      const mockSuggestions: Suggestion[] = [
        {
          type: "description",
          title: "Enhance Description",
          description: "Consider adding more sensory details to create atmosphere.",
        },
        {
          type: "character",
          title: "Character Development", 
          description: "Show Sarah's emotional state through actions or internal thoughts.",
        },
        {
          type: "dialogue",
          title: "Dialogue Enhancement",
          description: "Add subtext to dialogue to reveal character motivations.",
        }
      ];
      
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-96 max-w-90vw bg-white border border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wand2 className="text-blue-600" size={20} />
            <span>AI Writing Assistant</span>
          </DialogTitle>

        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Suggested Improvements:</h4>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <Card key={index} className={`border ${
                      suggestion.type === 'description' ? 'border-blue-200 bg-blue-50' :
                      suggestion.type === 'character' ? 'border-green-200 bg-green-50' :
                      'border-purple-200 bg-purple-50'
                    }`}>
                      <CardContent className="p-3">
                        <div className={`text-sm font-medium mb-1 ${
                          suggestion.type === 'description' ? 'text-blue-800' :
                          suggestion.type === 'character' ? 'text-green-800' :
                          'text-purple-800'
                        }`}>
                          {suggestion.title}
                        </div>
                        <div className={`text-sm ${
                          suggestion.type === 'description' ? 'text-blue-600' :
                          suggestion.type === 'character' ? 'text-green-600' :
                          'text-purple-600'
                        }`}>
                          {suggestion.description}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Later
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={onClose}
                >
                  Apply Suggestions
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
