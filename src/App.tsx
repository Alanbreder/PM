import React, { useState, useEffect } from 'react';
import { Workspace } from './types';
import { apiFetch } from './lib/api';
import { Navbar } from './components/Navbar';
import { ResearchView } from './components/ResearchView';
import { EvidenceView } from './components/EvidenceView';
import { ProblemView } from './components/ProblemView';
import { OpportunityView } from './components/OpportunityView';
import { HypothesisView } from './components/HypothesisView';
import { ExperimentView } from './components/ExperimentView';
import { DecisionView } from './components/DecisionView';
import { IntelligenceView } from './components/IntelligenceView';
import { WorkspaceModal } from './components/WorkspaceModal';

export default function App() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [activeTab, setActiveTab] = useState('intelligence'); // Default to Etapa 7: Inteligência do Produto
  const [loading, setLoading] = useState(true);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);

  const initApp = async () => {
    setLoading(true);
    try {
      // Sync demo user
      await apiFetch('/api/auth/sync-user', {
        method: 'POST',
        body: JSON.stringify({
          uid: 'usr_demo_admin',
          email: 'demo@productos.io',
          name: 'Demo Admin',
        }),
      });

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
      setCurrentWorkspace(list[0]);
    } catch (err) {
      console.error('App init error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initApp();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-medium">Iniciando Product OS Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
        onSelectWorkspace={(ws) => setCurrentWorkspace(ws)}
        onOpenNewWorkspace={() => setShowWorkspaceModal(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentWorkspace ? (
          <>
            {activeTab === 'research' && <ResearchView workspaceId={currentWorkspace.id} />}
            {activeTab === 'evidence' && <EvidenceView workspaceId={currentWorkspace.id} />}
            {activeTab === 'problem' && <ProblemView workspaceId={currentWorkspace.id} />}
            {activeTab === 'opportunity' && <OpportunityView workspaceId={currentWorkspace.id} />}
            {activeTab === 'hypothesis' && <HypothesisView workspaceId={currentWorkspace.id} />}
            {activeTab === 'experiment' && <ExperimentView workspaceId={currentWorkspace.id} />}
            {activeTab === 'decision' && <DecisionView workspaceId={currentWorkspace.id} />}
            {activeTab === 'intelligence' && (
              <IntelligenceView
                workspaceId={currentWorkspace.id}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}
          </>
        ) : (
          <div className="text-center py-20 text-slate-400 text-sm">
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
    </div>
  );
}
