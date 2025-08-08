import { randomUUID } from 'crypto';
import {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  ListTodosRequest,
  TodoListResponse,
  TodoStats,
  TodoFilters
} from '../types.js';
import {
  TodoSchema,
  CreateTodoSchema,
  UpdateTodoSchema,
  ListTodosSchema,  
} from '../schemas/todo.schemas.js';
import { validateData, ValidationError } from '../utils/validation.js';
import { TodoStatsSchema } from '../schemas/common.schemas.js';

export class TodoService {
  private todos: Map<string, Todo> = new Map();

  constructor() {
    this.addSampleData();
  }

  private addSampleData(): void {
    const sampleTodos: Omit<Todo, 'id'>[] = [
      {
        title: "Estudar MCP Protocol",
        description: "Aprender sobre Model Context Protocol com TypeScript e Zod",
        completed: false,
        createdAt: new Date(),
        priority: 'high',
        tags: ['estudo', 'typescript', 'mcp']
      },
      {
        title: "Criar tutorial TypeScript",
        description: "Desenvolver tutorial completo com validação Zod",
        completed: true,
        createdAt: new Date(Date.now() - 86400000),
        completedAt: new Date(),
        priority: 'medium',
        tags: ['tutorial', 'typescript', 'zod']
      },
      {
        title: "Implementar testes unitários",
        description: "Adicionar cobertura de testes para o servidor MCP",
        completed: false,
        createdAt: new Date(Date.now() - 43200000),
        priority: 'low',
        tags: ['testes', 'qualidade']
      }
    ];

    sampleTodos.forEach(todoData => {
      const id = randomUUID();
      const todoWithDefaults = {
        ...todoData,
        id,
        completed: todoData.completed ?? false,
        priority: todoData.priority ?? 'medium' as const,
        tags: todoData.tags ?? []
      };
      const validatedTodo = validateData(TodoSchema, todoWithDefaults);
      const todoWithRequiredFields: Todo = {
        ...validatedTodo,
        completed: validatedTodo.completed ?? false,
        priority: validatedTodo.priority ?? 'medium',
        tags: validatedTodo.tags ?? []
      };
      this.todos.set(id, todoWithRequiredFields);
    });
  }

  getAllTodos(filters?: TodoFilters): Todo[] {
    let todos = Array.from(this.todos.values());

    // Aplicar filtros
    if (filters?.status && filters.status !== 'all') {
      const isCompleted = filters.status === 'completed';
      todos = todos.filter(todo => todo.completed === isCompleted);
    }

    if (filters?.priority) {
      todos = todos.filter(todo => todo.priority === filters.priority);
    }

    if (filters?.tags && filters.tags.length > 0) {
      todos = todos.filter(todo => 
        filters.tags!.some(tag => todo.tags.includes(tag))
      );
    }

    if (filters?.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      todos = todos.filter(todo => 
        todo.title.toLowerCase().includes(searchLower) ||
        todo.description?.toLowerCase().includes(searchLower)
      );
    }

    return todos.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  listTodos(request: ListTodosRequest): TodoListResponse {
    // Validar entrada
    const validatedRequest = validateData(ListTodosSchema, request);
    
    const filters: TodoFilters = {};
    
    if (validatedRequest.status !== undefined) {
      filters.status = validatedRequest.status;
    }
    
    if (validatedRequest.priority !== undefined) {
      filters.priority = validatedRequest.priority;
    }
    
    if (validatedRequest.tags !== undefined) {
      filters.tags = validatedRequest.tags;
    }

    const allFilteredTodos = this.getAllTodos(filters);
    const startIndex = validatedRequest.offset ?? 0;
    const limit = validatedRequest.limit ?? 50;
    const offset = validatedRequest.offset ?? 0;
    const endIndex = startIndex + limit;
    const paginatedTodos = allFilteredTodos.slice(startIndex, endIndex);

    const response: TodoListResponse = {
      todos: paginatedTodos,
      total: allFilteredTodos.length,
      limit: limit,
      offset: offset,
      hasMore: endIndex < allFilteredTodos.length
    };

    return validateData(TodoSchema.array(), paginatedTodos).length > 0 
      ? response 
      : { ...response, todos: [] };
  }

  getTodoById(id: string): Todo | null {
    const todo = this.todos.get(id);
    return todo || null;
  }

  createTodo(request: CreateTodoRequest): Todo {
    // Validar entrada
    const validatedRequest = validateData(CreateTodoSchema, request);
    
    const todo: Todo = {
      id: randomUUID(),
      title: validatedRequest.title,
      description: validatedRequest.description,
      completed: false,
      createdAt: new Date(),
      priority: validatedRequest.priority || 'medium',
      tags: validatedRequest.tags || []
    };

    this.todos.set(todo.id, todo);
    
    return todo;
  }

  updateTodo(request: UpdateTodoRequest): Todo | null {
    // Validar entrada
    const validatedRequest = validateData(UpdateTodoSchema, request);
    
    const existingTodo = this.todos.get(validatedRequest.id);
    if (!existingTodo) {
      return null;
    }

    const updatedTodo: Todo = {
      ...existingTodo,
      ...(validatedRequest.title !== undefined && { title: validatedRequest.title }),
      ...(validatedRequest.description !== undefined && { description: validatedRequest.description }),
      ...(validatedRequest.priority !== undefined && { priority: validatedRequest.priority }),
      ...(validatedRequest.tags !== undefined && { tags: validatedRequest.tags }),
      ...(validatedRequest.completed !== undefined && { 
        completed: validatedRequest.completed,
        completedAt: validatedRequest.completed ? new Date() : undefined
      })
    };

    this.todos.set(validatedRequest.id, updatedTodo);
    
    return updatedTodo;
  }

  deleteTodo(id: string): boolean {
    try {
      validateData(TodoSchema.shape.id, id);
      return this.todos.delete(id);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      return false;
    }
  }

  getStats(): TodoStats {
    const todos = this.getAllTodos();
    const stats = {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      pending: todos.filter(t => !t.completed).length
    };

    return validateData(TodoStatsSchema, stats);
  }

  searchTodos(searchTerm: string, filters?: Omit<TodoFilters, 'searchTerm'>): Todo[] {
    return this.getAllTodos({ ...filters, searchTerm });
  }

  getTodosByTag(tag: string): Todo[] {
    return this.getAllTodos({ tags: [tag] });
  }

  getTodosByPriority(priority: Todo['priority']): Todo[] {
    return this.getAllTodos({ priority });
  }
}