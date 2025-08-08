import { randomUUID } from "crypto";

export type Todo = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
};

export class TodoService {
  private todos = new Map<string, Todo>();

  constructor() {
    this.seed();
  }

  private seed() {
    const seed: Omit<Todo, "id">[] = [
      {
        title: "Aprender MCP",
        description: "Ler docs e criar um exemplo prático",
        completed: false,
        createdAt: new Date(),
      },
      {
        title: "Estudar TypeScript",
        description: "Ler docs e praticar",
        completed: true,
        createdAt: new Date(Date.now() - 86400000),
        completedAt: new Date(),
      },
    ];

    for (const t of seed) {
      const id = randomUUID();
      this.todos.set(id, { ...t, id });
    }
  }

  listTodos() {
    return Array.from(this.todos.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  createTodo(title: string, description?: string): Todo {
    const todo: Todo = {
      id: randomUUID(),
      title,
      description,
      completed: false,
      createdAt: new Date(),
    }

    this.todos.set(todo.id, todo);
    return todo;
  }

  toggleTodo(id: string): Todo | null {
    const t = this.todos.get(id);

    if (!t) {
      return null;
    }
      
    const completed = !t.completed;
    const completedAt = completed ? new Date(): undefined;
    const updated = { ...t, completed, completedAt };

    this.todos.set(id, updated);
    return updated;
  }

  removeTodo(id: string) {
    return this.todos.delete(id);
  }

  stats() {
    const all = this.listTodos();
    return {
      total: all.length,
      completed: all.filter(t => t.completed).length,
      pending: all.filter(t => !t.completed).length,
    }
  }
}
