import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { content, searchResults, userQuery } = await request.json();

    if (!content || !userQuery) {
      return NextResponse.json(
        { error: "Content and user query are required" },
        { status: 400 }
      );
    }

    // Create context from search results
    const searchContext =
      searchResults
        ?.slice(0, 3)
        .map((result: any, index: number) => {
          return `${index + 1}. ${result.title} - ${result.url}`;
        })
        .join("\n") || "";

    // Generate related questions using AI
    const prompt = `Based on the following conversation and search results, generate 5 relevant follow-up questions that would help the user explore the topic further. The questions should be specific, insightful, and directly related to the content discussed.

User Query: "${userQuery}"

AI Response: "${content}"

Search Results Context:
${searchContext}

Generate 5 related questions that are:
1. Specific to the content discussed
2. Helpful for deeper exploration
3. Varied in scope (some broad, some specific)
4. Directly related to the topic

Return only the questions, one per line, without numbering or bullet points.`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "Otio AI Assistant",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are an AI assistant that generates relevant follow-up questions based on conversation content. Generate questions that help users explore topics more deeply.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API error:", errorData);
      throw new Error(`OpenRouter API failed: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedQuestions = data.choices?.[0]?.message?.content;

    if (!generatedQuestions) {
      throw new Error("No questions generated");
    }

    const questions = generatedQuestions
      .split("\n")
      .map((q: string) => q.trim())
      .filter((q: string) => q.length > 0)
      .slice(0, 5); //  max 5 questions

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Generate questions error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
