import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Book, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ThesaurusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SynonymData {
  word: string;
  synonyms: string[];
  antonyms: string[];
  definitions: string[];
}

export default function ThesaurusModal({ isOpen, onClose }: ThesaurusModalProps) {
  const [searchWord, setSearchWord] = useState("");
  const [selectedWord, setSelectedWord] = useState("");

  const { data: synonymData, isLoading, error } = useQuery<SynonymData>({
    queryKey: ["/api/thesaurus", selectedWord],
    enabled: !!selectedWord,
  });

  const handleSearch = () => {
    if (searchWord.trim()) {
      setSelectedWord(searchWord.trim().toLowerCase());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const replaceWord = (synonym: string) => {
    // This would integrate with the text editor to replace the selected word
    // For now, we'll copy to clipboard
    navigator.clipboard.writeText(synonym);
    
    // You could add a toast notification here
    console.log(`Copied "${synonym}" to clipboard`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl max-h-[80vh] bg-white border border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            Thesaurus
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Section */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter a word to find synonyms..."
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>

          {/* Results Section */}
          {selectedWord && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {isLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Finding synonyms...</p>
                </div>
              )}

              {error && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <p className="text-red-800 text-sm">
                      Unable to find synonyms for "{selectedWord}". Please try another word.
                    </p>
                  </CardContent>
                </Card>
              )}

              {synonymData && (
                <div className="space-y-4">
                  {/* Word Header */}
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <h3 className="text-lg font-semibold capitalize">{synonymData.word}</h3>
                  </div>

                  {/* Definitions */}
                  {synonymData.definitions && synonymData.definitions.length > 0 && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2 text-blue-900">Definitions</h4>
                        <ul className="space-y-1 text-sm text-blue-800">
                          {synonymData.definitions.slice(0, 3).map((def, index) => (
                            <li key={index} className="list-disc list-inside">{def}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Synonyms */}
                  {synonymData.synonyms && synonymData.synonyms.length > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-3 text-green-900">Synonyms</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {synonymData.synonyms.slice(0, 12).map((synonym, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              className="justify-between h-auto p-2 hover:bg-green-50"
                              onClick={() => replaceWord(synonym)}
                            >
                              <span className="text-sm">{synonym}</span>
                              <ArrowRight className="h-3 w-3 text-green-600" />
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Antonyms */}
                  {synonymData.antonyms && synonymData.antonyms.length > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-3 text-red-900">Antonyms</h4>
                        <div className="flex flex-wrap gap-2">
                          {synonymData.antonyms.slice(0, 8).map((antonym, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="border-red-200 text-red-800 hover:bg-red-50 cursor-pointer"
                              onClick={() => replaceWord(antonym)}
                            >
                              {antonym}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          {!selectedWord && (
            <Card className="bg-gray-50">
              <CardContent className="p-4 text-center">
                <Book className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Enter a word above to find synonyms, antonyms, and definitions.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Click on any synonym to copy it to your clipboard.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}