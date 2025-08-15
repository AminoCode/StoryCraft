import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Document } from "@shared/schema";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  document?: Document;
}

export default function ExportModal({ isOpen, onClose, document }: ExportModalProps) {
  const [format, setFormat] = useState("docx");
  const [includeCharacters, setIncludeCharacters] = useState(true);
  const [includeLocations, setIncludeLocations] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create and download file based on format
    const exportData = {
      document,
      includeCharacters,
      includeLocations,
      includeTimeline,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document?.title || 'document'}.${format}`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExporting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-96 max-w-90vw bg-white border border-gray-200">
        <DialogHeader>
          <DialogTitle>Export Document</DialogTitle>
          <DialogDescription>
            Export your document in multiple formats with optional story elements.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="format" className="text-sm font-medium text-gray-700 mb-2 block">
              Export Format
            </Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="docx">Microsoft Word (.docx)</SelectItem>
                <SelectItem value="pdf">PDF Document (.pdf)</SelectItem>
                <SelectItem value="epub">eBook (.epub)</SelectItem>
                <SelectItem value="txt">Plain Text (.txt)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Include
            </Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="characters"
                  checked={includeCharacters}
                  onCheckedChange={(checked) => setIncludeCharacters(checked === true)}
                />
                <Label htmlFor="characters" className="text-sm">
                  Character profiles
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="locations"
                  checked={includeLocations}
                  onCheckedChange={(checked) => setIncludeLocations(checked === true)}
                />
                <Label htmlFor="locations" className="text-sm">
                  Location descriptions
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="timeline"
                  checked={includeTimeline}
                  onCheckedChange={(checked) => setIncludeTimeline(checked === true)}
                />
                <Label htmlFor="timeline" className="text-sm">
                  Timeline summary
                </Label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700" 
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              'Export'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
