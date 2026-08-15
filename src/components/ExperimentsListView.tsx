import React, { useState } from 'react';
import { Experiment, ExperimentStatus, ExperimentResult, Hypothesis, ToastMessage } from '../types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { PageHeader } from './ui/PageHeader';
import { LoadingState } from './ui/LoadingState';
import { ErrorState } from './ui/ErrorState';
import { EmptyState } from './ui/EmptyState';
import { Button } from './ui/Button';
import { TestTube, Plus, Search, Filter, AlertCircle, Save, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface ExperimentsListViewProps {
  experiments: Experiment[];
  hypotheses: Hypothesis[];
  loading: boolean;
  error: string | null;
  fetchExperiments: () => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  activeWorkspaceId: string;
  initialHypothesisIdFilter?: string | null;
}

export function ExperimentsListView({
  experiments,
  hypotheses,
  loading,
  error,
  fetchExperiments,
  showToast,
  activeWorkspaceId,
  initialHypothesisIdFilter,
}: ExperimentsListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hypothesisFilter, setHypothesisFilter] = useState<string>(initialHypothesisIdFilter || 'all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state
  const [selectedHypothesisId, setSelectedHypothesisId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [method, setMethod] = useState('');
  const [successCriteria, setSuccessCriteria] = useState('');
  
  // Edit/Lifecycle state
  const [editingExperimentId, setEditingExperimentId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<ExperimentStatus>('draft');
  const [editResult, setEditResult] = useState<ExperimentResult | ''>('');
  const [editLearning, setEditLearning] = useState('');

  const handleCreateExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedHypothesisId) {
      setFormError('Selecione uma hipótese relacionada.');
      return;
    }

    if (!title.trim() || !description.trim() || !method.trim() || !successCriteria.trim()) {
      setFormError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/experiments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': activeWorkspaceId,
        },
        body: JSON.stringify({
          hypothesis_id: selectedHypothesisId,
          title: title.trim(),
          description: description.trim(),
          method: method.trim(),
          success_criteria: successCriteria.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar experimento');
      }

      showToast('Experimento Criado', 'Experimento registrado com sucesso!', 'success');
      setIsFormOpen(false);
      setTitle('');
      setDescription('');
      setMethod('');
      setSuccessCriteria('');
      setSelectedHypothesisId('');
      fetchExperiments();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (expId: string, newStatus: ExperimentStatus, finalResult?: ExperimentResult, finalLearning?: string) => {
    try {
      const body: any = { status: newStatus };
      if (newStatus === 'completed') {
        body.result = finalResult;
        body.learning = finalLearning;
      }

      const response = await fetch(`/api/experiments/${expId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': activeWorkspaceId,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao atualizar experimento');
      }

      showToast('Status Atualizado', 'Experimento atualizado com sucesso.', 'success');
      setEditingExperimentId(null);
      fetchExperiments();
    } catch (err: any) {
      showToast('Erro', err.message, 'error');
    }
  };

  const selectedHyp = hypotheses.find((h) => h.id === selectedHypothesisId);

  const filteredExperiments = experiments.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesHypothesis = hypothesisFilter === 'all' || e.hypothesis_id === hypothesisFilter;
    return matchesSearch && matchesStatus && matchesHypothesis;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Experimentos (Descoberta & Validação)"
        description="Testes estruturados para validar hipóteses de forma prática e mensurável."
        badge={
          <Badge variant="emerald" icon={<TestTube className="w-3.5 h-3.5" />}>
            Validation Engine
          </Badge>
        }
        actions={
          <Button onClick={() => {
              if (initialHypothesisIdFilter) setSelectedHypothesisId(initialHypothesisIdFilter);
              setIsFormOpen(true);
            }} 
            icon={<Plus className="w-4 h-4" />}>
            Novo Experimento
          </Button>
        }
      />

      {isFormOpen && (
        <Card className="border-emerald-500/30 bg-neutral-900/90 space-y-4 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <TestTube className="w-4 h-4 text-emerald-400" />
              <span>Desenhar Novo Experimento</span>
            </h3>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-neutral-400 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          {formError && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateExperiment} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                <span>Hipótese Relacionada *</span>
              </label>

              {hypotheses.length === 0 ? (
                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3.5 text-xs text-neutral-400 space-y-2">
                  <p>Nenhuma Hipótese cadastrada neste workspace. É necessário ter uma hipótese para criar um experimento.</p>
                </div>
              ) : (
                <select
                  value={selectedHypothesisId}
                  onChange={(e) => setSelectedHypothesisId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                >
                  <option value="" disabled>-- Selecione a Hipótese --</option>
                  {hypotheses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.statement.substring(0, 100)}...
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedHyp && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3.5 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                  Contexto da Hipótese Selecionada
                </span>
                <p className="text-xs text-white leading-relaxed">{selectedHyp.statement}</p>
                <div className="text-[11px] text-indigo-300 mt-2">
                  <strong>Métrica Alvo:</strong> {selectedHyp.metric_target}
                </div>
              </div>
            )}

            <div className="space-y-4 pt-2 border-t border-neutral-800">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-neutral-300">
                  Título do Experimento <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Teste A/B no Fluxo de Onboarding"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-neutral-300">
                  Descrição <span className="text-emerald-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="O que exatamente vamos testar e qual o escopo?"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-neutral-300">
                  Método / Como vamos testar? <span className="text-emerald-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  placeholder="Ex: Entrevista com 5 usuários, Teste A/B com 50% do tráfego, Fake Door..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-neutral-300">
                  Critério de Sucesso <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  value={successCriteria}
                  onChange={(e) => setSuccessCriteria(e.target.value)}
                  placeholder="Ex: Atingir 15% de conversão na variação B"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={submitting}
                disabled={!selectedHypothesisId || !title.trim() || !description.trim() || !method.trim() || !successCriteria.trim()}
                icon={<Save className="w-3.5 h-3.5" />}
              >
                Criar Experimento
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar experimentos..."
            className="w-full pl-8 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-neutral-500" />
          <select
            value={hypothesisFilter}
            onChange={(e) => setHypothesisFilter(e.target.value)}
            className="w-full sm:w-48 px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer truncate"
          >
            <option value="all">Todas as Hipóteses</option>
            {hypotheses.map(h => (
              <option key={h.id} value={h.id}>{h.statement.substring(0, 50)}...</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="all">Todos ({experiments.length})</option>
            <option value="draft">Rascunho</option>
            <option value="running">Em Execução</option>
            <option value="completed">Concluídos</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingState message="Carregando experimentos..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchExperiments} />
      ) : filteredExperiments.length === 0 ? (
        <EmptyState
          icon={<TestTube className="w-6 h-6" />}
          title="Nenhum experimento encontrado"
          description="Crie experimentos para validar suas hipóteses no mundo real."
          action={{
            label: 'Novo Experimento',
            onClick: () => setIsFormOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredExperiments.map((e) => (
            <Card key={e.id} className="space-y-4 border-neutral-800">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={
                        e.status === 'completed'
                          ? 'emerald'
                          : e.status === 'running'
                          ? 'amber'
                          : e.status === 'cancelled'
                          ? 'rose'
                          : 'neutral'
                      }
                    >
                      {e.status === 'draft' ? 'Rascunho' : e.status === 'running' ? 'Em Execução' : e.status === 'completed' ? 'Concluído' : 'Cancelado'}
                    </Badge>
                    {e.status === 'completed' && e.result && (
                      <Badge variant={e.result === 'confirmed' ? 'emerald' : e.result === 'rejected' ? 'rose' : 'neutral'}>
                        {e.result === 'confirmed' ? 'Hipótese Confirmada' : e.result === 'partially_confirmed' ? 'Parcialmente Confirmada' : e.result === 'rejected' ? 'Rejeitada' : 'Inconclusivo'}
                      </Badge>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">{e.title}</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">{e.description}</p>
                </div>

                <div className="flex-shrink-0">
                  {e.status === 'draft' && (
                    <Button size="sm" onClick={() => handleUpdateStatus(e.id, 'running')} icon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Iniciar Execução
                    </Button>
                  )}
                  {e.status === 'running' && editingExperimentId !== e.id && (
                    <Button size="sm" variant="primary" onClick={() => {
                        setEditingExperimentId(e.id);
                        setEditStatus('completed');
                        setEditResult('');
                        setEditLearning('');
                      }} icon={<CheckCircle className="w-3.5 h-3.5" />}>
                      Concluir Experimento
                    </Button>
                  )}
                </div>
              </div>

              {/* Concluir Experimento Formulário Inline */}
              {editingExperimentId === e.id && (
                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 space-y-4 animate-fadeIn">
                  <h5 className="text-xs font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> Registrar Resultados
                  </h5>
                  
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-neutral-300">
                      Resultado do Teste <span className="text-emerald-400">*</span>
                    </label>
                    <select
                      value={editResult}
                      onChange={(ev) => setEditResult(ev.target.value as ExperimentResult)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                    >
                      <option value="" disabled>-- Selecione o Resultado --</option>
                      <option value="confirmed">Confirmado (Sucesso absoluto)</option>
                      <option value="partially_confirmed">Parcialmente Confirmado</option>
                      <option value="rejected">Rejeitado (Falhou)</option>
                      <option value="inconclusive">Inconclusivo</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-neutral-300">
                      Aprendizados <span className="text-emerald-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={editLearning}
                      onChange={(ev) => setEditLearning(ev.target.value)}
                      placeholder="O que aprendemos com este experimento?"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditingExperimentId(null)}>
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={!editResult || !editLearning.trim()}
                      onClick={() => handleUpdateStatus(e.id, 'completed', editResult as ExperimentResult, editLearning)}
                    >
                      Salvar Conclusão
                    </Button>
                  </div>
                </div>
              )}

              {/* Informações Read-Only adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-950/50 p-3 rounded-lg border border-neutral-800/50">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Método</span>
                  <p className="text-xs text-neutral-300">{e.method}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Critério de Sucesso</span>
                  <p className="text-xs text-emerald-300/80">{e.success_criteria}</p>
                </div>
              </div>

              {e.status === 'completed' && e.learning && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg space-y-1">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Aprendizados Capturados</span>
                  <p className="text-xs text-white leading-relaxed">{e.learning}</p>
                </div>
              )}

              {e.hypothesis_statement && (
                <div className="text-[10px] text-neutral-500 pt-2 border-t border-neutral-800">
                  <span className="font-semibold text-neutral-400">Origem:</span> Hipótese "{e.hypothesis_statement.substring(0, 80)}..."
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
