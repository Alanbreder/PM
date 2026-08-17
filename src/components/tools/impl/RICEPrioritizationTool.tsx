import React from 'react';
import { Plus, Trash2, ArrowUpDown, Award, Calculator, Info } from 'lucide-react';

interface RICEItem {
  id: string;
  name: string;
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  score: number;
  notes?: string;
}

interface RICEPrioritizationToolProps {
  data: {
    items?: RICEItem[];
  };
  onChange: (newData: any) => void;
}

export const RICEPrioritizationTool: React.FC<RICEPrioritizationToolProps> = ({
  data,
  onChange,
}) => {
  const rawItems = data.items || [
    { id: '1', name: 'Onboarding com Google SSO', reach: 2500, impact: 4, confidence: 90, effort: 2, score: 4500, notes: 'Impacto alto na ativação' },
    { id: '2', name: 'Exportação Avançada em PDF', reach: 800, impact: 3, confidence: 85, effort: 1, score: 2040, notes: 'Quick win executivo' },
  ];

  const calculateScore = (reach: number, impact: number, confidence: number, effort: number) => {
    const eff = effort <= 0 ? 1 : effort;
    return Math.round((reach * impact * (confidence / 100)) / eff);
  };

  const updateItem = (id: string, field: keyof RICEItem, val: any) => {
    const updated = rawItems.map((item) => {
      if (item.id !== id) return item;
      const next = { ...item, [field]: val };
      next.score = calculateScore(
        Number(next.reach) || 0,
        Number(next.impact) || 1,
        Number(next.confidence) || 50,
        Number(next.effort) || 1
      );
      return next;
    });
    onChange({ ...data, items: updated });
  };

  const addItem = () => {
    const newItem: RICEItem = {
      id: String(Date.now()),
      name: 'Nova Iniciativa Prioritária',
      reach: 1000,
      impact: 3,
      confidence: 80,
      effort: 2,
      score: 1200,
      notes: '',
    };
    onChange({ ...data, items: [...rawItems, newItem] });
  };

  const removeItem = (id: string) => {
    const updated = rawItems.filter((i) => i.id !== id);
    onChange({ ...data, items: updated });
  };

  // Sort items by score descending
  const sortedItems = [...rawItems].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="space-y-6">
      {/* Header Banner & Formula */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-military-400 uppercase tracking-wider">
            <Calculator className="w-4 h-4" />
            Priorização RICE (Intercom Framework)
          </div>
          <p className="text-xs text-zinc-300 mt-1">
            Fórmula Matemática: <span className="font-mono text-military-300 font-bold">(Reach × Impact × Confidence%) ÷ Effort</span>
          </p>
        </div>

        <button
          onClick={addItem}
          className="px-3.5 py-2 bg-military-600 hover:bg-military-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Adicionar Iniciativa
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="p-3.5 w-12 text-center">Rank</th>
                <th className="p-3.5 min-w-[220px]">Iniciativa / Oportunidade</th>
                <th className="p-3.5 w-28">Reach (Usuários)</th>
                <th className="p-3.5 w-28">Impact (1-5)</th>
                <th className="p-3.5 w-28">Confidence (%)</th>
                <th className="p-3.5 w-28">Effort (Semanas)</th>
                <th className="p-3.5 w-28 text-center text-military-400 font-bold">RICE Score</th>
                <th className="p-3.5 min-w-[180px]">Observações</th>
                <th className="p-3.5 w-12 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {sortedItems.map((item, rankIdx) => (
                <tr key={item.id} className="hover:bg-zinc-800/40 transition">
                  {/* Rank */}
                  <td className="p-3.5 text-center font-bold">
                    {rankIdx === 0 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-military-900 text-military-300 border border-military-600 text-xs">
                        1º
                      </span>
                    ) : rankIdx === 1 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 text-xs">
                        2º
                      </span>
                    ) : rankIdx === 2 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 text-xs">
                        3º
                      </span>
                    ) : (
                      <span className="text-zinc-500 text-xs">{rankIdx + 1}º</span>
                    )}
                  </td>

                  {/* Name */}
                  <td className="p-3.5">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      className="w-full bg-transparent font-semibold text-zinc-100 placeholder-zinc-600 outline-none border-b border-transparent focus:border-military-500 pb-0.5"
                    />
                  </td>

                  {/* Reach */}
                  <td className="p-3.5">
                    <input
                      type="number"
                      value={item.reach}
                      onChange={(e) => updateItem(item.id, 'reach', Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded p-1.5 text-xs text-zinc-200 outline-none font-mono"
                    />
                  </td>

                  {/* Impact */}
                  <td className="p-3.5">
                    <select
                      value={item.impact}
                      onChange={(e) => updateItem(item.id, 'impact', Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded p-1.5 text-xs text-zinc-200 outline-none"
                    >
                      <option value={5}>5 - Massivo</option>
                      <option value={4}>4 - Alto</option>
                      <option value={3}>3 - Médio</option>
                      <option value={2}>2 - Baixo</option>
                      <option value={1}>1 - Mínimo</option>
                    </select>
                  </td>

                  {/* Confidence */}
                  <td className="p-3.5">
                    <select
                      value={item.confidence}
                      onChange={(e) => updateItem(item.id, 'confidence', Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded p-1.5 text-xs text-zinc-200 outline-none"
                    >
                      <option value={100}>100% - Muito Alta</option>
                      <option value={90}>90% - Alta</option>
                      <option value={80}>80% - Média</option>
                      <option value={50}>50% - Baixa (Risco)</option>
                    </select>
                  </td>

                  {/* Effort */}
                  <td className="p-3.5">
                    <input
                      type="number"
                      min={1}
                      value={item.effort}
                      onChange={(e) => updateItem(item.id, 'effort', Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded p-1.5 text-xs text-zinc-200 outline-none font-mono"
                    />
                  </td>

                  {/* Score */}
                  <td className="p-3.5 text-center">
                    <span className="inline-block px-2.5 py-1 rounded bg-military-950 text-military-300 border border-military-800 font-mono font-bold text-xs">
                      {item.score}
                    </span>
                  </td>

                  {/* Notes */}
                  <td className="p-3.5">
                    <input
                      type="text"
                      value={item.notes || ''}
                      onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                      placeholder="Justificativa..."
                      className="w-full bg-transparent text-xs text-zinc-400 placeholder-zinc-600 outline-none border-b border-transparent focus:border-military-500 pb-0.5"
                    />
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-zinc-600 hover:text-rose-400 transition"
                      title="Remover linha"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
