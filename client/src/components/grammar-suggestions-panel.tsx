import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ChevronLeft, ChevronRight } from "lucide-react";

interface AiSuggestion {
  type: string;
  originalText: string;
  suggestion: string;
  position: number;
  reason?: string;
}

interface GrammarSuggestionsPanelProps {
  suggestions: AiSuggestion[];
  onClose: () => void;
}

export default function GrammarSuggestionsPanel({ 
  suggestions, 
  onClose 
}: GrammarSuggestionsPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!suggestions.length) return null;

  const currentSuggestion = suggestions[currentIndex];
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < suggestions.length - 1;

  const goToPrevious = () => {
    if (canGoBack) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (canGoForward) setCurrentIndex(currentIndex + 1);
  };

  const handleApply = () => {
    // Apply suggestion logic would go here
    console.log('Applied suggestion:', currentSuggestion);
    // Move to next suggestion if available, otherwise close
    if (canGoForward) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handleDismiss = () => {
    // Dismiss suggestion logic would go here
    console.log('Dismissed suggestion:', currentSuggestion);
    // Move to next suggestion if available, otherwise close
    if (canGoForward) {
      setCurrentIndex(currentIndex + 1);
    } else if (suggestions.length > 1) {
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-2xl w-full mx-4 z-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            {currentSuggestion.type} Suggestion
          </Badge>
          <span className="text-xs text-gray-500">
            {currentIndex + 1} of {suggestions.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={goToPrevious}
            disabled={!canGoBack}
            className="h-6 w-6 p-0"
          >
            <ChevronLeft size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={goToNext}
            disabled={!canGoForward}
            className="h-6 w-6 p-0"
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          <span className="font-medium">From:</span> "{currentSuggestion.originalText}"
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          <span className="font-medium">To:</span> "{currentSuggestion.suggestion}"
        </p>
        {currentSuggestion.reason && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {currentSuggestion.reason}
          </p>
        )}
      </div>

      <div className="flex space-x-2 justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={handleDismiss}
          className="h-8 px-3 text-xs"
        >
          <X size={12} className="mr-1" />
          Dismiss
        </Button>
        <Button
          size="sm"
          onClick={handleApply}
          className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700"
        >
          <Check size={12} className="mr-1" />
          Apply
        </Button>
      </div>
    </div>
  );
}