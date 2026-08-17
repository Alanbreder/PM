import React, { useState } from 'react';
import { Workspace, User } from '../types';
import { apiFetch } from '../lib/api';
import { 
  Compass, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert,
  Building2,
  FolderPlus
} from 'lucide-react';

interface WorkspaceOnboardingViewProps {
  currentUser: User | null;
  onWorkspaceCreated: (workspace: Workspace) => void;
  onLogout: () => void;
}

export const WorkspaceOnboardingView: React.FC<WorkspaceOnboardingViewProps> = ({
  currentUser,
  onWorkspaceCreated,
  onLogout,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome do seu workspace.');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const res = await apiFetch('/api/workspaces', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      });

      if (res.data) {
        onWorkspaceCreated(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao criar workspace. Tente novamente.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-military-900/60 border border-military-600/50 shadow-lg shadow-military-900/30 text-military-300 mb-2">
            <Compass className="w-8 h-8 text-military-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100 font-sans">
            Bem-vindo ao <span className="text-military-400">Product OS</span>
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            O sistema operacional para Product Managers modernos. 
            <span className="block text-zinc-300 font-medium mt-1">
              "Guided when useful, flexible when necessary."
            </span>
          </p>
        </div>

        {/* Card Setup */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6">
          <div className="border-b border-zinc-800/80 pb-4">
            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-military-400" />
              Configure seu primeiro Workspace
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Workspaces garantem isolamento total dos seus dados, pesquisas, hipóteses e roadmaps.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Nome do Workspace ou Produto <span className="text-military-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Plataforma Core B2B, App Mobile Cliente"
                  required
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-military-500 focus:ring-1 focus:ring-military-500/50 transition"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Você poderá convidar seu time e criar outros workspaces a qualquer momento.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Descrição ou Missão do Produto <span className="text-zinc-500 font-normal">(opcional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Ex: Descoberta contínua e entrega de valor para a jornada de checkout e pagamentos."
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-military-500 focus:ring-1 focus:ring-military-500/50 transition"
              />
            </div>

            {/* Quick Principles Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-tight">
                  <strong className="text-zinc-200 block mb-0.5">Fluxo Contínuo</strong>
                  <span className="text-zinc-400">Pesquisa → Evidências → Problemas → Oportunidades → Roadmap</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-military-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-tight">
                  <strong className="text-zinc-200 block mb-0.5">Toolkit Independente</strong>
                  <span className="text-zinc-400">12 Canvas e ferramentas que podem ser usadas livremente</span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={onLogout}
                className="text-xs text-zinc-400 hover:text-zinc-200 transition order-2 sm:order-1"
              >
                Sair da conta ({currentUser?.email})
              </button>

              <button
                type="submit"
                disabled={creating || !name.trim()}
                className="w-full sm:w-auto px-6 py-2.5 bg-military-600 hover:bg-military-500 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-100 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-military-950/50 order-1 sm:order-2"
              >
                {creating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Criando Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Criar Workspace e Entrar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
