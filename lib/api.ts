export interface ExaSearchResult {
  id: string;
  title: string;
  url: string;
  publishedDate: string;
  author: string;
  score: number;
  text?: string;
  highlights?: string[];
}

export interface ExaSearchResponse {
  results: ExaSearchResult[];
  autopromptString: string;
}

export interface SourceCitation {
  id: string;
  title: string;
  url: string;
  author?: string;
  publishedDate?: string;
  relevanceScore: number;
}

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  stream: boolean;
  temperature?: number;
  max_tokens?: number;
}

/**
 * Search with Exa.ai
 * @param query
 * @returns
 * @description: This function searches the Exa.ai API for the query
 */

export async function searchWithExa(query: string): Promise<ExaSearchResponse> {
  const response = await fetch("/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || response.statusText;
    console.error("Search API error:", errorMessage);

    if (errorMessage.includes("EXA_API_KEY not configured")) {
      throw new Error(
        "Search API is not configured. Please set up your EXA_API_KEY in the .env.local file."
      );
    }

    throw new Error(`Search failed: ${errorMessage}`);
  }

  return response.json();
}

/**
 * Stream with OpenRouter
 * @param query
 * @param context
 * @param style
 * @param onToken
 * @param onComplete
 * @param onError
 * @returns
 * @description: This function streams the response from the OpenRouter API. It is Client Side Streaming.
 */

export async function streamWithOpenRouter(
  query: string,
  context: string,
  style: string,
  onToken: (token: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    console.log("Starting streamWithOpenRouter with:", {
      query,
      context: context.substring(0, 100) + "...",
      style,
    });

    const response = await fetch("/api/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, context, style }),
    });

    console.log(
      "Stream response status:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      throw new Error(`Streaming failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    const timeout = setTimeout(() => {
      console.log("Stream timeout, calling onComplete");
      onComplete();
    }, 30000);

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        clearTimeout(timeout);
        console.log("Stream reader done, calling onComplete");
        onComplete();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          console.log("Received line:", line);
        }

        if (line.startsWith("0:")) {
          // AI SDK UI message stream format
          try {
            const data = JSON.parse(line.slice(2));
            if (data.type === "text-delta" && data.textDelta) {
              console.log("Sending token:", data.textDelta);
              onToken(data.textDelta);
            }
          } catch (e) {
            console.log("Failed to parse UI message data:", e);
          }
        } else if (
          line.trim() &&
          !line.startsWith("0:") &&
          !line.startsWith("1:") &&
          !line.startsWith("data: ")
        ) {
          console.log("Sending plain text token:", line);
          onToken(line);
        } else if (line.startsWith("1:")) {
          try {
            const data = JSON.parse(line.slice(2));
            if (data.type === "finish") {
              clearTimeout(timeout);
              console.log("Received finish signal, calling onComplete");
              onComplete();
              return;
            }
          } catch (e) {
            console.log("Failed to parse finish signal:", e);
          }
        } else if (line.startsWith("data: ")) {
          // Original streaming format
          const data = line.slice(6);
          if (data === "[DONE]") {
            clearTimeout(timeout);
            console.log("Received [DONE] signal, calling onComplete");
            onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            console.log("Parsed data object:", parsed);

            if (parsed.content) {
              console.log("Sending content token:", parsed.content);
              onToken(parsed.content);
            }
          } catch (e) {
            console.log("Failed to parse data object:", e);
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : "Unknown error");
  }
}

export function formatSearchContext(results: ExaSearchResult[]): string {
  return results
    .slice(0, 5)
    .map((result, index) => {
      const author = result.author ? ` by ${result.author}` : "";
      const date = new Date(result.publishedDate).toLocaleDateString();

      return `${index + 1}. ${
        result.title
      }${author}\n   Published: ${date}\n   Source: ${
        result.url
      }\n   Relevance Score: ${result.score.toFixed(3)}`;
    })
    .join("\n\n");
}

export function formatSourceCitations(
  results: ExaSearchResult[]
): SourceCitation[] {
  return results.slice(0, 5).map((result) => ({
    id: result.id,
    title: result.title,
    url: result.url,
    author: result.author,
    publishedDate: result.publishedDate,
    relevanceScore: result.score,
  }));
}

export function getStylePrompt(style: string): string {
  switch (style) {
    case "step-by-step":
      return "Please provide a step-by-step explanation with clear numbered steps.";
    case "bullet summary":
      return "Please provide a concise bullet-point summary of the key points.";
    case "explain like I'm 5":
      return "Please explain this in simple terms that a 5-year-old could understand, using analogies and simple language.";
    default:
      return "Please provide a comprehensive and well-structured response.";
  }
}

export async function generateRelatedQuestions(
  content: string,
  searchResults: ExaSearchResult[],
  userQuery: string
): Promise<string[]> {
  try {
    const response = await fetch("/api/generate-questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        searchResults,
        userQuery,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Generate questions API error:", errorData);
      throw new Error(`Generate questions failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.questions || [];
  } catch (error) {
    console.error("Generate related questions error:", error);
    // fallback questions if generation fails
    return [
      "Can you provide more details about this topic?",
      "What are the key benefits of this approach?",
      "Are there any potential drawbacks or limitations?",
      "How does this compare to alternative methods?",
      "What are the practical applications?",
    ];
  }
}

/**
 * Stream with AISDK
 * @param messages
 * @param searchResults
 * @param style
 * @param onToken
 * @param onComplete
 * @param onError
 * @returns
 * @description: This function streams the response from the AISDK
 */

export async function streamWithAISDK(
  messages: any[],
  searchResults: ExaSearchResult[],
  style: string,
  onToken: (token: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const context = formatSearchContext(searchResults);

    // query from the last user message, or use a fallback
    const lastUserMessage = messages.filter((msg) => msg.role === "user").pop();
    const query =
      lastUserMessage?.content || "Please provide information about this topic";

    console.log("Starting stream With AISDK:", {
      query,
      context: context.substring(0, 100) + "...",
      style,
      messagesCount: messages.length,
      lastUserMessage: lastUserMessage?.content?.substring(0, 50),
    });

    if (!query.trim()) {
      throw new Error("No valid query provided");
    }

    const response = await fetch("/api/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, context, style }),
    });

    console.log(
      "Stream response status:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      throw new Error(`Streaming failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    // Set a timeout to ensure completion
    const timeout = setTimeout(() => {
      console.log("Stream timeout, calling onComplete");
      onComplete();
    }, 30000);

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        clearTimeout(timeout);
        console.log("Stream reader done, calling onComplete");
        onComplete();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          console.log("Received line:", line);
        }

        if (line.startsWith("0:")) {
          // AI SDK UI message stream format
          try {
            const data = JSON.parse(line.slice(2));
            if (data.type === "text-delta" && data.textDelta) {
              onToken(data.textDelta);
            }
          } catch (e) {
            console.log("Failed to parse UI message data:", e);
          }
        } else if (
          line.trim() &&
          !line.startsWith("0:") &&
          !line.startsWith("1:") &&
          !line.startsWith("data: ")
        ) {
          // Plain text chunks (fallback)
          onToken(line);
        } else if (line.startsWith("1:")) {
          // AI SDK finish signal
          try {
            const data = JSON.parse(line.slice(2));
            if (data.type === "finish") {
              clearTimeout(timeout);
              console.log("Received finish signal, calling onComplete");
              onComplete();
              return;
            }
          } catch (e) {
            console.log("Failed to parse finish signal:", e);
          }
        } else if (line.startsWith("data: ")) {
          // Original streaming format
          const data = line.slice(6);
          if (data === "[DONE]") {
            clearTimeout(timeout);
            console.log("Received [DONE] signal, calling onComplete");
            onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(data);

            if (parsed.content) {
              onToken(parsed.content);
            }
          } catch (e) {
            console.log("Failed to parse data object:", e);
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : "Unknown error");
  }
}
