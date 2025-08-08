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
import { ToolHandlers } from "./handlers/toolHandlers.js";
import { ResourceHandlers } from "./handlers/resourceHandlers.js";
import { PromptHandlers } from "./handlers/promptHandlers.js";
import { TOOL_DEFINITIONS } from "./config/toolDefinitions.js";

class TodoMCPServer {
  private server: Server;
  private todoService: TodoService;
  private toolHandlers: ToolHandlers;
  private resourceHandlers: ResourceHandlers;
  private promptHandlers: PromptHandlers;

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
    this.toolHandlers = new ToolHandlers(this.todoService);
    this.resourceHandlers = new ResourceHandlers(this.todoService);
    this.promptHandlers = new PromptHandlers(this.todoService);
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Handler para listar recursos
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return this.resourceHandlers.handleListResources();
    });

    // Handler para ler recursos
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      return this.resourceHandlers.handleReadResource(request);
    });

    // Handler para listar ferramentas
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: TOOL_DEFINITIONS.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      };
    });

    // Handler para executar ferramentas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      return this.toolHandlers.handleCallTool(request);
    });

    // Handler para listar prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return this.promptHandlers.handleListPrompts();
    });

    // Handler para obter prompts
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      return this.promptHandlers.handleGetPrompt(request);
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

export { TodoMCPServer };
