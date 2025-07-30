import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import FloatingToolbar from "@/components/floating-toolbar";
import RichTextEditor from "@/components/rich-text-editor";
import ContextualSidebar from "@/components/contextual-sidebar";
import AiModal from "@/components/ai-modal";
import ExportModal from "@/components/export-modal";
import { useWritingAssistant } from "@/hooks/use-writing-assistant";
import type { Document } from "@shared/schema";

export default function WriterPage() {
  const [documentId] = useState("default-doc");
  const [showAiModal, setShowAiModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [content, setContent] = useState("");
  const [wordCount, setWordCount] = useState(0);

  const { data: document, isLoading } = useQuery<Document>({
    queryKey: ["/api/documents", documentId],
  });

  const { 
    analyzeText, 
    extractEntities, 
    formatDialogue,
    generateWritingPrompt 
  } = useWritingAssistant();

  useEffect(() => {
    if (document) {
      setContent(document.content);
      setWordCount(document.wordCount);
    }
  }, [document]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    const words = newContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <FloatingToolbar
        onAiSuggestions={handleAiSuggestions}
        onExport={handleExport}
        onFormatDialogue={handleFormatDialogue}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-primary">
              {document?.title || "Untitled Document"}
            </h1>
            <span className="text-sm text-gray-500">
              Auto-saved 2 min ago
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{wordCount.toLocaleString()}</span> words
            </div>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>AI Active</span>
            </div>
          </div>
        </header>

        {/* Main Writing Area */}
        <div className="flex-1 bg-white">
          <RichTextEditor
            content={content}
            onChange={handleContentChange}
            documentId={documentId}
          />
        </div>
      </div>

      <ContextualSidebar documentId={documentId} />

      <AiModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        content={content}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        document={document}
      />
    </div>
  );
}
