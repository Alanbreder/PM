import React from 'react';
import { Users, Target, Frown, Sparkles, Briefcase, Activity } from 'lucide-react';

interface PersonasToolProps {
  data: {
    name?: string;
    role_title?: string;
    segment?: string;
    description?: string;
    goals?: string;
    pains?: string;
    behaviors?: string;
    jobs_to_be_done?: string;
  };
  onChange: (newData: any) => void;
}

export const PersonasTool: React.FC<PersonasToolProps> = ({ data, onChange }) => {
  const updateField = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Banner: Identity Header */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-military-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Nome da Persona
            </label>
            <input
              type="text"
              value={data.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Ex: Mariana Silva, Lucas Ferreira..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" /> Cargo / Função
            </label>
            <input
              type="text"
              value={data.role_title || ''}
              onChange={(e) => updateField('role_title', e.target.value)}
              placeholder="Ex: Head de Produto, Tech Lead, Analista..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Segmento / Indústria
            </label>
            <input
              type="text"
              value={data.segment || ''}
              onChange={(e) => updateField('segment', e.target.value)}
              placeholder="Ex: Scale-ups B2B, E-commerce, Fintech..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none"
            />
          </div>
        </div>

        {/* Persona Bio / Summary */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
            Biografia & Contexto do Dia a Dia
          </label>
          <textarea
            value={data.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Descreva a rotina, motivações, desafios e como essa pessoa interage com a equipe..."
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* 4 Quadrants: Goals, Pains, Behaviors, JTBD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Goals & Objectives */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex flex-col h-[320px]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Objetivos & Metas (Goals)
            </label>
            <span className="text-[10px] text-zinc-500">O que quer alcançar</span>
          </div>
          <textarea
            value={data.goals || ''}
            onChange={(e) => updateField('goals', e.target.value)}
            placeholder="• Atingir metas de retenção e engajamento&#10;• Agilizar reuniões de diretoria com relatórios confiáveis&#10;• Aumentar a maturidade de produto do time..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>

        {/* Pains & Frustrations */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex flex-col h-[320px]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Frown className="w-3.5 h-3.5" /> Dores & Frustrações (Pains)
            </label>
            <span className="text-[10px] text-zinc-500">O que a atrapalha</span>
          </div>
          <textarea
            value={data.pains || ''}
            onChange={(e) => updateField('pains', e.target.value)}
            placeholder="• Informações de discovery espalhadas em 5 ferramentas&#10;• Pressão da liderança por features sem validação&#10;• Dificuldade de demonstrar o impacto do produto..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>

        {/* Behaviors & Habits */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex flex-col h-[320px]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Hábitos & Comportamentos
            </label>
            <span className="text-[10px] text-zinc-500">Como age e decide</span>
          </div>
          <textarea
            value={data.behaviors || ''}
            onChange={(e) => updateField('behaviors', e.target.value)}
            placeholder="• Prefere dados concretos a opiniões subjetivas&#10;• Usa Slack e Notion o dia inteiro&#10;• Realiza check-ins semanais com engenharia e design..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-sky-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>

        {/* Jobs to be Done */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex flex-col h-[320px]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Jobs To Be Done Centrais
            </label>
            <span className="text-[10px] text-zinc-500">Trabalhos a realizar</span>
          </div>
          <textarea
            value={data.jobs_to_be_done || ''}
            onChange={(e) => updateField('jobs_to_be_done', e.target.value)}
            placeholder="• Justificar o roadmap para diretoria com evidências de clientes&#10;• Priorizar oportunidades de forma transparente e colaborativa&#10;• Conectar hipóteses a experimentos reais..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>
      </div>
    </div>
  );
};
