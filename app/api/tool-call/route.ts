import { NextRequest, NextResponse } from "next/server";
import { classifyQuery, executeToolCall } from "@/lib/queryClassifier";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required and must be a string" },
        { status: 400 }
      );
    }

    // classifying  the query
    const classification = classifyQuery(query);

    // if it's a tool call, execute it
    if (classification.type === "tool" && classification.suggestedTool) {
      const toolResult = await executeToolCall(
        query,
        classification.suggestedTool
      );

      return NextResponse.json({
        classification,
        toolResult,
        shouldUseTool: true,
      });
    }

    // if it's a mixed query, we might want to do both
    if (classification.type === "mixed") {
      return NextResponse.json({
        classification,
        shouldUseTool: false,
        shouldUseWebSearch: true,
        message:
          "This query contains both computational and research elements. Consider using both tool calls and web search.",
      });
    }

    // default to web search
    return NextResponse.json({
      classification,
      shouldUseTool: false,
      shouldUseWebSearch: true,
      message: "Query classified as research query, use web search",
    });
  } catch (error) {
    console.error("Tool call API error:", error);
    return NextResponse.json(
      { error: "Failed to process tool call" },
      { status: 500 }
    );
  }
}
