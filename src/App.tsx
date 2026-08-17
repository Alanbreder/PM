import React, { useState, useEffect, useCallback } from 'react';
import { Workspace, User } from './types';
import { apiFetch, getAuthToken, clearAuthToken } from './lib/api';
import { Navbar } from './components/Navbar';
import { ExecutiveDashboardView } from './components/ExecutiveDashboardView';
import { StrategyView } from './components/StrategyView';
import { ResearchView } from './components/ResearchView';
import { EvidenceView } from './components/EvidenceView';
import { PersonasView } from './components/PersonasView';
import { ProblemView } from './components/ProblemView';
import { OpportunityView } from './components/OpportunityView';
import { PrioritizationView } from './components/PrioritizationView';
import { HypothesisView } from './components/HypothesisView';
import { ExperimentView } from './components/ExperimentView';
import { DecisionView } from './components/DecisionView';
import { IntelligenceView } from './components/IntelligenceView';
import { RoadmapView } from './components/RoadmapView';
import { PRDView } from './components/PRDView';
import { OutcomeReviewView } from './components/OutcomeReviewView';
import { ToolkitView } from './components/ToolkitView';
import { WorkspaceModal } from './components/WorkspaceModal';
import { CommandPalette } from './components/CommandPalette';
import { ToolKey } from './types/tools';

import { AuthView } from './components/AuthView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // Default to Executive Dashboard
  const [loading, setLoading] = useState(true);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [toolkitInitialTool, setToolkitInitialTool] = useState<ToolKey | null>(null);

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const initApp = useCallback(async (userOverride?: User) => {
    setLoading(true);
    setAuthError(null);

    const token = getAuthToken();
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      // Sync user if provided or sync user profile
      if (userOverride) {
        try {
          await apiFetch('/api/auth/sync-user', {
            method: 'POST',
            body: JSON.stringify({
              uid: userOverride.uid,
              email: userOverride.email,
              name: userOverride.name || userOverride.email.split('@')[0],
            }),
          });
          setCurrentUser(userOverride);
        } catch {
          // Non-blocking sync error
        }
      }

      // Load workspaces
      const wsRes = await apiFetch('/api/workspaces');
      let list: Workspace[] = wsRes.data || [];

      // If no workspace exists, create a default workspace
      if (list.length === 0) {
        const defaultWsRes = await apiFetch('/api/workspaces', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Workspace Principal',
            description: 'Workspace padrão para descoberta e produto OS',
          }),
        });
        list = [defaultWsRes.data];
      }

      setWorkspaces(list);
      setCurrentWorkspace(list[0] || null);
      setIsAuthenticated(true);
    } catch (err: any) {
      if (err.status === 401 || err.code === 'UNAUTHORIZED' || err.message?.includes('Token de autenticação')) {
        clearAuthToken();
        setIsAuthenticated(false);
        setAuthError('Sessão expirada ou token inválido. Por favor, autentique-se novamente.');
      } else {
        setAuthError(err.message || 'Erro ao carregar workspaces');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initApp();
  }, [initApp]);

  const handleAuthenticated = (user: { uid: string; email: string; name?: string }) => {
    setCurrentUser(user);
    initApp(user);
  };

  const handleLogout = () => {
    clearAuthToken();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setWorkspaces([]);
    setCurrentWorkspace(null);
    setAuthError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-military-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-zinc-400 font-medium">Iniciando Product OS Engine...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthView
        onAuthenticated={handleAuthenticated}
        error={authError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Navbar
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
        onSelectWorkspace={(ws) => setCurrentWorkspace(ws)}
        onOpenNewWorkspace={() => setShowWorkspaceModal(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentWorkspace ? (
          <>
            {activeTab === 'dashboard' && (
              <ExecutiveDashboardView
                workspaceId={currentWorkspace.id}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}
            {activeTab === 'strategy' && <StrategyView workspaceId={currentWorkspace.id} />}
            {activeTab === 'research' && <ResearchView workspaceId={currentWorkspace.id} />}
            {activeTab === 'evidence' && <EvidenceView workspaceId={currentWorkspace.id} />}
            {activeTab === 'personas' && <PersonasView workspaceId={currentWorkspace.id} />}
            {activeTab === 'problem' && <ProblemView workspaceId={currentWorkspace.id} />}
            {activeTab === 'opportunity' && <OpportunityView workspaceId={currentWorkspace.id} />}
            {activeTab === 'prioritization' && <PrioritizationView workspaceId={currentWorkspace.id} />}
            {activeTab === 'hypothesis' && <HypothesisView workspaceId={currentWorkspace.id} />}
            {activeTab === 'experiment' && <ExperimentView workspaceId={currentWorkspace.id} />}
            {activeTab === 'decision' && <DecisionView workspaceId={currentWorkspace.id} />}
            {activeTab === 'intelligence' && (
              <IntelligenceView
                workspaceId={currentWorkspace.id}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}
            {activeTab === 'roadmap' && <RoadmapView workspaceId={currentWorkspace.id} />}
            {activeTab === 'prd' && <PRDView workspaceId={currentWorkspace.id} />}
            {activeTab === 'outcomes' && <OutcomeReviewView workspaceId={currentWorkspace.id} />}
            {activeTab === 'toolkit' && (
              <ToolkitView
                workspaceId={currentWorkspace.id}
                initialToolKey={toolkitInitialTool}
              />
            )}
          </>
        ) : (
          <div className="text-center py-20 text-zinc-400 text-sm">
            Nenhum workspace selecionado. Crie ou selecione um workspace para iniciar.
          </div>
        )}
      </main>

      {showWorkspaceModal && (
        <WorkspaceModal
          onClose={() => setShowWorkspaceModal(false)}
          onCreated={(newWs) => {
            setWorkspaces((prev) => [...prev, newWs]);
            setCurrentWorkspace(newWs);
          }}
        />
      )}

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigateTab={(tab) => {
          setToolkitInitialTool(null);
          setActiveTab(tab);
        }}
        onOpenTool={(toolKey) => {
          setToolkitInitialTool(toolKey);
          setActiveTab('toolkit');
        }}
      />
    </div>
  );
}

