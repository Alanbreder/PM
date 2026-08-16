import React, { useState, useEffect } from 'react';
import { Opportunity } from '../types';
import { apiFetch } from '../lib/api';
import { Lightbulb, Plus, AlertCircle } from 'lucide-react';

interface OpportunityViewProps {
  workspaceId: string;
}

export const OpportunityView: React.FC<OpportunityViewProps> = ({ workspaceId }) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [effort, setEffort] = useState<'low' | 'medium' | 'high' | 'very_high'>('medium');
  const [value, setValue] = useState<'low' | 'medium' | 'high' | 'transformative'>('medium');
  const [submitting, setSubmitting] = useState(false);

  const loadOpportunities = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/opportunities', {}, workspaceId);
      setOpportunities(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar oportunidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) loadOpportunities();
  }, [workspaceId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setSubmitting(true);
    try {
      await apiFetch(
        '/api/opportunities',
        {
          method: 'POST',
          body: JSON.stringify({ title, description, effort, value }),
        },
        workspaceId
      );
      setShowModal(false);
      setTitle('');
      setDescription('');
      loadOpportunities();
    } catch (err: any) {
      setError(err.message || 'Falha ao criar oportunidade');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-indigo-400" />
            Oportunidades de Produto
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Soluções e direcionamentos estratégicos mapeados para resolver os problemas validados.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Criar Oportunidade
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Carregando oportunidades...</div>
      ) : opportunities.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center">
          <Lightbulb className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">Nenhuma oportunidade registrada</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Mapeie a primeira oportunidade para resolver um problema identificado.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg"
          >
            Criar Oportunidade
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((op) => (
            <div key={op.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">{op.title}</h3>
              <p className="text-xs text-slate-300">{op.description}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span>Valor: <strong className="text-emerald-400">{op.value}</strong></span>
                <span>Esforço: <strong className="text-amber-400">{op.effort}</strong></span>
                <span>Status: <strong className="text-indigo-400">{op.status}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full text-slate-100">
            <h3 className="text-base font-bold text-white mb-4">Nova Oportunidade de Solução</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Checkout de 1-Clique para PIX e Cartão"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Explique como a oportunidade resolve as dores do produto..."
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Valor Gerado</label>
                  <select
                    value={value}
                    onChange={(e) => setValue(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="low">Baixo</option>
                    <option value="medium">Médio</option>
                    <option value="high">Alto</option>
                    <option value="transformative">Transformacional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Esforço Estimado</label>
                  <select
                    value={effort}
                    onChange={(e) => setEffort(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="low">Baixo</option>
                    <option value="medium">Médio</option>
                    <option value="high">Alto</option>
                    <option value="very_high">Muito Alto</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg"
                >
                  Criar Oportunidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
