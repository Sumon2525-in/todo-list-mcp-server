import { z } from 'zod';

export class ValidationError extends Error {
  public readonly issues: z.ZodIssue[];
  public readonly code = 'VALIDATION_ERROR';

  constructor(error: z.ZodError) {
    const message = `Error de validação: ${error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ')}`;

    super(message);
    this.name = 'ValidationError';
    this.issues = error.issues;
  }
}

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error);
    }
    throw error;
  }
}

export async function validateDataAsync<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error);
    }
    throw error;
  }
}

export function sanitizeInput(data: unknown): unknown {
  if (typeof data === 'string') {
    return data.trim();
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  }
  
  if (data && typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
}

export function createErrorResponse(
  error: unknown, 
  operation: string
): { error: string; details?: string; code?: string } {
  if (error instanceof ValidationError) {
    return {
      error: `Erro de validação em ${operation}`,
      details: error.message,
      code: error.code
    };
  }
  
  if (error instanceof Error) {
    return {
      error: `Erro em ${operation}`,
      details: error.message,
      code: 'OPERATION_ERROR'
    };
  }
  
  return {
    error: `Erro desconhecido em ${operation}`,
    details: String(error),
    code: 'UNKNOWN_ERROR'
  };
}