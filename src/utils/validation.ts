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