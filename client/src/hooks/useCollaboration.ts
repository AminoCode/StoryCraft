import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';

interface Collaborator {
  userId: string;
  userName: string;
  cursorPosition?: number;
}

interface CollaborationHook {
  collaborators: Collaborator[];
  isConnected: boolean;
  sendCursorUpdate: (position: number) => void;
  sendContentChange: (content: string, wordCount: number) => void;
  onContentUpdate?: (content: string, wordCount: number, userId: string, userName: string) => void;
  onUserJoined?: (userId: string, userName: string) => void;
  onUserLeft?: (userId: string, userName: string) => void;
  onCursorMoved?: (userId: string, userName: string, position: number) => void;
}

export function useCollaboration(documentId: string | null): CollaborationHook {
  const { user } = useAuth() as { user: any };
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const callbacksRef = useRef<{
    onContentUpdate?: (content: string, wordCount: number, userId: string, userName: string) => void;
    onUserJoined?: (userId: string, userName: string) => void;
    onUserLeft?: (userId: string, userName: string) => void;
    onCursorMoved?: (userId: string, userName: string, position: number) => void;
  }>({});

  // Connect to WebSocket when document ID is provided
  useEffect(() => {
    if (!documentId || !user) {
      return;
    }

    console.log('Connecting to WebSocket for document:', documentId);

    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Join the document
      ws.send(JSON.stringify({
        type: 'join_document',
        documentId,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`.trim() || user.email
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);

        switch (data.type) {
          case 'current_collaborators':
            setCollaborators(data.collaborators || []);
            break;

          case 'user_joined':
            setCollaborators(prev => {
              const exists = prev.some(c => c.userId === data.userId);
              if (exists) return prev;
              const newCollaborator = {
                userId: data.userId,
                userName: data.userName,
                cursorPosition: undefined
              };
              callbacksRef.current.onUserJoined?.(data.userId, data.userName);
              return [...prev, newCollaborator];
            });
            break;

          case 'user_left':
            setCollaborators(prev => {
              const filtered = prev.filter(c => c.userId !== data.userId);
              callbacksRef.current.onUserLeft?.(data.userId, data.userName);
              return filtered;
            });
            break;

          case 'cursor_moved':
            setCollaborators(prev => 
              prev.map(c => 
                c.userId === data.userId 
                  ? { ...c, cursorPosition: data.position }
                  : c
              )
            );
            callbacksRef.current.onCursorMoved?.(data.userId, data.userName, data.position);
            break;

          case 'content_updated':
            // Only apply updates from other users
            if (data.userId !== user.id) {
              callbacksRef.current.onContentUpdate?.(data.content, data.wordCount, data.userId, data.userName);
            }
            break;

          case 'error':
            console.error('WebSocket error from server:', data.message);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setCollaborators([]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    wsRef.current = ws;

    // Cleanup on unmount or document change
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'leave_document',
          documentId
        }));
      }
      ws.close();
      setIsConnected(false);
      setCollaborators([]);
    };
  }, [documentId, user]);

  const sendCursorUpdate = (position: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && documentId) {
      wsRef.current.send(JSON.stringify({
        type: 'cursor_update',
        documentId,
        position
      }));
    }
  };

  const sendContentChange = (content: string, wordCount: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && documentId) {
      wsRef.current.send(JSON.stringify({
        type: 'content_change',
        documentId,
        content,
        wordCount
      }));
    }
  };

  return {
    collaborators,
    isConnected,
    sendCursorUpdate,
    sendContentChange,
    // Expose callback setters
    get onContentUpdate() { return callbacksRef.current.onContentUpdate; },
    set onContentUpdate(callback) { callbacksRef.current.onContentUpdate = callback; },
    get onUserJoined() { return callbacksRef.current.onUserJoined; },
    set onUserJoined(callback) { callbacksRef.current.onUserJoined = callback; },
    get onUserLeft() { return callbacksRef.current.onUserLeft; },
    set onUserLeft(callback) { callbacksRef.current.onUserLeft = callback; },
    get onCursorMoved() { return callbacksRef.current.onCursorMoved; },
    set onCursorMoved(callback) { callbacksRef.current.onCursorMoved = callback; }
  };
}