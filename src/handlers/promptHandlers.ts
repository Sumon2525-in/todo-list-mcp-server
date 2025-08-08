import { GetPromptRequest, GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import { TodoService } from "../services/todo.services.js";
import { createErrorResponse } from "../utils/validation.js";

class PromptHandlers {
  constructor(private todoService: TodoService) {}

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

          const tagFrequencyInsights = todos
            .flatMap((todo) => todo.tags)
            .reduce((acc, tag) => {
              acc[tag] = (acc[tag] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

          const topTagsInsights = Object.entries(tagFrequencyInsights)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

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

**Distribuição Temporal dos Todos:**
${todos.slice(-10).map(todo => `- ${todo.title}: criado ${new Date(todo.createdAt).toLocaleDateString('pt-BR')} ${todo.completed ? '(✓ completo)' : '(pendente)'}`).join('\n')}

**Tags e Categorização:**
- Tags únicas utilizadas: ${Array.from(new Set(todos.flatMap(t => t.tags))).length}
- Todos sem tags: ${todos.filter(t => t.tags.length === 0).length}
- Tags mais produtivas: ${topTagsInsights.slice(0, 3).map(([tag, count]) => `${tag} (${count})`).join(', ') || 'N/A'}

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
