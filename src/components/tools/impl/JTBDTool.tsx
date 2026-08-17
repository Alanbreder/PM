import React from 'react';
import { Target, Compass, Heart, Share2, AlertCircle, FileCheck } from 'lucide-react';

interface JTBDToolProps {
  data: {
    situation?: string;
    motivation?: string;
    desired_outcome?: string;
    functional_job?: string;
    emotional_job?: string;
    social_job?: string;
    pain_points?: string;
    evidence?: string;
  };
  onChange: (newData: any) => void;
}

export const JTBDTool: React.FC<JTBDToolProps> = ({ data, onChange }) => {
  const updateField = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Core JTBD Triad Banner */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-military-400 uppercase tracking-wider">
            <Target className="w-4 h-4" />
            Declaração Central do Job (Clayton Christensen Framework)
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">When / I want to / So I can</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Situation */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-sky-400">
              1. Situação (Contexto / Gatilho)
            </label>
            <textarea
              value={data.situation || ''}
              onChange={(e) => updateField('situation', e.target.value)}
              placeholder="Quando estou preparando a priorização do próximo trimestre com a liderança..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-sky-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Motivation */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-military-400">
              2. Motivação (Ação Central)
            </label>
            <textarea
              value={data.motivation || ''}
              onChange={(e) => updateField('motivation', e.target.value)}
              placeholder="Eu quero comprovar com evidências reais de clientes por que determinados problemas foram escolhidos..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Desired Outcome */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-emerald-400">
              3. Resultado Desejado (Transformação)
            </label>
            <textarea
              value={data.desired_outcome || ''}
              onChange={(e) => updateField('desired_outcome', e.target.value)}
              placeholder="Para que eu possa obter aprovação rápida de budget e manter os engenheiros engajados..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* 3 Dimensions of Value: Functional, Emotional, Social */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[280px]">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-zinc-200 uppercase tracking-wider">
            <Compass className="w-4 h-4 text-sky-400" />
            Job Funcional (O que executa)
          </div>
          <p className="text-[11px] text-zinc-400 mb-2">
            Quais tarefas operacionais e práticas o usuário precisa realizar diretamente?
          </p>
          <textarea
            value={data.functional_job || ''}
            onChange={(e) => updateField('functional_job', e.target.value)}
            placeholder="Ex: Mapear evidências qualitativas diretamente às oportunidades e gerar score RICE..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[280px]">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-zinc-200 uppercase tracking-wider">
            <Heart className="w-4 h-4 text-rose-400" />
            Job Emocional (Como se sente)
          </div>
          <p className="text-[11px] text-zinc-400 mb-2">
            Como o usuário deseja se sentir (ou evitar se sentir) durante e após a execução?
          </p>
          <textarea
            value={data.emotional_job || ''}
            onChange={(e) => updateField('emotional_job', e.target.value)}
            placeholder="Ex: Sentir segurança e confiança de que não estou desperdiçando tempo de engenharia com suposições..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[280px]">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-zinc-200 uppercase tracking-wider">
            <Share2 className="w-4 h-4 text-purple-400" />
            Job Social (Como é visto)
          </div>
          <p className="text-[11px] text-zinc-400 mb-2">
            Como o usuário quer ser percebido pela liderança, pares ou mercado?
          </p>
          <textarea
            value={data.social_job || ''}
            onChange={(e) => updateField('social_job', e.target.value)}
            placeholder="Ex: Ser reconhecido pela liderança e pares como um Product Manager rigoroso e estratégico..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Bottom Row: Pains & Real Evidences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" />
            Barreiras & Dores no Job Atual
          </div>
          <textarea
            value={data.pain_points || ''}
            onChange={(e) => updateField('pain_points', e.target.value)}
            placeholder="O que impede o usuário de realizar este Job com excelência hoje?"
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <FileCheck className="w-4 h-4" />
            Evidências & Dados Concretos
          </div>
          <textarea
            value={data.evidence || ''}
            onChange={(e) => updateField('evidence', e.target.value)}
            placeholder="Dados quantitativos ou falas de entrevistas que comprovam a existência desse Job..."
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
