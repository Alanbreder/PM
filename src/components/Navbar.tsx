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
  Sparkles,
  LogOut,
  User
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
    { id: 'research', label: '1. Pesquisa', icon: Search },
    { id: 'evidence', label: '2. Evidências', icon: FileText },
    { id: 'problem', label: '3. Problemas', icon: AlertCircle },
    { id: 'opportunity', label: '4. Oportunidades', icon: Lightbulb },
    { id: 'hypothesis', label: '5. Hipóteses', icon: GitCommit },
    { id: 'experiment', label: '6. Experimentos', icon: FlaskConical },
    { id: 'decision', label: '7. Decisões', icon: CheckCircle2 },
    { id: 'intelligence', label: '8. Inteligência do Produto', icon: BrainCircuit, badge: 'Etapa 7' },
    { id: 'roadmap', label: '9. Roadmap & Entregas', icon: Compass, badge: 'Etapa 8', highlight: true },
  ];


  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Workspace Selector */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
                POS
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-white block leading-none">Product OS</span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Discovery Engine</span>
              </div>
            </div>

            {/* Workspace Select */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700/60 text-xs">
              <FolderKanban className="w-4 h-4 text-indigo-400" />
              <select
                value={currentWorkspace?.id || ''}
                onChange={(e) => {
                  const ws = workspaces.find((w) => w.id === e.target.value);
                  if (ws) onSelectWorkspace(ws);
                }}
                className="bg-transparent font-medium text-slate-200 outline-none cursor-pointer pr-2"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id} className="bg-slate-900 text-slate-200">
                    {ws.name} ({ws.role})
                  </option>
                ))}
              </select>
              <button
                onClick={onOpenNewWorkspace}
                className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-700 transition"
                title="Novo Workspace"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick status badge & User Profile / Logout */}
          <div className="flex items-center gap-3 text-xs">
            <div className="hidden md:flex items-center gap-2 text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Ciclo Ativo
              </span>
            </div>

            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-[11px] font-medium text-slate-200 leading-tight">
                    {currentUser.name || currentUser.email}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono leading-tight">
                    {currentUser.email}
                  </span>
                </div>
                {onLogout && (
                  <button
                    id="btn-logout"
                    onClick={onLogout}
                    title="Sair / Trocar de Conta"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Navigation */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-t-md transition whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'bg-slate-800 text-white border-indigo-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
                } ${tab.highlight && !isActive ? 'text-amber-400 hover:text-amber-300' : ''}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : tab.highlight ? 'text-indigo-400' : 'text-slate-400'}`} />
                {tab.label}
                {tab.badge && (
                  <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded border ${
                    tab.highlight 
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
                      : 'bg-slate-700/50 text-slate-300 border-slate-600/40'
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
