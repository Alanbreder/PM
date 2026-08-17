import React from 'react';
import { FlaskConical, Target, CheckCircle2, Clock, FileSearch, Sparkles } from 'lucide-react';

interface ExperimentCanvasToolProps {
  data: {
    hypothesis?: string;
    assumption?: string;
    target_user?: string;
    problem?: string;
    experiment_type?: string;
    success_criteria?: string;
    expected_result?: string;
    evidence_needed?: string;
    timebox?: string;
    result?: string;
    learning?: string;
    decision?: string;
  };
  onChange: (newData: any) => void;
}

export const ExperimentCanvasTool: React.FC<ExperimentCanvasToolProps> = ({ data, onChange }) => {
  const updateField = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Hypothesis & Premise */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
            <FlaskConical className="w-4 h-4" />
            Desenho de Experimento & Validação de Hipótese
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Estratégia de Validação Rápida</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-military-400" /> Hipótese Central (If / Then)
            </label>
            <textarea
              value={data.hypothesis || ''}
              onChange={(e) => updateField('hypothesis', e.target.value)}
              placeholder="Se implementarmos [solução], os usuários [comportamento esperado] porque [motivo]..."
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-600 outline-none resize-none leading-relaxed font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileSearch className="w-3.5 h-3.5 text-amber-400" /> Premissa Mais Arriscada (Riskiest Assumption)
            </label>
            <textarea
              value={data.assumption || ''}
              onChange={(e) => updateField('assumption', e.target.value)}
              placeholder="O que precisa ser verdade para esta hipótese não falhar?"
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-600 outline-none resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Protocol Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
            Tipo de Teste / Metodologia
          </label>
          <select
            value={data.experiment_type || 'Teste A/B'}
            onChange={(e) => updateField('experiment_type', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-2.5 text-xs text-zinc-200 outline-none"
          >
            <option value="Teste A/B">Teste A/B com divisão de tráfego</option>
            <option value="Fake Door / Smoke Test">Fake Door / Smoke Test (Botão fantasma)</option>
            <option value="Entrevistas de Usabilidade">Entrevistas de Usabilidade com Protótipo</option>
            <option value="Concierge / Mágico de Oz">Concierge / Mágico de Oz (Operação manual)</option>
            <option value="Pesquisa Quantitativa">Pesquisa Quantitativa com Clientes</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
            Público / Amostra Alvo
          </label>
          <input
            type="text"
            value={data.target_user || ''}
            onChange={(e) => updateField('target_user', e.target.value)}
            placeholder="Ex: 50% dos novos usuários (min. 1.000 sessões)"
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-2.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-sky-400" /> Timebox / Duração do Teste
          </label>
          <input
            type="text"
            value={data.timebox || ''}
            onChange={(e) => updateField('timebox', e.target.value)}
            placeholder="Ex: 14 dias corridos (2 sprints)"
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-2.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none"
          />
        </div>
      </div>

      {/* Success Metrics vs Evidence Needed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[240px]">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            Critério de Sucesso Quantitativo
          </div>
          <p className="text-[11px] text-zinc-400 mb-2">
            Qual número ou métrica valida ou invalida a hipótese?
          </p>
          <textarea
            value={data.success_criteria || ''}
            onChange={(e) => updateField('success_criteria', e.target.value)}
            placeholder="Ex: Taxa de conversão final crescer no mínimo +15% com significância estatística (p < 0.05)..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[240px]">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <FileSearch className="w-4 h-4" />
            Evidências & Dados a Coletar
          </div>
          <p className="text-[11px] text-zinc-400 mb-2">
            Quais logs, eventos ou feedbacks qualitativos serão registrados?
          </p>
          <textarea
            value={data.evidence_needed || ''}
            onChange={(e) => updateField('evidence_needed', e.target.value)}
            placeholder="Ex: Eventos 'button_clicked', 'step_completed', gravações de sessão no Hotjar..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-sky-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>
      </div>

      {/* Execution Results & Decisions */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-military-400" />
            Resultados Obtidos & Aprendizados (Pós-Execução)
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Decisão:</span>
            <select
              value={data.decision || 'pending'}
              onChange={(e) => updateField('decision', e.target.value)}
              className="bg-zinc-950 text-xs font-bold text-zinc-200 border border-zinc-800 rounded px-2.5 py-1 outline-none"
            >
              <option value="pending">Pendente / Em Teste</option>
              <option value="accepted">Aprovado (Validado)</option>
              <option value="rejected">Rejeitado (Invalidado)</option>
              <option value="pivoted">Pivotado (Novo Teste)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Resultado Concreto dos Dados
            </label>
            <textarea
              value={data.result || ''}
              onChange={(e) => updateField('result', e.target.value)}
              placeholder="Ex: Variante B superou o controle em +28% de conversão com 99% de confiança estatística..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Aprendizado Principal & Próximos Passos
            </label>
            <textarea
              value={data.learning || ''}
              onChange={(e) => updateField('learning', e.target.value)}
              placeholder="O que descobrimos sobre o comportamento do usuário e o que faremos a seguir?"
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
