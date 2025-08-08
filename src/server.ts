import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  GetPromptRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { TodoService } from "./services/todo.services.js";
import {
  CreateTodoSchema,
  UpdateTodoSchema,
  DeleteTodoSchema,
  ListTodosSchema,
  GetTodoByIdSchema,
  SearchTodosSchema,
} from "./schemas/todo.schemas.js";
import {
  validateData,
  sanitizeInput,
  createErrorResponse,
} from "./utils/validation.js";

export class TodoMCPServer {
  private server: Server;
  private todoService: TodoService;

  constructor() {
    this.server = new Server(
      {
        name: "todo-server-zod",
        version: "2.0.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      }
    );

    this.todoService = new TodoService();
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Handler para listar recursos
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
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
            description: "List of all completed todos",
          },
          {
            uri: "todo://pending",
            mimeType: "application/json",
            name: "Pending Todos",
            description: "List of all pending todos",
          },
        ],
      };
    });

    // Handler para ler recursos
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        const { uri } = request.params;

        try {
          switch (uri) {
            case "todo://all": {
              const todos = this.todoService.getAllTodos();
              return {
                contents: [
                  {
                    uri,
                    mimeType: "application/json",
                    text: JSON.stringify(todos, null, 2),
                  },
                ],
              };
            }

            case "todo://stats": {
              const stats = this.todoService.getStats();
              return {
                contents: [
                  {
                    uri,
                    mimeType: "application/json",
                    text: JSON.stringify(stats, null, 2),
                  },
                ],
              };
            }

            case "todo://completed": {
              const todos = this.todoService.getAllTodos({
                status: "completed",
              });
              return {
                contents: [
                  {
                    uri,
                    mimeType: "application/json",
                    text: JSON.stringify(todos, null, 2),
                  },
                ],
              };
            }

            case "todo://pending": {
              const todos = this.todoService.getAllTodos({ status: "pending" });
              return {
                contents: [
                  {
                    uri,
                    mimeType: "application/json",
                    text: JSON.stringify(todos, null, 2),
                  },
                ],
              };
            }

            default:
              throw new Error(`Resource not found: ${uri}`);
          }
        } catch (error) {
          const errorResponse = createErrorResponse(
            error,
            `read resource ${uri}`
          );
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(errorResponse, null, 2),
              },
            ],
          };
        }
      }
    );

    // Handler para listar ferramentas
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "create_todo",
            description: "Create a new todo item with validation",
            inputSchema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "Title of the todo (1-200 characters)",
                  minLength: 1,
                  maxLength: 200,
                },
                description: {
                  type: "string",
                  description: "Optional description (max 1000 characters)",
                  maxLength: 1000,
                },
                priority: {
                  type: "string",
                  enum: ["low", "medium", "high"],
                  description: "Priority level",
                  default: "medium",
                },
                tags: {
                  type: "array",
                  items: { type: "string", minLength: 1, maxLength: 50 },
                  maxItems: 10,
                  description: "Tags for categorization",
                  default: [],
                },
              },
              required: ["title"],
            },
          },
          {
            name: "update_todo",
            description: "Update an existing todo item",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                  description: "UUID of the todo to update",
                },
                title: {
                  type: "string",
                  minLength: 1,
                  maxLength: 200,
                  description: "New title",
                },
                description: {
                  type: "string",
                  maxLength: 1000,
                  description: "New description",
                },
                completed: {
                  type: "boolean",
                  description: "Mark as completed or not",
                },
                priority: {
                  type: "string",
                  enum: ["low", "medium", "high"],
                  description: "New priority level",
                },
                tags: {
                  type: "array",
                  items: { type: "string", minLength: 1, maxLength: 50 },
                  maxItems: 10,
                  description: "New tags",
                },
              },
              required: ["id"],
            },
          },
          {
            name: "delete_todo",
            description: "Delete a todo item",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                  description: "UUID of the todo to delete",
                },
              },
              required: ["id"],
            },
          },
          {
            name: "list_todos",
            description: "List todos with filtering and pagination",
            inputSchema: {
              type: "object",
              properties: {
                status: {
                  type: "string",
                  enum: ["all", "completed", "pending"],
                  description: "Filter by completion status",
                  default: "all",
                },
                priority: {
                  type: "string",
                  enum: ["low", "medium", "high"],
                  description: "Filter by priority",
                },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  description: "Filter by tags (OR logic)",
                },
                limit: {
                  type: "number",
                  minimum: 1,
                  maximum: 100,
                  description: "Maximum number of results",
                  default: 50,
                },
                offset: {
                  type: "number",
                  minimum: 0,
                  description: "Number of results to skip",
                  default: 0,
                },
              },
            },
          },
          {
            name: "get_todo",
            description: "Get a specific todo by ID",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                  description: "UUID of the todo to retrieve",
                },
              },
              required: ["id"],
            },
          },
          {
            name: "search_todos",
            description: "Search todos by title or description",
            inputSchema: {
              type: "object",
              properties: {
                searchTerm: {
                  type: "string",
                  minLength: 1,
                  description: "Search term for title or description",
                },
                status: {
                  type: "string",
                  enum: ["all", "completed", "pending"],
                  description: "Filter by status",
                  default: "all",
                },
                priority: {
                  type: "string",
                  enum: ["low", "medium", "high"],
                  description: "Filter by priority",
                },
              },
              required: ["searchTerm"],
            },
          },
        ],
      };
    });

    // Handler para executar ferramentas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Sanitizar entrada
        const sanitizedArgs = sanitizeInput(args);

        switch (name) {
          case "create_todo": {
            const validatedRequest = validateData(
              CreateTodoSchema,
              sanitizedArgs
            );
            const todo = this.todoService.createTodo({
              ...validatedRequest,
              priority: validatedRequest.priority || "medium",
              tags: validatedRequest.tags || [],
            });

            return {
              content: [
                {
                  type: "text",
                  text: `✅ Todo criado com sucesso!\n\n${JSON.stringify(
                    todo,
                    null,
                    2
                  )}`,
                },
              ],
            };
          }

          case "update_todo": {
            const validatedRequest = validateData(
              UpdateTodoSchema,
              sanitizedArgs
            );
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
                  text: `✅ Todo atualizado com sucesso!\n\n${JSON.stringify(
                    todo,
                    null,
                    2
                  )}`,
                },
              ],
            };
          }

          case "delete_todo": {
            const validatedRequest = validateData(
              DeleteTodoSchema,
              sanitizedArgs
            );
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
          }

          case "list_todos": {
            const validatedRequest = validateData(
              ListTodosSchema,
              sanitizedArgs
            );
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
                    `📄 Página: ${
                      Math.floor(result.offset / result.limit) + 1
                    }\n` +
                    `${
                      result.hasMore
                        ? "➡️ Há mais resultados disponíveis"
                        : "✅ Todos os resultados exibidos"
                    }\n\n` +
                    JSON.stringify(result.todos, null, 2),
                },
              ],
            };
          }

          case "get_todo": {
            const validatedRequest = validateData(
              GetTodoByIdSchema,
              sanitizedArgs
            );
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
                  text: `📋 Todo encontrado:\n\n${JSON.stringify(
                    todo,
                    null,
                    2
                  )}`,
                },
              ],
            };
          }

          case "search_todos": {
            const validatedRequest = validateData(
              SearchTodosSchema,
              sanitizedArgs
            );
            const filters: any = {};
            if (validatedRequest.status !== undefined) {
              filters.status = validatedRequest.status;
            }
            if (validatedRequest.priority !== undefined) {
              filters.priority = validatedRequest.priority;
            }
            const todos = this.todoService.searchTodos(
              validatedRequest.searchTerm,
              filters
            );

            return {
              content: [
                {
                  type: "text",
                  text: `🔍 Busca por "${
                    validatedRequest.searchTerm
                  }" retornou ${todos.length} resultado(s):\n\n${JSON.stringify(
                    todos,
                    null,
                    2
                  )}`,
                },
              ],
            };
          }

          default:
            throw new Error(`Ferramenta desconhecida: ${name}`);
        }
      } catch (error) {
        const errorResponse = createErrorResponse(
          error,
          `executar ferramenta ${name}`
        );
        return {
          content: [
            {
              type: "text",
              text: `❌ ${errorResponse.error}\n${errorResponse.details || ""}`,
            },
          ],
        };
      }
    });

    // Handler para listar prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: "todo_summary",
            description: "Generate a comprehensive summary of todos",
            arguments: [
              {
                name: "include_completed",
                description: "Whether to include completed todos (true/false)",
                required: false,
              },
              {
                name: "group_by_priority",
                description: "Group todos by priority level (true/false)",
                required: false,
              },
            ],
          },
          {
            name: "todo_prioritization",
            description: "Get help prioritizing pending todos",
            arguments: [],
          },
          {
            name: "productivity_insights",
            description:
              "Generate productivity insights based on todo patterns",
            arguments: [
              {
                name: "time_period",
                description: "Time period to analyze (week/month/all)",
                required: false,
              },
            ],
          },
        ],
      };
    });

    // Handler para obter prompts
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "todo_summary": {
            const includeCompleted = args?.include_completed === "true";
            const groupByPriority = args?.group_by_priority === "true";

            const todos = this.todoService.getAllTodos();
            const stats = this.todoService.getStats();

            let prompt = `# 📊 Resumo de Tarefas\n\n`;
            prompt += `**📈 Estatísticas Gerais:**\n`;
            prompt += `- Total: ${stats.total}\n`;
            prompt += `- ✅ Concluídas: ${stats.completed}\n`;
            prompt += `- ⏳ Pendentes: ${stats.pending}\n`;
            prompt += `- 📊 Taxa de conclusão: ${
              stats.total > 0
                ? Math.round((stats.completed / stats.total) * 100)
                : 0
            }%\n\n`;

            const filteredTodos = includeCompleted
              ? todos
              : todos.filter((t) => !t.completed);

            if (filteredTodos.length > 0) {
              if (groupByPriority) {
                const priorities = ["high", "medium", "low"] as const;
                priorities.forEach((priority) => {
                  const priorityTodos = filteredTodos.filter(
                    (t) => t.priority === priority
                  );
                  if (priorityTodos.length > 0) {
                    const priorityEmoji =
                      priority === "high"
                        ? "🔴"
                        : priority === "medium"
                        ? "🟡"
                        : "🟢";
                    prompt += `**${priorityEmoji} Prioridade ${priority.toUpperCase()} (${
                      priorityTodos.length
                    }):**\n`;
                    priorityTodos.forEach((todo) => {
                      prompt += `- [${todo.completed ? "x" : " "}] ${
                        todo.title
                      }`;
                      if (todo.description) prompt += ` - ${todo.description}`;
                      if (todo.tags.length > 0)
                        prompt += ` 🏷️ ${todo.tags.join(", ")}`;
                      prompt += `\n`;
                    });
                    prompt += `\n`;
                  }
                });
              } else {
                prompt += `**📋 ${
                  includeCompleted ? "Todas as" : "Tarefas Pendentes"
                } (${filteredTodos.length}):**\n`;
                filteredTodos.forEach((todo) => {
                  const priorityEmoji =
                    todo.priority === "high"
                      ? "🔴"
                      : todo.priority === "medium"
                      ? "🟡"
                      : "🟢";
                  prompt += `- [${
                    todo.completed ? "x" : " "
                  }] ${priorityEmoji} ${todo.title}`;
                  if (todo.description) prompt += ` - ${todo.description}`;
                  if (todo.tags.length > 0)
                    prompt += ` 🏷️ ${todo.tags.join(", ")}`;
                  prompt += `\n`;
                });
              }
            }

            return {
              messages: [
                {
                  role: "user",
                  content: {
                    type: "text",
                    text: prompt,
                  },
                },
              ],
            };
          }

          case "todo_prioritization": {
            const pendingTodos = this.todoService.getAllTodos({
              status: "pending",
            });

            let prompt = `# 🎯 Ajuda para Priorização de Tarefas\n\n`;
            prompt += `Preciso de ajuda para priorizar essas ${pendingTodos.length} tarefas pendentes:\n\n`;

            pendingTodos.forEach((todo, index) => {
              const priorityEmoji =
                todo.priority === "high"
                  ? "🔴"
                  : todo.priority === "medium"
                  ? "🟡"
                  : "🟢";
              prompt += `**${index + 1}. ${todo.title}** ${priorityEmoji}\n`;
              if (todo.description) prompt += `   📝 ${todo.description}\n`;
              if (todo.tags.length > 0)
                prompt += `   🏷️ Tags: ${todo.tags.join(", ")}\n`;
              prompt += `   📅 Criada em: ${todo.createdAt.toLocaleDateString(
                "pt-BR"
              )}\n`;
              prompt += `   ⚡ Prioridade atual: ${todo.priority}\n\n`;
            });

            prompt += `Por favor, sugira uma ordem de priorização considerando:\n`;
            prompt += `- Urgência e importância\n`;
            prompt += `- Dependências entre tarefas\n`;
            prompt += `- Esforço estimado\n`;
            prompt += `- Impact no projeto geral\n\n`;
            prompt += `Forneça uma explicação detalhada para suas recomendações.`;

            return {
              messages: [
                {
                  role: "user",
                  content: {
                    type: "text",
                    text: prompt,
                  },
                },
              ],
            };
          }

          case "productivity_insights": {
            const timePeriod = args?.time_period || "all";
            const todos = this.todoService.getAllTodos();
            const stats = this.todoService.getStats();

            // Análise por prioridade
            const priorityStats = {
              high: todos.filter((t) => t.priority === "high"),
              medium: todos.filter((t) => t.priority === "medium"),
              low: todos.filter((t) => t.priority === "low"),
            };

            // Análise por tags
            const tagStats = new Map<
              string,
              { total: number; completed: number }
            >();
            todos.forEach((todo) => {
              todo.tags.forEach((tag) => {
                const current = tagStats.get(tag) || { total: 0, completed: 0 };
                current.total++;
                if (todo.completed) current.completed++;
                tagStats.set(tag, current);
              });
            });

            let prompt = `# 📊 Insights de Produtividade\n\n`;
            prompt += `**📈 Análise Geral (${timePeriod}):**\n`;
            prompt += `- Taxa de conclusão: ${Math.round(
              (stats.completed / stats.total) * 100
            )}%\n`;
            prompt += `- Total de tarefas: ${stats.total}\n\n`;

            prompt += `**🎯 Análise por Prioridade:**\n`;
            Object.entries(priorityStats).forEach(([priority, tasks]) => {
              const completedCount = tasks.filter((t) => t.completed).length;
              const completionRate =
                tasks.length > 0
                  ? Math.round((completedCount / tasks.length) * 100)
                  : 0;
              const emoji =
                priority === "high"
                  ? "🔴"
                  : priority === "medium"
                  ? "🟡"
                  : "🟢";
              prompt += `- ${emoji} ${priority}: ${completedCount}/${tasks.length} (${completionRate}%)\n`;
            });

            if (tagStats.size > 0) {
              prompt += `\n**🏷️ Análise por Tags:**\n`;
              Array.from(tagStats.entries())
                .sort((a, b) => b[1].total - a[1].total)
                .slice(0, 5)
                .forEach(([tag, stats]) => {
                  const rate = Math.round(
                    (stats.completed / stats.total) * 100
                  );
                  prompt += `- ${tag}: ${stats.completed}/${stats.total} (${rate}%)\n`;
                });
            }

            prompt += `\n**💡 Baseado nestes dados, me forneça insights sobre:**\n`;
            prompt += `- Padrões de produtividade\n`;
            prompt += `- Áreas que precisam de atenção\n`;
            prompt += `- Sugestões para melhorar a eficiência\n`;
            prompt += `- Recomendações de organização`;

            return {
              messages: [
                {
                  role: "user",
                  content: {
                    type: "text",
                    text: prompt,
                  },
                },
              ],
            };
          }

          default:
            throw new Error(`Prompt desconhecido: ${name}`);
        }
      } catch (error) {
        const errorResponse = createErrorResponse(
          error,
          `obter prompt ${name}`
        );
        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `❌ ${errorResponse.error}: ${errorResponse.details}`,
              },
            },
          ],
        };
      }
    });
  }
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("🚀 MCP Todo Server com Zod iniciado");
    console.error("✅ Validação robusta ativada");
    console.error("🔒 Type safety garantida");

    // Keep the process running
    process.on("SIGINT", async () => {
      console.error("🛑 Encerrando Todo List MCP Server");
      await this.server.close();
      process.exit(0);
    });
  }
}
