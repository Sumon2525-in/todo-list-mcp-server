import { ReadResourceRequest, ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import { TodoService } from "../services/todo.services.js";
import { createErrorResponse } from "../utils/validation.js";

class ResourceHandlers {
  constructor(private todoService: TodoService) {}

  public handleListResources() {
    return {
      resources: [
        {
          uri: "todo://all",
          mimeType: "application/json",
          name: "All Todos",
          description: "Complete list of all todos with full details",
        },
        {
          uri: "todo://stats",
          mimeType: "application/json",
          name: "Todo Statistics",
          description: "Statistics about todos (total, completed, pending)",
        },
        {
          uri: "todo://completed",
          mimeType: "application/json",
          name: "Completed Todos",
          description: "Only completed todos",
        },
        {
          uri: "todo://pending",
          mimeType: "application/json",
          name: "Pending Todos",
          description: "Only pending todos",
        },
      ],
    };
  }

  public async handleReadResource(request: ReadResourceRequest): Promise<ReadResourceResult> {
    const { uri } = request.params;

    try {
      switch (uri) {
        case "todo://all":
          const allTodos = this.todoService.getAllTodos();
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(allTodos, null, 2),
              },
            ],
          };

        case "todo://stats":
          const stats = this.todoService.getStats();
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(
                  {
                    totalTodos: stats.total,
                    completedTodos: stats.completed,
                    pendingTodos: stats.pending,
                    completionRate: `${((stats.completed / stats.total) * 100).toFixed(1)}%`,
                    lastUpdated: new Date().toISOString(),
                  },
                  null,
                  2
                ),
              },
            ],
          };

        case "todo://completed":
          const completedTodos = this.todoService.getAllTodos().filter((todo) => todo.completed);
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(completedTodos, null, 2),
              },
            ],
          };

        case "todo://pending":
          const pendingTodos = this.todoService.getAllTodos().filter((todo) => !todo.completed);
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(pendingTodos, null, 2),
              },
            ],
          };

        default:
          throw new Error(`Recurso não encontrado: ${uri}`);
      }
    } catch (error) {
      const errorResponse = createErrorResponse(error, `ler recurso ${uri}`);
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                error: errorResponse.error,
                details: errorResponse.details,
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }
}

export { ResourceHandlers };
