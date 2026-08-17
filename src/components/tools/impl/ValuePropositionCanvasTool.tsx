import React from 'react';
import { Target, Smile, Frown, Package, Shield, Sparkles } from 'lucide-react';

interface ValuePropositionCanvasToolProps {
  data: {
    customer_jobs?: string;
    customer_pains?: string;
    customer_gains?: string;
    products_services?: string;
    pain_relievers?: string;
    gain_creators?: string;
  };
  onChange: (newData: any) => void;
}

export const ValuePropositionCanvasTool: React.FC<ValuePropositionCanvasToolProps> = ({
  data,
  onChange,
}) => {
  const updateField = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* 2 Main Sections: Customer Profile (Right/Circle) vs Value Map (Left/Square) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Profile (O Cliente) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-400"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">
                1. Perfil do Cliente (Customer Profile)
              </h3>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Público Alvo</span>
          </div>

          {/* Customer Jobs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Tarefas do Cliente (Customer Jobs)
            </label>
            <p className="text-[11px] text-zinc-400">
              O que o cliente está tentando fazer no seu trabalho ou dia a dia?
            </p>
            <textarea
              value={data.customer_jobs || ''}
              onChange={(e) => updateField('customer_jobs', e.target.value)}
              placeholder="• Coletar feedback de clientes&#10;• Priorizar backlog com critérios claros&#10;• Alinhar time de engenharia e negócios..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-sky-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
            />
          </div>

          {/* Customer Pains */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <Frown className="w-3.5 h-3.5" /> Dores & Frustrações (Pains)
            </label>
            <p className="text-[11px] text-zinc-400">
              O que irrita, gera custo desnecessário ou impede o cliente?
            </p>
            <textarea
              value={data.customer_pains || ''}
              onChange={(e) => updateField('customer_pains', e.target.value)}
              placeholder="• Decisões tomadas na base do 'achismo'&#10;• Retrabalho em features sem adoção&#10;• Dificuldade de demonstrar o impacto do discovery..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
            />
          </div>

          {/* Customer Gains */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5" /> Ganhos & Resultados Esperados (Gains)
            </label>
            <p className="text-[11px] text-zinc-400">
              Quais benefícios e vitórias o cliente deseja alcançar?
            </p>
            <textarea
              value={data.customer_gains || ''}
              onChange={(e) => updateField('customer_gains', e.target.value)}
              placeholder="• Visibilidade ponta a ponta do discovery&#10;• Agilidade com resumos gerados por IA&#10;• Autonomia e alinhamento do time..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
            />
          </div>
        </div>

        {/* Value Map (O Mapa de Valor / A Solução) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-military-400"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">
                2. Mapa de Valor (Value Map)
              </h3>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Sua Oferta</span>
          </div>

          {/* Products & Services */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-military-400 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Produtos & Serviços
            </label>
            <p className="text-[11px] text-zinc-400">
              Quais ofertas e capacidades tangíveis você entrega?
            </p>
            <textarea
              value={data.products_services || ''}
              onChange={(e) => updateField('products_services', e.target.value)}
              placeholder="• Product OS Discovery Engine&#10;• AI Product Coach em tempo real&#10;• Toolkit com 15 canvases interativos..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
            />
          </div>

          {/* Pain Relievers */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Aliviadores de Dor (Pain Relievers)
            </label>
            <p className="text-[11px] text-zinc-400">
              Como seu produto elimina exatamente as dores mapeadas ao lado?
            </p>
            <textarea
              value={data.pain_relievers || ''}
              onChange={(e) => updateField('pain_relievers', e.target.value)}
              placeholder="• Rastreabilidade nativa de ponta a ponta&#10;• Detecção automática de dados insuficientes&#10;• Elimina silos entre pesquisa e roadmap..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
            />
          </div>

          {/* Gain Creators */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Criadores de Ganho (Gain Creators)
            </label>
            <p className="text-[11px] text-zinc-400">
              Como seu produto produz os resultados positivos que o cliente deseja?
            </p>
            <textarea
              value={data.gain_creators || ''}
              onChange={(e) => updateField('gain_creators', e.target.value)}
              placeholder="• Aumento de 3x na velocidade de discovery&#10;• Apresentações executivas prontas em 1 clique&#10;• Alinhamento estratégico perfeito com OKRs..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
