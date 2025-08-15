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
import ResizableSidebar from "@/components/resizable-sidebar";
import AiModal from "@/components/ai-modal";
import ExportModal from "@/components/export-modal";
import ThesaurusModal from "@/components/thesaurus-modal";
import QuickFormatModal from "@/components/quick-format-modal";
import RelationshipGraph from "@/components/relationship-graph";
import LayoutControls from "@/components/layout-controls";
import FormatDropdown from "@/components/format-dropdown";
import GrammarSuggestionsPanel from "@/components/grammar-suggestions-panel";
import HorizontalTimeline from "@/components/horizontal-timeline";
import { ThemeProvider } from "@/components/theme-provider";

import { useWritingAssistant } from "@/hooks/use-writing-assistant";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { ArrowLeft, Plus, BookOpen, Edit3, Save, Clock, Wand2, Book, Download, Type, Trash2 } from "lucide-react";
import type { Project, Chapter, InsertChapter, Document, AiSuggestion } from "@shared/schema";

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
  const [showHorizontalTimeline, setShowHorizontalTimeline] = useState(false);
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<string | null>(null);
  const [showGrammarSuggestions, setShowGrammarSuggestions] = useState(false);
  
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

  // Fallback to document API for compatibility - disabled to prevent 404
  const { data: document, isLoading: isDocumentLoading } = useQuery<Document>({
    queryKey: ["/api/documents", "default-doc"],
    enabled: false, // Disabled to prevent unnecessary 404 calls
  });

  const { 
    analyzeText, 
    extractEntities, 
    formatDialogue,
    generateWritingPrompt 
  } = useWritingAssistant();

  // Consolidated mutation helpers
  const apiRequest = async (method: string, endpoint: string, data?: any) => {
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(data && { body: JSON.stringify(data) }),
    });
    if (!response.ok) throw new Error(`Failed to ${method.toLowerCase()} ${endpoint.split('/').pop()}`);
    return response.json();
  };

  const createChapterMutation = useMutation({
    mutationFn: (data: InsertChapter) => apiRequest("POST", "/api/chapters", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "chapters"] });
      setShowNewChapterDialog(false);
      setNewChapterTitle("");
      toast({ title: "Chapter created", description: "Your new chapter has been created successfully." });
    },
  });

  const deleteChapterMutation = useMutation({
    mutationFn: (chapterId: string) => apiRequest("DELETE", `/api/chapters/${chapterId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "chapters"] });
      setShowDeleteDialog(false);
      setChapterToDelete(null);
      toast({ title: "Chapter deleted", description: "The chapter has been deleted successfully." });
    },
  });

  const saveChapterMutation = useMutation({
    mutationFn: (data: { content: string; wordCount: number }) => 
      apiRequest("PUT", `/api/chapters/${chapterId}`, data),
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
    
    // Auto-save after content changes
    if (chapterId && newContent !== (currentChapter?.content || "")) {
      clearTimeout((window as any).saveTimeout);
      (window as any).saveTimeout = setTimeout(() => {
        saveChapterMutation.mutate({ content: newContent, wordCount: words.length });
      }, 1000); // Save after 1 second of no changes
    }
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

  const handleFormatAction = (type: string, value?: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    let formattedText = selectedText;
    
    switch (type) {
      case 'bold':
        window.document.execCommand('bold');
        break;
      case 'italic':
        window.document.execCommand('italic');
        break;
      case 'align':
        if (value === 'center') window.document.execCommand('justifyCenter');
        else if (value === 'right') window.document.execCommand('justifyRight');
        else window.document.execCommand('justifyLeft');
        break;
      case 'dialogue':
        if (value === 'standard') formattedText = `"${selectedText.replace(/^["']|["']$/g, '')}"`;
        else if (value === 'thought') formattedText = `*${selectedText}*`;
        else if (value === 'action') formattedText = `—${selectedText}`;
        break;
      case 'list':
        if (value === 'bullet') window.document.execCommand('insertUnorderedList');
        else if (value === 'numbered') window.document.execCommand('insertOrderedList');
        break;
      case 'paragraph':
        if (value === 'scene-break') formattedText = `\n\n* * *\n\n${selectedText}`;
        else if (value === 'chapter-break') formattedText = `\n\n\nChapter ${chapters.length + 1}\n\n${selectedText}`;
        break;
    }
    
    if (formattedText !== selectedText && (type === 'dialogue' || type === 'paragraph')) {
      range.deleteContents();
      range.insertNode(window.document.createTextNode(formattedText));
      handleContentChange(window.document.querySelector('[contenteditable="true"]')?.innerHTML || '');
    }
  };

  const handleDeleteChapter = (chapterId: string) => {
    setChapterToDelete(chapterId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteChapter = () => {
    if (chapterToDelete) {
      deleteChapterMutation.mutate(chapterToDelete);
    }
  };

  const handleApplySuggestion = (suggestion: AiSuggestion) => {
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const handleDismissSuggestion = (suggestion: AiSuggestion) => {
    setSuggestions(prev => prev.filter(s => s !== suggestion));
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

  // Effect to redirect to most recently edited chapter when no chapter is specified
  useEffect(() => {
    if (!chapterId && chapters.length > 0 && !isChaptersLoading) {
      // Find the most recently edited chapter (using updatedAt or createdAt field)
      const sortedChapters = [...chapters].sort((a, b) => {
        const aTime = new Date(a.lastSaved || a.createdAt || 0).getTime();
        const bTime = new Date(b.lastSaved || b.createdAt || 0).getTime();
        return bTime - aTime;
      });
      
      if (sortedChapters.length > 0) {
        const mostRecentChapter = sortedChapters[0];
        window.location.href = `/writer/${projectId}/${mostRecentChapter.id}`;
      }
    }
  }, [chapterId, chapters, projectId, isChaptersLoading]);

  const isLoading = isProjectLoading || isChaptersLoading || isChapterLoading || isDocumentLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ThemeProvider>
        {/* Left Sidebar for Chapter Navigation */}
        <div 
          className="w-64 bg-white border-r border-gray-200 flex flex-col"
          style={{ 
            height: '100vh',
            maxHeight: '100vh',
            overflow: 'hidden'
          }}
        >
          {/* Project Header */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200">
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 mb-3">
                <ArrowLeft className="h-4 w-4" />
                Back to Projects
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {project?.title || "Untitled Project"}
            </h1>
            {project?.genre && (
              <Badge variant="secondary" className="text-xs mt-1">
                {project.genre}
              </Badge>
            )}
          </div>

          {/* Chapter List Container */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Scrollable Chapter List */}
            <div 
              className="flex-1 chapter-list-container"
              style={{ 
                overflowY: 'auto',
                overflowX: 'hidden',
                minHeight: 0,
                maxHeight: '100%',
                height: '100%'
              }}
            >
              <div className="p-2 space-y-1">
                {chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      chapterId === chapter.id
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => window.location.href = `/writer/${projectId}/${chapter.id}`}
                    data-testid={`chapter-${chapter.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        Chapter {chapter.order}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {chapter.title}
                      </div>
                      <div className="text-xs text-gray-400">
                        {chapter.wordCount || 0} words
                      </div>
                    </div>
                    {chapterId === chapter.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setChapterToDelete(chapter.id);
                          setShowDeleteDialog(true);
                        }}
                        data-testid={`delete-chapter-${chapter.id}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Fixed Add Chapter Button */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
              <Button
                onClick={() => setShowNewChapterDialog(true)}
                className="w-full"
                size="sm"
                data-testid="add-chapter-button"
              >
                <Plus size={16} className="mr-2" />
                Add Chapter
              </Button>
            </div>
          </div>
        </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col" style={{ height: '100vh', maxHeight: '100vh' }}>
        {/* Editing Controls Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Enhanced Toolbar Controls */}
              <div className="flex items-center gap-2">
                <FormatDropdown onFormat={handleFormatAction} />
                <Separator orientation="vertical" className="h-6" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={handleAiSuggestions}
                  data-testid="ai-suggestions-button"
                >
                  <Wand2 className="h-4 w-4" />
                  AI
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={handleThesaurus}
                  data-testid="thesaurus-button"
                >
                  <Book className="h-4 w-4" />
                  Thesaurus
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={handleQuickFormat}
                  data-testid="quick-format-button"
                >
                  <Type className="h-4 w-4" />
                  Quick Format
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={handleExport}
                  data-testid="export-button"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {chapterId && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : "Not saved"}
                </div>
              )}
              
              <span className="text-xs text-muted-foreground">
                {wordCount} words
              </span>
              {currentChapter && (
                <span className="text-xs text-muted-foreground">
                  Chapter {currentChapter.order}
                </span>
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

        {/* Layout Controls */}
        <div className="flex-shrink-0">
          <LayoutControls
            layoutMode={layoutMode}
            onLayoutChange={setLayoutMode}
            onRelationshipViewToggle={() => setShowRelationshipView(!showRelationshipView)}
            showRelationshipView={showRelationshipView}
            showHorizontalTimeline={showHorizontalTimeline}
            onHorizontalTimelineToggle={() => setShowHorizontalTimeline(!showHorizontalTimeline)}
            projectId={projectId}
          />
        </div>

        {/* Horizontal Timeline - Independent Container */}
        {showHorizontalTimeline && (
          <div 
            className="flex-shrink-0 border-b border-gray-200 bg-gray-50"
            style={{ 
              height: '140px',
              minHeight: '140px',
              maxHeight: '140px',
              overflowX: 'auto',
              overflowY: 'hidden'
            }}
          >
            <HorizontalTimeline projectId={projectId} />
          </div>
        )}

        {/* Writing Area Layout - Remaining Space */}
        <div className="flex-1 min-h-0">
          {layoutMode === "sidebar" ? (
            <div className="flex h-full">
              {/* Main Writing Area */}
              <div 
                className="flex-1 bg-white"
                style={{
                  height: '100%',
                  maxHeight: '100%',
                  overflow: 'hidden'
                }}
              >
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

              <ResizableSidebar defaultWidth={320} minWidth={250} maxWidth={500}>
                <div 
                  style={{
                    height: '100%',
                    maxHeight: '100%',
                    overflow: 'hidden'
                  }}
                >
                  <ContextualSidebar 
                    documentId={chapterId || "default-doc"} 
                    projectId={projectId}
                    currentChapterId={chapterId}
                    isBottomLayout={false}
                  />
                </div>
              </ResizableSidebar>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Main Writing Area */}
              <div 
                className="flex-1 bg-white"
                style={{
                  minHeight: 0,
                  overflow: 'hidden'
                }}
              >
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
              <div 
                className="flex-shrink-0 border-t border-gray-200 bg-white"
                style={{
                  height: '320px',
                  minHeight: '320px',
                  maxHeight: '320px',
                  overflow: 'hidden'
                }}
              >
                <ContextualSidebar 
                  documentId={chapterId || "default-doc"} 
                  projectId={projectId}
                  currentChapterId={chapterId}
                  isBottomLayout={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      </ThemeProvider>
      {/* Grammar Suggestions Panel */}
      {showGrammarSuggestions && (
        <GrammarSuggestionsPanel
          suggestions={suggestions}
          onClose={() => setShowGrammarSuggestions(false)}
        />
      )}
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
      {/* New Chapter Dialog */}
      <Dialog open={showNewChapterDialog} onOpenChange={setShowNewChapterDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200">
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
                data-testid="new-chapter-title-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewChapterDialog(false)}
              data-testid="cancel-new-chapter"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateChapter}
              disabled={!newChapterTitle.trim() || createChapterMutation.isPending}
              data-testid="create-new-chapter"
            >
              {createChapterMutation.isPending ? "Creating..." : "Create Chapter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Chapter Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle>Delete Chapter</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chapter? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteChapter}
              disabled={deleteChapterMutation.isPending}
            >
              {deleteChapterMutation.isPending ? "Deleting..." : "Delete Chapter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
