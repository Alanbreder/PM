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
  category: 'Fluxo Product OS' | 'Ferramentas de Produto';
  action: () => void;
  icon: React.ReactNode;
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
    // Tabs
    {
      id: 'tab-dashboard',
      title: 'Visão Geral Executiva',
      subtitle: 'Métricas executivas, funil de maturidade e alertas de risco',
      category: 'Fluxo Product OS',
      action: () => {
        onNavigateTab('dashboard');
        onClose();
      },
      icon: <Layers className="w-4 h-4 text-military-400" />,
    },
    {
      id: 'tab-strategy',
      title: 'Estratégia & OKRs',
      subtitle: 'Pilares estratégicos e objetivos trimestrais do produto',
      category: 'Fluxo Product OS',
      action: () => {
        onNavigateTab('strategy');
        onClose();
      },
      icon: <Compass className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'tab-research',
      title: 'Pesquisa & Discovery',
      subtitle: 'Entrevistas de clientes, transcrições e anotações de campo',
      category: 'Fluxo Product OS',
      action: () => {
        onNavigateTab('research');
        onClose();
      },
      icon: <FileText className="w-4 h-4 text-sky-400" />,
    },
    {
      id: 'tab-evidence',
      title: 'Evidências & Fatos',
      subtitle: 'Fatos comprovados e dados qualitativos extraídos de entrevistas',
      category: 'Fluxo Product OS',
      action: () => {
        onNavigateTab('evidence');
        onClose();
      },
      icon: <Sparkles className="w-4 h-4 text-military-400" />,
    },
    {
      id: 'tab-problem',
      title: 'Problemas & Dores',
      subtitle: 'Gargalos reais validados com severidade e frequência',
      category: 'Fluxo Product OS',
      action: () => {
        onNavigateTab('problem');
        onClose();
      },
      icon: <HelpCircle className="w-4 h-4 text-rose-400" />,
    },
    {
      id: 'tab-opportunity',
      title: 'Oportunidades de Produto',
      subtitle: 'Árvores de oportunidade e geração de valor de negócio',
      category: 'Fluxo Product OS',
      action: () => {
        onNavigateTab('opportunity');
        onClose();
      },
      icon: <Target className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'tab-hypothesis',
      title: 'Hipóteses de Solução',
      subtitle: 'Premissas de causa e efeito (If/Then) aguardando teste',
      category: 'Fluxo Product OS',
      action: () => {
        onNavigateTab('hypothesis');
        onClose();
      },
      icon: <FlaskConical className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'tab-experiment',
      title: 'Experimentos & Testes',
      subtitle: 'Testes A/B, protótipos de fumaça e métricas de validação',
      category: 'Fluxo Product OS',
      action: () => {
        onNavigateTab('experiment');
        onClose();
      },
      icon: <FlaskConical className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'tab-decision',
      title: 'Decisões & ADRs',
      subtitle: 'Governança e registros formais de decisões estratégicas',
      category: 'Fluxo Product OS',
      action: () => {
        onNavigateTab('decision');
        onClose();
      },
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'tab-roadmap',
      title: 'Roadmap Estratégico',
      subtitle: 'Now / Next / Later alinhado a objetivos de negócio',
      category: 'Fluxo Product OS',
      action: () => {
        onNavigateTab('roadmap');
        onClose();
      },
      icon: <MapPin className="w-4 h-4 text-sky-400" />,
    },
    {
      id: 'tab-intelligence',
      title: 'Intelligence & Auditoria IA',
      subtitle: 'Auditoria de integridade, lacunas de pesquisa e linhagem',
      category: 'Fluxo Product OS',
      action: () => {
        onNavigateTab('intelligence');
        onClose();
      },
      icon: <Sparkles className="w-4 h-4 text-military-400" />,
    },

    // Tools
    {
      id: 'tool-ost',
      title: 'Opportunity Solution Tree (OST)',
      subtitle: 'Teresa Torres tree: Desired Outcome -> Oportunidades -> Soluções',
      category: 'Ferramentas de Produto',
      action: () => {
        onNavigateTab('toolkit');
        onOpenTool?.('opportunity_solution_tree');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-military-400" />,
    },
    {
      id: 'tool-product-canvas',
      title: 'Product Canvas (Roman Pichler)',
      subtitle: 'Canvas holístico de visão, personas, jornadas e escopo',
      category: 'Ferramentas de Produto',
      action: () => {
        onNavigateTab('toolkit');
        onOpenTool?.('product_canvas');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-military-400" />,
    },
    {
      id: 'tool-rice',
      title: 'Priorização RICE',
      subtitle: 'Cálculo quantitativo transparente de Reach, Impact, Confidence e Effort',
      category: 'Ferramentas de Produto',
      action: () => {
        onNavigateTab('toolkit');
        onOpenTool?.('rice_prioritization');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-military-400" />,
    },
    {
      id: 'tool-lean-canvas',
      title: 'Lean Canvas (9 Blocos)',
      subtitle: 'Ash Maurya modelo de negócio e proposta única de valor',
      category: 'Ferramentas de Produto',
      action: () => {
        onNavigateTab('toolkit');
        onOpenTool?.('lean_canvas');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-military-400" />,
    },
    {
      id: 'tool-personas',
      title: 'Personas & Arquétipos',
      subtitle: 'Dores, objetivos, hábitos e jobs de usuários',
      category: 'Ferramentas de Produto',
      action: () => {
        onNavigateTab('toolkit');
        onOpenTool?.('personas');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-military-400" />,
    },
    {
      id: 'tool-jtbd',
      title: 'Jobs To Be Done (JTBD)',
      subtitle: 'Clayton Christensen: tarefas funcionais, emocionais e sociais',
      category: 'Ferramentas de Produto',
      action: () => {
        onNavigateTab('toolkit');
        onOpenTool?.('jtbd');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-military-400" />,
    },
    {
      id: 'tool-matrix',
      title: 'Matriz Impacto x Esforço',
      subtitle: 'Triagem 2x2 rápida entre Quick Wins e Grandes Apostas',
      category: 'Ferramentas de Produto',
      action: () => {
        onNavigateTab('toolkit');
        onOpenTool?.('impact_effort_matrix');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-military-400" />,
    },
    {
      id: 'tool-assumption',
      title: 'Assumption Map (Matriz de Riscos)',
      subtitle: 'Mapeamento de Importância x Incerteza para testes rápidos',
      category: 'Ferramentas de Produto',
      action: () => {
        onNavigateTab('toolkit');
        onOpenTool?.('assumption_map');
        onClose();
      },
      icon: <Wrench className="w-4 h-4 text-military-400" />,
    },
  ];

  const filteredItems = items.filter((item) => {
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-military-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ir para qualquer visão, aba ou ferramenta... (ex: OST, RICE, Problemas)"
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
          />
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              Nenhum resultado encontrado para "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`p-3 rounded-xl cursor-pointer transition flex items-center justify-between gap-3 ${
                  idx === selectedIndex
                    ? 'bg-military-950/80 border border-military-700/70 text-zinc-100'
                    : 'hover:bg-zinc-800/60 text-zinc-300 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-zinc-100 truncate flex items-center gap-2">
                      <span>{item.title}</span>
                      <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-zinc-600 shrink-0" />
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                ↑
              </kbd>{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                ↓
              </kbd>{' '}
              Navegar
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                Enter
              </kbd>{' '}
              Selecionar
            </span>
          </div>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
              Esc
            </kbd>{' '}
            Fechar
          </span>
        </div>
      </div>
    </div>
  );
};
