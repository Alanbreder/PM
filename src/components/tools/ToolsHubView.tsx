import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Search,
  Plus,
  Compass,
  Target,
  Sparkles,
  Layers,
  FileText,
  Sliders,
  CheckCircle2,
  Trash2,
  Copy,
  ExternalLink,
  Link2,
  Calendar,
  LayoutGrid,
} from 'lucide-react';
import { ToolKey, ToolCategory, CanvasInstance } from '../../types/tools';
import { apiFetch } from '../../lib/api';

interface ToolsHubViewProps {
  workspaceId: string;
  onSelectTool: (toolKey: ToolKey, canvasId?: string) => void;
}

interface ToolDefinition {
  key: ToolKey;
  name: string;
  description: string;
  category: ToolCategory;
  recommendedFor: string;
  tags: string[];
}

const TOOLS_CATALOG: ToolDefinition[] = [
  // 1. Descoberta & Usuários
  {
    key: 'personas',
    name: 'Personas & Arquétipos',
    description: 'Mapeamento profundo de perfis de usuário, dores, objetivos, hábitos e jobs.',
    category: 'discovery',
    recommendedFor: 'Alinhar quem é o cliente com todo o time',
    tags: ['persona', 'usuario', 'perfil', 'pesquisa'],
  },
  {
    key: 'empathy_map',
    name: 'Mapa de Empatia',
    description: 'Dave Gray framework: o que o usuário Diz, Pensa, Faz, Sente, Dores e Ganhos.',
    category: 'discovery',
    recommendedFor: 'Mapear a perspectiva e sentimentos do usuário',
    tags: ['empatia', 'diz', 'pensa', 'sente', 'dores', 'ganhos'],
  },
  {
    key: 'user_journey_map',
    name: 'User Journey Map',
    description: 'Jornada passo a passo do usuário com sentimentos, ações e pontos de fricção.',
    category: 'discovery',
    recommendedFor: 'Descobrir gargalos e dores em fluxos',
    tags: ['jornada', 'etapas', 'experiencia', 'dor'],
  },
  {
    key: 'jtbd',
    name: 'Jobs To Be Done',
    description: 'Clayton Christensen framework: dimensões funcional, emocional e social.',
    category: 'discovery',
    recommendedFor: 'Entender a real motivação de compra e uso',
    tags: ['jtbd', 'necessidade', 'progresso', 'motivo'],
  },
  {
    key: 'problem_statement',
    name: 'Problem Statement',
    description: 'Declaração formal do problema com evidência, gravidade, frequência e custo.',
    category: 'discovery',
    recommendedFor: 'Evitar soluções sem problema real',
    tags: ['problema', 'evidencia', 'dor', 'gravidade'],
  },

  // 2. Estratégia & Modelo
  {
    key: 'product_vision_board',
    name: 'Product Vision Board',
    description: 'Roman Pichler board: visão de longo prazo, público, necessidades e produto.',
    category: 'strategy',
    recommendedFor: 'Definir a Estrela Guia e propósito do produto',
    tags: ['visao', 'estrategia', 'proposito', 'pichler'],
  },
  {
    key: 'product_strategy',
    name: 'Estratégia de Produto',
    description: 'Visão, mercado-alvo, problema, apostas estratégicas, diferenciais e métricas.',
    category: 'strategy',
    recommendedFor: 'Alinhar diferenciais e apostas de mercado',
    tags: ['estrategia', 'apostas', 'diferenciais', 'metricas', 'mercado'],
  },
  {
    key: 'product_canvas',
    name: 'Product Canvas',
    description: 'Visão holística combinando estratégia, personas, métricas e escopo de release.',
    category: 'strategy',
    recommendedFor: 'Planejar lançamentos com clareza total',
    tags: ['canvas', 'visao', 'release', 'kpis'],
  },
  {
    key: 'lean_canvas',
    name: 'Lean Canvas',
    description: 'Ash Maurya 9-box canvas para modelo de negócio ágil e proposta única de valor.',
    category: 'strategy',
    recommendedFor: 'Validar viabilidade de novos produtos',
    tags: ['lean', 'negocio', 'proposta', 'canais'],
  },
  {
    key: 'value_proposition_canvas',
    name: 'Value Proposition Canvas',
    description: 'Encaixe de produto-mercado: mapeie Customer Profile com seu Value Map.',
    category: 'strategy',
    recommendedFor: 'Garantir Product-Market Fit e proposta clara',
    tags: ['valor', 'pmf', 'diferencial', 'aliviadores'],
  },

  // 3. Priorização & Validação
  {
    key: 'opportunity_solution_tree',
    name: 'Opportunity Solution Tree',
    description: 'Teresa Torres tree: conecte Desired Outcome a Oportunidades, Soluções e Testes.',
    category: 'prioritization',
    recommendedFor: 'Continuous Discovery estruturado',
    tags: ['ost', 'teresa torres', 'oportunidade', 'experimento'],
  },
  {
    key: 'rice_prioritization',
    name: 'Priorização RICE',
    description: 'Score quantitativo transparente com Reach, Impact, Confidence e Effort.',
    category: 'prioritization',
    recommendedFor: 'Priorizar backlog com critérios objetivos',
    tags: ['rice', 'score', 'impacto', 'esforco'],
  },
  {
    key: 'impact_effort_matrix',
    name: 'Matriz Impacto x Esforço',
    description: 'Matriz 2x2 para triagem rápida entre Quick Wins e Grandes Apostas.',
    category: 'prioritization',
    recommendedFor: 'Decisões rápidas de sprint e planejamento',
    tags: ['matriz', 'quick win', 'esforco', '2x2'],
  },
  {
    key: 'assumption_map',
    name: 'Assumption Map (Riscos)',
    description: 'Matriz 2x2 de Importância x Incerteza para mapear o que testar antes de codar.',
    category: 'prioritization',
    recommendedFor: 'Reduzir riscos antes de gastar engenharia',
    tags: ['risco', 'premissa', 'incerteza', 'teste'],
  },

  // 4. Execução & Governança
  {
    key: 'experiment_canvas',
    name: 'Experiment Canvas',
    description: 'Desenho de hipóteses (If/Then), testes, critérios de sucesso e aprendizados.',
    category: 'execution',
    recommendedFor: 'Executar testes rigorosos de validação',
    tags: ['experimento', 'teste', 'metrica', 'validacao'],
  },
  {
    key: 'decision_canvas',
    name: 'Decision Canvas (ADR)',
    description: 'Registro de governança de decisões estratégicas, trade-offs e alternativas.',
    category: 'execution',
    recommendedFor: 'Documentar por que decidimos seguir tal rumo',
    tags: ['decisao', 'adr', 'governanca', 'trade-off'],
  },
  {
    key: 'story_map',
    name: 'User Story Mapping',
    description: 'Jeff Patton story mapping: fatie atividades em releases e defina o MVP.',
    category: 'execution',
    recommendedFor: 'Organizar histórias e lançamentos contínuos',
    tags: ['story map', 'mvp', 'release', 'backlog'],
  },
  {
    key: 'prd_canvas',
    name: 'PRD Canvas (Product Requirements)',
    description: 'Documento completo de requisitos, histórias de usuário, regras de negócio e critérios de aceite.',
    category: 'execution',
    recommendedFor: 'Documentar requisitos com clareza para engenharia e design',
    tags: ['prd', 'requisitos', 'criterios', 'historias', 'escopo'],
  },
];

export const ToolsHubView: React.FC<ToolsHubViewProps> = ({ workspaceId, onSelectTool }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>('all');
  const [savedCanvases, setSavedCanvases] = useState<CanvasInstance[]>([]);
  const [loadingCanvases, setLoadingCanvases] = useState(true);

  // Load saved canvases from backend
  const fetchCanvases = async () => {
    try {
      setLoadingCanvases(true);
      const res = await apiFetch('/api/toolkit/canvases', {}, workspaceId);
      if (res.data) {
        setSavedCanvases(res.data);
      }
    } catch (err) {
      console.error('Falha ao carregar canvases:', err);
    } finally {
      setLoadingCanvases(false);
    }
  };

  useEffect(() => {
    fetchCanvases();
  }, [workspaceId]);

  const handleDeleteCanvas = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja excluir este canvas?')) return;
    try {
      await apiFetch(`/api/toolkit/canvases/${id}`, { method: 'DELETE' }, workspaceId);
      setSavedCanvases((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(`Erro ao excluir: ${err.message}`);
    }
  };

  const handleDuplicateCanvas = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await apiFetch(`/api/toolkit/canvases/${id}/duplicate`, { method: 'POST' }, workspaceId);
      if (res.data) {
        fetchCanvases();
      }
    } catch (err: any) {
      alert(`Erro ao duplicar: ${err.message}`);
    }
  };

  // Filter tools catalog
  const filteredTools = TOOLS_CATALOG.filter((tool) => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Top Welcome Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-military-950 border border-military-700/60 rounded-xl text-military-300">
                <Wrench className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
                Product Tools Hub
              </h1>
            </div>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              15 ferramentas especializadas para o dia a dia do Product Manager. Utilize-as de forma
              independente para workshops e discovery rápido, ou conecte-as ao fluxo principal do Product OS
              sem duplicação de dados.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-950/80 px-4 py-2.5 rounded-xl border border-zinc-800 shrink-0">
            <Sparkles className="w-4 h-4 text-military-400" />
            <span>AI Product Coach integrado em todos os canvases</span>
          </div>
        </div>
      </div>

      {/* Saved Canvases Section (If any) */}
      {savedCanvases.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-military-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Meus Canvases & Ferramentas em Andamento ({savedCanvases.length})
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedCanvases.map((canvas) => (
              <div
                key={canvas.id}
                onClick={() => onSelectTool(canvas.tool_key, canvas.id)}
                className="bg-zinc-900 border border-zinc-800 hover:border-military-600/80 p-4 rounded-xl cursor-pointer transition flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                      {canvas.tool_key}
                    </span>
                    {canvas.entity_id ? (
                      <span className="text-[10px] flex items-center gap-1 font-bold text-military-300 bg-military-950/80 border border-military-700/60 px-2 py-0.5 rounded">
                        <Link2 className="w-3 h-3" /> Conectado ao OS
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500 font-medium">Independente</span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-zinc-100 group-hover:text-military-300 transition line-clamp-1 mb-1">
                    {canvas.title}
                  </h3>
                </div>

                <div className="pt-4 mt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(canvas.updated_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleDuplicateCanvas(canvas.id, e)}
                      title="Duplicar canvas"
                      className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteCanvas(canvas.id, e)}
                      title="Excluir canvas"
                      className="p-1.5 hover:bg-rose-950 rounded text-zinc-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Catalog Filters & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === 'all'
                  ? 'bg-military-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Todas (15)
            </button>
            <button
              onClick={() => setActiveCategory('discovery')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === 'discovery'
                  ? 'bg-military-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Descoberta & Usuários
            </button>
            <button
              onClick={() => setActiveCategory('strategy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === 'strategy'
                  ? 'bg-military-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Estratégia & Modelo
            </button>
            <button
              onClick={() => setActiveCategory('prioritization')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === 'prioritization'
                  ? 'bg-military-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Priorização & Validação
            </button>
            <button
              onClick={() => setActiveCategory('execution')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === 'execution'
                  ? 'bg-military-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Execução & Governança
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ferramenta..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-military-500 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none"
            />
          </div>
        </div>

        {/* Tools Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => (
            <div
              key={tool.key}
              onClick={() => onSelectTool(tool.key)}
              className="bg-zinc-900 border border-zinc-800 hover:border-military-600/80 p-5 rounded-2xl cursor-pointer transition flex flex-col justify-between group shadow-sm"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-military-400 bg-military-950/80 px-2 py-0.5 rounded border border-military-800/60">
                    {tool.category === 'discovery'
                      ? 'Descoberta'
                      : tool.category === 'strategy'
                      ? 'Estratégia'
                      : tool.category === 'prioritization'
                      ? 'Priorização'
                      : 'Execução'}
                  </span>
                  <button className="px-2 py-1 bg-zinc-800 hover:bg-military-600 text-zinc-300 hover:text-white rounded-md text-[11px] font-medium flex items-center gap-1 transition">
                    <Plus className="w-3 h-3" /> Abrir
                  </button>
                </div>

                <h3 className="text-sm font-bold text-zinc-100 group-hover:text-military-300 transition">
                  {tool.name}
                </h3>

                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                  {tool.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                <span className="truncate pr-2 italic">{tool.recommendedFor}</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-military-400 transition shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
