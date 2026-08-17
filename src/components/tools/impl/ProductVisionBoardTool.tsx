import React from 'react';

interface ProductVisionBoardToolProps {
  data: {
    vision?: string;
    target_group?: string;
    needs?: string;
    product?: string;
    business_goals?: string;
    competitors?: string;
    revenue_cost?: string;
  };
  onChange: (newData: any) => void;
}

export const ProductVisionBoardTool: React.FC<ProductVisionBoardToolProps> = ({ data, onChange }) => {
  const updateField = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Banner: Vision */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-military-400 uppercase tracking-wider">
            Visão do Produto (Vision)
          </label>
          <span className="text-[11px] text-zinc-500">O propósito inspirador e a razão de existir do produto</span>
        </div>
        <textarea
          value={data.vision || ''}
          onChange={(e) => updateField('vision', e.target.value)}
          placeholder="Qual é a transformação definitiva que queremos gerar no mundo ou na vida dos usuários?"
          rows={3}
          className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none resize-none leading-relaxed"
        />
      </div>

      {/* 4 Pillars Grid: Target Group, Needs, Product, Business Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Target Group */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[320px]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              1. Público Alvo
            </label>
            <span className="text-[10px] text-zinc-500">Segmento</span>
          </div>
          <p className="text-[11px] text-zinc-400 mb-2">
            Quem são os clientes e usuários ideais?
          </p>
          <textarea
            value={data.target_group || ''}
            onChange={(e) => updateField('target_group', e.target.value)}
            placeholder="• Product Managers em scale-ups&#10;• Líderes de Engenharia&#10;• Diretores de Produto..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
          />
        </div>

        {/* 2. Needs */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[320px]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              2. Necessidades & Dores
            </label>
            <span className="text-[10px] text-zinc-500">Problemas</span>
          </div>
          <p className="text-[11px] text-zinc-400 mb-2">
            Qual problema central o produto resolve?
          </p>
          <textarea
            value={data.needs || ''}
            onChange={(e) => updateField('needs', e.target.value)}
            placeholder="• Eliminar achismos em priorizações&#10;• Falta de tempo para documentar discovery&#10;• Dificuldade de demonstrar ROI..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
          />
        </div>

        {/* 3. Product */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[320px]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              3. O Produto & Diferencial
            </label>
            <span className="text-[10px] text-zinc-500">Solução</span>
          </div>
          <p className="text-[11px] text-zinc-400 mb-2">
            O que é o produto e o que o torna único?
          </p>
          <textarea
            value={data.product || ''}
            onChange={(e) => updateField('product', e.target.value)}
            placeholder="• Sistema unificado de discovery contínuo&#10;• AI Product Coach com rigor metodológico&#10;• Rastreabilidade ponta a ponta..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
          />
        </div>

        {/* 4. Business Goals */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[320px]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              4. Metas de Negócio
            </label>
            <span className="text-[10px] text-zinc-500">Valor Comercial</span>
          </div>
          <p className="text-[11px] text-zinc-400 mb-2">
            Como este produto beneficiará a empresa?
          </p>
          <textarea
            value={data.business_goals || ''}
            onChange={(e) => updateField('business_goals', e.target.value)}
            placeholder="• Atingir R$ 1M de ARR em 12 meses&#10;• Reduzir churn para menos de 1.5%&#10;• Posicionar como líder de categoria..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Bottom Row: Competitors & Revenue/Cost Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
            Concorrentes & Alternativas Existentes
          </label>
          <textarea
            value={data.competitors || ''}
            onChange={(e) => updateField('competitors', e.target.value)}
            placeholder="Quais alternativas o cliente usa hoje (planilhas, Jira, Notion, concorrentes diretos)?"
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
            Modelo de Receita & Estrutura de Custos
          </label>
          <textarea
            value={data.revenue_cost || ''}
            onChange={(e) => updateField('revenue_cost', e.target.value)}
            placeholder="Como o produto monetiza (assinatura, taxa por usuário, transação) e quais são os maiores custos?"
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
