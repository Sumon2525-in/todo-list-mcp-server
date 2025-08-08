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