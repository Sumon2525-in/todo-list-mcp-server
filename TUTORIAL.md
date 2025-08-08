# 🎓 Tutorial For Dummies: Como Criar um MCP Server do Zero

> **Para quem é este tutorial?** Pessoas que nunca criaram um MCP Server e querem aprender passo a passo, desde os conceitos básicos até ter um projeto funcionando com arquitetura profissional.

<div align="center">

![Iniciante](https://img.shields.io/badge/Nível-Iniciante-green?style=for-the-badge)
![Passo a Passo](https://img.shields.io/badge/Estilo-Passo%20a%20Passo-blue?style=for-the-badge)
![Completo](https://img.shields.io/badge/Tutorial-Completo-orange?style=for-the-badge)

</div>

## 📚 Parte 1: Entendendo os Conceitos Básicos

Antes de começar a programar, vamos entender **o que** estamos criando e **por que**.

### 🤔 **O que é um MCP Server?**

Imagine que você tem um assistente pessoal (Claude) e quer que ele possa:
- Ver suas tarefas 
- Criar novas tarefas
- Marcar tarefas como concluídas
- Te dar relatórios sobre sua produtividade

**MCP Server** é como uma "ponte" que permite ao Claude fazer essas coisas. É um programa que:
1. **Recebe pedidos** do Claude ("crie uma tarefa")
2. **Processa** o pedido (salva a tarefa)
3. **Responde** para o Claude ("tarefa criada com sucesso")

### 🏗️ **O que é TypeScript?**

TypeScript é como JavaScript, mas com "regras extras" que:
- **Detectam erros** antes do programa rodar
- **Ajudam o editor** a dar sugestões melhores
- **Tornam o código** mais fácil de entender

**Exemplo:**
```javascript
// JavaScript normal - pode dar erro
function criarTarefa(titulo) {
  return { titulo: titulo.toUpperCase() }; // E se titulo for null?
}

// TypeScript - previne erros
function criarTarefa(titulo: string) {
  return { titulo: titulo.toUpperCase() }; // Garante que titulo é uma string
}
```

### 🛡️ **O que é Zod?**

Zod é como um "inspetor de qualidade" que verifica se os dados estão corretos:

```typescript
// Definimos as regras
const TarefaSchema = z.object({
  titulo: z.string().min(1).max(100), // Texto de 1 a 100 caracteres
  prioridade: z.enum(['low', 'medium', 'high']) // Só estes valores
});

// Zod verifica automaticamente
const dadosRecebidos = { titulo: "", prioridade: "urgente" };
const resultado = TarefaSchema.parse(dadosRecebidos); // ❌ ERRO! Detecta problemas
```

### 🧩 **Arquitetura SOLID (Organização Profissional)**

Vamos organizar nosso código como os profissionais fazem:

```
📁 config/     ← Configurações (definições das ferramentas)
📁 handlers/   ← Manipuladores (quem faz o trabalho)
📁 schemas/    ← Validadores (regras dos dados)
📁 services/   ← Lógica de negócio (como as tarefas funcionam)
📁 utils/      ← Utilitários (funções auxiliares)
```

**Por que separar assim?**
- **Organização:** Cada arquivo tem uma responsabilidade
- **Facilidade:** Mais fácil encontrar e modificar código
- **Profissional:** Padrão usado por grandes empresas

### 🔧 **Como funciona a integração?**

```
[Você fala com Claude] 
       ↓
[Claude Desktop]
       ↓ (JSON-RPC)
[Nosso Servidor MCP] ← Arquitetura organizada!
   ↓
[Handlers especializados]
   ↓
[Serviço de Tarefas]
   ↓
[Suas tarefas em memória]
```

---

## 🛠️ Parte 2: Preparando o Ambiente

### **Passo 1: Verificar Requisitos**

Abra o **terminal** (cmd no Windows, Terminal no Mac/Linux) e digite:

```bash
# Verificar se Node.js está instalado
node --version
# Deve mostrar algo como: v18.17.0 ou superior

# Verificar se npm está instalado  
npm --version
# Deve mostrar algo como: 9.6.7 ou superior
```

**Se não estiver instalado:**
1. Vá em [nodejs.org](https://nodejs.org)
2. Baixe a versão LTS (recomendada)
3. Instale seguindo as instruções
4. Reinicie o terminal e teste novamente

### **Passo 2: Criar Pasta do Projeto**

```bash
# Criar pasta
mkdir todo-list-mcp-server
cd todo-list-mcp-server

# Verificar se está na pasta certa
pwd  # Mac/Linux
echo %cd%  # Windows
```

### **Passo 3: Inicializar Projeto Node.js**

```bash
# Criar arquivo package.json
npm init -y
```

**O que aconteceu?** Foi criado um arquivo `package.json` que é como uma "carteira de identidade" do nosso projeto.

### **Passo 4: Instalar Dependências**

```bash
# Instalar as bibliotecas que vamos usar
npm install @modelcontextprotocol/sdk zod zod-to-json-schema

# Instalar ferramentas de desenvolvimento  
npm install -D typescript @types/node tsx nodemon
```

**O que cada uma faz?**
- `@modelcontextprotocol/sdk`: Kit oficial para criar servidores MCP
- `zod`: Validação de dados
- `zod-to-json-schema`: Converte schemas Zod para JSON Schema
- `typescript`: Compilador TypeScript
- `@types/node`: Definições de tipos para Node.js
- `tsx`: Executa TypeScript diretamente

---

## 📁 Parte 3: Criando a Estrutura Profissional

### **Passo 1: Configurar TypeScript**

Crie o arquivo `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "resolveJsonModule": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**O que isso significa?**
- `"target": "ES2022"`: Usa JavaScript moderno
- `"outDir": "./dist"`: Código compilado vai para pasta `dist`
- `"rootDir": "./src"`: Código TypeScript fica na pasta `src`
- `"strict": true`: Ativa verificações rigorosas (detecta mais erros)

### **Passo 2: Atualizar package.json**

Abra `package.json` e substitua todo o conteúdo por:

```json
{
  "name": "todo-list-mcp-server",
  "version": "1.0.0",
  "description": "A Todo List MCP Server",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "build": "tsc",
    "validate": "tsc --noEmit"
  },
  "keywords": [
    "todo",
    "list",
    "mcp",
    "server",
    "nodejs"
  ],
  "author": "Seu Nome",
  "license": "MIT",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.17.2",
    "zod": "^3.25.76",
    "zod-to-json-schema": "^3.24.6"
  },
  "devDependencies": {
    "@types/node": "^24.2.0",
    "nodemon": "^3.1.10",
    "tsx": "^4.20.3",
    "typescript": "^5.9.2"
  }
}
```

**O que cada script faz?**
- `dev`: Roda o projeto em modo desenvolvimento (recarrega automaticamente)
- `build`: Compila TypeScript para JavaScript
- `start`: Executa o projeto compilado
- `validate`: Verifica erros sem compilar

### **Passo 3: Criar Estrutura de Pastas Profissional**

```bash
# Criar todas as pastas de uma vez
mkdir -p src/{config,handlers,schemas,services,utils}

# No Windows, criar uma por uma:
mkdir src
mkdir src\config
mkdir src\handlers  
mkdir src\schemas
mkdir src\services
mkdir src\utils
```

**Estrutura final:**
```
todo-list-mcp-server/
├── src/
│   ├── config/         # ⚙️ Configurações
│   ├── handlers/       # 🎯 Manipuladores especializados  
│   ├── schemas/        # 📋 Validações Zod
│   ├── services/       # 🔧 Lógica de negócio
│   ├── utils/          # 🛠️ Funções auxiliares
│   ├── types.ts        # 📝 Tipos TypeScript
│   ├── server.ts       # 🖥️ Servidor principal
│   └── index.ts        # 🚀 Ponto de entrada
├── package.json
└── tsconfig.json
```

---

## 🎯 Parte 4: Implementação Passo a Passo

Vamos criar o projeto **gradualmente**, começando simples e evoluindo para uma arquitetura profissional.

### **Etapa 1: Tipos Básicos**

Crie `src/types.ts`:

```typescript
import { z } from 'zod';
import { 
  CreateTodoSchema, 
  DeleteTodoSchema, 
  GetTodoByIdSchema, 
  ListTodosSchema, 
  TodoListResponseSchema, 
  TodoSchema, 
  UpdateTodoSchema 
} from './schemas/todo.schemas.js';
import { ErrorResponseSchema, TodoStatsSchema } from './schemas/common.schemas.js';

// Tipos gerados automaticamente a partir dos schemas Zod
export type Todo = z.infer<typeof TodoSchema>;
export type CreateTodoRequest = z.infer<typeof CreateTodoSchema>;
export type UpdateTodoRequest = z.infer<typeof UpdateTodoSchema>;
export type DeleteTodoRequest = z.infer<typeof DeleteTodoSchema>;
export type ListTodosRequest = z.infer<typeof ListTodosSchema>;
export type GetTodoByIdRequest = z.infer<typeof GetTodoByIdSchema>;
export type TodoListResponse = z.infer<typeof TodoListResponseSchema>;
export type TodoStats = z.infer<typeof TodoStatsSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Tipos auxiliares
export type TodoPriority = Todo['priority'];
export type TodoStatus = 'completed' | 'pending';

// Interface para filtros
export interface TodoFilters {
  status?: 'all' | 'completed' | 'pending';
  priority?: TodoPriority;
  tags?: string[];
  searchTerm?: string;
}
```

**Por que fazer assim?** Os tipos são **gerados automaticamente** pelos schemas Zod, garantindo que sempre estejam sincronizados!

### **Etapa 2: Schemas Comuns (Validação Base)**

Crie `src/schemas/common.schemas.ts`:

```typescript
import { z } from 'zod';

// Schema para ID único (UUID) - CORRIGIDO!
export const UuidSchema = z.string().uuid('ID deve ser um UUID válido');

// Schema para datas (converte automaticamente)
export const DateSchema = z.coerce.date();

// Schema para texto obrigatório
export const NonEmptyStringSchema = z.string().min(1, 'Não pode ser vazio');  

// Schema para filtro de status
export const TodoStatusFilterSchema = z.enum(['all', 'completed', 'pending']);

// Schema para respostas de erro
export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
  code: z.string().optional()
});

// Schema para estatísticas
export const TodoStatsSchema = z.object({
  total: z.number().int().min(0),
  completed: z.number().int().min(0),
  pending: z.number().int().min(0)
});
```

**O que fazem os schemas comuns?**
- **Reutilização:** Evita repetir código
- **Consistência:** Mesmas regras em todo projeto
- **Manutenção:** Mudança em um lugar afeta tudo

### **Etapa 3: Schemas de Tarefas**

Crie `src/schemas/todo.schemas.ts`:

```typescript
import { 
  DateSchema, 
  NonEmptyStringSchema, 
  UuidSchema 
} from "./common.schemas.js";
import { z } from 'zod';

// Schema principal para uma tarefa completa
export const TodoSchema = z.object({
  id: UuidSchema,
  title: NonEmptyStringSchema.max(200, 'Título não pode exceder 200 caracteres'),
  description: z.string().max(500, 'Descrição não pode exceder 500 caracteres').optional(),
  completed: z.boolean().default(false),
  createdAt: DateSchema,
  completedAt: DateSchema.optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  tags: z.array(z.string().min(1).max(50)).max(10).default([])
});

// Schema para criar tarefa (sem id, sem createdAt)
export const CreateTodoSchema = z.object({
  title: NonEmptyStringSchema.max(200, 'Título não pode exceder 200 caracteres'),
  description: z.string().max(500, 'Descrição não pode exceder 500 caracteres').optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  tags: z.array(z.string().min(1).max(50)).max(10).default([])
});

// Schema para atualizar tarefa (todos os campos opcionais exceto id)
export const UpdateTodoSchema = z.object({
  id: UuidSchema,
  title: NonEmptyStringSchema.max(200, 'Título não pode exceder 200 caracteres').optional(),
  description: z.string().max(500).optional(),
  completed: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  tags: z.array(z.string().min(1).max(50)).max(10).optional()
});

// Schema para deletar tarefa
export const DeleteTodoSchema = z.object({
  id: UuidSchema
});

// Schema para listar tarefas com filtros e paginação
export const ListTodosSchema = z.object({
  status: z.enum(['all', 'completed', 'pending']).default('all'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0)
});

// Schema para buscar tarefa por ID
export const GetTodoByIdSchema = z.object({
  id: UuidSchema
});

// Schema para resposta de lista paginada
export const TodoListResponseSchema = z.object({
  todos: z.array(TodoSchema),
  total: z.number().int().min(0),
  limit: z.number().int().min(1),
  offset: z.number().int().min(0),
  hasMore: z.boolean()
});

// Schema para busca textual
export const SearchTodosSchema = z.object({
  searchTerm: NonEmptyStringSchema.min(1, 'Termo de busca é obrigatório'),
  status: z.enum(['all', 'completed', 'pending']).default('all'),
  priority: z.enum(['low', 'medium', 'high']).optional()
});
```

**Por que tantos schemas?**
- **Validação específica:** Cada operação tem regras diferentes
- **Segurança:** Impossível enviar dados inválidos
- **Documentação:** Os schemas são a documentação viva da API

### **Etapa 4: Utilitários de Validação**

Crie `src/utils/validation.ts`:

```typescript
import { z } from 'zod';

// Classe para erros de validação personalizados
export class ValidationError extends Error {
  public readonly issues: z.ZodIssue[];
  public readonly code = 'VALIDATION_ERROR';

  constructor(error: z.ZodError) {
    // Criar mensagem amigável listando todos os problemas
    const message = `Erro de validação: ${error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ')}`;
    
    super(message);
    this.name = 'ValidationError';
    this.issues = error.issues;
  }
}

// Função principal para validar dados
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data); // Zod valida os dados
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error); // Nosso erro personalizado
    }
    throw error; // Outros tipos de erro
  }
}

// Função para validação assíncrona
export async function validateDataAsync<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error);
    }
    throw error;
  }
}

// Função para limpar dados de entrada
export function sanitizeInput(data: unknown): unknown {
  // Se for string, remove espaços extras
  if (typeof data === 'string') {
    return data.trim();
  }
  
  // Se for array, limpa cada item
  if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  }
  
  // Se for objeto, limpa cada propriedade
  if (data && typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data; // Outros tipos retorna como está
}

// Função para criar respostas de erro padronizadas
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
```

**O que estas funções fazem?**
- **`validateData`**: Verifica se os dados estão corretos usando Zod
- **`sanitizeInput`**: Remove espaços extras e limpa a entrada
- **`createErrorResponse`**: Cria mensagens de erro padronizadas e amigáveis

### **Etapa 5: Serviço de Tarefas (Lógica de Negócio)**

Crie `src/services/todo.services.ts`:

```typescript
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
  // Armazenamos as tarefas em memória (Map é como um dicionário)
  private todos: Map<string, Todo> = new Map();

  constructor() {
    this.addSampleData(); // Criar algumas tarefas de exemplo
  }

  // Método privado para criar dados de exemplo
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
        createdAt: new Date(Date.now() - 86400000), // 1 dia atrás
        completedAt: new Date(),
        priority: 'medium',
        tags: ['tutorial', 'typescript', 'zod']
      },
      {
        title: "Implementar testes unitários",
        description: "Adicionar cobertura de testes para o servidor MCP",
        completed: false,
        createdAt: new Date(Date.now() - 43200000), // 12 horas atrás
        priority: 'low',
        tags: ['testes', 'qualidade']
      }
    ];

    // Para cada exemplo, criar uma tarefa real
    sampleTodos.forEach(todoData => {
      const id = randomUUID(); // Gerar ID único
      const todoWithDefaults = {
        ...todoData,
        id,
        completed: todoData.completed ?? false,
        priority: todoData.priority ?? 'medium' as const,
        tags: todoData.tags ?? []
      };
      
      // Validar antes de salvar
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

  // Buscar todas as tarefas com filtros opcionais
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

    // Ordenar por data de criação (mais recentes primeiro)
    return todos.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // Listar tarefas com paginação
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

  // Buscar tarefa por ID
  getTodoById(id: string): Todo | null {
    const todo = this.todos.get(id);
    return todo || null;
  }

  // Criar nova tarefa
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

  // Atualizar tarefa existente
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

  // Deletar tarefa
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

  // Obter estatísticas
  getStats(): TodoStats {
    const todos = this.getAllTodos();
    const stats = {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      pending: todos.filter(t => !t.completed).length
    };

    return validateData(TodoStatsSchema, stats);
  }

  // Buscar tarefas por texto
  searchTodos(searchTerm: string, filters?: Omit<TodoFilters, 'searchTerm'>): Todo[] {
    return this.getAllTodos({ ...filters, searchTerm });
  }

  // Buscar tarefas por tag
  getTodosByTag(tag: string): Todo[] {
    return this.getAllTodos({ tags: [tag] });
  }

  // Buscar tarefas por prioridade
  getTodosByPriority(priority: Todo['priority']): Todo[] {
    return this.getAllTodos({ priority });
  }
}
```

**O que faz este serviço?**
- **Gerencia dados:** Todas as operações com tarefas passam por aqui
- **Valida tudo:** Usa Zod para garantir que os dados estão corretos
- **Organiza código:** Separa a lógica de negócio do resto do programa
- **CRUD completo:** Create, Read, Update, Delete

### **Etapa 6: Configurações Centralizadas**

Crie `src/config/toolDefinitions.ts`:

```typescript
// Definições centralizadas de todas as ferramentas MCP
export const TOOL_DEFINITIONS = [
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
          description: "Optional description (max 500 characters)",
          maxLength: 500,
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
          maxLength: 500,
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
] as const;
```

**Por que centralizar as definições?**
- **Manutenção:** Mudanças em um lugar afetam tudo
- **Consistência:** Todas as ferramentas seguem o mesmo padrão
- **Documentação:** Fácil ver todas as funcionalidades disponíveis

### **Etapa 7: Handlers Especializados (Arquitetura SOLID)**

#### **7.1 - Handler de Ferramentas**

Crie `src/handlers/toolHandlers.ts`:

```typescript
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

  // Método principal que roteia as chamadas de ferramentas
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

  // Handler para criar tarefa
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

  // Handler para atualizar tarefa
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

  // Handler para deletar tarefa
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

  // Handler para listar tarefas
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

  // Handler para buscar tarefa por ID
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

  // Handler para buscar tarefas por texto
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
```

#### **7.2 - Handler de Recursos**

Crie `src/handlers/resourceHandlers.ts`:

```typescript
import { ReadResourceRequest, ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import { TodoService } from "../services/todo.services.js";
import { createErrorResponse } from "../utils/validation.js";

class ResourceHandlers {
  constructor(private todoService: TodoService) {}

  // Lista todos os recursos disponíveis
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

  // Lê dados de um recurso específico
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
```

#### **7.3 - Handler de Prompts**

Crie `src/handlers/promptHandlers.ts`:

```typescript
import { GetPromptRequest, GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import { TodoService } from "../services/todo.services.js";
import { createErrorResponse } from "../utils/validation.js";

class PromptHandlers {
  constructor(private todoService: TodoService) {}

  // Lista todos os prompts disponíveis
  public handleListPrompts() {
    return {
      prompts: [
        {
          name: "todo-summary",
          description: "Gera um resumo analítico dos todos com estatísticas avançadas",
          arguments: [
            {
              name: "period",
              description: "Período para análise",
              required: false,
            },
            {
              name: "includeCompleted",
              description: "Incluir todos completos na análise",
              required: false,
            },
          ],
        },
        {
          name: "todo-prioritization",
          description: "Sugere priorização inteligente dos todos baseada em múltiplos critérios",
          arguments: [
            {
              name: "context",
              description: "Contexto adicional para priorização",
              required: false,
            },
            {
              name: "focusArea",
              description: "Área de foco (trabalho, pessoal, estudos, etc.)",
              required: false,
            },
          ],
        },
        {
          name: "todo-insights",
          description: "Fornece insights detalhados sobre padrões de produtividade",
          arguments: [
            {
              name: "analysisDepth",
              description: "Profundidade da análise (superficial, detalhada, completa)",
              required: false,
            },
          ],
        },
      ],
    };
  }

  // Gera prompt específico com dados contextuais
  public async handleGetPrompt(request: GetPromptRequest): Promise<GetPromptResult> {
    const { name, arguments: args } = request.params;

    try {
      const todos = this.todoService.getAllTodos();
      const stats = this.todoService.getStats();

      switch (name) {
        case "todo-summary":
          const period = args?.period || "all";
          const includeCompleted = args?.includeCompleted !== "false";

          const filteredTodos = includeCompleted ? todos : todos.filter((todo) => !todo.completed);

          const priorityBreakdown = filteredTodos.reduce(
            (acc, todo) => {
              acc[todo.priority] = (acc[todo.priority] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          );

          const tagFrequencySummary = filteredTodos
            .flatMap((todo) => todo.tags)
            .reduce((acc, tag) => {
              acc[tag] = (acc[tag] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

          const topTagsSummary = Object.entries(tagFrequencySummary)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

          return {
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `Por favor, forneça um resumo analítico dos meus todos baseado nos dados abaixo:

**Estatísticas Gerais:**
- Total de todos: ${filteredTodos.length}
- Todos completos: ${stats.completed}
- Todos pendentes: ${stats.pending}
- Taxa de conclusão: ${((stats.completed / stats.total) * 100).toFixed(1)}%

**Distribuição por Prioridade:**
${Object.entries(priorityBreakdown)
  .map(([priority, count]) => `- ${priority}: ${count} todos`)
  .join("\n")}

**Tags mais utilizadas:**
${topTagsSummary.map(([tag, count]) => `- ${tag}: ${count} usos`).join("\n") || "Nenhuma tag utilizada"}

**Lista de Todos ${includeCompleted ? '(Completos e Pendentes)' : '(Apenas Pendentes)'}:**
${filteredTodos
  .map((todo, i) => `${i + 1}. [${todo.completed ? '✓' : ' '}] ${todo.title} (${todo.priority}) ${todo.tags.length > 0 ? `[${todo.tags.join(', ')}]` : ''}`)
  .join("\n")}

Forneça insights sobre:
1. Padrões de produtividade
2. Sugestões de melhoria
3. Análise das prioridades
4. Recomendações baseadas nas tags
5. Tendências identificadas`,
                },
              },
            ],
          };

        case "todo-prioritization":
          const context = args?.context || "geral";
          const focusArea = args?.focusArea || "produtividade";
          
          const pendingTodos = todos.filter((todo) => !todo.completed);

          return {
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `Por favor, analise e sugira uma priorização inteligente para os seguintes todos pendentes:

**Contexto:** ${context}
**Área de Foco:** ${focusArea}

**Todos Pendentes para Priorização:**
${pendingTodos
  .map((todo, i) => `${i + 1}. ${todo.title}
   - Prioridade atual: ${todo.priority}
   - Descrição: ${todo.description || 'Sem descrição'}
   - Tags: ${todo.tags.join(', ') || 'Nenhuma'}
   - Criado em: ${todo.createdAt.toLocaleString('pt-BR')}`)
  .join('\n\n')}

**Estatísticas de Contexto:**
- Total de todos pendentes: ${pendingTodos.length}
- Distribuição por prioridade atual:
  - Alta: ${pendingTodos.filter(t => t.priority === 'high').length}
  - Média: ${pendingTodos.filter(t => t.priority === 'medium').length}
  - Baixa: ${pendingTodos.filter(t => t.priority === 'low').length}

Forneça:
1. Uma lista priorizada dos todos (1-${pendingTodos.length})
2. Justificativa para cada priorização
3. Sugestões de agrupamento ou sequenciamento
4. Recomendações de prazo
5. Identificação de dependências potenciais`,
                },
              },
            ],
          };

        case "todo-insights":
          const analysisDepth = args?.analysisDepth || "detalhada";
          
          const completedTodos = todos.filter((todo) => todo.completed);
          const avgCompletionTime = completedTodos.length > 0 
            ? completedTodos.reduce((acc, todo) => {
                const createdTime = new Date(todo.createdAt).getTime();
                const completedTime = new Date(todo.completedAt || todo.createdAt).getTime();
                return acc + (completedTime - createdTime);
              }, 0) / completedTodos.length / (1000 * 60 * 60 * 24) // em dias
            : 0;

          const priorityCompletionRates = ['high', 'medium', 'low'].map(priority => {
            const totalWithPriority = todos.filter(t => t.priority === priority).length;
            const completedWithPriority = todos.filter(t => t.priority === priority && t.completed).length;
            return {
              priority,
              total: totalWithPriority,
              completed: completedWithPriority,
              rate: totalWithPriority > 0 ? (completedWithPriority / totalWithPriority * 100).toFixed(1) : '0'
            };
          });

          return {
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `Forneça insights detalhados sobre meus padrões de produtividade baseado nos dados abaixo:

**Nível de Análise:** ${analysisDepth}

**Dados de Produtividade:**
- Total de todos criados: ${todos.length}
- Todos completos: ${completedTodos.length}
- Todos pendentes: ${todos.length - completedTodos.length}
- Taxa de conclusão geral: ${((completedTodos.length / todos.length) * 100).toFixed(1)}%
- Tempo médio para conclusão: ${avgCompletionTime.toFixed(1)} dias

**Taxa de Conclusão por Prioridade:**
${priorityCompletionRates.map(p => `- ${p.priority}: ${p.rate}% (${p.completed}/${p.total})`).join('\n')}

Por favor, analise e forneça:
1. **Padrões de Comportamento:** Tendências na criação e conclusão
2. **Eficiência por Categoria:** Qual tipo de tarefa você completa mais
3. **Pontos de Melhoria:** Onde focar para aumentar produtividade
4. **Recomendações Estratégicas:** Como otimizar seu sistema de todos
5. **Previsões:** Estimativas baseadas no histórico atual

${analysisDepth === 'completa' ? '\n**Análise Completa Solicitada:** Inclua correlações avançadas, sugestões de workflow e métricas preditivas.' : ''}`,
                },
              },
            ],
          };

        default:
          throw new Error(`Prompt desconhecido: ${name}`);
      }
    } catch (error) {
      const errorResponse = createErrorResponse(error, `obter prompt ${name}`);
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
  }
}

export { PromptHandlers };
```

**Por que usar handlers separados?**
- **Responsabilidade única:** Cada handler tem uma função específica
- **Organização:** Código mais limpo e fácil de manter
- **Testabilidade:** Cada handler pode ser testado independentemente
- **Escalabilidade:** Fácil adicionar novas funcionalidades

### **Etapa 8: Servidor Principal (Orquestrador)**

Crie `src/server.ts`:

```typescript
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
    // Configurar servidor MCP
    this.server = new Server(
      {
        name: "todo-server-zod",
        version: "2.0.0",
      },
      {
        capabilities: {
          resources: {},  // Pode fornecer recursos
          tools: {},      // Pode executar ferramentas
          prompts: {},    // Pode fornecer prompts
        },
      }
    );

    // Inicializar serviços e handlers
    this.todoService = new TodoService();
    this.toolHandlers = new ToolHandlers(this.todoService);
    this.resourceHandlers = new ResourceHandlers(this.todoService);
    this.promptHandlers = new PromptHandlers(this.todoService);
    
    // Configurar roteamento
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // RECURSOS: O que Claude pode VER (dados read-only)
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return this.resourceHandlers.handleListResources();
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      return this.resourceHandlers.handleReadResource(request);
    });

    // FERRAMENTAS: O que Claude pode FAZER (operações)
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: TOOL_DEFINITIONS.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      return this.toolHandlers.handleCallTool(request);
    });

    // PROMPTS: Templates contextuais para análise
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return this.promptHandlers.handleListPrompts();
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      return this.promptHandlers.handleGetPrompt(request);
    });
  }

  // Iniciar o servidor
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error("🚀 MCP Todo Server com Zod iniciado");
    console.error("✅ Validação robusta ativada");
    console.error("🔒 Type safety garantida");

    // Manter o processo rodando
    process.on("SIGINT", async () => {
      console.error("🛑 Encerrando Todo List MCP Server");
      await this.server.close();
      process.exit(0);
    });
  }
}

export { TodoMCPServer };
```

**O que faz o servidor?**
- **Orquestração:** Coordena todos os handlers
- **Roteamento:** Direciona requisições para o handler correto
- **Configuração:** Define capacidades e metadados do servidor
- **Transporte:** Gerencia comunicação com Claude Desktop

### **Etapa 9: Arquivo Principal**

Crie `src/index.ts`:

```typescript
#!/usr/bin/env node

import { TodoMCPServer } from './server.js';

async function main() {
  try {
    console.error('🔧 Inicializando MCP Todo Server com Zod...');
    const server = new TodoMCPServer();
    await server.start();
  } catch (error) {
    console.error('❌ Falha ao iniciar MCP Todo Server:', error);
    if (error instanceof Error) {
      console.error('📋 Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('💥 Erro não tratado:', error);
  process.exit(1);
});
```

**Por que este arquivo?**
- **Ponto de entrada:** É o primeiro arquivo executado
- **Trata erros:** Captura erros que possam "vazar" do servidor
- **Logs informativos:** Mostra o que está acontecendo

---

## 🧪 Parte 5: Testando o Servidor

### **Passo 1: Compilar o Projeto**

```bash
# Compilar TypeScript para JavaScript
npm run build
```

**O que acontece?** TypeScript vira JavaScript na pasta `dist/`.

### **Passo 2: Testar Execução**

```bash
# Executar o servidor
npm start
```

**Deve aparecer:**
```
🔧 Inicializando MCP Todo Server com Zod...
🚀 MCP Todo Server com Zod iniciado
✅ Validação robusta ativada
🔒 Type safety garantida
```

**Para parar:** Pressione `Ctrl+C`

### **Passo 3: Verificar Estrutura Final**

```bash
# Ver arquivos criados
ls -la  # Mac/Linux
dir     # Windows
```

**Deve ter:**
```
todo-list-mcp-server/
├── dist/                    # Código JavaScript compilado
├── src/
│   ├── config/
│   │   └── toolDefinitions.ts
│   ├── handlers/
│   │   ├── toolHandlers.ts
│   │   ├── resourceHandlers.ts
│   │   └── promptHandlers.ts
│   ├── schemas/
│   │   ├── common.schemas.ts
│   │   └── todo.schemas.ts
│   ├── services/
│   │   └── todo.services.ts
│   ├── utils/
│   │   └── validation.ts
│   ├── types.ts
│   ├── server.ts
│   └── index.ts
├── node_modules/           # Dependências instaladas
├── package.json
└── tsconfig.json
```

---

## 🔗 Parte 6: Conectando ao Claude Desktop

### **Passo 1: Descobrir Caminho Absoluto**

```bash
# No terminal, dentro da pasta do projeto
pwd       # Mac/Linux
echo %cd% # Windows
```

**Exemplo de resultado:**
- Mac: `/Users/seuusuario/todo-list-mcp-server`
- Windows: `C:\Users\seuusuario\todo-list-mcp-server`

**COPIE este caminho!** Vamos usar agora.

### **Passo 2: Localizar Configuração do Claude**

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### **Passo 3: Criar/Editar Configuração**

Abra o arquivo de configuração e coloque:

```json
{
  "mcpServers": {
    "todo-server": {
      "command": "node",
      "args": ["/CAMINHO/COMPLETO/PARA/todo-list-mcp-server/dist/index.js"]
    }
  }
}
```

**⚠️ SUBSTITUA `/CAMINHO/COMPLETO/PARA/` pelo caminho que você copiou!**

**Exemplo real:**
```json
{
  "mcpServers": {
    "todo-server": {
      "command": "node", 
      "args": ["C:/Users/joao/todo-list-mcp-server/dist/index.js"]
    }
  }
}
```

### **Passo 4: Reiniciar Claude Desktop**

1. **Feche** Claude Desktop completamente
2. **Aguarde** 5 segundos
3. **Abra** Claude Desktop novamente

### **Passo 5: Testar Integração**

Digite no Claude Desktop:

```
Liste todas as minhas tarefas
```

**Se funcionou, você verá:**
- JSON com 3 tarefas de exemplo
- "Estudar MCP Protocol", "Criar tutorial TypeScript", "Implementar testes unitários"

**Teste mais comandos:**
```
Crie uma tarefa: "Minha primeira tarefa via Claude" com prioridade alta e tags "teste", "sucesso"

Marque a primeira tarefa como concluída

Mostre as estatísticas das minhas tarefas

Gere um resumo das minhas tarefas

Me ajude a priorizar minhas tarefas pendentes
```

---

## 🎉 Parabéns! Seu MCP Server Profissional Está Funcionando!

### **O que você criou:**

✅ **Servidor MCP com arquitetura SOLID** 
✅ **Handlers especializados** por responsabilidade
✅ **Sistema de validação robusta** com Zod
✅ **Configurações centralizadas** profissionais
✅ **Code TypeScript limpo** e type-safe
✅ **Prompts inteligentes** para análise de produtividade

### **O que você aprendeu:**

1. **Conceitos MCP:** Resources, Tools, Prompts e como funcionam
2. **TypeScript avançado:** Tipos, interfaces, e compilação
3. **Zod para validação:** Runtime validation e type inference  
4. **Arquitetura SOLID:** Separação de responsabilidades
5. **Padrões profissionais:** Como organizar código como grandes empresas

### **Arquitetura que você domina:**

```
🎯 Handlers Especializados
├── ToolHandlers     → Operações CRUD
├── ResourceHandlers → Recursos de dados  
└── PromptHandlers   → Templates de análise

⚙️ Configurações Centralizadas
└── TOOL_DEFINITIONS → Definições das ferramentas

📋 Validação Robusta
├── Schemas Zod      → Regras dos dados
└── Utils Validation → Funções auxiliares

🔧 Lógica de Negócio
└── TodoService      → Gerenciamento das tarefas

🖥️ Orquestração
└── TodoMCPServer    → Coordena tudo
```

---

## 🚀 Próximos Passos: Expandindo Seu MCP Profissional

### **Ideias Simples para Praticar:**

#### **1. Adicionar Campo "Deadline"**
```typescript
// Em schemas/todo.schemas.ts
export const TodoSchema = z.object({
  // ... campos existentes
  deadline: DateSchema.optional(), // Data limite opcional
});

// Atualizar todos os handlers correspondentes
```

#### **2. Nova Ferramenta "Set Deadline"**
```typescript
// Em config/toolDefinitions.ts
{
  name: "set_deadline",
  description: "Definir prazo para uma tarefa",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      deadline: { type: "string", format: "date" }
    },
    required: ["id", "deadline"]
  }
}

// Implementar em handlers/toolHandlers.ts
```

#### **3. Novo Recurso "Overdue Tasks"**
```typescript
// Em handlers/resourceHandlers.ts
{
  uri: "todo://overdue",
  mimeType: "application/json",
  name: "Overdue Todos", 
  description: "Tasks past their deadline"
}

// Implementar lógica no TodoService
```

### **Ideias Avançadas:**

#### **4. Persistência com SQLite**
```bash
npm install sqlite3 @types/sqlite3

# Substituir Map por banco de dados real
```

#### **5. Sistema de Notificações**
```typescript
// Novo handler para notificações
class NotificationHandlers {
  checkOverdueTasks(): Todo[] {
    // Verificar tarefas com prazo vencido
  }
  
  sendReminders(): void {
    // Enviar lembretes
  }
}
```

#### **6. API REST Adicional**
```bash
npm install express @types/express

# Criar endpoints REST paralelos ao MCP
```

#### **7. Integração com Calendário**
```typescript
// Novo serviço para integração
class CalendarService {
  syncWithGoogleCalendar(): Promise<void> {
    // Sincronizar tarefas com Google Calendar
  }
}
```

---

## 🔧 Desenvolvimento Avançado

### **Testando Handlers Individualmente:**

```typescript
// test/toolHandlers.test.ts
import { ToolHandlers } from '../src/handlers/toolHandlers';
import { TodoService } from '../src/services/todo.services';

describe('ToolHandlers', () => {
  let toolHandlers: ToolHandlers;
  let todoService: TodoService;
  
  beforeEach(() => {
    todoService = new TodoService();
    toolHandlers = new ToolHandlers(todoService);
  });
  
  test('deve criar todo com sucesso', async () => {
    const request = {
      params: {
        name: 'create_todo',
        arguments: { 
          title: 'Test Todo', 
          priority: 'high',
          tags: ['test'] 
        }
      }
    };
    
    const result = await toolHandlers.handleCallTool(request);
    expect(result.content[0].text).toContain('Todo criado com sucesso');
  });
});
```

### **Comandos de Desenvolvimento:**

```bash
# Desenvolvimento com hot-reload
npm run dev

# Compilar apenas
npm run build  

# Validar TypeScript sem compilar
npm run validate

# Testar servidor
npm start

# Modo watch (rebuilda automaticamente)
npx tsc --watch
```

---

## 🐛 Troubleshooting Avançado

### **Problema 1: "UuidSchema is not defined"**
**Solução:** Corrigir nome da exportação
```typescript
// Em common.schemas.ts, linha 3:
export const UuidSchema = z.string().uuid('ID deve ser um UUID válido');
// NÃO: UuiSchema (estava com erro)
```

### **Problema 2: Handlers não funcionam**
**Solução:** Verificar importações e exports
```typescript
// Certificar que todos os handlers são exportados corretamente
export { ToolHandlers };
export { ResourceHandlers }; 
export { PromptHandlers };
```

### **Problema 3: Schemas não validam**
**Solução:** Verificar imports e estrutura
```typescript
// Verificar se está importando corretamente
import { UuidSchema } from "./common.schemas.js";
// Note o .js no final!
```

### **Problema 4: Claude não reconhece servidor**
**Solução:** Verificar se todas as partes funcionam
```bash
# 1. Testar compilação
npm run build

# 2. Testar execução
npm start

# 3. Verificar logs detalhados
# Windows: %APPDATA%\Claude\logs\
# Mac: ~/Library/Logs/Claude/
```

---

## 📚 Recursos para Continuar Evoluindo

### **Documentação Oficial:**
- 📖 [MCP Documentation](https://modelcontextprotocol.io)
- 📖 [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- 📖 [Zod Documentation](https://zod.dev/)
- 📖 [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

### **Conceitos Avançados para Estudar:**
1. **Design Patterns** (Factory, Observer, Strategy)
2. **Testes Unitários** (Jest, Vitest, Test-Driven Development)
3. **Banco de Dados** (SQLite, PostgreSQL, Prisma ORM)
4. **APIs REST** (Express.js, Fastify)
5. **Containerização** (Docker, Docker Compose)
6. **CI/CD** (GitHub Actions, pipeline automatizado)

### **Projetos de Prática Avançados:**
1. 📊 **Sistema de Analytics** (métricas, dashboards, relatórios)
2. 💼 **CRM Simples** (clientes, vendas, pipeline)
3. 📚 **Sistema de Biblioteca** (livros, empréstimos, usuários)
4. 💰 **Controle Financeiro** (receitas, despesas, categorias, orçamentos)
5. 🏥 **Sistema de Agendamentos** (médicos, pacientes, horários)

---

## 🎓 Conclusão

**Você acabou de criar um MCP Server de nível profissional!** 🎉

### **Suas conquistas:**
- ✅ **Arquitetura SOLID** implementada corretamente
- ✅ **Separação de responsabilidades** como grandes empresas
- ✅ **Validação robusta** com runtime + compile-time safety
- ✅ **Código limpo e manutenível** seguindo boas práticas
- ✅ **Sistema escalável** pronto para crescer

### **Habilidades que você desenvolveu:**
- 🧠 **Pensamento arquitetural** (como organizar código complexo)
- 🔧 **Programação defensiva** (validação e tratamento de erros)
- 📚 **Padrões profissionais** (SOLID, separation of concerns)
- 🛡️ **Type safety** (TypeScript + Zod)
- 🎯 **Problem solving** (debugging e troubleshooting)

### **Você está pronto para:**
- 🚀 Criar MCPs mais complexos para necessidades específicas
- 🏢 Trabalhar em projetos profissionais com arquitetura sólida
- 🌐 Expandir para APIs REST, bancos de dados e integrações
- 👥 Colaborar em equipes usando padrões reconhecidos
- 📈 Evoluir para arquiteturas ainda mais avançadas

**Lembre-se:** Todo expert já foi iniciante. Continue praticando, experimentando e construindo projetos cada vez mais desafiadores!

**Parabéns pela jornada e happy coding!** 💻✨

---

*Tutorial criado com ❤️ para elevar desenvolvedores iniciantes ao nível profissional. Continue codando, continue aprendendo!*