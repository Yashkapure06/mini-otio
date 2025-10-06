"use client";

import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
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

export const StreamingText = forwardRef<StreamingTextRef, StreamingTextProps>(
  ({ content, isStreaming, className }, ref) => {
    const [streamingContent, setStreamingContent] = useState("");
    const [finalContent, setFinalContent] = useState("");
    const contentRef = useRef("");

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      appendToken: (token: string) => {
        contentRef.current += token;
        setStreamingContent(contentRef.current);
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
      if (!isStreaming && content) {
        setFinalContent(content);
      }
    }, [content, isStreaming]);

    const displayContent = isStreaming ? streamingContent : finalContent;

    return (
      <div className={className}>
        <MarkdownRenderer content={displayContent} />
      </div>
    );
  }
);

StreamingText.displayName = "StreamingText";
