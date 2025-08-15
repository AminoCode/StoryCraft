import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Minus,
  Plus,
  Wand2, 
  Book, 
  Search, 
  Download, 
  Settings,
  Feather,
  Quote,
  List,
  ListOrdered,
  Link,
  PanelLeft,
  PanelBottom,
  SpellCheck
} from "lucide-react";

interface EnhancedToolbarProps {
  onAiSuggestions: () => void;
  onExport: () => void;
  onQuickFormat: () => void;
  onThesaurus: () => void;
  onRelationshipView: () => void;
  onLayoutToggle: () => void;
  onSpellCheck: () => void;
  layoutMode: "sidebar" | "bottom";
  onFontSizeChange: (size: string) => void;
  onFontFamilyChange: (family: string) => void;
  onLineSpacingChange: (spacing: string) => void;
  currentFontSize: string;
  currentFontFamily: string;
  currentLineSpacing: string;
  children?: React.ReactNode;
}

export default function EnhancedToolbar({ 
  onAiSuggestions, 
  onExport, 
  onQuickFormat,
  onThesaurus,
  onRelationshipView,
  onLayoutToggle,
  onSpellCheck,
  layoutMode,
  onFontSizeChange,
  onFontFamilyChange,
  onLineSpacingChange,
  currentFontSize,
  currentFontFamily,
  currentLineSpacing,
  children
}: EnhancedToolbarProps) {
  const handleFormatting = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleHeading = (level: string) => {
    document.execCommand('formatBlock', false, level);
  };

  return (
    <div className="w-16 bg-white shadow-lg border-r border-gray-200 flex flex-col items-center py-4 space-y-2 z-20 overflow-y-auto max-h-screen">
      {/* Logo/Brand */}
      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
        <Feather className="text-white text-lg" size={20} />
      </div>
      
      {/* Layout Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600"
            onClick={onLayoutToggle}
          >
            {layoutMode === "sidebar" ? <PanelBottom size={16} /> : <PanelLeft size={16} />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          Switch to {layoutMode === "sidebar" ? "Bottom" : "Sidebar"} Layout
        </TooltipContent>
      </Tooltip>

      <div className="w-8 h-px bg-gray-200 dark:bg-gray-600"></div>

      {/* Format Dropdown (from children) */}
      {children && (
        <div className="mb-2">
          {children}
        </div>
      )}

      <div className="w-8 h-px bg-gray-200 dark:bg-gray-600"></div>

      {/* Font Controls */}
      <div className="flex flex-col items-center space-y-1 w-full px-1">
        <Select value={currentFontFamily} onValueChange={onFontFamilyChange}>
          <SelectTrigger className="w-12 h-8 text-xs p-1">
            <Type size={12} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="serif">Serif</SelectItem>
            <SelectItem value="sans-serif">Sans</SelectItem>
            <SelectItem value="monospace">Mono</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Times New Roman">Times</SelectItem>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Helvetica">Helvetica</SelectItem>
          </SelectContent>
        </Select>

        <Select value={currentFontSize} onValueChange={onFontSizeChange}>
          <SelectTrigger className="w-12 h-8 text-xs p-1">
            <span className="text-xs">{currentFontSize}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12px">12</SelectItem>
            <SelectItem value="14px">14</SelectItem>
            <SelectItem value="16px">16</SelectItem>
            <SelectItem value="18px">18</SelectItem>
            <SelectItem value="20px">20</SelectItem>
            <SelectItem value="24px">24</SelectItem>
            <SelectItem value="28px">28</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-8 h-px bg-gray-200"></div>
      
      {/* Text Formatting */}
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

      <div className="w-8 h-px bg-gray-200"></div>

      {/* Alignment */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600"
            onClick={() => handleFormatting('justifyLeft')}
          >
            <AlignLeft size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Align Left</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600"
            onClick={() => handleFormatting('justifyCenter')}
          >
            <AlignCenter size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Center</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600"
            onClick={() => handleFormatting('justifyRight')}
          >
            <AlignRight size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Align Right</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600"
            onClick={() => handleFormatting('justifyFull')}
          >
            <AlignJustify size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Justify</TooltipContent>
      </Tooltip>

      <div className="w-8 h-px bg-gray-200"></div>

      {/* Lists */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600"
            onClick={() => handleFormatting('insertUnorderedList')}
          >
            <List size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Bullet List</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600"
            onClick={() => handleFormatting('insertOrderedList')}
          >
            <ListOrdered size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Numbered List</TooltipContent>
      </Tooltip>

      <div className="w-8 h-px bg-gray-200"></div>

      {/* Headings */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600 text-xs font-bold"
            onClick={() => handleHeading('h1')}
          >
            H1
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Heading 1</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600 text-xs font-bold"
            onClick={() => handleHeading('h2')}
          >
            H2
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Heading 2</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600 text-xs font-bold"
            onClick={() => handleHeading('h3')}
          >
            H3
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Heading 3</TooltipContent>
      </Tooltip>

      <div className="w-8 h-px bg-gray-200"></div>
      
      {/* Writing Tools */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600"
            onClick={onQuickFormat}
          >
            <Quote size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Quick Format</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600"
            onClick={onSpellCheck}
          >
            <SpellCheck size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Spell Check</TooltipContent>
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

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600"
            onClick={onRelationshipView}
          >
            <Link size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Story Relationships</TooltipContent>
      </Tooltip>
      
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