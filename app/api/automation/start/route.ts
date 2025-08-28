import { type NextRequest, NextResponse } from "next/server";
import { AutomationRequestSchema } from "@/lib/validation";
import { chatWithAgent } from "@/lib/specialized-agents";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validatedData = AutomationRequestSchema.parse(body);

    const automationAIResult = await chatWithAgent({
      userQuery: validatedData.prompt,
    });

    return NextResponse.json({
      success: true,
      data: {
        history: automationAIResult.history,
        lastAgent: automationAIResult.lastAgent,
        finalOutput: automationAIResult.finalOutput,
        message: "Automation task started successfully",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to start automation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
