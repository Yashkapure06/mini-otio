"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useMemo,
} from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface StreamingTextRendererProps {
  content: string;
  isStreaming: boolean;
  className?: string;
  highlights?: Array<{
    id: string;
    text: string;
    messageId: string;
  }>;
  messageId?: string;
}

export interface StreamingTextRendererRef {
  appendToken: (token: string) => void;
  getContent: () => string;
}

export const StreamingTextRenderer = forwardRef<
  StreamingTextRendererRef,
  StreamingTextRendererProps
>(({ content, isStreaming, className, highlights = [], messageId }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef("");
  const isInitialMount = useRef(true);
  const [streamingContent, setStreamingContent] = useState("");
  const [finalContent, setFinalContent] = useState("");
  const [isSelectionActive, setIsSelectionActive] = useState(false);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSelectionRef = useRef<{
    startContainer: Node;
    startOffset: number;
    endContainer: Node;
    endOffset: number;
  } | null>(null);

  // Save current selection
  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = containerRef.current;
      if (container && container.contains(range.commonAncestorContainer)) {
        const savedSelection = {
          startContainer: range.startContainer,
          startOffset: range.startOffset,
          endContainer: range.endContainer,
          endOffset: range.endOffset,
        };
        lastSelectionRef.current = savedSelection;
        return savedSelection;
      }
    }
    return null;
  }, []);

  // Restore selection
  const restoreSelection = useCallback((savedSelection: any) => {
    if (savedSelection) {
      try {
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          range.setStart(
            savedSelection.startContainer,
            savedSelection.startOffset
          );
          range.setEnd(savedSelection.endContainer, savedSelection.endOffset);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } catch (error) {
        // Selection restoration failed, ignore
        console.log("Selection restoration failed:", error);
      }
    }
  }, []);

  // Check if user is actively selecting text - optimized with debouncing
  const checkSelection = useCallback(() => {
    const selection = window.getSelection();
    const hasSelection = Boolean(
      selection && selection.toString().trim().length > 0
    );

    // Only update state if selection status actually changed
    if (hasSelection !== isSelectionActive) {
      setIsSelectionActive(hasSelection);
    }

    if (hasSelection) {
      // Save the current selection
      saveSelection();

      // Clear any existing timeout
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
      // Set timeout to clear selection state after user stops selecting
      selectionTimeoutRef.current = setTimeout(() => {
        setIsSelectionActive(false);
      }, 2000); // Increased timeout to give more time for selection
    }
  }, [saveSelection, isSelectionActive]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    appendToken: (token: string) => {
      contentRef.current += token;

      // If user is actively selecting, preserve selection
      if (isSelectionActive && lastSelectionRef.current) {
        // Save current selection before update
        const savedSelection = saveSelection();

        // Update content
        setStreamingContent(contentRef.current);

        // Restore selection after React update - optimized with single RAF
        if (savedSelection) {
          // Use requestAnimationFrame to ensure DOM is updated
          requestAnimationFrame(() => {
            restoreSelection(savedSelection);
          });
        }
      } else {
        // Batch updates to reduce re-renders
        setStreamingContent(contentRef.current);
      }
    },
    getContent: () => contentRef.current,
  }));

  // Handle streaming completion
  useEffect(() => {
    if (!isStreaming && streamingContent) {
      setFinalContent(streamingContent);
      setStreamingContent("");
      contentRef.current = "";
    }
  }, [isStreaming, streamingContent]);

  // Handle initial content or content updates when not streaming
  useEffect(() => {
    if (!isStreaming && content && isInitialMount.current) {
      setFinalContent(content);
      isInitialMount.current = false;
    }
  }, [content, isStreaming]);

  // Reset initial mount flag when streaming starts
  useEffect(() => {
    if (isStreaming) {
      isInitialMount.current = false;
    }
  }, [isStreaming]);

  // Listen for selection changes - optimized with throttling
  useEffect(() => {
    let throttleTimeout: NodeJS.Timeout | null = null;

    const throttledCheckSelection = () => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        checkSelection();
        throttleTimeout = null;
      }, 16); // ~60fps throttling
    };

    const handleSelectionChange = throttledCheckSelection;

    const handleMouseDown = () => {
      // Clear any existing timeout when user starts selecting
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };

    const handleMouseUp = () => {
      // Check selection after mouse up with throttling
      throttledCheckSelection();
    };

    document.addEventListener("selectionchange", handleSelectionChange, {
      passive: true,
    });
    document.addEventListener("mousedown", handleMouseDown, { passive: true });
    document.addEventListener("mouseup", handleMouseUp, { passive: true });

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [checkSelection]);

  // Memoize the display content to prevent unnecessary re-renders
  const displayContent = useMemo(() => {
    return isStreaming ? streamingContent : finalContent;
  }, [isStreaming, streamingContent, finalContent]);

  // Use a stable key to prevent unnecessary re-mounts
  const renderKey = useMemo(() => {
    return isStreaming ? "streaming" : "final";
  }, [isStreaming]);

  return (
    <div className={className} ref={containerRef}>
      <div key={renderKey}>
        <MarkdownRenderer
          content={displayContent}
          highlights={highlights}
          messageId={messageId}
        />
      </div>
    </div>
  );
});

StreamingTextRenderer.displayName = "StreamingTextRenderer";
