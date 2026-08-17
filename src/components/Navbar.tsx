import React, { useState, useRef, useEffect } from 'react';
import { Workspace } from '../types';
import { 
  Search, 
  FileText, 
  AlertCircle, 
  Lightbulb, 
  GitCommit, 
  FlaskConical, 
  CheckCircle2, 
  BrainCircuit,
  Compass,
  FolderKanban, 
  Plus,
  LogOut,
  LayoutDashboard,
  Target,
  Calculator,
  Users,
  TrendingUp,
  LayoutGrid,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  HelpCircle,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';

interface NavbarProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  onSelectWorkspace: (ws: Workspace) => void;
  onOpenNewWorkspace: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser?: { uid: string; email: string; name?: string } | null;
  onLogout?: () => void;
}

interface NavGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: {
    id: string;
    label: string;
    description: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

export const Navbar: React.FC<NavbarProps> = ({
  workspaces,
  currentWorkspace,
  onSelectWorkspace,
  onOpenNewWorkspace,
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on tab selection
  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  // Structured Navigation Groups
  const workAreasGroup: NavGroup = {
    id: 'work_areas',
    label: 'Trabalhar',
    icon: Briefcase,
    items: [
      { id: 'research', label: 'Descobrir', description: 'Entrevistas de clientes, transcrições e personas', icon: Search },
      { id: 'problem', label: 'Entender', description: 'Mapeamento de problemas e gargalos reais', icon: AlertCircle },
      { id: 'opportunity', label: 'Priorizar', description: 'Oportunidades de produto e scoring RICE', icon: Lightbulb },
      { id: 'hypothesis', label: 'Validar', description: 'Hipóteses de solução e testes controlados', icon: GitCommit },
      { id: 'decision', label: 'Decidir', description: 'Decisões documentadas e histórico de ADRs', icon: CheckCircle2 },
      { id: 'roadmap', label: 'Planejar', description: 'Iniciativas de roadmap, releases e PRDs', icon: Compass },
      { id: 'outcomes', label: 'Medir', description: 'Avaliação pós-lançamento e aprendizados', icon: TrendingUp },
    ],
  };

  const navGroups: NavGroup[] = [
    {
      id: 'strategy_group',
      label: 'Estratégia',
      icon: Target,
      items: [
        { id: 'strategy', label: 'Estratégia & OKRs', description: 'Visão de produto, pilares e metas trimestrais', icon: Target },
        { id: 'prioritization', label: 'Priorização RICE', description: 'Cálculo de Reach, Impact, Confidence e Effort', icon: Calculator },
      ],
    },
    {
      id: 'discovery_group',
      label: 'Discovery',
      icon: Search,
      items: [
        { id: 'research', label: 'Pesquisas', description: 'Anotações de campo, entrevistas e dados qualitativos', icon: Search },
        { id: 'evidence', label: 'Evidências', description: 'Fatos e citações validadas de usuários', icon: FileText },
        { id: 'personas', label: 'Personas & Segmentos', description: 'Arquétipos, Jobs To Be Done e dores', icon: Users },
        { id: 'problem', label: 'Problemas & Dores', description: 'Gargalos reais com frequência e impacto', icon: AlertCircle },
        { id: 'opportunity', label: 'Oportunidades', description: 'Cenários de valor e soluções potenciais', icon: Lightbulb },
      ],
    },
    {
      id: 'validation_group',
      label: 'Validação',
      icon: FlaskConical,
      items: [
        { id: 'hypothesis', label: 'Hipóteses', description: 'Premissas estruturadas de causa e efeito', icon: GitCommit },
        { id: 'experiment', label: 'Experimentos', description: 'Testes A/B, protótipos e critérios de sucesso', icon: FlaskConical },
        { id: 'decision', label: 'Decisões', description: 'Registro de decisões (Aprovado, Pivotado, Rejeitado)', icon: CheckCircle2 },
      ],
    },
    {
      id: 'execution_group',
      label: 'Execução',
      icon: Compass,
      items: [
        { id: 'roadmap', label: 'Roadmap Estratégico', description: 'Iniciativas Now / Next / Later com rastreabilidade', icon: Compass },
        { id: 'prd', label: 'PRDs & User Stories', description: 'Especificação funcional e histórias de usuário', icon: FileText },
        { id: 'outcomes', label: 'Pós-Lançamento & Outcomes', description: 'Revisão de impacto e feedback contínuo', icon: TrendingUp },
      ],
    },
  ];

  // Helper to determine if a dropdown group contains the active tab
  const isGroupActive = (group: NavGroup) => {
    return group.items.some((item) => item.id === activeTab);
  };

  return (
    <header className="bg-zinc-950 border-b border-zinc-800 text-zinc-100 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-4 py-3 border-b border-zinc-800/60">
          {/* Logo & Workspace Selector */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => handleSelectTab('dashboard')}
              className="flex items-center gap-2 text-left group focus:outline-none"
              title="Product OS - Ir para Início"
            >
              <div className="w-8 h-8 rounded-md bg-military-600 flex items-center justify-center font-bold text-zinc-100 shadow-sm border border-military-500/40 group-hover:bg-military-500 transition">
                POS
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-zinc-100 block leading-none">Product OS</span>
                <span className="text-[10px] text-military-400 font-mono tracking-wider uppercase">Discovery Engine</span>
              </div>
            </button>

            {/* Workspace Select */}
            <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1.5 rounded-md border border-zinc-800 text-xs">
              <FolderKanban className="w-3.5 h-3.5 text-military-400 shrink-0" />
              <select
                id="select-workspace-nav"
                value={currentWorkspace?.id || ''}
                onChange={(e) => {
                  const ws = workspaces.find((w) => w.id === e.target.value);
                  if (ws) onSelectWorkspace(ws);
                }}
                className="bg-transparent font-medium text-zinc-200 outline-none cursor-pointer pr-1 text-xs max-w-[140px] sm:max-w-[200px] truncate"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id} className="bg-zinc-900 text-zinc-200">
                    {ws.name} ({ws.role})
                  </option>
                ))}
              </select>
              <button
                id="btn-new-workspace-nav"
                onClick={onOpenNewWorkspace}
                className="text-zinc-400 hover:text-military-300 p-0.5 rounded hover:bg-zinc-800 transition"
                title="Novo Workspace"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Search (Cmd+K), User Info & Logout */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <button
              id="btn-cmd-k-search"
              onClick={() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition text-[11px]"
              title="Pesquisar ferramentas ou módulos (Cmd+K / Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-military-400" />
              <span className="hidden sm:inline">Buscar...</span>
              <kbd className="bg-zinc-800 text-zinc-300 font-mono text-[9px] px-1 py-0.5 rounded border border-zinc-700">
                ⌘K
              </kbd>
            </button>

            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-zinc-800">
                <div className="flex flex-col text-right">
                  <span className="text-[11px] font-medium text-zinc-200 leading-tight">
                    {currentUser.name || currentUser.email}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono leading-tight max-w-[130px] truncate">
                    {currentUser.email}
                  </span>
                </div>
                {onLogout && (
                  <button
                    id="btn-logout"
                    onClick={onLogout}
                    title="Sair / Trocar de Conta"
                    className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100"
              aria-label="Abrir Menu de Navegação"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Desktop Hierarchical Navigation Bar */}
        <nav ref={dropdownRef} className="hidden lg:flex items-center justify-between py-2 w-full text-xs">
          <div className="flex items-center gap-1">
            {/* 1. Início (Product Home) */}
            <button
              id="nav-tab-dashboard"
              onClick={() => handleSelectTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition border ${
                activeTab === 'dashboard'
                  ? 'bg-military-800/90 text-military-100 border-military-600 shadow-sm font-semibold'
                  : 'text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 border-transparent'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Início</span>
            </button>

            {/* 2. Trabalhar (Áreas de Atuação Livres) */}
            <div className="relative">
              <button
                id="nav-dropdown-work-areas"
                onClick={() => setOpenDropdown(openDropdown === 'work_areas' ? null : 'work_areas')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition border ${
                  isGroupActive(workAreasGroup) || openDropdown === 'work_areas'
                    ? 'bg-zinc-850 text-military-200 border-zinc-700'
                    : 'text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 border-transparent'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-military-400" />
                <span>Trabalhar</span>
                <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${openDropdown === 'work_areas' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'work_areas' && (
                <div className="absolute left-0 top-full mt-1.5 w-72 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 mb-1">
                    Áreas de Atuação (Fluxo Flexível)
                  </div>
                  {workAreasGroup.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTab(item.id)}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition ${
                          isActive
                            ? 'bg-military-900/90 text-military-100 border border-military-700/50 font-semibold'
                            : 'hover:bg-zinc-800 text-zinc-200'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-military-300' : 'text-military-400'}`} />
                        <div>
                          <div className="text-xs font-medium leading-tight">{item.label}</div>
                          <div className="text-[10px] text-zinc-400 leading-tight mt-0.5">{item.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="h-4 w-px bg-zinc-800 mx-1"></div>

            {/* 3. Estrutura por Domínio (Estratégia, Discovery, Validação, Execução) */}
            {navGroups.map((group) => {
              const GroupIcon = group.icon;
              const isCurrent = isGroupActive(group);
              const isOpen = openDropdown === group.id;

              return (
                <div key={group.id} className="relative">
                  <button
                    id={`nav-dropdown-${group.id}`}
                    onClick={() => setOpenDropdown(isOpen ? null : group.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition border ${
                      isCurrent
                        ? 'bg-military-800/90 text-military-100 border-military-600 shadow-sm font-semibold'
                        : isOpen
                        ? 'bg-zinc-850 text-zinc-100 border-zinc-700'
                        : 'text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 border-transparent'
                    }`}
                  >
                    <GroupIcon className={`w-3.5 h-3.5 ${isCurrent ? 'text-military-300' : 'text-zinc-400'}`} />
                    <span>{group.label}</span>
                    <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-64 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 mb-1">
                        {group.label}
                      </div>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            id={`nav-item-${item.id}`}
                            onClick={() => handleSelectTab(item.id)}
                            className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition ${
                              isActive
                                ? 'bg-military-900/90 text-military-100 border border-military-700/50 font-semibold'
                                : 'hover:bg-zinc-800 text-zinc-200'
                            }`}
                          >
                            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-military-300' : 'text-zinc-400'}`} />
                            <div>
                              <div className="text-xs font-medium leading-tight">{item.label}</div>
                              <div className="text-[10px] text-zinc-400 leading-tight mt-0.5">{item.description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Action Anchors: Intelligence & Toolkit */}
          <div className="flex items-center gap-1.5">
            {/* Product Intelligence */}
            <button
              id="nav-tab-intelligence"
              onClick={() => handleSelectTab('intelligence')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition border ${
                activeTab === 'intelligence'
                  ? 'bg-military-800/90 text-military-100 border-military-600 shadow-sm font-semibold'
                  : 'bg-zinc-900/80 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-850 border-zinc-800/80'
              }`}
            >
              <BrainCircuit className={`w-3.5 h-3.5 ${activeTab === 'intelligence' ? 'text-military-300' : 'text-military-400'}`} />
              <span>Inteligência</span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-military-900 text-military-300 border border-military-700/60 rounded">
                IA
              </span>
            </button>

            {/* Product Toolkit */}
            <button
              id="nav-tab-toolkit"
              onClick={() => handleSelectTab('toolkit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition border ${
                activeTab === 'toolkit'
                  ? 'bg-military-800/90 text-military-100 border-military-600 shadow-sm font-semibold'
                  : 'bg-zinc-900/80 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-850 border-zinc-800/80'
              }`}
            >
              <LayoutGrid className={`w-3.5 h-3.5 ${activeTab === 'toolkit' ? 'text-military-300' : 'text-military-400'}`} />
              <span>Toolkit</span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 rounded">
                18 Tools
              </span>
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer / Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-zinc-800/80 space-y-4 animate-in fade-in duration-150">
            {/* Início */}
            <button
              onClick={() => handleSelectTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs font-semibold ${
                activeTab === 'dashboard' ? 'bg-military-800 text-military-100' : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-military-400" />
              <span>Início (Product Home)</span>
            </button>

            {/* Trabalhar */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Áreas de Trabalho
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {workAreasGroup.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                        isActive ? 'bg-military-800 text-military-100 font-semibold' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-850'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-military-400 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Structured Groups */}
            {navGroups.map((group) => (
              <div key={group.id} className="space-y-1">
                <div className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {group.label}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTab(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs ${
                          isActive ? 'bg-military-800 text-military-100 font-semibold' : 'text-zinc-300 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Direct Links */}
            <div className="pt-2 border-t border-zinc-800 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSelectTab('intelligence')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg text-xs font-semibold ${
                  activeTab === 'intelligence' ? 'bg-military-800 text-military-100' : 'bg-zinc-900 text-zinc-300'
                }`}
              >
                <BrainCircuit className="w-4 h-4 text-military-400" />
                <span>Inteligência IA</span>
              </button>
              <button
                onClick={() => handleSelectTab('toolkit')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg text-xs font-semibold ${
                  activeTab === 'toolkit' ? 'bg-military-800 text-military-100' : 'bg-zinc-900 text-zinc-300'
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-military-400" />
                <span>Product Toolkit</span>
              </button>
            </div>

            {/* Mobile Logout */}
            {currentUser && onLogout && (
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs px-2">
                <span className="text-zinc-400 truncate">{currentUser.email}</span>
                <button
                  onClick={onLogout}
                  className="px-3 py-1 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 rounded font-medium flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sair
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
