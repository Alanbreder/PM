import React, { useState } from 'react';
import { Plus, Trash2, Zap, Trophy, Clock, Skull } from 'lucide-react';

interface ImpactEffortMatrixToolProps {
  data: {
    quick_wins?: string[];
    major_projects?: string[];
    fill_ins?: string[];
    thankless_tasks?: string[];
  };
  onChange: (newData: any) => void;
}

export const ImpactEffortMatrixTool: React.FC<ImpactEffortMatrixToolProps> = ({
  data,
  onChange,
}) => {
  const quick_wins = data.quick_wins || [];
  const major_projects = data.major_projects || [];
  const fill_ins = data.fill_ins || [];
  const thankless_tasks = data.thankless_tasks || [];

  const [inputValues, setInputValues] = useState<Record<string, string>>({
    quick_wins: '',
    major_projects: '',
    fill_ins: '',
    thankless_tasks: '',
  });

  const addItem = (quadrant: 'quick_wins' | 'major_projects' | 'fill_ins' | 'thankless_tasks') => {
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
    quadrant: 'quick_wins' | 'major_projects' | 'fill_ins' | 'thankless_tasks',
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
      {/* 2x2 Matrix Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Quadrant 1: Quick Wins (Alto Impacto / Baixo Esforço) */}
        <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-2xl p-5 flex flex-col h-[340px] shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-800/40">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-emerald-400" />
              1. Quick Wins (Vitórias Rápidas)
            </div>
            <span className="text-[10px] bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded font-mono">
              Alto Impacto / Baixo Esforço
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1 scrollbar-thin scrollbar-thumb-emerald-900">
            {quick_wins.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-zinc-900/90 border border-emerald-900/60 rounded-lg text-xs text-zinc-200 flex items-center justify-between gap-2"
              >
                <span>{item}</span>
                <button
                  onClick={() => removeItem('quick_wins', idx)}
                  className="text-zinc-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2 border-t border-emerald-900/40">
            <input
              type="text"
              value={inputValues.quick_wins}
              onChange={(e) => setInputValues({ ...inputValues, quick_wins: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && addItem('quick_wins')}
              placeholder="Adicionar quick win..."
              className="flex-1 bg-zinc-950 border border-emerald-900/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none"
            />
            <button
              onClick={() => addItem('quick_wins')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quadrant 2: Major Projects (Alto Impacto / Alto Esforço) */}
        <div className="bg-military-950/40 border border-military-800/60 rounded-2xl p-5 flex flex-col h-[340px] shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-military-800/40">
            <div className="flex items-center gap-2 text-xs font-bold text-military-300 uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-military-400" />
              2. Grandes Apostas (Major Projects)
            </div>
            <span className="text-[10px] bg-military-900 text-military-200 px-2 py-0.5 rounded font-mono">
              Alto Impacto / Alto Esforço
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1 scrollbar-thin scrollbar-thumb-military-900">
            {major_projects.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-zinc-900/90 border border-military-900/60 rounded-lg text-xs text-zinc-200 flex items-center justify-between gap-2"
              >
                <span>{item}</span>
                <button
                  onClick={() => removeItem('major_projects', idx)}
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
              value={inputValues.major_projects}
              onChange={(e) => setInputValues({ ...inputValues, major_projects: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && addItem('major_projects')}
              placeholder="Adicionar grande aposta..."
              className="flex-1 bg-zinc-950 border border-military-900/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none"
            />
            <button
              onClick={() => addItem('major_projects')}
              className="px-3 py-1.5 bg-military-600 hover:bg-military-500 text-white rounded-lg text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quadrant 3: Fill-ins (Baixo Impacto / Baixo Esforço) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col h-[340px] shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-zinc-400" />
              3. Tarefas Secundárias (Fill-ins)
            </div>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">
              Baixo Impacto / Baixo Esforço
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
            {fill_ins.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 flex items-center justify-between gap-2"
              >
                <span>{item}</span>
                <button
                  onClick={() => removeItem('fill_ins', idx)}
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
              value={inputValues.fill_ins}
              onChange={(e) => setInputValues({ ...inputValues, fill_ins: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && addItem('fill_ins')}
              placeholder="Adicionar tarefa secundária..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none"
            />
            <button
              onClick={() => addItem('fill_ins')}
              className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quadrant 4: Thankless Tasks (Baixo Impacto / Alto Esforço) */}
        <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-5 flex flex-col h-[340px] shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-900/40">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
              <Skull className="w-4 h-4" />
              4. Desperdício / Evitar (Thankless)
            </div>
            <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded font-mono">
              Baixo Impacto / Alto Esforço
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1 scrollbar-thin scrollbar-thumb-rose-950">
            {thankless_tasks.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-zinc-950 border border-rose-900/50 rounded-lg text-xs text-zinc-400 flex items-center justify-between gap-2"
              >
                <span>{item}</span>
                <button
                  onClick={() => removeItem('thankless_tasks', idx)}
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
              value={inputValues.thankless_tasks}
              onChange={(e) => setInputValues({ ...inputValues, thankless_tasks: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && addItem('thankless_tasks')}
              placeholder="Adicionar tarefa a evitar..."
              className="flex-1 bg-zinc-950 border border-rose-900/60 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none"
            />
            <button
              onClick={() => addItem('thankless_tasks')}
              className="px-3 py-1.5 bg-rose-800 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
