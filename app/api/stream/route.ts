import { NextRequest, NextResponse } from "next/server";
import { streamRequestSchema } from "@/lib/validators";
import { getStylePrompt } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, context, style, messages } = streamRequestSchema.parse(body);

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY not configured" },
        { status: 500 }
      );
    }

    const stylePrompt = getStylePrompt(style);
    const systemPrompt = `You are OTIO, an expert research assistant that synthesizes information from live web sources into clear, well-cited analysis. ${stylePrompt}

## Your Research Sources
The following sources were retrieved in real-time for this query. Each source includes its title, URL, key excerpts, and content. Ground your response in these sources.

${context}

## Response Guidelines
- **Synthesize**, don't just summarize — connect ideas across sources and draw conclusions.
- **Cite sources inline** using [Source 1], [Source 2] etc. when referencing specific claims.
- **Lead with insight** — start with the most important finding, then support it.
- If sources contradict each other, note the disagreement and explain both perspectives.
- If the sources don't cover something the user needs, say so explicitly rather than hallucinating.

## Formatting (Markdown)
- ## Headings for major sections
- ### Subheadings for sub-points
- **Bold** for key terms and critical findings
- > Blockquotes for direct quotes from sources
- Tables when comparing multiple items
- Bullet lists for enumerations; numbered lists for steps/sequences`;

    const finalMessages = [
      { role: "system", content: systemPrompt },
      ...(messages && messages.length > 0
        ? messages
        : [{ role: "user", content: query }]),
    ];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.OPENROUTER_REFERER ?? "http://localhost:3000",
          "X-Title": "Mini Research Assistant",
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
          messages: finalMessages,
          stream: true,
          temperature: parseFloat(process.env.OPENROUTER_TEMPERATURE ?? "0.7"),
          max_tokens: parseInt(process.env.OPENROUTER_MAX_TOKENS ?? "2000", 10),
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error response:", errorText);
      let message = `${response.status} ${response.statusText}`;
      try {
        const parsed = JSON.parse(errorText) as {
          error?: { message?: string; code?: number };
        };
        if (parsed?.error?.message) {
          message = parsed.error.message;
        }
      } catch {
        if (errorText.trim()) {
          message = errorText.slice(0, 800);
        }
      }

      const clientStatus =
        response.status === 401 ||
        response.status === 402 ||
        response.status === 429
          ? response.status
          : 502;

      return NextResponse.json(
        { error: message, upstreamStatus: response.status },
        { status: clientStatus }
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
          return reader!
            .read()
            .then(({ done, value }) => {
              if (done) {
                controller.enqueue(
                  new TextEncoder().encode("data: [DONE]\n\n")
                );
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
            })
            .catch((err) => {
              console.error("Stream pump error:", err);
              try {
                controller.error(err);
              } catch {
                // controller already closed
              }
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
    const message =
      error instanceof Error ? error.message : "Failed to stream response";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
