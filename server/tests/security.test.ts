import { dbStore } from '../db/store.js';

async function runTests() {
  console.log('Iniciando testes de sanidade e banco de dados...');
  const user = await dbStore.findOrCreateUser('usr_test', 'test@example.com', 'Test User');
  if (!user || user.uid !== 'usr_test') {
    throw new Error('Falha no teste de criação de usuário');
  }

  const workspaces = await dbStore.listUserWorkspaces('usr_test');
  console.log(`Sucesso: ${workspaces.length} workspace(s) listado(s).`);
  console.log('Todos os testes passaram com sucesso!');
}

runTests().catch((err) => {
  console.error('Erro nos testes:', err);
  process.exit(1);
});
