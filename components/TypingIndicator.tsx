"use client";

export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2 text-muted-foreground mt-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
      <span className="text-sm">Assistant is typing...</span>
    </div>
  );
}
