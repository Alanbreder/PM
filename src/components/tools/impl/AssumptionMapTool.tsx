import React, { useState } from 'react';
import { Plus, Trash2, AlertTriangle, ShieldCheck, HelpCircle, CheckCircle } from 'lucide-react';

interface AssumptionMapToolProps {
  data: {
    critical_hypotheses?: string[];
    important_knowns?: string[];
    low_priority_risks?: string[];
    unimportant_knowns?: string[];
  };
  onChange: (newData: any) => void;
}

export const AssumptionMapTool: React.FC<AssumptionMapToolProps> = ({ data, onChange }) => {
  const critical_hypotheses = data.critical_hypotheses || [];
  const important_knowns = data.important_knowns || [];
  const low_priority_risks = data.low_priority_risks || [];
  const unimportant_knowns = data.unimportant_knowns || [];

  const [inputValues, setInputValues] = useState<Record<string, string>>({
    critical_hypotheses: '',
    important_knowns: '',
    low_priority_risks: '',
    unimportant_knowns: '',
  });

  const addItem = (
    quadrant:
      | 'critical_hypotheses'
      | 'important_knowns'
      | 'low_priority_risks'
      | 'unimportant_knowns'
  ) => {
    const text = (inputValues[quadrant] || '').trim();
    if (!text) return;
    const currentList = data[quadrant] || [];
    onChange({
      ...data,
      [quadrant]: [...currentList, text],
    });
    setInputValues({ ...inputValues, [quadrant]: '' });
  };

  const removeItem = (
    quadrant:
      | 'critical_hypotheses'
      | 'important_knowns'
      | 'low_priority_risks'
      | 'unimportant_knowns',
    index: number
  ) => {
    const currentList = data[quadrant] || [];
    const updated = currentList.filter((_, idx) => idx !== index);
    onChange({
      ...data,
      [quadrant]: updated,
    });
  };

  return (
    <div className="space-y-6">
      {/* 2x2 Assumption Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Quadrant 1: Critical Hypotheses (Alta Importância / Alta Incerteza) -> EXPERIMENTAR AGORA */}
        <div className="bg-rose-950/20 border border-rose-800/60 rounded-2xl p-5 flex flex-col h-[340px] shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-800/40">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-300 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              1. Hipóteses Críticas (Testar Agora)
            </div>
            <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded font-mono">
              Alta Importância / Alta Incerteza
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1 scrollbar-thin scrollbar-thumb-rose-900">
            {critical_hypotheses.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-zinc-900/90 border border-rose-900/60 rounded-lg text-xs text-zinc-200 flex items-center justify-between gap-2"
              >
                <span>{item}</span>
                <button
                  onClick={() => removeItem('critical_hypotheses', idx)}
                  className="text-zinc-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2 border-t border-rose-900/40">
            <input
              type="text"
              value={inputValues.critical_hypotheses}
              onChange={(e) =>
                setInputValues({ ...inputValues, critical_hypotheses: e.target.value })
              }
              onKeyDown={(e) => e.key === 'Enter' && addItem('critical_hypotheses')}
              placeholder="Adicionar premissa de alto risco..."
              className="flex-1 bg-zinc-950 border border-rose-900/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none"
            />
            <button
              onClick={() => addItem('critical_hypotheses')}
              className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quadrant 2: Important Knowns (Alta Importância / Baixa Incerteza) -> PLANEJAR & EXECUTAR */}
        <div className="bg-military-950/40 border border-military-800/60 rounded-2xl p-5 flex flex-col h-[340px] shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-military-800/40">
            <div className="flex items-center gap-2 text-xs font-bold text-military-300 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-military-400" />
              2. Fatos Conhecidos (Planejar)
            </div>
            <span className="text-[10px] bg-military-900 text-military-200 px-2 py-0.5 rounded font-mono">
              Alta Importância / Baixa Incerteza
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1 scrollbar-thin scrollbar-thumb-military-900">
            {important_knowns.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-zinc-900/90 border border-military-900/60 rounded-lg text-xs text-zinc-200 flex items-center justify-between gap-2"
              >
                <span>{item}</span>
                <button
                  onClick={() => removeItem('important_knowns', idx)}
                  className="text-zinc-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2 border-t border-military-900/40">
            <input
              type="text"
              value={inputValues.important_knowns}
              onChange={(e) =>
                setInputValues({ ...inputValues, important_knowns: e.target.value })
              }
              onKeyDown={(e) => e.key === 'Enter' && addItem('important_knowns')}
              placeholder="Adicionar fato crucial conhecido..."
              className="flex-1 bg-zinc-950 border border-military-900/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none"
            />
            <button
              onClick={() => addItem('important_knowns')}
              className="px-3 py-1.5 bg-military-600 hover:bg-military-500 text-white rounded-lg text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quadrant 3: Low Priority Risks (Baixa Importância / Alta Incerteza) -> MONITORAR */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col h-[340px] shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              3. Incertezas Secundárias (Monitorar)
            </div>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">
              Baixa Importância / Alta Incerteza
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
            {low_priority_risks.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 flex items-center justify-between gap-2"
              >
                <span>{item}</span>
                <button
                  onClick={() => removeItem('low_priority_risks', idx)}
                  className="text-zinc-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2 border-t border-zinc-800">
            <input
              type="text"
              value={inputValues.low_priority_risks}
              onChange={(e) =>
                setInputValues({ ...inputValues, low_priority_risks: e.target.value })
              }
              onKeyDown={(e) => e.key === 'Enter' && addItem('low_priority_risks')}
              placeholder="Adicionar incerteza secundária..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none"
            />
            <button
              onClick={() => addItem('low_priority_risks')}
              className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quadrant 4: Unimportant Knowns (Baixa Importância / Baixa Incerteza) -> DELEGAR / DESCARTAR */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col h-[340px] shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <CheckCircle className="w-4 h-4 text-zinc-500" />
              4. Conhecido & Baixo Impacto (Delegar)
            </div>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">
              Baixa Importância / Baixa Incerteza
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
            {unimportant_knowns.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-400 flex items-center justify-between gap-2"
              >
                <span>{item}</span>
                <button
                  onClick={() => removeItem('unimportant_knowns', idx)}
                  className="text-zinc-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2 border-t border-zinc-800">
            <input
              type="text"
              value={inputValues.unimportant_knowns}
              onChange={(e) =>
                setInputValues({ ...inputValues, unimportant_knowns: e.target.value })
              }
              onKeyDown={(e) => e.key === 'Enter' && addItem('unimportant_knowns')}
              placeholder="Adicionar item conhecido de baixo impacto..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none"
            />
            <button
              onClick={() => addItem('unimportant_knowns')}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
