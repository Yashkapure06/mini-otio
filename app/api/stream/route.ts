import { NextRequest, NextResponse } from "next/server";
import { streamRequestSchema } from "@/lib/validators";
import { getStylePrompt } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Stream API received body:", JSON.stringify(body, null, 2));
    const { query, context, style, messages } = streamRequestSchema.parse(body);

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY not configured" },
        { status: 500 }
      );
    }

    const stylePrompt = getStylePrompt(style);
    const systemPrompt = `You are a helpful research assistant. ${stylePrompt}

Use the provided web search context to answer the user's question. If the context doesn't contain enough information, say so and provide what you can based on the available information.

IMPORTANT: Format your response using Markdown for better readability. Use:
- **Bold text** for important points
- *Italic text* for emphasis
- ## Headings for main sections
- ### Subheadings for subsections
- - Bullet points for lists
- 1. Numbered lists for steps
- \`code\` for technical terms
- > Blockquotes for important information
- [Links](url) for references
- Tables for structured data

Web Search Context:
${context}`;

    const finalMessages = [
      { role: "system", content: systemPrompt },
      ...(messages && messages.length > 0
        ? messages
        : [{ role: "user", content: query }]),
    ];

    console.log("Streaming request:", {
      query,
      style,
      contextLength: context.length,
      messagesCount: finalMessages.length,
      conversationHistory: messages?.length || 0,
    });

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Mini Research Assistant",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: finalMessages,
          stream: true,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error response:", errorText);
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText}`
      );
    }

    /**
     * Streaming response from OpenRouter API
     */
    const stream = new ReadableStream({
      start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        function pump(): Promise<void> {
          return reader!.read().then(({ done, value }) => {
            if (done) {
              controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
              controller.close();
              return;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ content })}\n\n`
                      )
                    );
                  }
                } catch (e) {
                  console.error("Failed to parse data object:", e);
                }
              }
            }

            return pump();
          });
        }

        return pump();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Stream API error:", error);
    return NextResponse.json(
      { error: "Failed to stream response" },
      { status: 500 }
    );
  }
}
