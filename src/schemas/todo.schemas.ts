import { 
  DateSchema, 
  NonEmptyStringSchema, 
  UuiSchema 
} from "./common.schemas";
import { z } from 'zod';

export const TodoSchema = z.object({
  id: UuiSchema,
  title: NonEmptyStringSchema.max(200, 'Título não pode exceder 200 caracteres'),
  description: z.string().max(500, 'Descrição não pode exceder 500 caracteres').optional(),
  completed: z.boolean().default(false),
  createdAt: DateSchema,
  completedAt: DateSchema.optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  tags: z.array(z.string().min(1).max(50)).max(10).default([])
});

export const CreateTodoSchema = z.object({
  title: NonEmptyStringSchema.max(200, 'Título não pode exceder 200 caracteres'),
  description: z.string().max(500, 'Descrição não pode exceder 500 caracteres').optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  tags: z.array(z.string().min(1).max(50)).max(10).default([])
});

export const UpdateTodoSchema = z.object({
  id: UuiSchema,
  title: NonEmptyStringSchema.max(200, 'Título não pode exceder 200 caracteres').optional(),
  description: z.string().max(500).optional(),
  completed: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  tags: z.array(z.string().min(1).max(50)).max(10).optional()
});

export const DeleteTodoSchema = z.object({
  id: UuiSchema
});

export const ListTodoSchema = z.object({
  status: z.enum(['all', 'completed', 'pending']).default('all'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0)
});

export const GetTodoByIdSchema = z.object({
  id: UuiSchema
});

export const TodoListResponseSchema = z.object({
  todos: z.array(TodoSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
  hasMore: z.boolean()
});

export const SearchTodosSchema = z.object({
  searchTerm: NonEmptyStringSchema.min(1, 'Termo de busca é obrigatório'),
  status: z.enum(['all', 'completed', 'pending']).default('all'),
  priority: z.enum(['low', 'medium', 'high']).optional()
})