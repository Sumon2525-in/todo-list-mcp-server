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
] as const;
