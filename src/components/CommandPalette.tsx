import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Wrench,
  Layers,
  Sparkles,
  ArrowRight,
  Command,
  Compass,
  Target,
  FileText,
  FlaskConical,
  CheckCircle2,
  MapPin,
  HelpCircle,
  X,
  Users,
  BrainCircuit,
  Calculator,
  TrendingUp,
  Plus,
  Zap,
  LayoutGrid,
  Activity,
  Briefcase
} from 'lucide-react';
import { ToolKey } from '../types/tools';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenTool?: (toolKey: ToolKey) => void;
}

interface PaletteItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Navegar' | 'Criar' | 'Ferramentas de Produto' | 'Ações Rápidas';
  action: () => void;
  icon: React.ReactNode;
  tags?: string[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenTool,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const items: PaletteItem[] = [
    // 1. Navegar
    {
      id: 'nav-dashboard',
      title: 'Product Home / Início',
      subtitle: 'Visão geral executiva, saúde do discovery e próximas ações',
      category: 'Navegar',
      action: () => {
        onNavigateTab('dashboard');
        onClose();
      },
      icon: <Layers className="w-4 h-4 text-military-400" />,
      tags: ['home', 'inicio', 'cockpit', 'dashboard'],
    },
    {
      id: 'nav-strategy',
      title: 'Estratégia & OKRs',
      subtitle: 'Pilares estratégicos e objetivos trimestrais do produto',
      category: 'Navegar',
      action: () => {
        onNavigateTab('strategy');
        onClose();
      },
      icon: <Target className="w-4 h-4 text-emerald-400" />,
      tags: ['okr', 'visao', 'metas', 'pilares'],
    },
    {
      id: 'nav-research',
      title: 'Pesquisas & Descoberta',
      subtitle: 'Entrevistas de clientes, transcrições e anotações de campo',
      category: 'Navegar',
      action: () => {
        onNavigateTab('research');
        onClose();
      },
      icon: <Search className="w-4 h-4 text-sky-400" />,
      tags: ['pesquisa', 'entrevistas', 'discovery', 'notas'],
    },
    {
      id: 'nav-evidence',
      title: 'Evidências & Fatos',
      subtitle: 'Fatos comprovados e dados qualitativos de usuários',
      category: 'Navegar',
      action: () => {
        onNavigateTab('evidence');
        onClose();
      },
      icon: <FileText className="w-4 h-4 text-military-400" />,
      tags: ['fatos', 'quotes', 'citacoes'],
    },
    {
      id: 'nav-personas',
      title: 'Personas & Segmentos',
      subtitle: 'Arquétipos de clientes, jobs to be done e segmentação',
      category: 'Navegar',
      action: () => {
        onNavigateTab('personas');
        onClose();
      },
      icon: <Users className="w-4 h-4 text-indigo-400" />,
      tags: ['persona', 'segmento', 'usuario', 'publico'],
    },
    {
      id: 'nav-problem',
      title: 'Problemas & Dores',
      subtitle: 'Gargalos reais validados com severidade e frequência',
      category: 'Navegar',
      action: () => {
        onNavigateTab('problem');
        onClose();
      },
      icon: <HelpCircle className="w-4 h-4 text-rose-400" />,
      tags: ['dores', 'problemas', 'gargalos'],
    },
    {
      id: 'nav-opportunity',
      title: 'Oportunidades de Produto',
      subtitle: 'Espaço de soluções e geração de valor de negócio',
      category: 'Navegar',
      action: () => {
        onNavigateTab('opportunity');
        onClose();
      },
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      tags: ['oportunidades', 'solucoes', 'valor'],
    },
    {
      id: 'nav-prioritization',
      title: 'Priorização RICE',
      subtitle: 'Score de Reach, Impact, Confidence e Effort',
      category: 'Navegar',
      action: () => {
        onNavigateTab('prioritization');
        onClose();
      },
      icon: <Calculator className="w-4 h-4 text-yellow-400" />,
      tags: ['rice', 'score', 'ranking', 'matriz'],
    },
    {
      id: 'nav-hypothesis',
      title: 'Hipóteses de Solução',
      subtitle: 'Premissas de causa e efeito (Se... então...) aguardando teste',
      category: 'Navegar',
      action: () => {
        onNavigateTab('hypothesis');
        onClose();
      },
      icon: <FlaskConical className="w-4 h-4 text-purple-400" />,
      tags: ['hipoteses', 'premissas', 'solucao'],
    },
    {
      id: 'nav-experiment',
      title: 'Experimentos & Testes',
      subtitle: 'Testes A/B, protótipos de fumaça e métricas de sucesso',
      category: 'Navegar',
      action: () => {
        onNavigateTab('experiment');
        onClose();
      },
      icon: <FlaskConical className="w-4 h-4 text-teal-400" />,
      tags: ['experimentos', 'testes', 'a/b', 'validacao'],
    },
    {
      id: 'nav-decision',
      title: 'Decisões de Produto',
      subtitle: 'Registro de decisões (Aprovado, Pivotado, Rejeitado) e ADRs',
      category: 'Navegar',
      action: () => {
        onNavigateTab('decision');
        onClose();
      },
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      tags: ['decisoes', 'adrs', 'aprovacao'],
    },
    {
      id: 'nav-roadmap',
      title: 'Roadmap Estratégico',
      subtitle: 'Iniciativas Now / Next / Later com rastreabilidade total',
      category: 'Navegar',
      action: () => {
        onNavigateTab('roadmap');
        onClose();
      },
      icon: <Compass className="w-4 h-4 text-military-300" />,
      tags: ['roadmap', 'planejamento', 'releases'],
    },
    {
      id: 'nav-prd',
      title: 'PRDs & User Stories',
      subtitle: 'Documentos de especificação de produto e histórias de usuário',
      category: 'Navegar',
      action: () => {
        onNavigateTab('prd');
        onClose();
      },
      icon: <FileText className="w-4 h-4 text-blue-400" />,
      tags: ['prd', 'especificacao', 'stories', 'requisitos'],
    },
    {
      id: 'nav-outcomes',
      title: 'Pós-Lançamento & Outcomes',
      subtitle: 'Acompanhamento de impacto e realimentação do discovery',
      category: 'Navegar',
      action: () => {
        onNavigateTab('outcomes');
        onClose();
      },
      icon: <TrendingUp className="w-4 h-4 text-lime-400" />,
      tags: ['outcomes', 'pos-lancamento', 'impacto', 'metricas'],
    },
    {
      id: 'nav-intelligence',
      title: 'Inteligência IA & Insights',
      subtitle: 'Diagnóstico com 5 pilares metodológicos e detecção de riscos',
      category: 'Navegar',
      action: () => {
        onNavigateTab('intelligence');
        onClose();
      },
      icon: <BrainCircuit className="w-4 h-4 text-military-300" />,
      tags: ['ia', 'inteligencia', 'insights', 'diagnostico', 'coach'],
    },
    {
      id: 'nav-toolkit',
      title: 'Product Toolkit (18 Ferramentas)',
      subtitle: 'Catálogo de ferramentas e canvases independentes',
      category: 'Navegar',
      action: () => {
        onNavigateTab('toolkit');
        onClose();
      },
      icon: <LayoutGrid className="w-4 h-4 text-military-300" />,
      tags: ['toolkit', 'ferramentas', 'canvas', 'modelos'],
    },

    // 2. Criar Entidade Rápida
    {
      id: 'create-research',
      title: 'Nova Pesquisa com Clientes',
      subtitle: 'Registrar entrevista ou anotação de campo no Discovery',
      category: 'Criar',
      action: () => {
        onNavigateTab('research');
        onClose();
      },
      icon: <Plus className="w-4 h-4 text-sky-400" />,
    },
    {
      id: 'create-problem',
      title: 'Novo Problema / Dor',
      subtitle: 'Cadastrar gargalo e severidade relatada',
      category: 'Criar',
      action: () => {
        onNavigateTab('problem');
        onClose();
      },
      icon: <Plus className="w-4 h-4 text-rose-400" />,
    },
    {
      id: 'create-hypothesis',
      title: 'Nova Hipótese de Solução',
      subtitle: 'Criar premissa If/Then para validação',
      category: 'Criar',
      action: () => {
        onNavigateTab('hypothesis');
        onClose();
      },
      icon: <Plus className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'create-experiment',
      title: 'Novo Experimento / Teste',
      subtitle: 'Desenhar teste prático com métrica de sucesso',
      category: 'Criar',
      action: () => {
        onNavigateTab('experiment');
        onClose();
      },
      icon: <Plus className="w-4 h-4 text-teal-400" />,
    },
    {
      id: 'create-roadmap-item',
      title: 'Nova Iniciativa de Roadmap',
      subtitle: 'Adicionar iniciativa em Now, Next ou Later',
      category: 'Criar',
      action: () => {
        onNavigateTab('roadmap');
        onClose();
      },
      icon: <Plus className="w-4 h-4 text-indigo-400" />,
    },

    // 3. Ferramentas de Produto (18 Ferramentas)
    {
      id: 'tool-empathy-map',
      title: 'Mapa de Empatia (Empathy Map)',
      subtitle: 'Says, Thinks, Does, Feels, Pains e Gains',
      category: 'Ferramentas de Produto',
      action: () => {
        if (onOpenTool) onOpenTool('empathy_map');
        else onNavigateTab('toolkit');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-sky-400" />,
      tags: ['empatia', 'usuario', 'sentimentos', 'dores'],
    },
    {
      id: 'tool-persona',
      title: 'Persona Canvas',
      subtitle: 'Arquétipos, Jobs To Be Done, dores e comportamentos',
      category: 'Ferramentas de Produto',
      action: () => {
        if (onOpenTool) onOpenTool('personas');
        else onNavigateTab('toolkit');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-sky-400" />,
      tags: ['persona', 'perfil', 'arquetipo'],
    },
    {
      id: 'tool-journey',
      title: 'User Journey Map',
      subtitle: 'Jornada ponta a ponta do usuário por etapas e sentimentos',
      category: 'Ferramentas de Produto',
      action: () => {
        if (onOpenTool) onOpenTool('user_journey_map');
        else onNavigateTab('toolkit');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-sky-400" />,
      tags: ['jornada', 'etapas', 'touchpoints', 'journey'],
    },
    {
      id: 'tool-jtbd',
      title: 'Jobs To Be Done (JTBD)',
      subtitle: 'Quando [situação], quero [motivação], para que [resultado]',
      category: 'Ferramentas de Produto',
      action: () => {
        if (onOpenTool) onOpenTool('jtbd');
        else onNavigateTab('toolkit');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-sky-400" />,
      tags: ['jtbd', 'jobs', 'tarefas', 'progresso'],
    },
    {
      id: 'tool-product-strategy',
      title: 'Estratégia de Produto Canvas',
      subtitle: 'Visão, Mercado, Problema, Apostas, Diferenciais e Métricas',
      category: 'Ferramentas de Produto',
      action: () => {
        if (onOpenTool) onOpenTool('product_strategy');
        else onNavigateTab('toolkit');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-emerald-400" />,
      tags: ['estrategia', 'pilares', 'diferencial', 'strategy'],
    },
    {
      id: 'tool-product-vision',
      title: 'Product Vision Board (Pichler)',
      subtitle: 'Visão, Grupo-Alvo, Necessidades, Produto e Metas de Negócio',
      category: 'Ferramentas de Produto',
      action: () => {
        if (onOpenTool) onOpenTool('product_vision_board');
        else onNavigateTab('toolkit');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-emerald-400" />,
      tags: ['visao', 'vision', 'pichler'],
    },
    {
      id: 'tool-lean-canvas',
      title: 'Lean Canvas',
      subtitle: '9 blocos rápidos para validação de modelo de negócio',
      category: 'Ferramentas de Produto',
      action: () => {
        if (onOpenTool) onOpenTool('lean_canvas');
        else onNavigateTab('toolkit');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-emerald-400" />,
      tags: ['lean', 'canvas', 'negocio', 'modelo'],
    },
    {
      id: 'tool-ost',
      title: 'Opportunity Solution Tree (OST - Teresa Torres)',
      subtitle: 'Outcome → Oportunidades → Soluções → Experimentos',
      category: 'Ferramentas de Produto',
      action: () => {
        if (onOpenTool) onOpenTool('opportunity_solution_tree');
        else onNavigateTab('toolkit');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-amber-400" />,
      tags: ['ost', 'teresa torres', 'arvore', 'continuous discovery'],
    },
    {
      id: 'tool-rice',
      title: 'Priorização RICE Calculator',
      subtitle: 'Cálculo de Reach, Impact, Confidence e Effort',
      category: 'Ferramentas de Produto',
      action: () => {
        if (onOpenTool) onOpenTool('rice_prioritization');
        else onNavigateTab('toolkit');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-amber-400" />,
      tags: ['rice', 'priorizacao', 'score'],
    },
    {
      id: 'tool-impact-effort',
      title: 'Matriz Impacto x Esforço',
      subtitle: 'Quick Wins, Grandes Apostas, Preenchimento e Descarte',
      category: 'Ferramentas de Produto',
      action: () => {
        if (onOpenTool) onOpenTool('impact_effort_matrix');
        else onNavigateTab('toolkit');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-amber-400" />,
      tags: ['matriz', 'quick wins', 'esforco', 'impacto'],
    },
    {
      id: 'tool-prd-canvas',
      title: 'PRD Canvas (Product Requirements)',
      subtitle: 'Requisitos, histórias de usuário, critérios de aceite e escopo',
      category: 'Ferramentas de Produto',
      action: () => {
        if (onOpenTool) onOpenTool('prd_canvas');
        else onNavigateTab('toolkit');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-indigo-400" />,
      tags: ['prd', 'requisitos', 'especificacao', 'historias'],
    },
    {
      id: 'tool-story-mapping',
      title: 'User Story Mapping (Jeff Patton)',
      subtitle: 'Fatie atividades de usuários em releases e defina o MVP',
      category: 'Ferramentas de Produto',
      action: () => {
        if (onOpenTool) onOpenTool('story_map');
        else onNavigateTab('toolkit');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-indigo-400" />,
      tags: ['story mapping', 'mvp', 'release', 'backlog'],
    },
    {
      id: 'tool-experiment-canvas',
      title: 'Experiment Canvas',
      subtitle: 'Desenho de hipótese, métricas de corte e plano de teste',
      category: 'Ferramentas de Produto',
      action: () => {
        if (onOpenTool) onOpenTool('experiment_canvas');
        else onNavigateTab('toolkit');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-purple-400" />,
      tags: ['experimento', 'teste', 'canvas'],
    },
    {
      id: 'tool-decision-canvas',
      title: 'Decision Canvas / ADR',
      subtitle: 'Decisão de produto, contexto, opções e consequências',
      category: 'Ferramentas de Produto',
      action: () => {
        if (onOpenTool) onOpenTool('decision_canvas');
        else onNavigateTab('toolkit');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-emerald-400" />,
      tags: ['decisao', 'adr', 'justificativa'],
    },

    // 4. Ações Rápidas
    {
      id: 'action-diagnostics',
      title: 'Executar Diagnóstico com IA',
      subtitle: 'Avaliação crítica baseada nos 5 pilares do Product Coach',
      category: 'Ações Rápidas',
      action: () => {
        onNavigateTab('intelligence');
        onClose();
      },
      icon: <BrainCircuit className="w-4 h-4 text-military-300" />,
    },
  ];

  const filteredItems = items.filter((item) => {
    if (!query) return true;
    const lower = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(lower) ||
      item.subtitle.toLowerCase().includes(lower) ||
      item.category.toLowerCase().includes(lower) ||
      item.tags?.some((t) => t.toLowerCase().includes(lower))
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-800 gap-3">
          <Search className="w-5 h-5 text-military-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="O que você quer fazer? (ex: Lean Canvas, Pesquisa, RICE, Hipótese...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800 border border-zinc-700 rounded">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-zinc-800/40">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500 space-y-1">
              <p>Nenhuma ferramenta ou fluxo encontrado para &ldquo;{query}&rdquo;.</p>
              <p className="text-[11px] text-zinc-600">Tente buscar por &ldquo;Persona&rdquo;, &ldquo;Canvas&rdquo;, &ldquo;Roadmap&rdquo; ou &ldquo;RICE&rdquo;.</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
                    isSelected ? 'bg-military-850/90 text-military-100' : 'hover:bg-zinc-850 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-military-750 text-military-200' : 'bg-zinc-800 text-zinc-400'}`}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-100">{item.title}</span>
                        <span className="px-1.5 py-0.2 text-[9px] font-medium rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">{item.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-military-300 translate-x-0.5' : 'text-zinc-600 opacity-0'}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-zinc-950/70 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span>
              <strong className="text-zinc-400">↑↓</strong> para navegar
            </span>
            <span>
              <strong className="text-zinc-400">ENTER</strong> para selecionar
            </span>
          </div>
          <span>Product OS Command Center</span>
        </div>
      </div>
    </div>
  );
};
