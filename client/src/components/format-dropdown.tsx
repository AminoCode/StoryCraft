import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  Quote,
  Bold,
  Italic
} from "lucide-react";

interface FormatDropdownProps {
  onFormat: (type: string, value?: string) => void;
}

export default function FormatDropdown({ onFormat }: FormatDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 px-2">
          <Type size={14} className="mr-1" />
          Format
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Text Formatting</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onFormat('bold')}>
          <Bold size={14} className="mr-2" />
          Bold
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFormat('italic')}>
          <Italic size={14} className="mr-2" />
          Italic
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Alignment</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onFormat('align', 'left')}>
          <AlignLeft size={14} className="mr-2" />
          Align Left
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFormat('align', 'center')}>
          <AlignCenter size={14} className="mr-2" />
          Align Center
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFormat('align', 'right')}>
          <AlignRight size={14} className="mr-2" />
          Align Right
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Dialogue Styles</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onFormat('dialogue', 'standard')}>
          <Quote size={14} className="mr-2" />
          Standard Dialogue
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFormat('dialogue', 'thought')}>
          <Quote size={14} className="mr-2" />
          Thought Style
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFormat('dialogue', 'action')}>
          <Quote size={14} className="mr-2" />
          Action Dialogue
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Structure</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onFormat('list', 'bullet')}>
          <List size={14} className="mr-2" />
          Bullet List
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFormat('list', 'numbered')}>
          <List size={14} className="mr-2" />
          Numbered List
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFormat('paragraph', 'scene-break')}>
          <Type size={14} className="mr-2" />
          Scene Break
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFormat('paragraph', 'chapter-break')}>
          <Type size={14} className="mr-2" />
          Chapter Break
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}