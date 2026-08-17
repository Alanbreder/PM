import React from 'react';

interface ProductCanvasToolProps {
  data: {
    product_name?: string;
    vision_goal?: string;
    target_group?: string;
    big_picture?: string;
    metrics?: string;
    product_details?: string;
  };
  onChange: (newData: any) => void;
}

export const ProductCanvasTool: React.FC<ProductCanvasToolProps> = ({ data, onChange }) => {
  const updateField = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Information: Product Name & Vision Goal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
        <div>
          <label className="block text-xs font-bold text-military-400 uppercase tracking-wider mb-1.5">
            Nome do Produto / Iniciativa
          </label>
          <input
            type="text"
            value={data.product_name || ''}
            onChange={(e) => updateField('product_name', e.target.value)}
            placeholder="Ex: DataPulse Enterprise, App Mobile B2C..."
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-military-400 uppercase tracking-wider mb-1.5">
            Visão / Objetivo Central
          </label>
          <input
            type="text"
            value={data.vision_goal || ''}
            onChange={(e) => updateField('vision_goal', e.target.value)}
            placeholder="Ex: Capacitar times de receita a tomar decisões em tempo real..."
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition"
          />
        </div>
      </div>

      {/* Main Grid: Target Group, Big Picture, Metrics, Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Column 1: Target Group & Metrics */}
        <div className="space-y-5">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[280px]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                1. Grupo Alvo (Target Group)
              </label>
              <span className="text-[10px] text-zinc-500">Personas / Usuários</span>
            </div>
            <textarea
              value={data.target_group || ''}
              onChange={(e) => updateField('target_group', e.target.value)}
              placeholder="Quem são os usuários e clientes primários? Quais são suas funções, dores e contextos?"
              className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[280px]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                2. Métricas de Sucesso & Critérios
              </label>
              <span className="text-[10px] text-zinc-500">Métricas Chave</span>
            </div>
            <textarea
              value={data.metrics || ''}
              onChange={(e) => updateField('metrics', e.target.value)}
              placeholder="• Taxa de ativação D1 > 60%&#10;• Redução de tempo de ciclo em 40%&#10;• Adoção de features..."
              className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
            />
          </div>
        </div>

        {/* Column 2: Big Picture / Epics / User Journey */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[580px]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              3. Big Picture (Jornada & Épicos)
            </label>
            <span className="text-[10px] text-zinc-500">Visão Geral da Experiência</span>
          </div>
          <p className="text-[11px] text-zinc-400 mb-2">
            Como os usuários interagem com o produto do início ao fim? Principais etapas e fluxos:
          </p>
          <textarea
            value={data.big_picture || ''}
            onChange={(e) => updateField('big_picture', e.target.value)}
            placeholder="1. Descoberta & Criação de Conta&#10;2. Conexão de Fontes de Dados&#10;3. Execução Automatizada de Discovery&#10;4. Visualização de Linha do Tempo e Impacto..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>

        {/* Column 3: Product Details / Features / MVP Scope */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[580px]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              4. Detalhes do Produto (Features & Escopo)
            </label>
            <span className="text-[10px] text-zinc-500">Requisitos Chave</span>
          </div>
          <p className="text-[11px] text-zinc-400 mb-2">
            Quais funcionalidades e capacidades tangíveis serão entregues para suportar o Big Picture?
          </p>
          <textarea
            value={data.product_details || ''}
            onChange={(e) => updateField('product_details', e.target.value)}
            placeholder="• Autenticação SAML SSO&#10;• Conectores REST / GraphQL&#10;• Motor de AI Product Coach&#10;• Exportação PDF / Markdown..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>
      </div>
    </div>
  );
};
