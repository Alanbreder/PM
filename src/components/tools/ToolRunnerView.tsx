import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ToolKey, ToolTemplate, AICoachEvaluation, CanvasInstance } from '../../types/tools';
import { apiFetch } from '../../lib/api';
import { ToolHeader } from './ToolHeader';
import { AICoachDrawer } from './AICoachDrawer';
import { LinkedEntityModal } from './LinkedEntityModal';
import { ExportModal } from './ExportModal';
import { TOOL_TEMPLATES } from './templates';

// Implementations
import { ProductCanvasTool } from './impl/ProductCanvasTool';
import { ProductVisionBoardTool } from './impl/ProductVisionBoardTool';
import { OSTTool } from './impl/OSTTool';
import { PersonasTool } from './impl/PersonasTool';
import { UserJourneyMapTool } from './impl/UserJourneyMapTool';
import { JTBDTool } from './impl/JTBDTool';
import { ProblemStatementTool } from './impl/ProblemStatementTool';
import { ValuePropositionCanvasTool } from './impl/ValuePropositionCanvasTool';
import { RICEPrioritizationTool } from './impl/RICEPrioritizationTool';
import { ImpactEffortMatrixTool } from './impl/ImpactEffortMatrixTool';
import { AssumptionMapTool } from './impl/AssumptionMapTool';
import { ExperimentCanvasTool } from './impl/ExperimentCanvasTool';
import { DecisionCanvasTool } from './impl/DecisionCanvasTool';
import { StoryMapTool } from './impl/StoryMapTool';
import { LeanCanvasTool } from './impl/LeanCanvasTool';
import { EmpathyMapTool } from './impl/EmpathyMapTool';
import { ProductStrategyTool } from './impl/ProductStrategyTool';
import { PRDCanvasTool } from './impl/PRDCanvasTool';

interface ToolRunnerViewProps {
  toolKey: ToolKey;
  canvasId?: string;
  workspaceId: string;
  onBackToHub: () => void;
}

const TOOL_TITLES: Record<ToolKey, { name: string; description: string }> = {
  product_canvas: {
    name: 'Product Canvas',
    description: 'Roman Pichler framework: visao holistica, publico, jornada, metricas e escopo.',
  },
  product_vision_board: {
    name: 'Product Vision Board',
    description: 'Alinhamento estrategico da visao, publico, necessidades, produto e metas de negocio.',
  },
  opportunity_solution_tree: {
    name: 'Opportunity Solution Tree',
    description: 'Teresa Torres discovery tree: conecte Desired Outcome a Oportunidades, Solucoes e Testes.',
  },
  personas: {
    name: 'Personas & Arquetipos',
    description: 'Mapeamento profundo de perfis de usuario, dores, objetivos e habitos.',
  },
  user_journey_map: {
    name: 'User Journey Map',
    description: 'Jornada passo a passo do usuario com pensamentos, emocoes e pontos de dor.',
  },
  jtbd: {
    name: 'Jobs To Be Done',
    description: 'Clayton Christensen framework: dimensoes funcional, emocional e social.',
  },
  problem_statement: {
    name: 'Problem Statement',
    description: 'Estruturacao formal do problema com gravidade, frequencia, evidencia e impacto.',
  },
  value_proposition_canvas: {
    name: 'Value Proposition Canvas',
    description: 'Estrategia de produto: encaixe entre Customer Profile e Value Map.',
  },
  rice_prioritization: {
    name: 'RICE Prioritization',
    description: 'Priorizacao quantitativa transparente com Reach, Impact, Confidence e Effort.',
  },
  impact_effort_matrix: {
    name: 'Matriz Impacto x Esforco',
    description: 'Matriz 2x2 para decisao rapida entre Quick Wins e Grandes Apostas.',
  },
  assumption_map: {
    name: 'Assumption Map (Matriz de Riscos)',
    description: 'Mapeamento 2x2 de Importancia x Incerteza para identificar o que testar primeiro.',
  },
  experiment_canvas: {
    name: 'Experiment Canvas',
    description: 'Desenho rigoroso de testes, premissas mais arriscadas e criterios de sucesso.',
  },
  decision_canvas: {
    name: 'Decision Canvas',
    description: 'Registro de governanca de decisoes estrategicas, trade-offs e opcoes avaliadas.',
  },
  story_map: {
    name: 'User Story Mapping',
    description: 'Jeff Patton story mapping com fatiamento de releases e escopo essencial de MVP.',
  },
  empathy_map: {
    name: 'Mapa de Empatia',
    description: 'Dave Gray framework: o que o usuário Diz, Pensa, Faz, Sente, Dores e Ganhos.',
  },
  product_strategy: {
    name: 'Estratégia de Produto',
    description: 'Visão, mercado-alvo, problema, apostas estratégicas, diferenciais e métricas.',
  },
  prd_canvas: {
    name: 'PRD Canvas (Product Requirements)',
    description: 'Documento completo de requisitos, histórias, regras de negócio e critérios de aceite.',
  },
  lean_canvas: {
    name: 'Lean Canvas',
    description: 'Ash Maurya 9-box canvas para modelo de negocio e proposta de valor.',
  },
};

export const ToolRunnerView: React.FC<ToolRunnerViewProps> = ({
  toolKey,
  canvasId,
  workspaceId,
  onBackToHub,
}) => {
  const meta = TOOL_TITLES[toolKey] || { name: 'Product Tool', description: '' };

  const [currentId, setCurrentId] = useState<string | undefined>(canvasId);
  const [instanceTitle, setInstanceTitle] = useState<string>(meta.name);
  const [canvasData, setCanvasData] = useState<Record<string, any>>({});
  const [entityType, setEntityType] = useState<string | undefined>();
  const [entityId, setEntityId] = useState<string | undefined>();
  const [entityTitle, setEntityTitle] = useState<string | undefined>();

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [loading, setLoading] = useState(true);

  // Modals & Drawers
  const [isAICoachOpen, setIsAICoachOpen] = useState(false);
  const [aiCoachLoading, setAiCoachLoading] = useState(false);
  const [aiCoachEvaluation, setAiCoachEvaluation] = useState<AICoachEvaluation | null>(null);

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Debounced auto-save timer ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // 1. Initial Load from Backend
  useEffect(() => {
    let isMounted = true;
    async function loadCanvas() {
      setLoading(true);
      try {
        const targetParam = currentId || toolKey;
        const res = await apiFetch(`/api/toolkit/canvases/${targetParam}`, {}, workspaceId);
        if (res.data && isMounted) {
          setCurrentId(res.data.id);
          setInstanceTitle(res.data.title || meta.name);
          setCanvasData(res.data.canvas_data || {});
          setEntityType(res.data.entity_type);
          setEntityId(res.data.entity_id);
        } else if (isMounted) {
          // Initialize with default template
          const defaultTpl = TOOL_TEMPLATES[toolKey]?.[0];
          setCanvasData(defaultTpl?.data || {});
        }
      } catch (err) {
        console.error('Falha ao carregar canvas:', err);
        const defaultTpl = TOOL_TEMPLATES[toolKey]?.[0];
        setCanvasData(defaultTpl?.data || {});
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCanvas();

    return () => {
      isMounted = false;
    };
  }, [toolKey, canvasId, workspaceId]);

  // 2. Perform Save Function
  const performSave = useCallback(
    async (dataToSave: Record<string, any>, titleToSave: string, eType?: string, eId?: string) => {
      setSaveStatus('saving');
      try {
        const res = await apiFetch(
          '/api/toolkit/canvases',
          {
            method: 'POST',
            body: JSON.stringify({
              id: currentId,
              tool_key: toolKey,
              title: titleToSave || meta.name,
              entity_type: eType,
              entity_id: eId,
              canvas_data: dataToSave,
            }),
          },
          workspaceId
        );

        if (res.data) {
          setCurrentId(res.data.id);
          setSaveStatus('saved');
        }
      } catch (err) {
        console.error('Erro ao salvar canvas:', err);
        setSaveStatus('unsaved');
      }
    },
    [currentId, toolKey, meta.name, workspaceId]
  );

  // 3. Trigger AutoSave with 1000ms Debounce
  const handleDataChange = (newData: any) => {
    setCanvasData(newData);
    setSaveStatus('unsaved');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      performSave(newData, instanceTitle, entityType, entityId);
    }, 1000);
  };

  const handleUpdateTitle = (newTitle: string) => {
    setInstanceTitle(newTitle);
    performSave(canvasData, newTitle, entityType, entityId);
  };

  const handleApplyTemplate = (tpl: ToolTemplate) => {
    if (window.confirm(`Substituir dados atuais pelo template "${tpl.name}"?`)) {
      handleDataChange(tpl.data);
    }
  };

  const handleReset = () => {
    if (window.confirm('Deseja realmente limpar todos os campos deste canvas?')) {
      const defaultTpl = TOOL_TEMPLATES[toolKey]?.[0];
      handleDataChange(defaultTpl?.data || {});
    }
  };

  const handleDuplicate = async () => {
    if (!currentId) {
      await performSave(canvasData, `${instanceTitle} (Cópia)`);
      return;
    }
    try {
      const res = await apiFetch(`/api/toolkit/canvases/${currentId}/duplicate`, { method: 'POST' }, workspaceId);
      if (res.data) {
        setCurrentId(res.data.id);
        setInstanceTitle(res.data.title);
        alert('Canvas duplicado com sucesso!');
      }
    } catch (err: any) {
      alert(`Falha ao duplicar: ${err.message}`);
    }
  };

  // AI Coach Analysis
  const runAICoachAnalysis = async () => {
    setIsAICoachOpen(true);
    setAiCoachLoading(true);
    try {
      const res = await apiFetch(
        '/api/toolkit/ai-coach',
        {
          method: 'POST',
          body: JSON.stringify({
            tool_key: toolKey,
            tool_title: instanceTitle || meta.name,
            canvas_data: canvasData,
          }),
        },
        workspaceId
      );

      if (res.data) {
        setAiCoachEvaluation(res.data);
      }
    } catch (err) {
      console.error('Erro na analise do AI Coach:', err);
    } finally {
      setAiCoachLoading(false);
    }
  };

  // Render Tool Subcomponent
  const renderToolComponent = () => {
    switch (toolKey) {
      case 'product_canvas':
        return <ProductCanvasTool data={canvasData} onChange={handleDataChange} />;
      case 'product_vision_board':
        return <ProductVisionBoardTool data={canvasData} onChange={handleDataChange} />;
      case 'opportunity_solution_tree':
        return <OSTTool data={canvasData} onChange={handleDataChange} />;
      case 'personas':
        return <PersonasTool data={canvasData} onChange={handleDataChange} />;
      case 'user_journey_map':
        return <UserJourneyMapTool data={canvasData} onChange={handleDataChange} />;
      case 'jtbd':
        return <JTBDTool data={canvasData} onChange={handleDataChange} />;
      case 'problem_statement':
        return <ProblemStatementTool data={canvasData} onChange={handleDataChange} />;
      case 'value_proposition_canvas':
        return <ValuePropositionCanvasTool data={canvasData} onChange={handleDataChange} />;
      case 'rice_prioritization':
        return <RICEPrioritizationTool data={canvasData} onChange={handleDataChange} />;
      case 'impact_effort_matrix':
        return <ImpactEffortMatrixTool data={canvasData} onChange={handleDataChange} />;
      case 'assumption_map':
        return <AssumptionMapTool data={canvasData} onChange={handleDataChange} />;
      case 'experiment_canvas':
        return <ExperimentCanvasTool data={canvasData} onChange={handleDataChange} />;
      case 'decision_canvas':
        return <DecisionCanvasTool data={canvasData} onChange={handleDataChange} />;
      case 'story_map':
        return <StoryMapTool data={canvasData} onChange={handleDataChange} />;
      case 'empathy_map':
        return <EmpathyMapTool data={canvasData} onChange={handleDataChange} />;
      case 'product_strategy':
        return <ProductStrategyTool data={canvasData} onChange={handleDataChange} />;
      case 'prd_canvas':
        return <PRDCanvasTool data={canvasData} onChange={handleDataChange} />;
      case 'lean_canvas':
        return <LeanCanvasTool data={canvasData} onChange={handleDataChange} />;
      default:
        return <LeanCanvasTool data={canvasData} onChange={handleDataChange} />;
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-military-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-zinc-400 text-xs font-medium">Carregando ferramenta de produto...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* Tool Header with Title, Templates, Save Status & Global Actions */}
      <ToolHeader
        toolKey={toolKey}
        toolTitle={meta.name}
        toolDescription={meta.description}
        instanceTitle={instanceTitle}
        onUpdateTitle={handleUpdateTitle}
        saveStatus={saveStatus}
        isLinked={Boolean(entityId)}
        linkedEntityName={entityTitle}
        onOpenAICoach={runAICoachAnalysis}
        onOpenLinkModal={() => setIsLinkModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onDuplicate={handleDuplicate}
        onReset={handleReset}
        onApplyTemplate={handleApplyTemplate}
        onBackToHub={onBackToHub}
      />

      {/* Active Tool Canvas Body */}
      <div className="min-h-[500px]">{renderToolComponent()}</div>

      {/* AI Coach Drawer */}
      <AICoachDrawer
        isOpen={isAICoachOpen}
        onClose={() => setIsAICoachOpen(false)}
        loading={aiCoachLoading}
        evaluation={aiCoachEvaluation}
        onReanalyze={runAICoachAnalysis}
        toolTitle={instanceTitle || meta.name}
      />

      {/* Link to Product OS Modal */}
      <LinkedEntityModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        workspaceId={workspaceId}
        toolKey={toolKey}
        canvasData={canvasData}
        currentEntityType={entityType}
        currentEntityId={entityId}
        onLinkUpdated={(newType, newId, newTitle) => {
          setEntityType(newType);
          setEntityId(newId);
          setEntityTitle(newTitle);
          performSave(canvasData, instanceTitle, newType, newId);
        }}
        onEntityConverted={(newEntity, newType) => {
          setEntityType(newType);
          setEntityId(newEntity.id);
          setEntityTitle(newEntity.title || newEntity.name);
          performSave(canvasData, instanceTitle, newType, newEntity.id);
        }}
      />

      {/* Export / Print Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        toolKey={toolKey}
        toolTitle={meta.name}
        instanceTitle={instanceTitle}
        canvasData={canvasData}
      />
    </div>
  );
};
