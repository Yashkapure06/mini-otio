"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useMemo,
  memo,
} from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface StreamingTextProps {
  content: string;
  isStreaming: boolean;
  className?: string;
}

export interface StreamingTextRef {
  appendToken: (token: string) => void;
  getContent: () => string;
}

// MarkdownRenderer is now properly memoized internally

export const StreamingText = forwardRef<StreamingTextRef, StreamingTextProps>(
  ({ content, isStreaming, className }, ref) => {
    const [streamingContent, setStreamingContent] = useState("");
    const [finalContent, setFinalContent] = useState("");
    const contentRef = useRef("");
    const containerRef = useRef<HTMLDivElement>(null);
    const isInitialMount = useRef(true);
    const lastRenderedLength = useRef(0);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      appendToken: (token: string) => {
        contentRef.current += token;
        setStreamingContent((prev) => prev + token);
      },
      getContent: () => contentRef.current,
    }));

    // Handle streaming completion
    useEffect(() => {
      if (!isStreaming && streamingContent) {
        setFinalContent(streamingContent);
        setStreamingContent("");
        contentRef.current = "";
        lastRenderedLength.current = 0;
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
          <MarkdownRenderer content={displayContent} />
        </div>
      </div>
    );
  }
);

StreamingText.displayName = "StreamingText";
