import { useEffect, useState } from 'react';

interface Collaborator {
  userId: string;
  userName: string;
  cursorPosition?: number;
}

interface CollaboratorCursorsProps {
  collaborators: Collaborator[];
  editorRef: React.RefObject<HTMLDivElement>;
}

const CURSOR_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Light Yellow
  '#BB8FCE', // Light Purple
  '#85C1E9', // Light Blue
];

export function CollaboratorCursors({ collaborators, editorRef }: CollaboratorCursorsProps) {
  const [cursorElements, setCursorElements] = useState<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const currentElements = new Map(cursorElements);

    // Create cursor elements for each collaborator
    collaborators.forEach((collaborator, index) => {
      if (collaborator.cursorPosition === undefined) return;

      let cursorElement = currentElements.get(collaborator.userId);
      
      if (!cursorElement) {
        // Create new cursor element
        cursorElement = document.createElement('div');
        cursorElement.className = 'collaborator-cursor';
        cursorElement.style.cssText = `
          position: absolute;
          width: 2px;
          height: 20px;
          background-color: ${CURSOR_COLORS[index % CURSOR_COLORS.length]};
          z-index: 1000;
          pointer-events: none;
          transition: all 0.1s ease;
        `;
        
        // Add collaborator name label
        const label = document.createElement('div');
        label.textContent = collaborator.userName;
        label.style.cssText = `
          position: absolute;
          top: -25px;
          left: -10px;
          background-color: ${CURSOR_COLORS[index % CURSOR_COLORS.length]};
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0.9;
        `;
        cursorElement.appendChild(label);
        
        editor.appendChild(cursorElement);
        currentElements.set(collaborator.userId, cursorElement);
      }

      // Position the cursor based on text position
      try {
        const range = document.createRange();
        const textNodes = getTextNodes(editor);
        let currentPos = 0;
        let found = false;

        for (const textNode of textNodes) {
          const nodeLength = textNode.textContent?.length || 0;
          if (currentPos + nodeLength >= collaborator.cursorPosition) {
            const offset = collaborator.cursorPosition - currentPos;
            range.setStart(textNode, Math.min(offset, nodeLength));
            range.setEnd(textNode, Math.min(offset, nodeLength));
            found = true;
            break;
          }
          currentPos += nodeLength;
        }

        if (found) {
          const rect = range.getBoundingClientRect();
          const editorRect = editor.getBoundingClientRect();
          
          cursorElement.style.left = `${rect.left - editorRect.left}px`;
          cursorElement.style.top = `${rect.top - editorRect.top}px`;
          cursorElement.style.display = 'block';
        } else {
          cursorElement.style.display = 'none';
        }
      } catch (error) {
        console.warn('Error positioning cursor:', error);
        cursorElement.style.display = 'none';
      }
    });

    // Remove cursors for collaborators who are no longer present
    const activeUserIds = new Set(collaborators.map(c => c.userId));
    currentElements.forEach((element, userId) => {
      if (!activeUserIds.has(userId)) {
        element.remove();
        currentElements.delete(userId);
      }
    });

    setCursorElements(currentElements);

    return () => {
      // Cleanup all cursor elements
      currentElements.forEach(element => element.remove());
      setCursorElements(new Map());
    };
  }, [collaborators, editorRef]);

  return null; // This component doesn't render anything directly
}

function getTextNodes(element: HTMLElement): Text[] {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node;
  while (node = walker.nextNode()) {
    textNodes.push(node as Text);
  }

  return textNodes;
}