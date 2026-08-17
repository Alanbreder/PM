import React from 'react';

interface LeanCanvasToolProps {
  data: {
    problem?: string;
    solution?: string;
    unique_value?: string;
    unfair_advantage?: string;
    customer_segments?: string;
    key_metrics?: string;
    channels?: string;
    cost_structure?: string;
    revenue_streams?: string;
  };
  onChange: (newData: any) => void;
}

export const LeanCanvasTool: React.FC<LeanCanvasToolProps> = ({ data, onChange }) => {
  const updateField = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* 5-Column Classic 9-Box Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* Box 1: Problem */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[380px]">
          <label className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
            1. Problema
          </label>
          <p className="text-[10px] text-zinc-500 mb-2">Top 3 problemas dos usuários</p>
          <textarea
            value={data.problem || ''}
            onChange={(e) => updateField('problem', e.target.value)}
            placeholder="1. Falta de visibilidade...&#10;2. Decisões no achismo...&#10;3. Retrabalho manual..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded p-2.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>

        {/* Box 2 & 8: Solution & Key Metrics */}
        <div className="flex flex-col gap-3 h-[380px]">
          {/* Solution */}
          <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl flex-1 flex flex-col">
            <label className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-0.5">
              4. Solução
            </label>
            <p className="text-[10px] text-zinc-500 mb-1.5">Top 3 funcionalidades</p>
            <textarea
              value={data.solution || ''}
              onChange={(e) => updateField('solution', e.target.value)}
              placeholder="1. Discovery automatizado...&#10;2. AI Product Coach...&#10;3. Rastreabilidade..."
              className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-sky-500 rounded p-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none font-mono"
            />
          </div>

          {/* Key Metrics */}
          <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl flex-1 flex flex-col">
            <label className="text-xs font-bold text-military-400 uppercase tracking-wider mb-0.5">
              8. Métricas Chave
            </label>
            <p className="text-[10px] text-zinc-500 mb-1.5">Números vitais</p>
            <textarea
              value={data.key_metrics || ''}
              onChange={(e) => updateField('key_metrics', e.target.value)}
              placeholder="• Taxa de ativação D1&#10;• Retenção semanal&#10;• Health Score..."
              className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded p-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none font-mono"
            />
          </div>
        </div>

        {/* Box 3: Unique Value Proposition */}
        <div className="bg-military-950/40 border border-military-700/60 p-4 rounded-xl flex flex-col h-[380px]">
          <label className="text-xs font-bold text-military-300 uppercase tracking-wider mb-1">
            3. Proposta Única de Valor
          </label>
          <p className="text-[10px] text-military-400 mb-2">Mensagem clara e convincente</p>
          <textarea
            value={data.unique_value || ''}
            onChange={(e) => updateField('unique_value', e.target.value)}
            placeholder="O único sistema operacional de produto que une discovery contínuo, governança e inteligência artificial em um fluxo contínuo..."
            className="flex-1 w-full bg-zinc-950 border border-military-800 focus:border-military-500 rounded p-2.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none resize-none leading-relaxed font-semibold"
          />
        </div>

        {/* Box 9 & 5: Unfair Advantage & Channels */}
        <div className="flex flex-col gap-3 h-[380px]">
          {/* Unfair Advantage */}
          <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl flex-1 flex flex-col">
            <label className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-0.5">
              9. Vantagem Injusta
            </label>
            <p className="text-[10px] text-zinc-500 mb-1.5">Difícil de copiar</p>
            <textarea
              value={data.unfair_advantage || ''}
              onChange={(e) => updateField('unfair_advantage', e.target.value)}
              placeholder="• Motor de linhagem e auditoria&#10;• Comunidade proprietária..."
              className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded p-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none font-mono"
            />
          </div>

          {/* Channels */}
          <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl flex-1 flex flex-col">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-0.5">
              5. Canais
            </label>
            <p className="text-[10px] text-zinc-500 mb-1.5">Caminho até os clientes</p>
            <textarea
              value={data.channels || ''}
              onChange={(e) => updateField('channels', e.target.value)}
              placeholder="• Product-Led Growth&#10;• Conteúdo especializado&#10;• Vendas diretas Enterprise..."
              className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded p-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none font-mono"
            />
          </div>
        </div>

        {/* Box 2: Customer Segments */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[380px]">
          <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            2. Segmentos de Clientes
          </label>
          <p className="text-[10px] text-zinc-500 mb-2">Público alvo & Early Adopters</p>
          <textarea
            value={data.customer_segments || ''}
            onChange={(e) => updateField('customer_segments', e.target.value)}
            placeholder="• Heads e VPs de Produto em Scale-ups&#10;• Product Managers e POs&#10;• Early adopters em empresas de tecnologia..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded p-2.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>
      </div>

      {/* Bottom 2 Columns: Cost Structure vs Revenue Streams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <label className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1">
            7. Estrutura de Custos
          </label>
          <textarea
            value={data.cost_structure || ''}
            onChange={(e) => updateField('cost_structure', e.target.value)}
            placeholder="• Infraestrutura em Cloud Run & Supabase / Postgres&#10;• Custos de inferência de LLM Gemini&#10;• Salários de engenharia e suporte..."
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded p-2.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none font-mono"
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            6. Fontes de Receita
          </label>
          <textarea
            value={data.revenue_streams || ''}
            onChange={(e) => updateField('revenue_streams', e.target.value)}
            placeholder="• Assinatura SaaS Freemium (Plano Starter Grátis)&#10;• Plano Pro ($29/usuário/mês)&#10;• Plano Enterprise corporativo com SSO..."
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded p-2.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none font-mono"
          />
        </div>
      </div>
    </div>
  );
};
