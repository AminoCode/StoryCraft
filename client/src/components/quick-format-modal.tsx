import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered } from "lucide-react";

interface QuickFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFormat: (formatType: string, options?: any) => void;
}

const formatOptions = [
  {
    id: "dialogue-standard",
    name: "Standard Dialogue",
    description: "Classic novel format with proper quotation marks",
    icon: Quote,
    example: '"Hello," she said. "How are you today?"'
  },
  {
    id: "dialogue-script",
    name: "Script Format",
    description: "Screenplay style dialogue formatting",
    icon: Type,
    example: "SARAH\nHello. How are you today?"
  },
  {
    id: "dialogue-minimal",
    name: "Minimal Dialogue",
    description: "Clean format with em-dashes",
    icon: Quote,
    example: "—Hello. How are you today?"
  },
  {
    id: "paragraph-indent",
    name: "Paragraph Indents",
    description: "Traditional book formatting with indented paragraphs",
    icon: AlignLeft,
    example: "    The morning sun cast long shadows..."
  },
  {
    id: "paragraph-block",
    name: "Block Paragraphs",
    description: "Modern formatting with line breaks between paragraphs",
    icon: AlignLeft,
    example: "The morning sun cast long shadows.\n\nShe walked slowly down the path."
  },
  {
    id: "list-bulleted",
    name: "Bullet Points",
    description: "Convert selection to bulleted list",
    icon: List,
    example: "• First item\n• Second item\n• Third item"
  },
  {
    id: "list-numbered",
    name: "Numbered List",
    description: "Convert selection to numbered list",
    icon: ListOrdered,
    example: "1. First item\n2. Second item\n3. Third item"
  },
  {
    id: "center-text",
    name: "Center Text",
    description: "Center align selected text",
    icon: AlignCenter,
    example: "           Centered Text           "
  }
];

export default function QuickFormatModal({ isOpen, onClose, onFormat }: QuickFormatModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  const handleFormatApply = (formatId: string) => {
    onFormat(formatId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Quick Format
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {formatOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Card 
                key={option.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedFormat === option.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedFormat(option.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <IconComponent className="h-4 w-4" />
                    {option.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                  <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                    {option.example}
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFormatApply(option.id);
                    }}
                  >
                    Apply Format
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}