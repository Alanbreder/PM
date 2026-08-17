import React from 'react';
import { MessageSquare, Brain, Eye, Heart, Frown, Sparkles } from 'lucide-react';

interface EmpathyMapToolProps {
  data: {
    says?: string;
    thinks?: string;
    does?: string;
    feels?: string;
    pains?: string;
    gains?: string;
  };
  onChange: (newData: any) => void;
}

export const EmpathyMapTool: React.FC<EmpathyMapToolProps> = ({ data, onChange }) => {
  const updateField = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Top 4 Quadrants: Says, Thinks, Does, Feels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Says (O que diz) */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[280px]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-military-300 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-military-400" /> O que diz (Says)
            </label>
            <span className="text-[10px] text-zinc-500">Citações reais do usuário</span>
          </div>
          <textarea
            value={data.says || ''}
            onChange={(e) => updateField('says', e.target.value)}
            placeholder='• "Preciso compilar esses dados antes da reunião das 15h"&#10;• "Essa ferramenta é muito lenta para exportar"'
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>

        {/* Thinks (O que pensa) */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[280px]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" /> O que pensa (Thinks)
            </label>
            <span className="text-[10px] text-zinc-500">Crenças e expectativas</span>
          </div>
          <textarea
            value={data.thinks || ''}
            onChange={(e) => updateField('thinks', e.target.value)}
            placeholder="• 'Será que estou tomando a decisão certa?'&#10;• 'Gostaria que o processo fosse mais automatizado'"
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-sky-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>

        {/* Does (O que faz) */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[280px]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> O que faz (Does)
            </label>
            <span className="text-[10px] text-zinc-500">Comportamentos observados</span>
          </div>
          <textarea
            value={data.does || ''}
            onChange={(e) => updateField('does', e.target.value)}
            placeholder="• Exporta CSV e junta tudo no Excel manualmente&#10;• Pede ajuda no canal do Slack para entender métricas"
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>

        {/* Feels (O que sente) */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[280px]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" /> O que sente (Feels)
            </label>
            <span className="text-[10px] text-zinc-500">Emoções e inseguranças</span>
          </div>
          <textarea
            value={data.feels || ''}
            onChange={(e) => updateField('feels', e.target.value)}
            placeholder="• Ansiedade com prazos apertados&#10;• Frustração com retrabalho&#10;• Alívio quando o relatório bate"
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>
      </div>

      {/* Bottom 2 Columns: Pains vs Gains */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pains */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[220px]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Frown className="w-3.5 h-3.5" /> Dores & Obstáculos (Pains)
            </label>
            <span className="text-[10px] text-zinc-500">O que atrapalha ou machuca</span>
          </div>
          <textarea
            value={data.pains || ''}
            onChange={(e) => updateField('pains', e.target.value)}
            placeholder="• Perda de dados em planilhas não sincronizadas&#10;• Dificuldade de justificar decisões de produto para stakeholders"
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>

        {/* Gains */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[220px]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Ganhos & Sucesso (Gains)
            </label>
            <span className="text-[10px] text-zinc-500">O que significa vitória</span>
          </div>
          <textarea
            value={data.gains || ''}
            onChange={(e) => updateField('gains', e.target.value)}
            placeholder="• Decisões com 100% de evidência e segurança&#10;• Economia de 8 horas semanais em reuniões de alinhamento"
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>
      </div>
    </div>
  );
};
