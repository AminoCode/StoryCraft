import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Bold, 
  Italic, 
  Underline, 
  Quote, 
  Wand2, 
  Book, 
  Search, 
  Download, 
  Settings,
  Feather
} from "lucide-react";

interface FloatingToolbarProps {
  onAiSuggestions: () => void;
  onExport: () => void;
  onFormatDialogue: () => void;
  onThesaurus: () => void;
}

export default function FloatingToolbar({ 
  onAiSuggestions, 
  onExport, 
  onFormatDialogue,
  onThesaurus 
}: FloatingToolbarProps) {
  const handleFormatting = (command: string) => {
    document.execCommand(command, false);
  };

  return (
    <div className="w-16 bg-white shadow-lg border-r border-gray-200 flex flex-col items-center py-4 space-y-3 z-20">
      {/* Logo/Brand */}
      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
        <Feather className="text-white text-lg" size={20} />
      </div>
      
      {/* Text Formatting Tools */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600"
            onClick={() => handleFormatting('bold')}
          >
            <Bold size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Bold</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600"
            onClick={() => handleFormatting('italic')}
          >
            <Italic size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Italic</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600"
            onClick={() => handleFormatting('underline')}
          >
            <Underline size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Underline</TooltipContent>
      </Tooltip>
      
      {/* Divider */}
      <div className="w-8 h-px bg-gray-200"></div>
      
      {/* Writing Tools */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600"
            onClick={onFormatDialogue}
          >
            <Quote size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Format Dialogue</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600"
            onClick={onAiSuggestions}
          >
            <Wand2 size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">AI Suggestions</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600"
            onClick={onThesaurus}
          >
            <Book size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Thesaurus</TooltipContent>
      </Tooltip>
      
      {/* Divider */}
      <div className="w-8 h-px bg-gray-200"></div>
      
      {/* Utility Tools */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600"
          >
            <Search size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Search & Replace</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600"
            onClick={onExport}
          >
            <Download size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Export</TooltipContent>
      </Tooltip>
      
      {/* Bottom Actions */}
      <div className="flex-1"></div>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600"
          >
            <Settings size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Settings</TooltipContent>
      </Tooltip>
    </div>
  );
}
