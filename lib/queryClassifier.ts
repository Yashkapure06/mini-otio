/**
 * Query classification system to determine whether to use tool calls or web search
 */

export interface QueryClassification {
  type: "tool" | "web_search" | "mixed";
  confidence: number;
  reasoning: string;
  suggestedTool?: string;
}

export interface ToolCallResult {
  type: "calculator" | "converter" | "formatter" | "generator";
  result: any;
  success: boolean;
  error?: string;
}

/**
 * Classify a user query to determine the appropriate response method
 */
export function classifyQuery(query: string): QueryClassification {
  const lowerQuery = query.toLowerCase().trim();

  // Mathematical expressions and calculations
  if (isMathematicalQuery(lowerQuery)) {
    return {
      type: "tool",
      confidence: 0.9,
      reasoning: "Mathematical expression detected",
      suggestedTool: "calculator",
    };
  }

  // Unit conversions
  if (isConversionQuery(lowerQuery)) {
    return {
      type: "tool",
      confidence: 0.8,
      reasoning: "Unit conversion detected",
      suggestedTool: "converter",
    };
  }

  // Code formatting or generation
  if (isCodeQuery(lowerQuery)) {
    return {
      type: "tool",
      confidence: 0.7,
      reasoning: "Code-related query detected",
      suggestedTool: "formatter",
    };
  }

  // Simple factual questions that don't need web search
  if (isSimpleFactualQuery(lowerQuery)) {
    return {
      type: "tool",
      confidence: 0.6,
      reasoning: "Simple factual query that can be answered directly",
      suggestedTool: "generator",
    };
  }

  // Research or current information queries
  if (isResearchQuery(lowerQuery)) {
    return {
      type: "web_search",
      confidence: 0.9,
      reasoning: "Research or current information query detected",
    };
  }

  // Mixed queries that might need both
  if (isMixedQuery(lowerQuery)) {
    return {
      type: "mixed",
      confidence: 0.7,
      reasoning: "Query contains both computational and research elements",
    };
  }

  // Default to web search for unknown queries
  return {
    type: "web_search",
    confidence: 0.5,
    reasoning: "Default to web search for comprehensive information",
  };
}

function isMathematicalQuery(query: string): boolean {
  const mathPatterns = [
    // Basic arithmetic
    /\d+\s*[+\-*/]\s*\d+/,
    // Mathematical expressions with parentheses
    /\([^)]*\)/,
    // Mathematical functions
    /\b(sin|cos|tan|log|sqrt|pow|abs|ceil|floor|round)\s*\(/,
    // Percentage calculations
    /\d+%\s*(of|from|in)/,
    // Mathematical symbols
    /[+\-*/=<>]/,
    // Square root, power
    /\d+\^\d+|\d+\*\*\d+|\d+\s*\/\s*\d+/,
    // Simple math keywords
    /\b(calculate|compute|solve|add|subtract|multiply|divide|sum|total|average|mean)\b/,
  ];

  return mathPatterns.some((pattern) => pattern.test(query));
}

function isConversionQuery(query: string): boolean {
  const conversionPatterns = [
    // Unit conversions
    /\b(convert|conversion|to|from)\b.*\b(kg|pound|lb|meter|feet|inch|cm|km|mile|celsius|fahrenheit|kelvin)\b/i,
    // Currency conversions
    /\b(convert|conversion|to|from)\b.*\b(usd|eur|gbp|jpy|cad|aud|dollar|euro|pound|yen)\b/i,
    // Time conversions
    /\b(convert|conversion|to|from)\b.*\b(hour|minute|second|day|week|month|year)\b/i,
    // Temperature conversions
    /\b(convert|conversion|to|from)\b.*\b(celsius|fahrenheit|kelvin|°c|°f)\b/i,
  ];

  return conversionPatterns.some((pattern) => pattern.test(query));
}

function isCodeQuery(query: string): boolean {
  const codePatterns = [
    // Code formatting
    /\b(format|beautify|prettify|minify)\b.*\b(code|json|html|css|javascript|python|java)\b/i,
    // Code generation
    /\b(generate|create|write|code)\b.*\b(function|class|method|api|endpoint)\b/i,
    // Syntax highlighting
    /\b(syntax|highlight|color)\b.*\b(code|programming)\b/i,
  ];

  return codePatterns.some((pattern) => pattern.test(query));
}

function isSimpleFactualQuery(query: string): boolean {
  const simplePatterns = [
    // Basic definitions
    /\b(what is|define|definition of)\b/,
    // Simple facts
    /\b(how many|how much|when was|who is|where is)\b/,
    // Basic questions
    /\b(explain|tell me about)\b.*\b(briefly|simply|in simple terms)\b/,
  ];

  return simplePatterns.some((pattern) => pattern.test(query));
}

function isResearchQuery(query: string): boolean {
  const researchPatterns = [
    // Current events
    /\b(latest|recent|current|news|today|this year)\b/,
    // Research topics
    /\b(research|study|analysis|trends|statistics|data)\b/,
    // Complex topics
    /\b(comprehensive|detailed|in-depth|thorough)\b/,
    // Comparison questions
    /\b(compare|vs|versus|difference between|pros and cons)\b/,
    // How-to guides
    /\b(how to|tutorial|guide|steps|process)\b/,
  ];

  return researchPatterns.some((pattern) => pattern.test(query));
}

function isMixedQuery(query: string): boolean {
  // Queries that contain both computational and research elements
  const hasMath = isMathematicalQuery(query);
  const hasResearch = isResearchQuery(query);

  return hasMath && hasResearch;
}

/**
 * Execute a tool call based on the classification
 */
export async function executeToolCall(
  query: string,
  toolType: string
): Promise<ToolCallResult> {
  try {
    switch (toolType) {
      case "calculator":
        return await executeCalculator(query);
      case "converter":
        return await executeConverter(query);
      case "formatter":
        return await executeFormatter(query);
      case "generator":
        return await executeGenerator(query);
      default:
        throw new Error(`Unknown tool type: ${toolType}`);
    }
  } catch (error) {
    return {
      type: toolType as any,
      result: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function executeCalculator(query: string): Promise<ToolCallResult> {
  try {
    // Extract mathematical expression from query
    const mathExpression = extractMathExpression(query);
    if (!mathExpression) {
      throw new Error("No valid mathematical expression found");
    }

    // Safe evaluation of mathematical expressions
    const result = evaluateMathExpression(mathExpression);

    return {
      type: "calculator",
      result: {
        expression: mathExpression,
        result: result,
        formatted: formatNumber(result),
      },
      success: true,
    };
  } catch (error) {
    return {
      type: "calculator",
      result: null,
      success: false,
      error: error instanceof Error ? error.message : "Calculation failed",
    };
  }
}

async function executeConverter(query: string): Promise<ToolCallResult> {
  // Placeholder for unit conversion logic
  return {
    type: "converter",
    result: { message: "Unit conversion not yet implemented" },
    success: false,
    error: "Unit conversion feature coming soon",
  };
}

async function executeFormatter(query: string): Promise<ToolCallResult> {
  // Placeholder for code formatting logic
  return {
    type: "formatter",
    result: { message: "Code formatting not yet implemented" },
    success: false,
    error: "Code formatting feature coming soon",
  };
}

async function executeGenerator(query: string): Promise<ToolCallResult> {
  // Placeholder for content generation logic
  return {
    type: "generator",
    result: { message: "Content generation not yet implemented" },
    success: false,
    error: "Content generation feature coming soon",
  };
}

function extractMathExpression(query: string): string | null {
  // Extract mathematical expressions from natural language
  const patterns = [
    // Direct mathematical expressions
    /(\d+(?:\.\d+)?\s*[+\-*/]\s*\d+(?:\.\d+)?(?:\s*[+\-*/]\s*\d+(?:\.\d+)?)*)/,
    // Expressions with parentheses
    /(\([^)]*\))/,
    // Simple arithmetic
    /(\d+\s*[+\-*/]\s*\d+)/,
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

function evaluateMathExpression(expression: string): number {
  // Safe evaluation of mathematical expressions
  // Remove any non-mathematical characters
  const cleanExpression = expression.replace(/[^0-9+\-*/().\s]/g, "");

  try {
    // Use Function constructor for safer evaluation than eval
    const result = new Function("return " + cleanExpression)();
    return typeof result === "number" ? result : NaN;
  } catch (error) {
    throw new Error("Invalid mathematical expression");
  }
}

function formatNumber(num: number): string {
  if (Number.isInteger(num)) {
    return num.toString();
  }
  return num.toFixed(6).replace(/\.?0+$/, "");
}
