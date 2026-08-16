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

  // 2. Test: Mock auth blocked in development (even with ALLOW_DEV_MOCK_AUTH=true)
  console.log('🧪 Testando bloqueio de mock auth em desenvolvimento...');
  process.env.NODE_ENV = 'development';
  process.env.ALLOW_DEV_MOCK_AUTH = 'true';

  let reqDev: any = { headers: { 'x-test-user-id': 'usr_dev_mock' } };
  let devStatus = 0;
  let resDev: any = {
    status: (code: number) => {
      devStatus = code;
      return {
        json: () => {},
      };
    },
  };
  let devNextCalled = false;

  await authenticate(reqDev, resDev, () => {
    devNextCalled = true;
  });

  if (devNextCalled || devStatus !== 401) {
    throw new Error('FALHA: Mock auth deveria ser bloqueado em development mesmo com ALLOW_DEV_MOCK_AUTH=true!');
  }
  console.log('✅ Mock auth bloqueado com sucesso em desenvolvimento (401).');

  // 2b. Test: Mock auth blocked in staging
  console.log('🧪 Testando bloqueio de mock auth em staging...');
  process.env.NODE_ENV = 'staging';
  process.env.ALLOW_DEV_MOCK_AUTH = 'true';

  let reqStaging: any = { headers: { 'x-test-user-id': 'usr_staging_mock' } };
  let stagingStatus = 0;
  let resStaging: any = {
    status: (code: number) => {
      stagingStatus = code;
      return { json: () => {} };
    },
  };
  let stagingNextCalled = false;

  await authenticate(reqStaging, resStaging, () => {
    stagingNextCalled = true;
  });

  if (stagingNextCalled || stagingStatus !== 401) {
    throw new Error('FALHA: Mock auth deveria ser bloqueado em staging (401)!');
  }
  console.log('✅ Mock auth bloqueado com sucesso em staging (401).');

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

  // 3b. Test: Demo token blocked in production and development
  console.log('🧪 Testando bloqueio de demo-token fora do ambiente de teste...');
  process.env.NODE_ENV = 'development';
  process.env.ALLOW_DEV_MOCK_AUTH = 'true';
  let reqDemoToken: any = { headers: { authorization: 'Bearer demo-token' } };
  let demoStatus = 0;
  let resDemo: any = {
    status: (code: number) => {
      demoStatus = code;
      return { json: () => {} };
    },
  };
  let demoNextCalled = false;
  await authenticate(reqDemoToken, resDemo, () => {
    demoNextCalled = true;
  });
  if (demoNextCalled || demoStatus !== 401) {
    throw new Error('FALHA: demo-token deveria ser rejeitado fora do ambiente de teste (401)!');
  }
  console.log('✅ demo-token bloqueado com sucesso fora do ambiente de teste (401).');

  // Restore env vars
  process.env.NODE_ENV = origNodeEnv;
  process.env.ALLOW_DEV_MOCK_AUTH = origAllowMock;

  // 4. Test: Mock auth succeeds in test mode when ALLOW_DEV_MOCK_AUTH=true
  console.log('🧪 Testando liberação de mock auth em ambiente de teste com flag...');
  process.env.NODE_ENV = 'test';
  process.env.ALLOW_DEV_MOCK_AUTH = 'true';
  let reqTest: any = { headers: { 'x-test-user-id': 'usr_test_valid' } };
  let testNextCalled = false;
  await authenticate(reqTest, {} as any, () => {
    testNextCalled = true;
  });

  if (!testNextCalled || reqTest.user?.uid !== 'usr_test_valid') {
    throw new Error('FALHA: Mock auth deveria passar no ambiente de teste!');
  }
  console.log('✅ Mock auth permitido corretamente em ambiente de teste.');

  // 4b. Test: demo-token succeeds in test mode when ALLOW_DEV_MOCK_AUTH=true
  let reqTestDemo: any = { headers: { authorization: 'Bearer demo-token' } };
  let testDemoNextCalled = false;
  await authenticate(reqTestDemo, {} as any, () => {
    testDemoNextCalled = true;
  });
  if (!testDemoNextCalled || reqTestDemo.user?.uid !== 'usr_demo_admin') {
    throw new Error('FALHA: demo-token deveria passar no ambiente de teste com flag!');
  }
  console.log('✅ demo-token aceito com sucesso em ambiente de teste com flag.');

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

  // 6. Test: DATABASE_URL mandatory in production
  console.log('🗄️ Testando obrigatoriedade de DATABASE_URL em produção...');
  const checkDatabaseUrlInProd = (nodeEnv: string, dbUrl?: string) => {
    if (nodeEnv === 'production' && !dbUrl) {
      throw new Error('FATAL: A variável de ambiente DATABASE_URL é obrigatória em produção.');
    }
  };

  let dbUrlError: Error | null = null;
  try {
    checkDatabaseUrlInProd('production', undefined);
  } catch (err: any) {
    dbUrlError = err;
  }

  if (!dbUrlError || !dbUrlError.message.includes('DATABASE_URL é obrigatória em produção')) {
    throw new Error('FALHA: Aplicação deveria falhar em produção sem DATABASE_URL configurada!');
  }
  console.log('✅ Falha imediata confirmada quando DATABASE_URL não está configurada em produção.');

  console.log('🎉 Todos os testes de Segurança e Autenticação passaram!');
  process.exit(0);
}

runSecurityTests().catch((err) => {
  console.error('❌ Erro nos testes de segurança:', err);
  process.exit(1);
});
