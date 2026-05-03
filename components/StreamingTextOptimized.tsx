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

interface StreamingTextOptimizedProps {
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

export interface StreamingTextOptimizedRef {
  appendToken: (token: string) => void;
  getContent: () => string;
}

export const StreamingTextOptimized = forwardRef<
  StreamingTextOptimizedRef,
  StreamingTextOptimizedProps
>(({ content, isStreaming, className, highlights = [], messageId }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef("");
  const isInitialMount = useRef(true);
  const isMountedRef = useRef(true);
  const [streamingContent, setStreamingContent] = useState("");
  const [finalContent, setFinalContent] = useState("");
  const [isSelectionActive, setIsSelectionActive] = useState(false);
  const selectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRafRef = useRef<number>(0);
  const pendingRestoreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSelectionRef = useRef<{
    startContainer: Node;
    startOffset: number;
    endContainer: Node;
    endOffset: number;
  } | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pendingRafRef.current) cancelAnimationFrame(pendingRafRef.current);
      if (pendingRestoreTimeoutRef.current) clearTimeout(pendingRestoreTimeoutRef.current);
      if (selectionTimeoutRef.current) clearTimeout(selectionTimeoutRef.current);
    };
  }, []);

  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = containerRef.current;
      if (container && container.contains(range.commonAncestorContainer)) {
        const saved = {
          startContainer: range.startContainer,
          startOffset: range.startOffset,
          endContainer: range.endContainer,
          endOffset: range.endOffset,
        };
        lastSelectionRef.current = saved;
        return saved;
      }
    }
    return null;
  }, []);

  const restoreSelection = useCallback(
    (savedSelection: typeof lastSelectionRef.current) => {
      if (!savedSelection) return;
      try {
        const selection = window.getSelection();
        if (!selection) return;
        // Validate nodes are still in the DOM before restoring
        if (
          !document.contains(savedSelection.startContainer) ||
          !document.contains(savedSelection.endContainer)
        ) {
          return;
        }
        const range = document.createRange();
        range.setStart(savedSelection.startContainer, savedSelection.startOffset);
        range.setEnd(savedSelection.endContainer, savedSelection.endOffset);
        selection.removeAllRanges();
        selection.addRange(range);
      } catch {
        // Selection restoration failed — nodes detached or invalid
      }
    },
    []
  );

  const checkSelection = useCallback(() => {
    if (!isMountedRef.current) return;
    const selection = window.getSelection();
    const hasSelection = Boolean(selection && selection.toString().trim().length > 0);
    setIsSelectionActive(hasSelection);

    if (hasSelection) {
      saveSelection();
      if (selectionTimeoutRef.current) clearTimeout(selectionTimeoutRef.current);
      selectionTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) setIsSelectionActive(false);
      }, 5000);
    }
  }, [saveSelection]);

  useImperativeHandle(ref, () => ({
    appendToken: (token: string) => {
      contentRef.current += token;

      if (isSelectionActive && lastSelectionRef.current) {
        const savedSelection = saveSelection();
        setStreamingContent(contentRef.current);

        if (savedSelection) {
          if (pendingRafRef.current) cancelAnimationFrame(pendingRafRef.current);
          if (pendingRestoreTimeoutRef.current) clearTimeout(pendingRestoreTimeoutRef.current);

          pendingRafRef.current = requestAnimationFrame(() => {
            if (!isMountedRef.current) return;
            restoreSelection(savedSelection);
            pendingRestoreTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current) restoreSelection(savedSelection);
            }, 10);
          });
        }
      } else {
        setStreamingContent(contentRef.current);
      }
    },
    getContent: () => contentRef.current,
  }));

  useEffect(() => {
    if (!isStreaming && streamingContent) {
      setFinalContent(streamingContent);
      setStreamingContent("");
      contentRef.current = "";
    }
  }, [isStreaming, streamingContent]);

  useEffect(() => {
    if (!isStreaming && content && isInitialMount.current) {
      setFinalContent(content);
      isInitialMount.current = false;
    }
  }, [content, isStreaming]);

  useEffect(() => {
    if (isStreaming) {
      isInitialMount.current = false;
    }
  }, [isStreaming]);

  useEffect(() => {
    const handleSelectionChange = () => checkSelection();
    const handleMouseDown = () => {
      if (selectionTimeoutRef.current) clearTimeout(selectionTimeoutRef.current);
    };
    const handleMouseUp = () => {
      setTimeout(() => {
        if (isMountedRef.current) checkSelection();
      }, 10);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      if (selectionTimeoutRef.current) clearTimeout(selectionTimeoutRef.current);
    };
  }, [checkSelection]);

  const displayContent = useMemo(
    () => (isStreaming ? streamingContent : finalContent),
    [isStreaming, streamingContent, finalContent]
  );

  const renderKey = useMemo(() => (isStreaming ? "streaming" : "final"), [isStreaming]);

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

StreamingTextOptimized.displayName = "StreamingTextOptimized";
