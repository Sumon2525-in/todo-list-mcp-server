import { CallToolRequest, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { TodoService } from "../services/todo.services.js";
import {
  CreateTodoSchema,
  UpdateTodoSchema,
  DeleteTodoSchema,
  ListTodosSchema,
  GetTodoByIdSchema,
  SearchTodosSchema,
} from "../schemas/todo.schemas.js";
import {
  validateData,
  sanitizeInput,
  createErrorResponse,
} from "../utils/validation.js";

export class ToolHandlers {
  constructor(private todoService: TodoService) {}

  public async handleCallTool(request: CallToolRequest): Promise<CallToolResult> {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "create_todo":
          return this.handleCreateTodo(request);
        case "update_todo":
          return this.handleUpdateTodo(request);
        case "delete_todo":
          return this.handleDeleteTodo(request);
        case "list_todos":
          return this.handleListTodos(request);
        case "get_todo":
          return this.handleGetTodo(request);
        case "search_todos":
          return this.handleSearchTodos(request);
        default:
          return {
            content: [
              {
                type: "text",
                text: `❌ Ferramenta desconhecida: ${name}`,
              },
            ],
            isError: true,
          };
      }
    } catch (error) {
      const errorResponse = createErrorResponse(error, `executar ${name}`);
      return {
        content: [
          {
            type: "text",
            text: `❌ ${errorResponse.error}: ${errorResponse.details}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleCreateTodo(request: CallToolRequest): Promise<CallToolResult> {
    try {
      const sanitizedArgs = sanitizeInput(request.params.arguments);
      const validatedRequest = validateData(CreateTodoSchema, sanitizedArgs);
      
      const todo = this.todoService.createTodo({
        ...validatedRequest,
        priority: validatedRequest.priority || "medium",
        tags: validatedRequest.tags || [],
      });

      return {
        content: [
          {
            type: "text",
            text: `✅ Todo criado com sucesso!\n\n${JSON.stringify(todo, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      const errorResponse = createErrorResponse(error, "criar todo");
      return {
        content: [
          {
            type: "text",
            text: `❌ ${errorResponse.error}\n${errorResponse.details || ""}`,
          },
        ],
      };
    }
  }

  async handleUpdateTodo(request: CallToolRequest): Promise<CallToolResult> {
    try {
      const sanitizedArgs = sanitizeInput(request.params.arguments);
      const validatedRequest = validateData(UpdateTodoSchema, sanitizedArgs);
      const todo = this.todoService.updateTodo(validatedRequest);

      if (!todo) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Todo com ID ${validatedRequest.id} não encontrado`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `✅ Todo atualizado com sucesso!\n\n${JSON.stringify(todo, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      const errorResponse = createErrorResponse(error, "atualizar todo");
      return {
        content: [
          {
            type: "text",
            text: `❌ ${errorResponse.error}\n${errorResponse.details || ""}`,
          },
        ],
      };
    }
  }

  async handleDeleteTodo(request: CallToolRequest): Promise<CallToolResult> {
    try {
      const sanitizedArgs = sanitizeInput(request.params.arguments);
      const validatedRequest = validateData(DeleteTodoSchema, sanitizedArgs);
      const deleted = this.todoService.deleteTodo(validatedRequest.id);

      return {
        content: [
          {
            type: "text",
            text: deleted
              ? `✅ Todo com ID ${validatedRequest.id} deletado com sucesso`
              : `❌ Todo com ID ${validatedRequest.id} não encontrado`,
          },
        ],
      };
    } catch (error) {
      const errorResponse = createErrorResponse(error, "deletar todo");
      return {
        content: [
          {
            type: "text",
            text: `❌ ${errorResponse.error}\n${errorResponse.details || ""}`,
          },
        ],
      };
    }
  }

  async handleListTodos(request: CallToolRequest): Promise<CallToolResult> {
    try {
      const sanitizedArgs = sanitizeInput(request.params.arguments);
      const validatedRequest = validateData(ListTodosSchema, sanitizedArgs);
      
      const result = this.todoService.listTodos({
        ...validatedRequest,
        status: validatedRequest.status || "all",
        limit: validatedRequest.limit || 50,
        offset: validatedRequest.offset || 0,
      });

      return {
        content: [
          {
            type: "text",
            text:
              `📋 Encontrados ${result.todos.length} de ${result.total} todo(s)\n` +
              `📄 Página: ${Math.floor(result.offset / result.limit) + 1}\n` +
              `${
                result.hasMore
                  ? "➡️ Há mais resultados disponíveis"
                  : "✅ Todos os resultados exibidos"
              }\n\n` +
              JSON.stringify(result.todos, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorResponse = createErrorResponse(error, "listar todos");
      return {
        content: [
          {
            type: "text",
            text: `❌ ${errorResponse.error}\n${errorResponse.details || ""}`,
          },
        ],
      };
    }
  }

  async handleGetTodo(request: CallToolRequest): Promise<CallToolResult> {
    try {
      const sanitizedArgs = sanitizeInput(request.params.arguments);
      const validatedRequest = validateData(GetTodoByIdSchema, sanitizedArgs);
      const todo = this.todoService.getTodoById(validatedRequest.id);

      if (!todo) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Todo com ID ${validatedRequest.id} não encontrado`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `📋 Todo encontrado:\n\n${JSON.stringify(todo, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      const errorResponse = createErrorResponse(error, "buscar todo");
      return {
        content: [
          {
            type: "text",
            text: `❌ ${errorResponse.error}\n${errorResponse.details || ""}`,
          },
        ],
      };
    }
  }

  async handleSearchTodos(request: CallToolRequest): Promise<CallToolResult> {
    try {
      const sanitizedArgs = sanitizeInput(request.params.arguments);
      const validatedRequest = validateData(SearchTodosSchema, sanitizedArgs);
      
      const filters: any = {};
      if (validatedRequest.status !== undefined) {
        filters.status = validatedRequest.status;
      }
      if (validatedRequest.priority !== undefined) {
        filters.priority = validatedRequest.priority;
      }
      
      const todos = this.todoService.searchTodos(validatedRequest.searchTerm, filters);

      return {
        content: [
          {
            type: "text",
            text: `🔍 Busca por "${validatedRequest.searchTerm}" retornou ${todos.length} resultado(s):\n\n${JSON.stringify(todos, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      const errorResponse = createErrorResponse(error, "buscar todos");
      return {
        content: [
          {
            type: "text",
            text: `❌ ${errorResponse.error}\n${errorResponse.details || ""}`,
          },
        ],
      };
    }
  }
}
