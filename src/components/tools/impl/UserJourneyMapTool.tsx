import React from 'react';
import { Plus, Trash2, Smile, Meh, Frown, Sparkles, MapPin } from 'lucide-react';

interface JourneyStage {
  stage: string;
  goal: string;
  actions: string;
  thoughts: string;
  pain_points: string;
  emotion: 'positive' | 'neutral' | 'negative';
  opportunities: string;
}

interface UserJourneyMapToolProps {
  data: {
    stages?: JourneyStage[];
  };
  onChange: (newData: any) => void;
}

export const UserJourneyMapTool: React.FC<UserJourneyMapToolProps> = ({ data, onChange }) => {
  const stages = data.stages || [
    { stage: '1. Descoberta', goal: '', actions: '', thoughts: '', pain_points: '', emotion: 'neutral', opportunities: '' },
    { stage: '2. Onboarding', goal: '', actions: '', thoughts: '', pain_points: '', emotion: 'neutral', opportunities: '' },
    { stage: '3. Primeiro Uso', goal: '', actions: '', thoughts: '', pain_points: '', emotion: 'positive', opportunities: '' },
    { stage: '4. Resolução', goal: '', actions: '', thoughts: '', pain_points: '', emotion: 'negative', opportunities: '' },
    { stage: '5. Retenção', goal: '', actions: '', thoughts: '', pain_points: '', emotion: 'positive', opportunities: '' },
  ];

  const updateStage = (index: number, field: keyof JourneyStage, val: any) => {
    const updated = [...stages];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ ...data, stages: updated });
  };

  const addStage = () => {
    const newStage: JourneyStage = {
      stage: `Novo Estágio ${stages.length + 1}`,
      goal: '',
      actions: '',
      thoughts: '',
      pain_points: '',
      emotion: 'neutral',
      opportunities: '',
    };
    onChange({ ...data, stages: [...stages, newStage] });
  };

  const removeStage = (index: number) => {
    const updated = stages.filter((_, idx) => idx !== index);
    onChange({ ...data, stages: updated });
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-military-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Estágios da Jornada do Usuário ({stages.length})
          </h3>
        </div>
        <button
          onClick={addStage}
          className="px-3 py-1.5 bg-military-600 hover:bg-military-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar Estágio
        </button>
      </div>

      {/* Horizontal Scrollable Stages Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-700">
        {stages.map((stageItem, idx) => (
          <div
            key={idx}
            className="w-80 shrink-0 bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col space-y-4 shadow-sm"
          >
            {/* Stage Header */}
            <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <input
                type="text"
                value={stageItem.stage}
                onChange={(e) => updateStage(idx, 'stage', e.target.value)}
                className="font-bold text-xs text-zinc-100 bg-transparent outline-none w-full border-b border-transparent focus:border-military-500"
              />
              {stages.length > 1 && (
                <button
                  onClick={() => removeStage(idx)}
                  className="text-zinc-500 hover:text-rose-400 p-1 transition"
                  title="Excluir estágio"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Goal */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Objetivo do Usuário
              </label>
              <textarea
                value={stageItem.goal}
                onChange={(e) => updateStage(idx, 'goal', e.target.value)}
                placeholder="O que o usuário quer nesta etapa?"
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded p-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none"
              />
            </div>

            {/* Actions */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Ações Realizadas
              </label>
              <textarea
                value={stageItem.actions}
                onChange={(e) => updateStage(idx, 'actions', e.target.value)}
                placeholder="Passos que o usuário executa..."
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded p-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none"
              />
            </div>

            {/* Thoughts */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Pensamentos & Citações
              </label>
              <textarea
                value={stageItem.thoughts}
                onChange={(e) => updateStage(idx, 'thoughts', e.target.value)}
                placeholder="'Será que isso é seguro?'..."
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded p-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none"
              />
            </div>

            {/* Emotion Selector */}
            <div className="space-y-1 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Sentimento / Emoção
              </label>
              <div className="flex items-center justify-around">
                <button
                  type="button"
                  onClick={() => updateStage(idx, 'emotion', 'positive')}
                  className={`p-1.5 rounded-lg flex items-center gap-1 text-[11px] transition ${
                    stageItem.emotion === 'positive'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Smile className="w-3.5 h-3.5 text-emerald-400" /> Positivo
                </button>
                <button
                  type="button"
                  onClick={() => updateStage(idx, 'emotion', 'neutral')}
                  className={`p-1.5 rounded-lg flex items-center gap-1 text-[11px] transition ${
                    stageItem.emotion === 'neutral'
                      ? 'bg-amber-950 text-amber-300 border border-amber-700 font-bold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Meh className="w-3.5 h-3.5 text-amber-400" /> Neutro
                </button>
                <button
                  type="button"
                  onClick={() => updateStage(idx, 'emotion', 'negative')}
                  className={`p-1.5 rounded-lg flex items-center gap-1 text-[11px] transition ${
                    stageItem.emotion === 'negative'
                      ? 'bg-rose-950 text-rose-300 border border-rose-700 font-bold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Frown className="w-3.5 h-3.5 text-rose-400" /> Frustrado
                </button>
              </div>
            </div>

            {/* Pain Points */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                Pontos de Fricção (Dores)
              </label>
              <textarea
                value={stageItem.pain_points}
                onChange={(e) => updateStage(idx, 'pain_points', e.target.value)}
                placeholder="O que gera atraso, dúvida ou abandono?"
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded p-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none"
              />
            </div>

            {/* Opportunities */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-military-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Oportunidades de Melhoria
              </label>
              <textarea
                value={stageItem.opportunities}
                onChange={(e) => updateStage(idx, 'opportunities', e.target.value)}
                placeholder="Como podemos transformar essa dor em valor?"
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded p-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
