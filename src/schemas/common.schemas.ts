import { z } from 'zod';

export const UuiSchema = z.string().uuid('ID deve ser um UUID válido');

export const DateSchema = z.coerce.date();

export const NonEmptyStringSchema = z.string().min(1, 'Não pode ser vazio');  

export const TodoStatusFilterSchema = z.enum(['all', 'completed', 'pending']);

export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
  code: z.string().optional()
});

export const TodoStatsSchema = z.object({
  total: z.number().int().min(0),
  completed: z.number().int().min(0),
  pending: z.number().int().min(0)
})