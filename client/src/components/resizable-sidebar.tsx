import { useState, useRef, useEffect, useCallback } from "react";

interface ResizableSidebarProps {
  children: React.ReactNode;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  isBottomLayout?: boolean;
}

export default function ResizableSidebar({ 
  children, 
  minWidth = 200, 
  maxWidth = 600, 
  defaultWidth = 320,
  isBottomLayout = false 
}: ResizableSidebarProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !sidebarRef.current) return;

    if (!isBottomLayout) {
      // For right sidebar, calculate from the right edge of the viewport
      const newWidth = window.innerWidth - e.clientX;
      const constrainedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
      setWidth(constrainedWidth);
    }
  }, [isResizing, minWidth, maxWidth, isBottomLayout]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  if (isBottomLayout) {
    return <div className="w-full h-full">{children}</div>;
  }

  return (
    <div className="relative flex h-full">
      {/* Resize handle */}
      <div
        className={`w-1 bg-transparent hover:bg-blue-500 cursor-col-resize flex-shrink-0 group transition-colors ${
          isResizing ? 'bg-blue-500' : ''
        }`}
        onMouseDown={handleMouseDown}
        data-testid="sidebar-resize-handle"
      >
        <div className="w-full h-full group-hover:bg-blue-500 transition-colors" />
      </div>
      
      {/* Sidebar content */}
      <div
        ref={sidebarRef}
        className="flex-shrink-0 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700"
        style={{ width: `${width}px` }}
      >
        {children}
      </div>
    </div>
  );
}