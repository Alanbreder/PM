import React, { useState, useEffect } from 'react';
import { 
  Link2, 
  X, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Unlink, 
  Search,
  FileText,
  AlertTriangle,
  Lightbulb,
  GitCommit,
  FlaskConical,
  CheckCircle2,
  Users
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { ToolKey } from '../../types/tools';

interface LinkedEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  toolKey: ToolKey;
  canvasData: Record<string, any>;
  currentEntityType?: string;
  currentEntityId?: string;
  onLinkUpdated: (entityType?: string, entityId?: string, entityTitle?: string) => void;
  onEntityConverted: (newEntity: any, entityType: string) => void;
}

export const LinkedEntityModal: React.FC<LinkedEntityModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  toolKey,
  canvasData,
  currentEntityType,
  currentEntityId,
  onLinkUpdated,
  onEntityConverted,
}) => {
  const [selectedType, setSelectedType] = useState<string>('opportunity');
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const entityTypes = [
    { id: 'problem', label: 'Problemas', icon: AlertCircle, endpoint: '/api/problems' },
    { id: 'opportunity', label: 'Oportunidades', icon: Lightbulb, endpoint: '/api/opportunities' },
    { id: 'hypothesis', label: 'Hipóteses', icon: GitCommit, endpoint: '/api/hypotheses' },
    { id: 'experiment', label: 'Experimentos', icon: FlaskConical, endpoint: '/api/experiments' },
    { id: 'decision', label: 'Decisões', icon: CheckCircle2, endpoint: '/api/decisions' },
    { id: 'persona', label: 'Personas', icon: Users, endpoint: '/api/personas' },
  ];

  const loadEntities = async (type: string) => {
    setLoading(true);
    setError(null);
    try {
      const typeConfig = entityTypes.find((t) => t.id === type);
      if (!typeConfig) return;
      const res = await apiFetch(typeConfig.endpoint, {}, workspaceId);
      setEntities(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar entidades');
      setEntities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadEntities(selectedType);
    }
  }, [isOpen, selectedType, workspaceId]);

  if (!isOpen) return null;

  const handleSelectEntity = (entity: any) => {
    onLinkUpdated(selectedType, entity.id, entity.title || entity.name);
    setSuccessMsg(`Vinculado com sucesso a "${entity.title || entity.name}"`);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  const handleUnlink = () => {
    onLinkUpdated(undefined, undefined, undefined);
    setSuccessMsg('Vínculo removido. Canvas agora está em modo Standalone.');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  const handleConvertToEntity = async (targetType: string) => {
    setConverting(true);
    setError(null);
    try {
      const res = await apiFetch(
        '/api/toolkit/convert-to-entity',
        {
          method: 'POST',
          body: JSON.stringify({
            tool_key: toolKey,
            target_entity_type: targetType,
            canvas_data: canvasData,
          }),
        },
        workspaceId
      );

      if (res.data) {
        onEntityConverted(res.data, targetType);
        onLinkUpdated(targetType, res.data.id, res.data.title || res.data.name);
        setSuccessMsg(`Criado e vinculado com sucesso: ${res.data.title || res.data.name}`);
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao converter em entidade do Product OS');
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl text-zinc-100 animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-military-600/30 text-military-300 border border-military-500/40">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Vínculo com o Product OS</h2>
              <p className="text-[11px] text-zinc-400">
                Conecte este canvas aos fluxos de discovery ou transforme os dados em uma nova entidade.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="m-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {successMsg && (
          <div className="m-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            {successMsg}
          </div>
        )}

        <div className="p-5 space-y-6 text-xs">
          {/* Quick Actions: Convert to Real Product OS Entity */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-zinc-200 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-military-400" />
                Transformar dados deste Canvas em Entidade do Product OS
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Sem Duplicação</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              Gera automaticamente um registro oficial no fluxo de produto preenchido com as informações atuais deste canvas.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => handleConvertToEntity('problem')}
                disabled={converting}
                className="p-2.5 bg-zinc-900 hover:bg-military-900/60 border border-zinc-800 hover:border-military-600 rounded-lg text-left transition group"
              >
                <div className="font-semibold text-zinc-200 group-hover:text-military-300 flex items-center justify-between">
                  Criar Problema
                  <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Para fluxo de validação</div>
              </button>

              <button
                onClick={() => handleConvertToEntity('opportunity')}
                disabled={converting}
                className="p-2.5 bg-zinc-900 hover:bg-military-900/60 border border-zinc-800 hover:border-military-600 rounded-lg text-left transition group"
              >
                <div className="font-semibold text-zinc-200 group-hover:text-military-300 flex items-center justify-between">
                  Criar Oportunidade
                  <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Para priorização RICE</div>
              </button>

              <button
                onClick={() => handleConvertToEntity('hypothesis')}
                disabled={converting}
                className="p-2.5 bg-zinc-900 hover:bg-military-900/60 border border-zinc-800 hover:border-military-600 rounded-lg text-left transition group"
              >
                <div className="font-semibold text-zinc-200 group-hover:text-military-300 flex items-center justify-between">
                  Criar Hipótese
                  <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Para teste em discovery</div>
              </button>

              <button
                onClick={() => handleConvertToEntity('experiment')}
                disabled={converting}
                className="p-2.5 bg-zinc-900 hover:bg-military-900/60 border border-zinc-800 hover:border-military-600 rounded-lg text-left transition group"
              >
                <div className="font-semibold text-zinc-200 group-hover:text-military-300 flex items-center justify-between">
                  Criar Experimento
                  <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Para execução de testes</div>
              </button>

              <button
                onClick={() => handleConvertToEntity('decision')}
                disabled={converting}
                className="p-2.5 bg-zinc-900 hover:bg-military-900/60 border border-zinc-800 hover:border-military-600 rounded-lg text-left transition group"
              >
                <div className="font-semibold text-zinc-200 group-hover:text-military-300 flex items-center justify-between">
                  Criar Decisão
                  <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Para registro no comitê</div>
              </button>

              <button
                onClick={() => handleConvertToEntity('persona')}
                disabled={converting}
                className="p-2.5 bg-zinc-900 hover:bg-military-900/60 border border-zinc-800 hover:border-military-600 rounded-lg text-left transition group"
              >
                <div className="font-semibold text-zinc-200 group-hover:text-military-300 flex items-center justify-between">
                  Criar Persona
                  <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Perfil de usuário</div>
              </button>
            </div>
          </div>

          {/* Connect to Existing Entity */}
          <div className="space-y-3">
            <div className="font-bold text-zinc-200 text-xs flex items-center justify-between">
              <span>Ou vincular a um item existente:</span>
              {currentEntityId && (
                <button
                  onClick={handleUnlink}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <Unlink className="w-3 h-3" /> Desvincular e deixar Standalone
                </button>
              )}
            </div>

            {/* Type selector tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {entityTypes.map((type) => {
                const Icon = type.icon;
                const isActive = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
                      isActive
                        ? 'bg-military-600 text-white font-bold'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {type.label}
                  </button>
                );
              })}
            </div>

            {/* Entity List */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 max-h-56 overflow-y-auto space-y-1.5">
              {loading ? (
                <div className="p-6 text-center text-zinc-500">Carregando itens...</div>
              ) : entities.length === 0 ? (
                <div className="p-6 text-center text-zinc-500">
                  Nenhum registro encontrado nesta categoria.
                </div>
              ) : (
                entities.map((item) => {
                  const isCurrent = currentEntityId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectEntity(item)}
                      className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200'
                          : 'bg-zinc-900 border-zinc-800/80 hover:bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-zinc-100 flex items-center gap-2">
                          {item.title || item.name}
                          {isCurrent && (
                            <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                              Atualmente Vinculado
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 line-clamp-1">
                          {item.description || item.statement || item.objective || item.role_title || 'Sem descrição'}
                        </div>
                      </div>
                      <button className="px-2.5 py-1 bg-zinc-800 hover:bg-military-600 text-zinc-200 hover:text-white rounded text-[11px] font-medium transition">
                        Selecionar
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
