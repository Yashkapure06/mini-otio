import { NextRequest, NextResponse } from "next/server";
import { searchRequestSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    console.log("Search API called");
    const body = await request.json();
    console.log("Request body:", body);
    const { query } = searchRequestSchema.parse(body);

    const exaApiKey = process.env.EXA_API_KEY;
    console.log("EXA_API_KEY loaded:", exaApiKey ? "Yes" : "No");
    if (!exaApiKey) {
      console.error("EXA_API_KEY is not configured in environment variables");
      return NextResponse.json(
        {
          error:
            "EXA_API_KEY not configured. Please set EXA_API_KEY in your .env.local file",
        },
        { status: 500 }
      );
    }

    const requestBody = {
      query: query,
      numResults: 5,
      type: "neural",
      useAutoprompt: true,
    };

    const response = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${exaApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Exa API error response:", errorText);
      throw new Error(
        `Exa API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
