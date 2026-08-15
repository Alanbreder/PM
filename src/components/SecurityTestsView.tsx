import React from 'react';
import { ShieldCheck, CheckCircle2, Terminal, Lock, Key, Server, Database } from 'lucide-react';
import { PageHeader } from './ui/PageHeader';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

export function SecurityTestsView() {
  const securityControls = [
    {
      title: 'Isolamento Multi-tenant Estrito',
      description: 'Todas as consultas SQL filtram por workspace_id e memberships validados.',
      status: 'Aprovado (Deny-by-Default)',
      icon: <Database className="w-4 h-4 text-emerald-400" />,
    },
    {
      title: 'Autenticação Firebase JWT & Admin SDK',
      description: 'UID extraído estritamente do token criptografado. Mock auth restrito a NODE_ENV=test.',
      status: 'Aprovado (Deny-by-Default)',
      icon: <Key className="w-4 h-4 text-emerald-400" />,
    },
    {
      title: 'Prevenção IDOR & Cross-Tenant Relations',
      description: 'Validação de integridade referencial e tenant matching em todas as entidades e junções.',
      status: 'Aprovado (Deny-by-Default)',
      icon: <Lock className="w-4 h-4 text-emerald-400" />,
    },
    {
      title: 'Proteção de Endpoints & CI/CD Security Suite',
      description: 'Suíte de testes de invasão executada exclusivamente via CLI/CI, sem endpoints públicos.',
      status: 'Aprovado (Deny-by-Default)',
      icon: <Server className="w-4 h-4 text-emerald-400" />,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Auditoria & Diretrizes de Segurança Multi-tenant"
        description="O Product OS opera sob o princípio de Deny-by-Default. Nenhuma rota ou entidade é acessível sem validação de token e membership no workspace correspondente."
        badge={
          <Badge variant="emerald" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Security Hardened
          </Badge>
        }
      />

      {/* Terminal Output / Instructions */}
      <Card className="bg-neutral-950 border-neutral-800 font-mono text-xs space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2 text-neutral-400">
          <span className="flex items-center gap-1.5 text-neutral-300">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Execução da Suíte Automatizada de Testes de Invasão</span>
          </span>
          <span className="text-[11px] text-emerald-400 font-semibold">CLI / CI Mode</span>
        </div>

        <div className="space-y-2 text-neutral-300">
          <p className="text-neutral-400 text-xs font-sans">
            Por motivos de segurança (SEC-R02), a suíte de testes que muta dados para verificar isolamento cross-tenant é executada exclusivamente via linha de comando ou pipeline de CI:
          </p>
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded text-emerald-400 select-all font-mono text-xs">
            $ npm test
          </div>
          <p className="text-[11px] text-neutral-500 font-sans">
            Comando direto: <code className="text-neutral-400 font-mono">NODE_ENV=test tsx server/tests/security.test.ts</code>
          </p>
        </div>
      </Card>

      {/* Controls Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Controles de Segurança Ativos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {securityControls.map((ctrl, idx) => (
            <Card key={idx} className="p-4 space-y-2 border-neutral-800 bg-neutral-900/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-medium text-xs">
                  {ctrl.icon}
                  {ctrl.title}
                </div>
                <Badge variant="emerald" icon={<CheckCircle2 className="w-3 h-3" />}>
                  Ativo
                </Badge>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {ctrl.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
