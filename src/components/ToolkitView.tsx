import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { LayoutGrid, Save, RefreshCw, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface ToolkitViewProps {
  workspaceId: string;
}

export const ToolkitView: React.FC<ToolkitViewProps> = ({ workspaceId }) => {
  const [activeTool, setActiveTool] = useState<string>('lean_canvas');
  const [canvasData, setCanvasData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const tools = [
    { id: 'lean_canvas', label: 'Lean Canvas' },
    { id: 'opportunity_solution_tree', label: 'Opportunity Solution Tree (OST)' },
    { id: 'customer_journey_map', label: 'Customer Journey Map' },
    { id: 'empathy_map', label: 'Mapa de Empatia' },
    { id: 'value_proposition_canvas', label: 'Value Proposition Canvas' },
    { id: 'swot_analysis', label: 'Matriz SWOT' },
  ];

  const loadCanvas = async (toolKey: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/toolkit/canvases/${toolKey}`, {}, workspaceId);
      if (res.data && res.data.canvas_data) {
        setCanvasData(res.data.canvas_data);
      } else {
        setCanvasData(getDefaultCanvasData(toolKey));
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar canvas');
      setCanvasData(getDefaultCanvasData(toolKey));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId && activeTool) loadCanvas(activeTool);
  }, [workspaceId, activeTool]);

  const getDefaultCanvasData = (toolKey: string) => {
    if (toolKey === 'lean_canvas') {
      return {
        problem: '1. Principais problemas enfrentados pelo cliente no setup',
        solution: '2. As 3 principais funcionalidades da solução',
        unique_value: '3. Proposta Única de Valor simples e clara',
        unfair_advantage: '4. Vantagem competitiva não facilmente copiável',
        customer_segments: '5. Segmentos de clientes e early adopters',
        key_metrics: '6. Métricas-chave de engajamento e retenção',
        channels: '7. Canais de aquisição e distribuição',
        cost_structure: '8. Estrutura de custos operacionais',
        revenue_streams: '9. Fontes de receita e precificação',
      };
    } else if (toolKey === 'swot_analysis') {
      return {
        strengths: 'Forças internas do produto',
        weaknesses: 'Fraquezas internas a melhorar',
        opportunities: 'Oportunidades de mercado',
        threats: 'Ameaças e concorrência externa',
      };
    }
    return { section_1: 'Conteúdo do Canvas' };
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSavedSuccess(false);
    try {
      await apiFetch(
        '/api/toolkit/canvases',
        {
          method: 'POST',
          body: JSON.stringify({
            tool_key: activeTool,
            title: tools.find((t) => t.id === activeTool)?.label || activeTool,
            canvas_data: canvasData,
          }),
        },
        workspaceId
      );
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar canvas');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setCanvasData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-indigo-400" />
            Product Toolkit & Canvases Interativos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Frameworks e ferramentas de ideação para estruturação estratégica do produto.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" /> Canvas salvo!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar Canvas'}
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTool(t.id)}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition whitespace-nowrap ${
              activeTool === t.id
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Carregando canvas do toolkit...</div>
      ) : activeTool === 'lean_canvas' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-950 p-4 border border-slate-800 rounded-xl">
          <div className="md:col-span-1 space-y-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] font-bold text-rose-400 uppercase">Problema</span>
            <textarea
              value={canvasData.problem || ''}
              onChange={(e) => handleFieldChange('problem', e.target.value)}
              rows={8}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white outline-none resize-none"
            />
          </div>
          <div className="md:col-span-1 space-y-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] font-bold text-indigo-400 uppercase">Solução</span>
            <textarea
              value={canvasData.solution || ''}
              onChange={(e) => handleFieldChange('solution', e.target.value)}
              rows={8}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white outline-none resize-none"
            />
          </div>
          <div className="md:col-span-1 space-y-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] font-bold text-amber-400 uppercase">Proposta Única de Valor</span>
            <textarea
              value={canvasData.unique_value || ''}
              onChange={(e) => handleFieldChange('unique_value', e.target.value)}
              rows={8}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white outline-none resize-none"
            />
          </div>
          <div className="md:col-span-1 space-y-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] font-bold text-cyan-400 uppercase">Vantagem Injusta</span>
            <textarea
              value={canvasData.unfair_advantage || ''}
              onChange={(e) => handleFieldChange('unfair_advantage', e.target.value)}
              rows={8}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white outline-none resize-none"
            />
          </div>
          <div className="md:col-span-1 space-y-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] font-bold text-emerald-400 uppercase">Segmentos de Clientes</span>
            <textarea
              value={canvasData.customer_segments || ''}
              onChange={(e) => handleFieldChange('customer_segments', e.target.value)}
              rows={8}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white outline-none resize-none"
            />
          </div>
        </div>
      ) : activeTool === 'swot_analysis' ? (
        <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 border border-slate-800 rounded-xl">
          <div className="space-y-2 bg-slate-900 p-4 rounded-lg border border-slate-800">
            <span className="text-xs font-bold text-emerald-400 uppercase">Forças (Strengths)</span>
            <textarea
              value={canvasData.strengths || ''}
              onChange={(e) => handleFieldChange('strengths', e.target.value)}
              rows={6}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-xs text-white outline-none"
            />
          </div>
          <div className="space-y-2 bg-slate-900 p-4 rounded-lg border border-slate-800">
            <span className="text-xs font-bold text-rose-400 uppercase">Fraquezas (Weaknesses)</span>
            <textarea
              value={canvasData.weaknesses || ''}
              onChange={(e) => handleFieldChange('weaknesses', e.target.value)}
              rows={6}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-xs text-white outline-none"
            />
          </div>
          <div className="space-y-2 bg-slate-900 p-4 rounded-lg border border-slate-800">
            <span className="text-xs font-bold text-indigo-400 uppercase">Oportunidades (Opportunities)</span>
            <textarea
              value={canvasData.opportunities || ''}
              onChange={(e) => handleFieldChange('opportunities', e.target.value)}
              rows={6}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-xs text-white outline-none"
            />
          </div>
          <div className="space-y-2 bg-slate-900 p-4 rounded-lg border border-slate-800">
            <span className="text-xs font-bold text-amber-400 uppercase">Ameaças (Threats)</span>
            <textarea
              value={canvasData.threats || ''}
              onChange={(e) => handleFieldChange('threats', e.target.value)}
              rows={6}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-xs text-white outline-none"
            />
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase">
            {tools.find((t) => t.id === activeTool)?.label}
          </span>
          <textarea
            value={canvasData.section_1 || ''}
            onChange={(e) => handleFieldChange('section_1', e.target.value)}
            rows={12}
            placeholder="Digite os elementos e mapas deste canvas..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-white outline-none font-mono"
          />
        </div>
      )}
    </div>
  );
};
