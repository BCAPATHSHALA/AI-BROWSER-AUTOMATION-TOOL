import { NextResponse } from "next/server";
import { z } from "zod";

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  details?: any;
  code?: string;
}

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

export class AutomationError extends Error {
  constructor(
    message: string,
    public code = "AUTOMATION_ERROR",
    public statusCode = 500
  ) {
    super(message);
    this.name = "AutomationError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public details: z.ZodError,
    public statusCode = 400
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class SessionError extends Error {
  constructor(
    message: string,
    public sessionId: string,
    public statusCode = 404
  ) {
    super(message);
    this.name = "SessionError";
  }
}

export function handleApiError(error: unknown): NextResponse<ApiError> {
  console.error("API Error:", error);

  // Validation errors
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation error",
        message: "Invalid request data",
        details: error.errors,
      },
      { status: 400 }
    );
  }

  // Custom validation errors
  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation error",
        message: error.message,
        details: error.details.errors,
      },
      { status: error.statusCode }
    );
  }

  // Session errors
  if (error instanceof SessionError) {
    return NextResponse.json(
      {
        success: false,
        error: "Session error",
        message: error.message,
        code: "SESSION_ERROR",
      },
      { status: error.statusCode }
    );
  }

  // Automation errors
  if (error instanceof AutomationError) {
    return NextResponse.json(
      {
        success: false,
        error: "Automation error",
        message: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // Generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    );
  }

  // Unknown errors
  return NextResponse.json(
    {
      success: false,
      error: "Unknown error",
      message: "An unexpected error occurred",
    },
    { status: 500 }
  );
}

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

// Middleware wrapper for error handling
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse<R>>
) {
  return async (...args: T): Promise<NextResponse<R | ApiError>> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
