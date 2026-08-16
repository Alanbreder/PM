import React, { useState, useEffect } from 'react';
import { Evidence } from '../types';
import { apiFetch } from '../lib/api';
import { FileText, Plus, Tag, AlertCircle } from 'lucide-react';

interface EvidenceViewProps {
  workspaceId: string;
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({ workspaceId }) => {
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvidences = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/evidences', {}, workspaceId);
      setEvidences(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar evidências');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) loadEvidences();
  }, [workspaceId]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Banco de Evidências Rastreáveis
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Evidências extraídas de pesquisas e feedbacks. Servem como suporte factual para validar problemas.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Carregando evidências...</div>
      ) : evidences.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">Nenhuma evidência encontrada</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Gere pesquisas na Etapa 1 e aprove as análises de IA para alimentar o repositório de evidências.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evidences.map((ev) => (
            <div key={ev.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-semibold text-indigo-400">Fonte: {ev.source || 'Pesquisa'}</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/20">
                  Pontuação de Impacto: {ev.impact_score}/5
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
                "{ev.content}"
              </p>
              {ev.tags && ev.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {ev.tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      <Tag className="w-2.5 h-2.5 text-slate-400" /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
