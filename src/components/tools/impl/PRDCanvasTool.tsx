import React from 'react';
import { FileText, Target, Users, CheckSquare, ShieldAlert, BarChart3, HelpCircle, Layers, ListTodo } from 'lucide-react';

interface PRDCanvasToolProps {
  data: {
    context_and_overview?: string;
    problem_statement?: string;
    objectives?: string;
    non_objectives?: string;
    target_users?: string;
    user_stories?: string;
    functional_requirements?: string;
    non_functional_requirements?: string;
    business_rules?: string;
    acceptance_criteria?: string;
    success_metrics?: string;
    dependencies_and_risks?: string;
    open_questions?: string;
  };
  onChange: (newData: any) => void;
}

export const PRDCanvasTool: React.FC<PRDCanvasToolProps> = ({ data, onChange }) => {
  const updateField = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-5">
      {/* Block 1: Context, Problem & Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Context & Overview */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[280px]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-military-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-military-400" /> 1. Contexto & Visão
            </label>
          </div>
          <p className="text-[10px] text-zinc-500 mb-2">Por que estamos construindo isso agora?</p>
          <textarea
            value={data.context_and_overview || ''}
            onChange={(e) => updateField('context_and_overview', e.target.value)}
            placeholder="Descreva o contexto de mercado, alinhamento com a estratégia da empresa e relevância atual..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>

        {/* Problem Statement */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[280px]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> 2. O Problema
            </label>
          </div>
          <p className="text-[10px] text-zinc-500 mb-2">Qual dor específica estamos resolvendo?</p>
          <textarea
            value={data.problem_statement || ''}
            onChange={(e) => updateField('problem_statement', e.target.value)}
            placeholder="Qual é a dor do usuário, o impacto no negócio e a evidência que comprova o problema..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>

        {/* Objectives vs Non-Objectives */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[280px]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> 3. Objetivos & Fora de Escopo
            </label>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              value={data.objectives || ''}
              onChange={(e) => updateField('objectives', e.target.value)}
              placeholder="Objetivos (O que faremos):&#10;• Entregar fluxo de exportação em 1 clique&#10;• Garantir suporte a CSV/PDF"
              rows={3}
              className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded p-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none font-mono"
            />
            <textarea
              value={data.non_objectives || ''}
              onChange={(e) => updateField('non_objectives', e.target.value)}
              placeholder="Não-Objetivos (Fora do escopo / V1):&#10;• Não suportaremos integração direta com ERP legado&#10;• Não haverá edição colaborativa em tempo real na V1"
              rows={3}
              className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded p-2 text-xs text-zinc-300 placeholder-zinc-600 outline-none resize-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Block 2: Users & User Stories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Target Users / Personas */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[270px]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> 4. Usuários & Personas
            </label>
            <span className="text-[10px] text-zinc-500">Quem usa e se beneficia</span>
          </div>
          <textarea
            value={data.target_users || ''}
            onChange={(e) => updateField('target_users', e.target.value)}
            placeholder="• Persona Principal: Product Manager Sênior&#10;• Stakeholder Secundário: VP de Engenharia e Head de Design&#10;• Nível de conhecimento técnico: intermediário"
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-sky-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>

        {/* User Stories */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[270px]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <ListTodo className="w-3.5 h-3.5" /> 5. Histórias de Usuário (User Stories)
            </label>
            <span className="text-[10px] text-zinc-500">Como [persona], quero [ação], para [benefício]</span>
          </div>
          <textarea
            value={data.user_stories || ''}
            onChange={(e) => updateField('user_stories', e.target.value)}
            placeholder="• Como PM, quero exportar o canvas em Markdown para colar na issue do Jira&#10;• Como Tech Lead, quero ver critérios de aceite claros para planejar os testes de automação&#10;• Como Designer, quero visualizar as regras de negócio para desenhar o fluxo de telas"
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>
      </div>

      {/* Block 3: Requirements & Acceptance Criteria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Functional & Non-Functional Requirements */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[300px]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> 6. Requisitos Funcionais & Não-Funcionais
            </label>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              value={data.functional_requirements || ''}
              onChange={(e) => updateField('functional_requirements', e.target.value)}
              placeholder="Requisitos Funcionais (RF):&#10;• RF01: O sistema deve validar campos obrigatórios antes do envio&#10;• RF02: O usuário pode duplicar itens existentes com 1 clique"
              rows={3}
              className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded p-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none font-mono"
            />
            <textarea
              value={data.non_functional_requirements || ''}
              onChange={(e) => updateField('non_functional_requirements', e.target.value)}
              placeholder="Requisitos Não-Funcionais (RNF):&#10;• RNF01: Tempo de resposta do endpoint < 200ms&#10;• RNF02: Isolamento multi-tenant estrito por workspace"
              rows={3}
              className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded p-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none font-mono"
            />
          </div>
        </div>

        {/* Business Rules & Acceptance Criteria */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[300px]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-military-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-military-400" /> 7. Regras de Negócio & Critérios de Aceite
            </label>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              value={data.business_rules || ''}
              onChange={(e) => updateField('business_rules', e.target.value)}
              placeholder="Regras de Negócio (RN):&#10;• RN01: Usuários com perfil 'viewer' não podem criar ou alterar itens&#10;• RN02: Toda iniciativa concluída deve exigir registro de impacto"
              rows={3}
              className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded p-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none font-mono"
            />
            <textarea
              value={data.acceptance_criteria || ''}
              onChange={(e) => updateField('acceptance_criteria', e.target.value)}
              placeholder="Critérios de Aceite (Gherkin / Given-When-Then):&#10;• Dado que o usuário preenche o PRD, quando clicar em 'Salvar', então o autosave deve atualizar o status em menos de 1s&#10;• Dado um token expirado, o sistema deve redirecionar para re-autenticação"
              rows={3}
              className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded p-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Block 4: Metrics, Risks & Open Questions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Success Metrics */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[240px]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> 8. Métricas de Sucesso
            </label>
          </div>
          <p className="text-[10px] text-zinc-500 mb-2">Como saberemos se funcionou?</p>
          <textarea
            value={data.success_metrics || ''}
            onChange={(e) => updateField('success_metrics', e.target.value)}
            placeholder="• Taxa de adoção da funcionalidade > 40% na primeira semana&#10;• Redução de tickets de suporte relacionados a exportação para 0"
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>

        {/* Dependencies & Risks */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[240px]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> 9. Dependências & Riscos
            </label>
          </div>
          <p className="text-[10px] text-zinc-500 mb-2">Bloqueios ou incertezas técnicas</p>
          <textarea
            value={data.dependencies_and_risks || ''}
            onChange={(e) => updateField('dependencies_and_risks', e.target.value)}
            placeholder="• Dependência da liberação da nova API do serviço de autenticação&#10;• Risco de sobrecarga no banco de dados durante migração"
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>

        {/* Open Questions */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[240px]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" /> 10. Perguntas em Aberto
            </label>
          </div>
          <p className="text-[10px] text-zinc-500 mb-2">Dúvidas a validar antes da sprint</p>
          <textarea
            value={data.open_questions || ''}
            onChange={(e) => updateField('open_questions', e.target.value)}
            placeholder="• Precisamos de suporte a múltiplos idiomas no lançamento?&#10;• Qual é o limite de tamanho de payload para exportação?"
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-sky-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>
      </div>
    </div>
  );
};
