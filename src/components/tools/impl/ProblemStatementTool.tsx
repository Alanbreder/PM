import React from 'react';
import { AlertCircle, HelpCircle, Users, Activity, FileText, CheckCircle2, TrendingUp } from 'lucide-react';

interface ProblemStatementToolProps {
  data: {
    who?: string;
    problem?: string;
    context?: string;
    frequency_level?: string;
    impact_level?: string;
    evidence?: string;
    current_alternatives?: string;
    why_it_matters?: string;
    desired_outcome?: string;
  };
  onChange: (newData: any) => void;
}

export const ProblemStatementTool: React.FC<ProblemStatementToolProps> = ({ data, onChange }) => {
  const updateField = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Core Problem Definition */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" />
            Declaração Central do Problema (Problem Statement)
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Foco na Dor do Usuário (Não na Solução)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-military-400" /> Quem é o afetado (Who)
            </label>
            <input
              type="text"
              value={data.who || ''}
              onChange={(e) => updateField('who', e.target.value)}
              placeholder="Ex: Novos clientes de e-commerce tentando configurar o gateway pela primeira vez..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-400" /> Contexto & Gatilho (When & Where)
            </label>
            <input
              type="text"
              value={data.context || ''}
              onChange={(e) => updateField('context', e.target.value)}
              placeholder="Ex: Durante o passo 3 do onboarding de credenciamento bancário..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-600 outline-none"
            />
          </div>
        </div>

        {/* The Problem Statement */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider mb-1.5">
            Qual é a Dor Real & Concreta (The Problem)
          </label>
          <textarea
            value={data.problem || ''}
            onChange={(e) => updateField('problem', e.target.value)}
            placeholder="Descreva claramente o obstáculo ou falha enfrentada pelo usuário (evite propor soluções aqui)..."
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-600 outline-none resize-none leading-relaxed font-semibold"
          />
        </div>
      </div>

      {/* Severity & Frequency Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-2">
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Nível de Impacto no Usuário
          </label>
          <select
            value={data.impact_level || 'high'}
            onChange={(e) => updateField('impact_level', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-2.5 text-xs text-zinc-200 outline-none"
          >
            <option value="critical">Crítico (Impede totalmente o uso / Bloqueia conversão)</option>
            <option value="high">Alto (Gera grande frustração e retrabalho manual)</option>
            <option value="medium">Médio (Fricção perceptível com contorno fácil)</option>
            <option value="low">Baixo (Pequena melhoria cosmética)</option>
          </select>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-2">
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Frequência de Ocorrência
          </label>
          <select
            value={data.frequency_level || 'frequent'}
            onChange={(e) => updateField('frequency_level', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-2.5 text-xs text-zinc-200 outline-none"
          >
            <option value="constant">Constante (Acontece em 100% das sessões)</option>
            <option value="frequent">Frequente (Acontece na maioria das vezes)</option>
            <option value="occasional">Ocasional (Acontece em cenários específicos)</option>
            <option value="rare">Raro (Casos isolados)</option>
          </select>
        </div>
      </div>

      {/* 4 Supporting Columns: Evidence, Alternatives, Why It Matters, Desired Outcome */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[260px]">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-zinc-200 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-military-400" />
            Evidências & Dados Concretos
          </div>
          <p className="text-[11px] text-zinc-400 mb-2">
            Métricas de telemetria, tickets de suporte ou falas reais de entrevistas:
          </p>
          <textarea
            value={data.evidence || ''}
            onChange={(e) => updateField('evidence', e.target.value)}
            placeholder="Ex: Dados de telemetria apontam 42% de churn no passo de upload (N=1.200/mês)..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[260px]">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-zinc-200 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            Alternativas Atuais (Workarounds)
          </div>
          <p className="text-[11px] text-zinc-400 mb-2">
            Como os usuários contornam o problema hoje de forma imperfeita?
          </p>
          <textarea
            value={data.current_alternatives || ''}
            onChange={(e) => updateField('current_alternatives', e.target.value)}
            placeholder="Ex: Envio manual de documentos por email para o suporte, demorando até 72 horas..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[260px]">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-zinc-200 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-rose-400" />
            Por que Importa para o Negócio (ROI / Churn / NPS)
          </div>
          <p className="text-[11px] text-zinc-400 mb-2">
            Qual é o prejuízo de não resolver este problema agora?
          </p>
          <textarea
            value={data.why_it_matters || ''}
            onChange={(e) => updateField('why_it_matters', e.target.value)}
            placeholder="Ex: Representa perda estimada de R$ 180.000 em ARR anual e queda no NPS..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[260px]">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-zinc-200 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Resultado Esperado (Desired Outcome)
          </div>
          <p className="text-[11px] text-zinc-400 mb-2">
            Como saberemos que o problema foi satisfatoriamente eliminado?
          </p>
          <textarea
            value={data.desired_outcome || ''}
            onChange={(e) => updateField('desired_outcome', e.target.value)}
            placeholder="Ex: Validação automática de documentos em menos de 30 segundos com sucesso > 95%..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
