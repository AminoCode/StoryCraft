import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import EnhancedToolbar from "@/components/enhanced-toolbar";
import RichTextEditor from "@/components/rich-text-editor";
import ContextualSidebar from "@/components/contextual-sidebar";
import AiModal from "@/components/ai-modal";
import ExportModal from "@/components/export-modal";
import ThesaurusModal from "@/components/thesaurus-modal";
import QuickFormatModal from "@/components/quick-format-modal";
import RelationshipGraph from "@/components/relationship-graph";

import { useWritingAssistant } from "@/hooks/use-writing-assistant";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { ArrowLeft, Plus, BookOpen, Edit3, Save, Clock } from "lucide-react";
import type { Project, Chapter, InsertChapter, Document } from "@shared/schema";

export default function WriterPage() {
  const [, params] = useRoute("/writer/:projectId?/:chapterId?");
  const projectId = params?.projectId || "default-project";
  const chapterId = params?.chapterId;
  
  const [showAiModal, setShowAiModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showNewChapterDialog, setShowNewChapterDialog] = useState(false);
  const [showThesaurusModal, setShowThesaurusModal] = useState(false);
  const [showQuickFormatModal, setShowQuickFormatModal] = useState(false);
  const [showRelationshipView, setShowRelationshipView] = useState(false);
  const [content, setContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [layoutMode, setLayoutMode] = useState<"sidebar" | "bottom">("sidebar");
  const [fontSize, setFontSize] = useState("16px");
  const [fontFamily, setFontFamily] = useState("serif");
  const [lineSpacing, setLineSpacing] = useState("1.5");
  
  const { toast } = useToast();

  const { data: project, isLoading: isProjectLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
  });

  const { data: chapters = [], isLoading: isChaptersLoading } = useQuery<Chapter[]>({
    queryKey: ["/api/projects", projectId, "chapters"],
  });

  const { data: currentChapter, isLoading: isChapterLoading } = useQuery<Chapter>({
    queryKey: ["/api/chapters", chapterId],
    enabled: !!chapterId,
  });

  // Fallback to document API for compatibility
  const { data: document, isLoading: isDocumentLoading } = useQuery<Document>({
    queryKey: ["/api/documents", "default-doc"],
    enabled: !chapterId,
  });

  const { 
    analyzeText, 
    extractEntities, 
    formatDialogue,
    generateWritingPrompt 
  } = useWritingAssistant();

  const createChapterMutation = useMutation({
    mutationFn: async (data: InsertChapter) => {
      const response = await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create chapter");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "chapters"] });
      setShowNewChapterDialog(false);
      setNewChapterTitle("");
      toast({
        title: "Chapter created",
        description: "Your new chapter has been created successfully.",
      });
    },
  });

  const saveChapterMutation = useMutation({
    mutationFn: async (data: { content: string; wordCount: number }) => {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save chapter");
      return response.json();
    },
    onSuccess: () => {
      setLastSaved(new Date());
      queryClient.invalidateQueries({ queryKey: ["/api/chapters", chapterId] });
    },
  });

  useEffect(() => {
    if (currentChapter) {
      setContent(currentChapter.content || "");
      setWordCount(currentChapter.wordCount || 0);
      setLastSaved(currentChapter.lastSaved ? new Date(currentChapter.lastSaved) : null);
    } else if (document && !chapterId) {
      setContent(document.content);
      setWordCount(document.wordCount);
    }
  }, [currentChapter, document, chapterId]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    const words = newContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  const handleSave = () => {
    if (chapterId && content !== (currentChapter?.content || "")) {
      saveChapterMutation.mutate({ content, wordCount });
    }
  };

  const handleCreateChapter = () => {
    if (newChapterTitle.trim()) {
      const nextOrder = Math.max(...chapters.map(c => c.order), 0) + 1;
      createChapterMutation.mutate({
        projectId,
        title: newChapterTitle.trim(),
        content: "",
        order: nextOrder,
      });
    }
  };

  const handleAiSuggestions = () => {
    setShowAiModal(true);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleFormatDialogue = async () => {
    if (content) {
      const formatted = await formatDialogue(content);
      if (formatted) {
        setContent(formatted);
      }
    }
  };

  const handleThesaurus = () => {
    setShowThesaurusModal(true);
  };

  const handleQuickFormat = () => {
    setShowQuickFormatModal(true);
  };

  const handleRelationshipView = () => {
    setShowRelationshipView(true);
  };

  const toggleLayout = () => {
    setLayoutMode(layoutMode === "sidebar" ? "bottom" : "sidebar");
  };

  const handleSpellCheck = () => {
    // Basic spell check implementation using browser's built-in features
    const textEditor = window.document.querySelector('[contenteditable="true"]') as HTMLElement;
    if (textEditor) {
      textEditor.spellcheck = true;
      textEditor.focus();
    }
    toast({ title: "Spell Check", description: "Spell check enabled. Right-click on red underlined words for suggestions." });
  };

  const handleQuickFormatApply = (formatType: string) => {
    // Implementation for different formatting types
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    let formattedText = selectedText;
    
    switch (formatType) {
      case "dialogue-standard":
        formattedText = `"${selectedText.replace(/^["']|["']$/g, '')}"`;
        break;
      case "dialogue-script":
        formattedText = `CHARACTER\n${selectedText}`;
        break;
      case "dialogue-minimal":
        formattedText = `—${selectedText}`;
        break;
      case "paragraph-indent":
        formattedText = `    ${selectedText}`;
        break;
      case "center-text":
        window.document.execCommand('justifyCenter');
        return;
      case "list-bulleted":
        window.document.execCommand('insertUnorderedList');
        return;
      case "list-numbered":
        window.document.execCommand('insertOrderedList');
        return;
    }
    
    if (formattedText !== selectedText) {
      window.document.execCommand('insertText', false, formattedText);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (!chapterId || !currentChapter) return;
    
    const autoSaveTimer = setTimeout(() => {
      if (content !== currentChapter.content && content.trim()) {
        handleSave();
      }
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [content, chapterId, currentChapter]);

  const isLoading = isProjectLoading || isChaptersLoading || isChapterLoading || isDocumentLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <EnhancedToolbar
        onAiSuggestions={handleAiSuggestions}
        onExport={handleExport}
        onQuickFormat={handleQuickFormat}
        onThesaurus={handleThesaurus}
        onRelationshipView={handleRelationshipView}
        onLayoutToggle={toggleLayout}
        onSpellCheck={handleSpellCheck}
        layoutMode={layoutMode}
        onFontSizeChange={setFontSize}
        onFontFamilyChange={setFontFamily}
        onLineSpacingChange={setLineSpacing}
        currentFontSize={fontSize}
        currentFontFamily={fontFamily}
        currentLineSpacing={lineSpacing}
      />
      
      {/* Project Navigation Header */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Projects
                </Button>
              </Link>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h1 className="font-semibold text-lg">{project?.title || "Unknown Project"}</h1>
                  {project?.genre && (
                    <Badge variant="secondary" className="text-xs">
                      {project.genre}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {chapterId && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : "Not saved"}
                </div>
              )}
              
              {chapterId && (
                <Button 
                  onClick={handleSave} 
                  disabled={saveChapterMutation.isPending}
                  size="sm"
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saveChapterMutation.isPending ? "Saving..." : "Save"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Chapter Navigation */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Chapters:</span>
              <div className="flex gap-2">
                {chapters.map((chapter) => (
                  <Link key={chapter.id} href={`/writer/${projectId}/${chapter.id}`}>
                    <Button
                      variant={chapterId === chapter.id ? "default" : "outline"}
                      size="sm"
                      className="h-8"
                    >
                      {chapter.title}
                    </Button>
                  </Link>
                ))}
                
                <Dialog open={showNewChapterDialog} onOpenChange={setShowNewChapterDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <Plus className="h-3 w-3" />
                      New Chapter
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Chapter</DialogTitle>
                      <DialogDescription>
                        Add a new chapter to your project.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="chapter-title">Chapter Title</Label>
                        <Input
                          id="chapter-title"
                          value={newChapterTitle}
                          onChange={(e) => setNewChapterTitle(e.target.value)}
                          placeholder="Enter chapter title..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowNewChapterDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateChapter}
                        disabled={!newChapterTitle.trim() || createChapterMutation.isPending}
                      >
                        {createChapterMutation.isPending ? "Creating..." : "Create Chapter"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <span className="text-xs text-muted-foreground">
                {wordCount} words
              </span>
              {currentChapter && (
                <span className="text-xs text-muted-foreground">
                  Chapter {currentChapter.order}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {layoutMode === "sidebar" ? (
          <div className="flex-1 flex">
            {/* Main Writing Area */}
            <div className="flex-1 bg-white">
              <RichTextEditor
                content={content}
                onChange={handleContentChange}
                documentId={chapterId || "default-doc"}
                projectId={projectId}
                style={{ 
                  fontSize, 
                  fontFamily, 
                  lineHeight: lineSpacing 
                }}
              />
            </div>

            <ContextualSidebar 
              documentId={chapterId || "default-doc"} 
              projectId={projectId}
              isBottomLayout={false}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Main Writing Area */}
            <div className="flex-1 bg-white">
              <RichTextEditor
                content={content}
                onChange={handleContentChange}
                documentId={chapterId || "default-doc"}
                projectId={projectId}
                style={{ 
                  fontSize, 
                  fontFamily, 
                  lineHeight: lineSpacing 
                }}
              />
            </div>

            {/* Bottom Panel for Story Elements */}
            <div className="h-80 border-t border-gray-200 overflow-hidden">
              <ContextualSidebar 
                documentId={chapterId || "default-doc"} 
                projectId={projectId}
                isBottomLayout={true}
              />
            </div>
          </div>
        )}
      </div>

      
      <AiModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        content={content}
        projectId={projectId}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        document={currentChapter || document}
      />

      <ThesaurusModal
        isOpen={showThesaurusModal}
        onClose={() => setShowThesaurusModal(false)}
      />

      <QuickFormatModal
        isOpen={showQuickFormatModal}
        onClose={() => setShowQuickFormatModal(false)}
        onFormat={handleQuickFormatApply}
      />

      <RelationshipGraph
        isOpen={showRelationshipView}
        onClose={() => setShowRelationshipView(false)}
        projectId={projectId}
      />
    </div>
  );
}
