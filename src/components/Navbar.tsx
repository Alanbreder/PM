import React from 'react';
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
  LayoutGrid
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
  const tabs = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'strategy', label: 'Estratégia & OKRs', icon: Target },
    { id: 'research', label: '1. Pesquisa', icon: Search },
    { id: 'evidence', label: '2. Evidências', icon: FileText },
    { id: 'personas', label: 'Personas & Segmentos', icon: Users },
    { id: 'problem', label: '3. Problemas', icon: AlertCircle },
    { id: 'opportunity', label: '4. Oportunidades', icon: Lightbulb },
    { id: 'prioritization', label: 'Priorização RICE', icon: Calculator },
    { id: 'hypothesis', label: '5. Hipóteses', icon: GitCommit },
    { id: 'experiment', label: '6. Experimentos', icon: FlaskConical },
    { id: 'decision', label: '7. Decisões', icon: CheckCircle2 },
    { id: 'intelligence', label: '8. Inteligência IA', icon: BrainCircuit, badge: 'IA' },
    { id: 'roadmap', label: '9. Roadmap', icon: Compass, highlight: true },
    { id: 'prd', label: 'PRDs & User Stories', icon: FileText },
    { id: 'outcomes', label: 'Pós-Lançamento', icon: TrendingUp },
    { id: 'toolkit', label: 'Product Toolkit', icon: LayoutGrid },
  ];


  return (
    <header className="bg-zinc-950 border-b border-zinc-800 text-zinc-100 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-zinc-800/60">
          {/* Logo & Workspace Selector */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-military-600 flex items-center justify-center font-bold text-zinc-100 shadow-sm border border-military-500/40">
                POS
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-zinc-100 block leading-none">Product OS</span>
                <span className="text-[10px] text-military-400 font-mono tracking-wider uppercase">Discovery Engine</span>
              </div>
            </div>

            {/* Workspace Select */}
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-800 text-xs">
              <FolderKanban className="w-4 h-4 text-military-400" />
              <select
                value={currentWorkspace?.id || ''}
                onChange={(e) => {
                  const ws = workspaces.find((w) => w.id === e.target.value);
                  if (ws) onSelectWorkspace(ws);
                }}
                className="bg-transparent font-medium text-zinc-200 outline-none cursor-pointer pr-2"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id} className="bg-zinc-900 text-zinc-200">
                    {ws.name} ({ws.role})
                  </option>
                ))}
              </select>
              <button
                onClick={onOpenNewWorkspace}
                className="text-zinc-400 hover:text-military-300 p-0.5 rounded hover:bg-zinc-800 transition"
                title="Novo Workspace"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick status badge, Cmd+K trigger & User Profile / Logout */}
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
              }}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition text-[11px]"
              title="Pesquisar ferramentas ou fluxos (Cmd+K / Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-military-400" />
              <span>Buscar...</span>
              <kbd className="bg-zinc-800 text-zinc-300 font-mono text-[9px] px-1 py-0.5 rounded border border-zinc-700">
                ⌘K
              </kbd>
            </button>

            <div className="hidden md:flex items-center gap-2 text-zinc-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-military-900/80 text-military-300 border border-military-700/60 font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-military-400 animate-pulse"></span>
                Ciclo Ativo
              </span>
            </div>

            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-[11px] font-medium text-zinc-200 leading-tight">
                    {currentUser.name || currentUser.email}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono leading-tight">
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
          </div>
        </div>

        {/* Pipeline Navigation - Line wrapping enabled so it never overflows */}
        <nav className="flex flex-wrap gap-1.5 py-2.5 w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition border ${
                  isActive
                    ? 'bg-military-800/90 text-military-200 border-military-600 shadow-sm font-semibold'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/90 border-zinc-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-military-300' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 text-[9px] font-semibold rounded border ${
                    isActive
                      ? 'bg-military-700/60 text-military-200 border-military-500/40' 
                      : 'bg-military-900/60 text-military-300 border-military-800/60'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
