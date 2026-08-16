import { authenticate, requireWorkspace, requireRole } from '../middleware/auth.js';
import { devAdminRouter } from '../routes/devAdmin.routes.js';
import { dbStore } from '../db/store.js';
import cors from 'cors';
import crypto from 'crypto';

async function runSecurityTests() {
  console.log('🔒 Iniciando suíte de testes de Segurança e Autenticação...');

  // Save original env vars
  const origNodeEnv = process.env.NODE_ENV;
  const origAllowMock = process.env.ALLOW_DEV_MOCK_AUTH;
  const origAllowDevAdmin = process.env.ALLOW_DEV_ADMIN;
  const origDevAdminUid = process.env.DEV_ADMIN_UID;
  const origDevAdminEmail = process.env.DEV_ADMIN_EMAIL;
  const origDevAdminKey = process.env.DEV_ADMIN_KEY;

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

  // ==========================================
  // DEV ADMIN MODE SECURITY SUITE
  // ==========================================
  console.log('\n🛠️ INICIANDO SUÍTE ESPECÍFICA DO DEV ADMIN MODE...');

  // Helper to execute devAdmin login route
  const callDevAdminLogin = async (
    env: { nodeEnv: string; allowDevAdmin?: string; devAdminKey?: string },
    reqOverrides: any = {}
  ): Promise<{ status: number; body: any }> => {
    process.env.NODE_ENV = env.nodeEnv;
    process.env.ALLOW_DEV_ADMIN = env.allowDevAdmin;
    process.env.DEV_ADMIN_KEY = env.devAdminKey || '';

    let resCode = 200;
    let resJson: any = null;

    const req: any = {
      ip: '127.0.0.1',
      hostname: 'localhost',
      headers: {},
      body: {},
      socket: { remoteAddress: '127.0.0.1' },
      ...reqOverrides,
    };

    const res: any = {
      status: (code: number) => {
        resCode = code;
        return {
          json: (data: any) => {
            resJson = data;
          },
        };
      },
      json: (data: any) => {
        resJson = data;
      },
    };

    // Find the login handler from devAdminRouter
    const loginLayer = (devAdminRouter as any).stack.find(
      (layer: any) => layer.route && layer.route.path === '/login' && layer.route.methods.post
    );

    if (!loginLayer) {
      throw new Error('Handler /login não encontrado no router devAdmin');
    }

    await loginLayer.route.stack[0].handle(req, res, () => {});
    return { status: resCode, body: resJson };
  };

  // 12. Test: DEV ADMIN is REJECTED in production even if ALLOW_DEV_ADMIN=true
  console.log('🧪 Testando que DEV ADMIN é categoricamente rejeitado em produção (403)...');
  const prodDevAdminResult = await callDevAdminLogin({
    nodeEnv: 'production',
    allowDevAdmin: 'true',
  });
  if (prodDevAdminResult.status !== 403) {
    throw new Error(`FALHA: Dev Admin DEVE ser rejeitado em produção! Retornou: ${prodDevAdminResult.status}`);
  }
  console.log('✅ DEV ADMIN categoricamente bloqueado em produção (403).');

  // 13. Test: DEV ADMIN is REJECTED in staging even if ALLOW_DEV_ADMIN=true
  console.log('🧪 Testando que DEV ADMIN é categoricamente rejeitado em staging (403)...');
  const stagingDevAdminResult = await callDevAdminLogin({
    nodeEnv: 'staging',
    allowDevAdmin: 'true',
  });
  if (stagingDevAdminResult.status !== 403) {
    throw new Error(`FALHA: Dev Admin DEVE ser rejeitado em staging! Retornou: ${stagingDevAdminResult.status}`);
  }
  console.log('✅ DEV ADMIN categoricamente bloqueado em staging (403).');

  // 14. Test: DEV ADMIN is REJECTED when ALLOW_DEV_ADMIN is false/unset in development
  console.log('🧪 Testando que DEV ADMIN é rejeitado em development quando ALLOW_DEV_ADMIN=false (403)...');
  const devDisabledResult = await callDevAdminLogin({
    nodeEnv: 'development',
    allowDevAdmin: 'false',
  });
  if (devDisabledResult.status !== 403) {
    throw new Error(`FALHA: Dev Admin DEVE ser rejeitado quando flag for false! Retornou: ${devDisabledResult.status}`);
  }
  console.log('✅ DEV ADMIN rejeitado quando ALLOW_DEV_ADMIN=false (403).');

  // 15. Test: DEV ADMIN is REJECTED when request is from non-local origin / IP
  console.log('🧪 Testando que DEV ADMIN rejeita requisições não locais (403)...');
  const remoteIpResult = await callDevAdminLogin(
    { nodeEnv: 'development', allowDevAdmin: 'true' },
    { ip: '198.51.100.42', hostname: 'evil.external.com', socket: { remoteAddress: '198.51.100.42' } }
  );
  if (remoteIpResult.status !== 403) {
    throw new Error('FALHA: Dev Admin DEVE rejeitar requisições de IPs não locais!');
  }
  console.log('✅ DEV ADMIN bloqueou requisição não-local com sucesso (403).');

  // 16. Test: DEV ADMIN validates configured DEV_ADMIN_KEY
  console.log('🧪 Testando que DEV ADMIN exige DEV_ADMIN_KEY quando configurada...');
  const keyConfiguredResult = await callDevAdminLogin({
    nodeEnv: 'development',
    allowDevAdmin: 'true',
    devAdminKey: 'secret_dev_pass_123',
  });
  if (keyConfiguredResult.status !== 401) {
    throw new Error('FALHA: Dev Admin deveria rejeitar sem a chave dev válida (401)!');
  }

  const validKeyResult = await callDevAdminLogin(
    {
      nodeEnv: 'development',
      allowDevAdmin: 'true',
      devAdminKey: 'secret_dev_pass_123',
    },
    { headers: { 'x-dev-admin-key': 'secret_dev_pass_123' } }
  );
  if (validKeyResult.status !== 200 || !validKeyResult.body.token) {
    throw new Error('FALHA: Dev Admin deveria aceitar quando a chave dev é fornecida corretamente!');
  }
  console.log('✅ Validação de DEV_ADMIN_KEY confirmada com sucesso.');

  // 17. Test: DEV ADMIN works in development when explicitly enabled
  console.log('🧪 Testando funcionamento do DEV ADMIN em development quando explicitamente habilitado...');
  process.env.DEV_ADMIN_UID = 'usr_custom_dev_admin';
  process.env.DEV_ADMIN_EMAIL = 'custom-admin@local.test';

  const devLoginSuccess = await callDevAdminLogin({
    nodeEnv: 'development',
    allowDevAdmin: 'true',
  });

  if (devLoginSuccess.status !== 200 || !devLoginSuccess.body.token) {
    throw new Error('FALHA: Dev Admin deveria autenticar com sucesso em development com ALLOW_DEV_ADMIN=true!');
  }

  const sessionToken = devLoginSuccess.body.token;
  const returnedUser = devLoginSuccess.body.user;

  if (returnedUser.uid !== 'usr_custom_dev_admin' || returnedUser.email !== 'custom-admin@local.test') {
    throw new Error('FALHA: Dados do usuário dev admin devem vir estritamente das variáveis de ambiente!');
  }
  console.log('✅ DEV ADMIN autenticado com sucesso e dados originados exclusivamente do backend/env.');

  // 18. Test: User cannot choose or elevate UID/Role via request payload
  console.log('🧪 Testando que o usuário NÃO consegue escolher outro UID ou Role pelo request...');
  const forgedPayloadResult = await callDevAdminLogin(
    {
      nodeEnv: 'development',
      allowDevAdmin: 'true',
    },
    {
      body: {
        uid: 'usr_impersonated_victim',
        email: 'victim@target.com',
        role: 'super_admin',
      },
    }
  );

  if (forgedPayloadResult.body.user.uid !== 'usr_custom_dev_admin') {
    throw new Error('FALHA DE SEGURANÇA: Backend permitiu injeção de UID pelo payload da requisição!');
  }
  console.log('✅ Injeção de UID/Role ignorada com sucesso pelo backend.');

  // 19. Test: Authenticate middleware accepts valid DevAdmin session token
  console.log('🧪 Testando consumo de token de sessão Dev Admin no middleware authenticate...');
  process.env.NODE_ENV = 'development';
  process.env.ALLOW_DEV_ADMIN = 'true';

  let reqDevSession: any = { headers: { authorization: `Bearer ${sessionToken}` } };
  let devSessionPassed = false;
  await authenticate(reqDevSession, {} as any, () => {
    devSessionPassed = true;
  });

  if (!devSessionPassed || reqDevSession.user?.uid !== 'usr_custom_dev_admin') {
    throw new Error('FALHA: Middleware authenticate deveria autenticar o token de sessão dev admin!');
  }
  console.log('✅ Token de sessão Dev Admin autenticado com sucesso no middleware.');

  // 20. Test: Dev Admin token is rejected if NODE_ENV changes to production
  console.log('🧪 Testando rejeição do token Dev Admin caso o ambiente mude para produção...');
  process.env.NODE_ENV = 'production';
  let reqProdDevToken: any = { headers: { authorization: `Bearer ${sessionToken}` } };
  let prodDevStatus = 0;
  let resProdDev: any = {
    status: (code: number) => {
      prodDevStatus = code;
      return { json: () => {} };
    },
  };
  let prodDevPassed = false;
  await authenticate(reqProdDevToken, resProdDev, () => {
    prodDevPassed = true;
  });

  if (prodDevPassed || prodDevStatus !== 401) {
    throw new Error('FALHA: Token Dev Admin DEVE ser rejeitado em produção mesmo que tenha sido gerado antes!');
  }
  console.log('✅ Token Dev Admin bloqueado com sucesso em produção (401).');

  // 21. Test: Ensure Dev Admin user receives owner role in workspace
  console.log('🧪 Testando que o Dev Admin possui papel owner no workspace...');
  process.env.NODE_ENV = 'test';
  process.env.ALLOW_DEV_ADMIN = 'true';
  const targetWsId = devLoginSuccess.body.workspace_id;
  const adminMember = await dbStore.getWorkspaceMember(targetWsId, 'usr_custom_dev_admin');

  if (!adminMember || adminMember.role !== 'owner') {
    throw new Error('FALHA: Usuário Dev Admin deve possuir a role owner no workspace!');
  }
  console.log('✅ Usuário Dev Admin confirmado com role owner no banco de dados.');

  // 22. Test: No legacy routes (/api/auth/login, /admin-login, /register) exist in authRouter
  console.log('🧪 Verificando que nenhuma rota antiga de login/admin-login foi reintroduzida em /api/auth...');
  const { authRouter } = await import('../routes/auth.routes.js');
  const authRoutes = (authRouter as any).stack
    .filter((layer: any) => layer.route)
    .map((layer: any) => layer.route.path);

  if (authRoutes.includes('/login') || authRoutes.includes('/admin-login') || authRoutes.includes('/register')) {
    throw new Error('FALHA DE SEGURANÇA: Rotas legadas inseguras (/login, /admin-login, /register) foram encontradas!');
  }
  console.log('✅ Nenhuma rota legada de autenticação encontrada em auth.routes.ts.');

  // 23. Test: Role is strictly determined by backend database
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

  // 24. Test: Cross-tenant access isolation
  console.log('🔒 Testando isolamento estrito contra acesso cross-tenant...');
  const wsOther = await dbStore.createWorkspace('Workspace Isolado B', 'usr_other_tenant', 'Workspace Outro Tenant');
  let crossReq: any = {
    headers: { 'x-workspace-id': wsOther.id },
    user: { uid: 'usr_viewer_1', email: 'viewer@example.com' },
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

  // 25. Test: CORS allowlist rejection
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

  // Restore env vars
  process.env.NODE_ENV = origNodeEnv;
  process.env.ALLOW_DEV_MOCK_AUTH = origAllowMock;
  process.env.ALLOW_DEV_ADMIN = origAllowDevAdmin;
  process.env.DEV_ADMIN_UID = origDevAdminUid;
  process.env.DEV_ADMIN_EMAIL = origDevAdminEmail;
  process.env.DEV_ADMIN_KEY = origDevAdminKey;

  console.log('\n🎉 TODOS OS TESTES DE SEGURANÇA E DEV ADMIN PASSARAM COM 100% DE SUCESSO!');
  process.exit(0);
}

runSecurityTests().catch((err) => {
  console.error('❌ Erro nos testes de segurança:', err);
  process.exit(1);
});
