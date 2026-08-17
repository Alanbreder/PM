import React from 'react';
import { Target, Compass, Award, BarChart3, ShieldCheck, Flame } from 'lucide-react';

interface ProductStrategyToolProps {
  data: {
    vision?: string;
    target_market?: string;
    problem_focus?: string;
    strategic_bets?: string;
    differentiators?: string;
    metrics_and_outcomes?: string;
  };
  onChange: (newData: any) => void;
}

export const ProductStrategyTool: React.FC<ProductStrategyToolProps> = ({ data, onChange }) => {
  const updateField = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Vision & Target */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Vision */}
        <div className="bg-military-950/40 border border-military-700/60 p-4 rounded-xl flex flex-col h-[260px]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-military-300 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-military-400" /> 1. Visão de Produto (Vision)
            </label>
            <span className="text-[10px] text-military-400">Norte estratégico a longo prazo</span>
          </div>
          <textarea
            value={data.vision || ''}
            onChange={(e) => updateField('vision', e.target.value)}
            placeholder="Ex: Tornar o Product Discovery contínuo, transparente e automatizado para 100% dos times de tecnologia..."
            className="flex-1 w-full bg-zinc-950 border border-military-800/80 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-600 outline-none resize-none leading-relaxed font-semibold"
          />
        </div>

        {/* Target Market */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[260px]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> 2. Mercado-Alvo & Segmento (Target)
            </label>
            <span className="text-[10px] text-zinc-500">Quem servimos primeiro</span>
          </div>
          <textarea
            value={data.target_market || ''}
            onChange={(e) => updateField('target_market', e.target.value)}
            placeholder="Ex: Scale-ups B2B de 50 a 500 colaboradores, com múltiplos times de produto e necessidade de governança clara..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-sky-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>
      </div>

      {/* Middle: Problem Focus & Strategic Bets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Core Problem */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[260px]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> 3. Problema Central (Problem Focus)
            </label>
            <span className="text-[10px] text-zinc-500">A maior fricção do mercado</span>
          </div>
          <textarea
            value={data.problem_focus || ''}
            onChange={(e) => updateField('problem_focus', e.target.value)}
            placeholder="Ex: Desconexão entre discovery e execução. Features são lançadas sem evidência ou validação real de mercado..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>

        {/* Strategic Bets */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[260px]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" /> 4. Apostas Estratégicas (Strategic Bets)
            </label>
            <span className="text-[10px] text-zinc-500">Onde alocaremos recursos</span>
          </div>
          <textarea
            value={data.strategic_bets || ''}
            onChange={(e) => updateField('strategic_bets', e.target.value)}
            placeholder="• Aposta 1: Motor nativo de IA para síntese de entrevistas&#10;• Aposta 2: Linhagem de ponta a ponta que conecta notas a iniciativas do roadmap&#10;• Aposta 3: Product Toolkit independente com autosave"
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>
      </div>

      {/* Bottom: Differentiators & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Differentiators */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[240px]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> 5. Diferenciais Competitivos (Differentiators)
            </label>
            <span className="text-[10px] text-zinc-500">Por que vencemos</span>
          </div>
          <textarea
            value={data.differentiators || ''}
            onChange={(e) => updateField('differentiators', e.target.value)}
            placeholder="• Arquitetura com auditoria e rastreabilidade estrita&#10;• Suporte a modo pipeline guiado e modo toolkit isolado&#10;• IA especializada em rigor metodológico (não apenas texto genérico)"
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>

        {/* Metrics & Outcomes */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[240px]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> 6. Métricas & Resultados Esperados (Metrics)
            </label>
            <span className="text-[10px] text-zinc-500">Como medimos o sucesso</span>
          </div>
          <textarea
            value={data.metrics_and_outcomes || ''}
            onChange={(e) => updateField('metrics_and_outcomes', e.target.value)}
            placeholder="• Health Score médio do Discovery > 80%&#10;• Redução do tempo de validação de hipóteses de 4 para 1 semana&#10;• 90% das iniciativas do roadmap vinculadas a decisões documentadas"
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>
      </div>
    </div>
  );
};
