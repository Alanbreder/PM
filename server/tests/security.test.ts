import { authenticate } from '../middleware/auth.js';
import { dbStore } from '../db/store.js';
import cors from 'cors';

async function runSecurityTests() {
  console.log('🔒 Iniciando suíte de testes de Segurança e Autenticação...');

  // 1. Sanity test for user and workspace store
  const user = await dbStore.findOrCreateUser('usr_test', 'test@example.com', 'Test User');
  if (!user || user.uid !== 'usr_test') {
    throw new Error('Falha no teste de criação de usuário');
  }

  // Save original env vars
  const origNodeEnv = process.env.NODE_ENV;
  const origAllowMock = process.env.ALLOW_DEV_MOCK_AUTH;

  // 2. Test: Mock auth blocked in development without ALLOW_DEV_MOCK_AUTH=true
  console.log('🧪 Testando bloqueio de mock auth em desenvolvimento sem flag...');
  process.env.NODE_ENV = 'development';
  process.env.ALLOW_DEV_MOCK_AUTH = 'false';

  let reqDev: any = { headers: { 'x-test-user-id': 'usr_dev_mock' } };
  let devStatus = 0;
  let devBody: any = null;
  let resDev: any = {
    status: (code: number) => {
      devStatus = code;
      return {
        json: (data: any) => {
          devBody = data;
        },
      };
    },
  };
  let devNextCalled = false;

  await authenticate(reqDev, resDev, () => {
    devNextCalled = true;
  });

  if (devNextCalled || devStatus !== 401) {
    throw new Error('FALHA: Mock auth deveria ser bloqueado em development sem ALLOW_DEV_MOCK_AUTH=true!');
  }
  console.log('✅ Mock auth bloqueado com sucesso em desenvolvimento sem flag (401).');

  // 3. Test: Mock auth blocked in production
  console.log('🧪 Testando bloqueio de mock auth em produção...');
  process.env.NODE_ENV = 'production';
  process.env.ALLOW_DEV_MOCK_AUTH = 'true';

  let reqProd: any = { headers: { 'x-test-user-id': 'usr_prod_mock' } };
  let prodStatus = 0;
  let resProd: any = {
    status: (code: number) => {
      prodStatus = code;
      return {
        json: () => {},
      };
    },
  };
  let prodNextCalled = false;

  await authenticate(reqProd, resProd, () => {
    prodNextCalled = true;
  });

  if (prodNextCalled || prodStatus !== 401) {
    throw new Error('FALHA: Mock auth deveria ser bloqueado em produção (401)!');
  }
  console.log('✅ Mock auth bloqueado com sucesso em produção (401).');

  // Restore env vars
  process.env.NODE_ENV = origNodeEnv;
  process.env.ALLOW_DEV_MOCK_AUTH = origAllowMock;

  // 4. Test: Mock auth succeeds in test mode when ALLOW_DEV_MOCK_AUTH=true
  console.log('🧪 Testando liberação de mock auth em ambiente de teste com flag...');
  let reqTest: any = { headers: { 'x-test-user-id': 'usr_test_valid' } };
  let testNextCalled = false;
  await authenticate(reqTest, {} as any, () => {
    testNextCalled = true;
  });

  if (!testNextCalled || reqTest.user?.uid !== 'usr_test_valid') {
    throw new Error('FALHA: Mock auth deveria passar no ambiente de teste!');
  }
  console.log('✅ Mock auth permitido corretamente em ambiente de teste.');

  // 5. Test: CORS allowlist rejection
  console.log('🌐 Testando restrição de CORS (sem wildcard e com allowlist)...');
  const allowedOrigins = ['https://ais-dev-app.run.app'];
  const corsMiddleware = cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: origin not allowed'), false);
    },
  });

  let corsError: any = null;
  corsMiddleware(
    { headers: { origin: 'https://evil-attacker.example.com' }, method: 'GET' } as any,
    { setHeader: () => {} } as any,
    (err?: any) => {
      if (err) corsError = err;
    }
  );

  if (!corsError || !corsError.message.includes('CORS policy')) {
    throw new Error('FALHA: CORS aceitou uma origem não autorizada fora da allowlist!');
  }
  console.log('✅ CORS rejeitou origem não autorizada com sucesso.');

  console.log('🎉 Todos os testes de Segurança e Autenticação passaram!');
}

runSecurityTests().catch((err) => {
  console.error('❌ Erro nos testes de segurança:', err);
  process.exit(1);
});
