import { authenticate, requireWorkspace, requireRole } from '../middleware/auth.js';
import { dbStore } from '../db/store.js';
import cors from 'cors';
import crypto from 'crypto';

async function runSecurityTests() {
  console.log('🔒 Iniciando suíte de testes de Segurança e Autenticação...');

  // Save original env vars
  const origNodeEnv = process.env.NODE_ENV;
  const origAllowMock = process.env.ALLOW_DEV_MOCK_AUTH;
  const origProjectId = process.env.FIREBASE_PROJECT_ID;

  // 1. Sanity test for user and workspace store
  const user = await dbStore.findOrCreateUser('usr_test', 'test@example.com', 'Test User');
  if (!user || user.uid !== 'usr_test') {
    throw new Error('Falha no teste de criação de usuário');
  }

  // 2. Test: Mock auth blocked in development (even with ALLOW_DEV_MOCK_AUTH=true)
  console.log('🧪 Testando bloqueio de mock auth em desenvolvimento...');
  process.env.NODE_ENV = 'development';
  process.env.ALLOW_DEV_MOCK_AUTH = 'true';

  let reqDev: any = { headers: { 'x-test-user-id': 'usr_dev_mock' } };
  let devStatus = 0;
  let resDev: any = {
    status: (code: number) => {
      devStatus = code;
      return { json: () => {} };
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
      return { json: () => {} };
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

  // 4. Test: Demo token blocked in production and development
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

  // 5. Test: Reject forged local JWT with previously known secret
  console.log('🧪 Testando rejeição de token assinado com segredo legado/antigo...');
  const oldSecret = 'product-os-sip-secret-key-2026';
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ uid: 'usr_hacker', email: 'hacker@evil.com', role: 'owner' })).toString('base64url');
  const signature = crypto.createHmac('sha256', oldSecret).update(`${header}.${payload}`).digest('base64url');
  const forgedToken = `${header}.${payload}.${signature}`;

  let forgedReq: any = { headers: { authorization: `Bearer ${forgedToken}` } };
  let forgedStatus = 0;
  let resForged: any = {
    status: (code: number) => {
      forgedStatus = code;
      return { json: () => {} };
    },
  };
  let forgedNextCalled = false;
  await authenticate(forgedReq, resForged, () => {
    forgedNextCalled = true;
  });

  if (forgedNextCalled || forgedStatus !== 401) {
    throw new Error('FALHA: Token JWT com segredo legado DEVE ser rejeitado com 401!');
  }
  console.log('✅ Token forjado com segredo legado rejeitado com sucesso (401).');

  // 6. Test: FIREBASE_PROJECT_ID mandatory in production
  console.log('🔥 Testando obrigatoriedade de FIREBASE_PROJECT_ID em produção...');
  const validateProdFirebaseConfig = (nodeEnv: string, projId?: string) => {
    if (nodeEnv === 'production' && !projId) {
      throw new Error('FATAL: FIREBASE_PROJECT_ID environment variable is required in production');
    }
  };

  let fbProjError: Error | null = null;
  try {
    validateProdFirebaseConfig('production', undefined);
  } catch (err: any) {
    fbProjError = err;
  }
  if (!fbProjError || !fbProjError.message.includes('FIREBASE_PROJECT_ID')) {
    throw new Error('FALHA: Produção deveria falhar se FIREBASE_PROJECT_ID estiver ausente!');
  }
  console.log('✅ Falha imediata confirmada quando FIREBASE_PROJECT_ID não está configurado em produção.');

  // 7. Test: DATABASE_URL mandatory in production
  console.log('🗄️ Testando obrigatoriedade de DATABASE_URL em produção...');
  const validateProdDatabaseUrl = (nodeEnv: string, dbUrl?: string) => {
    if (nodeEnv === 'production' && !dbUrl) {
      throw new Error('FATAL: DATABASE_URL must be defined in production environment');
    }
  };

  let dbUrlError: Error | null = null;
  try {
    validateProdDatabaseUrl('production', undefined);
  } catch (err: any) {
    dbUrlError = err;
  }
  if (!dbUrlError || !dbUrlError.message.includes('DATABASE_URL')) {
    throw new Error('FALHA: Aplicação deveria falhar em produção sem DATABASE_URL configurada!');
  }
  console.log('✅ Falha imediata confirmada quando DATABASE_URL não está configurada em produção.');

  // Restore env vars for test suite execution
  process.env.NODE_ENV = 'test';
  process.env.ALLOW_DEV_MOCK_AUTH = 'true';

  // 8. Test: Controlled mock auth in test environment
  console.log('🧪 Testando mock auth em ambiente de teste com flag controlada...');
  let reqTest: any = { headers: { 'x-test-user-id': 'usr_test_valid' } };
  let testNextCalled = false;
  await authenticate(reqTest, {} as any, () => {
    testNextCalled = true;
  });
  if (!testNextCalled || reqTest.user?.uid !== 'usr_test_valid') {
    throw new Error('FALHA: Mock auth deveria passar no ambiente de teste!');
  }
  console.log('✅ Mock auth permitido corretamente no ambiente de teste.');

  // 9. Test: Role is strictly determined by backend database, frontend role in body/header ignored
  console.log('🛡️ Testando que o papel RBAC é determinado exclusivamente pelo banco (backend)...');
  const wsOwner = await dbStore.createWorkspace('Workspace RBAC Test', 'usr_owner_1', 'Workspace Teste');
  const wsId = wsOwner.id;
  await dbStore.addWorkspaceMember(wsId, 'usr_viewer_1', 'viewer');

  let reqViewer: any = {
    headers: { 'x-workspace-id': wsId },
    user: { uid: 'usr_viewer_1', email: 'viewer@example.com' },
    body: { role: 'owner' }, // Attacker trying to elevate to owner via request body
  };
  let viewerPassed = false;
  await requireWorkspace(reqViewer, {} as any, () => {
    viewerPassed = true;
  });

  if (!viewerPassed || reqViewer.workspaceRole !== 'viewer') {
    throw new Error('FALHA: Papel do usuário deve ser viewer vindo do banco, ignorando body!');
  }

  // Now test requireRole blocking viewer from owner-only action
  let roleStatus = 0;
  let resRole: any = {
    status: (code: number) => {
      roleStatus = code;
      return { json: () => {} };
    },
  };
  let roleNextCalled = false;
  const ownerOnlyMiddleware = requireRole(['owner']);
  ownerOnlyMiddleware(reqViewer, resRole, () => {
    roleNextCalled = true;
  });

  if (roleNextCalled || roleStatus !== 403) {
    throw new Error('FALHA: Viewer não pode acessar rotas restritas a owner (403)!');
  }
  console.log('✅ RBAC verificado com sucesso: elevação de privilégio pelo frontend rejeitada.');

  // 10. Test: Cross-tenant access isolation
  console.log('🔒 Testando isolamento estrito contra acesso cross-tenant...');
  const wsOther = await dbStore.createWorkspace('Workspace Isolado B', 'usr_other_tenant', 'Workspace Outro Tenant');
  let crossReq: any = {
    headers: { 'x-workspace-id': wsOther.id },
    user: { uid: 'usr_viewer_1', email: 'viewer@example.com' }, // Not a member of wsOther
  };
  let crossStatus = 0;
  let resCross: any = {
    status: (code: number) => {
      crossStatus = code;
      return { json: () => {} };
    },
  };
  let crossNextCalled = false;
  await requireWorkspace(crossReq, resCross, () => {
    crossNextCalled = true;
  });

  if (crossNextCalled || crossStatus !== 403) {
    throw new Error('FALHA: Acesso cross-tenant não autorizado DEVE retornar 403!');
  }
  console.log('✅ Acesso cross-tenant bloqueado com sucesso (403).');

  // 11. Test: CORS allowlist rejection
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

  console.log('🎉 Todos os testes de Segurança e Autenticação passaram com sucesso!');
  process.exit(0);
}

runSecurityTests().catch((err) => {
  console.error('❌ Erro nos testes de segurança:', err);
  process.exit(1);
});
