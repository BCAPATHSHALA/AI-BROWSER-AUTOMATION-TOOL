import { z } from "zod";

export const AutomationRequestSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters long"),
  config: z
    .object({
      model: z.string().optional(),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().positive().optional(),
      headless: z.boolean().optional(),
      timeout: z.number().positive().optional(),
    })
    .optional(),
});

export type AutomationRequest = z.infer<typeof AutomationRequestSchema>;
