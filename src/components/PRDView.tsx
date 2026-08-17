import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { FileText, Plus, AlertCircle, CheckCircle2, ListChecks, Code2, Tag, Compass } from 'lucide-react';

interface PRDViewProps {
  workspaceId: string;
}

export const PRDView: React.FC<PRDViewProps> = ({ workspaceId }) => {
  const [prds, setPrds] = useState<any[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedPrd, setSelectedPrd] = useState<any | null>(null);

  // PRD Form
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [roadmapItemId, setRoadmapItemId] = useState('');

  // User Story Form Builder inside PRD
  const [asA, setAsA] = useState('Desenvolvedor');
  const [iWant, setIWant] = useState('');
  const [soThat, setSoThat] = useState('');
  const [criteriaInput, setCriteriaInput] = useState('');

  const [goalsInput, setGoalsInput] = useState('');
  const [dodInput, setDodInput] = useState('');
  const [techNotes, setTechNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prdRes, roadRes] = await Promise.all([
        apiFetch('/api/prds', {}, workspaceId),
        apiFetch('/api/roadmap', {}, workspaceId),
      ]);
      setPrds(prdRes.data || []);
      setRoadmapItems(roadRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar PRDs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) loadData();
  }, [workspaceId]);

  const handleCreatePrd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userStories = iWant ? [{
        id: 'us_' + Date.now(),
        asA,
        iWant,
        soThat,
        acceptanceCriteria: criteriaInput.split('\n').filter((l) => l.trim()),
        status: 'ready',
      }] : [];

      await apiFetch(
        '/api/prds',
        {
          method: 'POST',
          body: JSON.stringify({
            roadmap_item_id: roadmapItemId || undefined,
            title,
            summary,
            problem_statement: problemStatement,
            goals: goalsInput.split('\n').filter((l) => l.trim()),
            user_stories: userStories,
            technical_notes: techNotes,
            definition_of_done: dodInput.split('\n').filter((l) => l.trim()),
            status: 'draft',
          }),
        },
        workspaceId
      );
      setShowModal(false);
      setTitle('');
      setSummary('');
      setIWant('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar PRD');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-military-400" />
            Especificações de Produto (PRDs & User Stories)
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Transforme itens do Roadmap em especificações técnicas acionáveis com Histórias de Usuário e Critérios de Aceite.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg transition flex items-center gap-2 shadow"
        >
          <Plus className="w-4 h-4" /> Escrever Nova PRD
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-zinc-400 text-sm">Carregando PRDs e histórias...</div>
      ) : prds.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-12 text-center">
          <FileText className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Nenhuma PRD Especificada</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
            Documente a especificação funcional para alinhar engenharia, design e produto.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow"
          >
            Criar Primeira PRD
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* List Sidebar */}
          <div className="space-y-3 md:col-span-1">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Documentos PRD</h3>
            {prds.map((prd) => (
              <div
                key={prd.id}
                onClick={() => setSelectedPrd(prd)}
                className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
                  selectedPrd?.id === prd.id
                    ? 'bg-zinc-800 border-military-500 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] bg-military-900/80 text-military-300 border border-military-700/50 rounded font-mono font-semibold uppercase">
                    v{prd.version || 1} • {prd.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-zinc-100">{prd.title}</h4>
                {prd.roadmap_title && (
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-military-400" /> {prd.roadmap_title}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* PRD Content View */}
          <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            {!selectedPrd && prds.length > 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs">
                Selecione uma PRD da lista para visualizar todos os detalhes.
              </div>
            ) : selectedPrd ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 text-[10px] bg-military-900/80 text-military-300 border border-military-700/50 rounded font-mono font-bold uppercase">
                      {selectedPrd.status}
                    </span>
                    {selectedPrd.roadmap_title && (
                      <span className="text-xs text-military-300 font-medium flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5" /> Item: {selectedPrd.roadmap_title}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-zinc-100">{selectedPrd.title}</h2>
                  <p className="text-xs text-zinc-300 mt-2">{selectedPrd.summary}</p>
                </div>

                {/* Problem Statement */}
                {selectedPrd.problem_statement && (
                  <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700/50 space-y-1">
                    <h4 className="text-xs font-bold text-military-300 uppercase">Problema Resolver</h4>
                    <p className="text-xs text-zinc-200">{selectedPrd.problem_statement}</p>
                  </div>
                )}

                {/* User Stories */}
                {selectedPrd.user_stories && selectedPrd.user_stories.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-emerald-400" /> User Stories & Critérios de Aceite
                    </h4>
                    {selectedPrd.user_stories.map((us: any, idx: number) => (
                      <div key={idx} className="bg-zinc-800/80 p-4 rounded-lg border border-zinc-700 space-y-2">
                        <div className="text-xs text-zinc-100">
                          Como <strong>{us.asA}</strong>, eu quero <strong>{us.iWant}</strong> para que <strong>{us.soThat}</strong>.
                        </div>
                        {us.acceptanceCriteria && us.acceptanceCriteria.length > 0 && (
                          <div className="pl-3 border-l-2 border-emerald-500/50 space-y-1 pt-1">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase">Critérios de Aceite</span>
                            <ul className="space-y-0.5">
                              {us.acceptanceCriteria.map((ac: string, acIdx: number) => (
                                <li key={acIdx} className="text-[11px] text-zinc-300 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> {ac}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Technical Notes */}
                {selectedPrd.technical_notes && (
                  <div className="space-y-1 pt-2 border-t border-zinc-800">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-military-400" /> Requisitos & Anotações Técnicas
                    </h4>
                    <p className="text-xs text-zinc-300 font-mono bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                      {selectedPrd.technical_notes}
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* New PRD Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-xl w-full text-zinc-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-zinc-100 mb-4">Nova Especificação PRD</h3>
            <form onSubmit={handleCreatePrd} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Título da PRD</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: PRD — Validador de Credenciais e Webhooks"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Vincular Item do Roadmap (Opcional)</label>
                <select
                  value={roadmapItemId}
                  onChange={(e) => setRoadmapItemId(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                >
                  <option value="">-- Sem vínculo explícito --</option>
                  {roadmapItems.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.timeframe})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Resumo Executivo</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={2}
                  placeholder="Objetivo principal e o que será entregue neste escopo..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                />
              </div>

              {/* User Story builder */}
              <div className="bg-zinc-800/60 p-3.5 rounded-lg border border-zinc-700/50 space-y-3">
                <span className="text-xs font-bold text-emerald-400 block uppercase">História de Usuário (User Story)</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-300 mb-1">Como (Persona)</label>
                    <input
                      type="text"
                      value={asA}
                      onChange={(e) => setAsA(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-300 mb-1">Eu Quero (Ação)</label>
                    <input
                      type="text"
                      value={iWant}
                      onChange={(e) => setIWant(e.target.value)}
                      placeholder="validar minha chave de API"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-300 mb-1">Para Que (Benefício)</label>
                    <input
                      type="text"
                      value={soThat}
                      onChange={(e) => setSoThat(e.target.value)}
                      placeholder="eu evite erros de envio"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-300 mb-1">Critérios de Aceite (1 por linha)</label>
                  <textarea
                    value={criteriaInput}
                    onChange={(e) => setCriteriaInput(e.target.value)}
                    rows={2}
                    placeholder="Feedback verde para chave válida&#10;Mensagem legível em caso de erro"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Notas Técnicas & APIs</label>
                <textarea
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  rows={2}
                  placeholder="Rate limit, endpoints, componentes envolvidos..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow"
                >
                  Salvar PRD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
