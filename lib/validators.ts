import { z } from "zod";

/**
 * @description: This schema is used to validate the response style, using zod because it is a lightweight schema validation library.
 */

export const responseStyleSchema = z.enum([
  "default",
  "step-by-step",
  "bullet summary",
  "explain like I'm 5",
]);

export const messageInputSchema = z.object({
  query: z
    .string()
    .min(1, "Query cannot be empty")
    .max(1000, "Query is too long"),
  style: responseStyleSchema,
});

export const searchRequestSchema = z.object({
  query: z.string().min(1, "Query cannot be empty"),
});

export const streamRequestSchema = z.object({
  query: z.string().min(1, "Query cannot be empty"),
  context: z.string(),
  style: responseStyleSchema,
  messages: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
});

export type ResponseStyle = z.infer<typeof responseStyleSchema>;
export type MessageInput = z.infer<typeof messageInputSchema>;
export type SearchRequest = z.infer<typeof searchRequestSchema>;
export type StreamRequest = z.infer<typeof streamRequestSchema>;
