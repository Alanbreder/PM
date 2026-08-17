import React from 'react';
import { Plus, Trash2, GitBranch, Lightbulb, FlaskConical, Target } from 'lucide-react';

interface ExperimentNode {
  id: string;
  title: string;
  status: 'planned' | 'running' | 'completed';
}

interface SolutionNode {
  id: string;
  title: string;
  experiments: ExperimentNode[];
}

interface OpportunityNode {
  id: string;
  title: string;
  solutions: SolutionNode[];
}

interface OSTToolProps {
  data: {
    desired_outcome?: string;
    opportunities?: OpportunityNode[];
  };
  onChange: (newData: any) => void;
}

export const OSTTool: React.FC<OSTToolProps> = ({ data, onChange }) => {
  const opportunities = data.opportunities || [];

  const updateDesiredOutcome = (val: string) => {
    onChange({
      ...data,
      desired_outcome: val,
    });
  };

  const addOpportunity = () => {
    const newOpp: OpportunityNode = {
      id: `opp_${Date.now()}`,
      title: 'Nova Oportunidade',
      solutions: [
        {
          id: `sol_${Date.now()}_1`,
          title: 'Primeira Solução',
          experiments: [
            { id: `exp_${Date.now()}_1`, title: 'Experimento de Validação', status: 'planned' },
          ],
        },
      ],
    };
    onChange({
      ...data,
      opportunities: [...opportunities, newOpp],
    });
  };

  const removeOpportunity = (oppIndex: number) => {
    const updated = opportunities.filter((_, idx) => idx !== oppIndex);
    onChange({ ...data, opportunities: updated });
  };

  const updateOpportunityTitle = (oppIndex: number, title: string) => {
    const updated = [...opportunities];
    updated[oppIndex].title = title;
    onChange({ ...data, opportunities: updated });
  };

  const addSolution = (oppIndex: number) => {
    const updated = [...opportunities];
    updated[oppIndex].solutions.push({
      id: `sol_${Date.now()}`,
      title: 'Nova Solução Potencial',
      experiments: [
        { id: `exp_${Date.now()}`, title: 'Experimento A/B ou Entrevista', status: 'planned' },
      ],
    });
    onChange({ ...data, opportunities: updated });
  };

  const removeSolution = (oppIndex: number, solIndex: number) => {
    const updated = [...opportunities];
    updated[oppIndex].solutions = updated[oppIndex].solutions.filter((_, idx) => idx !== solIndex);
    onChange({ ...data, opportunities: updated });
  };

  const updateSolutionTitle = (oppIndex: number, solIndex: number, title: string) => {
    const updated = [...opportunities];
    updated[oppIndex].solutions[solIndex].title = title;
    onChange({ ...data, opportunities: updated });
  };

  const addExperiment = (oppIndex: number, solIndex: number) => {
    const updated = [...opportunities];
    updated[oppIndex].solutions[solIndex].experiments.push({
      id: `exp_${Date.now()}`,
      title: 'Novo Experimento Rápido',
      status: 'planned',
    });
    onChange({ ...data, opportunities: updated });
  };

  const removeExperiment = (oppIndex: number, solIndex: number, expIndex: number) => {
    const updated = [...opportunities];
    updated[oppIndex].solutions[solIndex].experiments = updated[oppIndex].solutions[
      solIndex
    ].experiments.filter((_, idx) => idx !== expIndex);
    onChange({ ...data, opportunities: updated });
  };

  const updateExperiment = (
    oppIndex: number,
    solIndex: number,
    expIndex: number,
    field: string,
    val: any
  ) => {
    const updated = [...opportunities];
    (updated[oppIndex].solutions[solIndex].experiments[expIndex] as any)[field] = val;
    onChange({ ...data, opportunities: updated });
  };

  return (
    <div className="space-y-6">
      {/* Root Node: Desired Outcome */}
      <div className="bg-military-950/60 border border-military-700/60 p-5 rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-military-300 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-military-400" />
            Nó Raiz: Resultado Desejado (Desired Outcome / OKR)
          </label>
          <span className="text-[10px] bg-military-900 text-military-200 px-2 py-0.5 rounded border border-military-700 font-mono">
            Teresa Torres Framework
          </span>
        </div>
        <textarea
          value={data.desired_outcome || ''}
          onChange={(e) => updateDesiredOutcome(e.target.value)}
          placeholder="Ex: Aumentar a retenção D30 de novos usuários de 32% para 55% no próximo trimestre..."
          rows={2}
          className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none resize-none leading-relaxed font-semibold"
        />
      </div>

      {/* Opportunities Tree Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-zinc-300 text-xs font-bold uppercase tracking-wider">
          <GitBranch className="w-4 h-4 text-military-400" />
          Ramos da Árvore: Oportunidades → Soluções → Experimentos
        </div>
        <button
          onClick={addOpportunity}
          className="px-3 py-1.5 bg-military-600 hover:bg-military-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar Oportunidade
        </button>
      </div>

      {/* Opportunities List */}
      {opportunities.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-xl p-8 text-center text-zinc-500 space-y-3">
          <GitBranch className="w-8 h-8 mx-auto text-zinc-600" />
          <p className="text-xs">Nenhum ramo de oportunidade adicionado à árvore ainda.</p>
          <button
            onClick={addOpportunity}
            className="px-4 py-2 bg-military-600 hover:bg-military-500 text-white rounded-lg text-xs font-semibold transition inline-flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Primeiro Ramo
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {opportunities.map((opp, oppIdx) => (
            <div
              key={opp.id || oppIdx}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4"
            >
              {/* Opportunity Header */}
              <div className="flex items-start justify-between gap-3 bg-zinc-950/80 p-3.5 rounded-lg border border-zinc-800">
                <div className="flex-1 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-military-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-military-400"></span>
                    Oportunidade (Dor / Desejo do Usuário) #{oppIdx + 1}
                  </div>
                  <input
                    type="text"
                    value={opp.title}
                    onChange={(e) => updateOpportunityTitle(oppIdx, e.target.value)}
                    placeholder="Ex: Usuários acham o processo de importação lento e confuso..."
                    className="w-full bg-transparent text-sm font-bold text-zinc-100 placeholder-zinc-600 outline-none border-b border-transparent focus:border-military-500 pb-0.5"
                  />
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => addSolution(oppIdx)}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded transition flex items-center gap-1 border border-zinc-700"
                    title="Adicionar solução a esta oportunidade"
                  >
                    <Plus className="w-3 h-3" /> Solução
                  </button>
                  <button
                    onClick={() => removeOpportunity(oppIdx)}
                    className="p-1.5 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 rounded transition"
                    title="Excluir oportunidade"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Solutions Grid */}
              <div className="pl-4 border-l-2 border-military-700/50 space-y-4">
                {opp.solutions.map((sol, solIdx) => (
                  <div
                    key={sol.id || solIdx}
                    className="bg-zinc-950 border border-zinc-800/90 rounded-xl p-4 space-y-3"
                  >
                    {/* Solution Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 text-sky-400" />
                          Solução #{solIdx + 1}
                        </div>
                        <input
                          type="text"
                          value={sol.title}
                          onChange={(e) => updateSolutionTitle(oppIdx, solIdx, e.target.value)}
                          placeholder="Ex: Assistente com importador guiado passo a passo..."
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-sky-500 rounded p-2 text-xs font-semibold text-zinc-100 placeholder-zinc-600 outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-1 shrink-0 pt-3">
                        <button
                          onClick={() => addExperiment(oppIdx, solIdx)}
                          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-medium rounded transition flex items-center gap-1 border border-zinc-800"
                          title="Adicionar experimento"
                        >
                          <Plus className="w-3 h-3" /> Experimento
                        </button>
                        <button
                          onClick={() => removeSolution(oppIdx, solIdx)}
                          className="p-1 text-zinc-600 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Experiments List */}
                    <div className="space-y-2 pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                        <FlaskConical className="w-3 h-3" />
                        Experimentos para Testar Premissas
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {sol.experiments.map((exp, expIdx) => (
                          <div
                            key={exp.id || expIdx}
                            className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2.5 space-y-2"
                          >
                            <input
                              type="text"
                              value={exp.title}
                              onChange={(e) =>
                                updateExperiment(oppIdx, solIdx, expIdx, 'title', e.target.value)
                              }
                              placeholder="Nome do teste (ex: Teste A/B, 5 Entrevistas...)"
                              className="w-full bg-transparent text-xs text-zinc-200 placeholder-zinc-600 outline-none border-b border-transparent focus:border-purple-500 pb-0.5"
                            />
                            <div className="flex items-center justify-between pt-1">
                              <select
                                value={exp.status}
                                onChange={(e) =>
                                  updateExperiment(oppIdx, solIdx, expIdx, 'status', e.target.value)
                                }
                                className="bg-zinc-950 text-[10px] text-zinc-300 border border-zinc-800 rounded px-2 py-0.5 outline-none"
                              >
                                <option value="planned">Planejado</option>
                                <option value="running">Em Execução</option>
                                <option value="completed">Concluído</option>
                              </select>
                              <button
                                onClick={() => removeExperiment(oppIdx, solIdx, expIdx)}
                                className="text-zinc-600 hover:text-rose-400 p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
