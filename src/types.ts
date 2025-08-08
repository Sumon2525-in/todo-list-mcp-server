import { z } from 'zod';
import { 
  CreateTodoSchema, 
  DeleteTodoSchema, 
  GetTodoByIdSchema, 
  ListTodosSchema, 
  TodoListResponseSchema, 
  TodoSchema, 
  UpdateTodoSchema 
} from './schemas/todo.schemas';
import { ErrorResponseSchema, TodoStatsSchema } from './schemas/common.schemas';

export type Todo = z.infer<typeof TodoSchema>;
export type CreateTodoRequest = z.infer<typeof CreateTodoSchema>;
export type UpdateTodoRequest = z.infer<typeof UpdateTodoSchema>;
export type DeleteTodoRequest = z.infer<typeof DeleteTodoSchema>;
export type ListTodosRequest = z.infer<typeof ListTodosSchema>;
export type GetTodoByIdRequest = z.infer<typeof GetTodoByIdSchema>;
export type TodoListResponse = z.infer<typeof TodoListResponseSchema>;
export type TodoStats = z.infer<typeof TodoStatsSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export type TodoPriority = Todo['priority'];
export type TodoStatus = 'completed' | 'pending';

export interface TodoFilters {
  status?: 'all' | 'completed' | 'pending';
  priority?: TodoPriority;
  tags?: string[];
  searchTerm?: string;
}