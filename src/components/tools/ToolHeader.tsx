import React from 'react';
import { 
  Sparkles, 
  Save, 
  Link2, 
  Printer, 
  Copy, 
  RotateCcw, 
  ArrowLeft, 
  CheckCircle2, 
  Cloud,
  FileText,
  Layers,
  ChevronDown
} from 'lucide-react';
import { ToolKey, ToolTemplate } from '../../types/tools';
import { TOOL_TEMPLATES } from './templates';

interface ToolHeaderProps {
  toolKey: ToolKey;
  toolTitle: string;
  toolDescription: string;
  instanceTitle: string;
  onUpdateTitle: (newTitle: string) => void;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  isLinked: boolean;
  linkedEntityName?: string;
  onOpenAICoach: () => void;
  onOpenLinkModal: () => void;
  onOpenExportModal: () => void;
  onDuplicate: () => void;
  onReset: () => void;
  onApplyTemplate: (template: ToolTemplate) => void;
  onBackToHub: () => void;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({
  toolKey,
  toolTitle,
  toolDescription,
  instanceTitle,
  onUpdateTitle,
  saveStatus,
  isLinked,
  linkedEntityName,
  onOpenAICoach,
  onOpenLinkModal,
  onOpenExportModal,
  onDuplicate,
  onReset,
  onApplyTemplate,
  onBackToHub,
}) => {
  const templates = TOOL_TEMPLATES[toolKey] || [];
  const [showTemplatesDropdown, setShowTemplatesDropdown] = React.useState(false);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [tempTitle, setTempTitle] = React.useState(instanceTitle);

  React.useEffect(() => {
    setTempTitle(instanceTitle);
  }, [instanceTitle]);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (tempTitle.trim() && tempTitle !== instanceTitle) {
      onUpdateTitle(tempTitle.trim());
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4 mb-6">
      {/* Top Bar: Navigation, Title & Save Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <button
            onClick={onBackToHub}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 transition shrink-0"
            title="Voltar ao Hub de Ferramentas"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-military-900/80 text-military-300 border border-military-700/60 text-[10px] font-bold uppercase tracking-wider">
                {toolTitle}
              </span>

              {isLinked ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[10px] font-medium flex items-center gap-1">
                  <Link2 className="w-3 h-3 text-emerald-400" /> Vinculado ao Product OS ({linkedEntityName || 'Conectado'})
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-medium">
                  Modo Independente (Standalone)
                </span>
              )}

              {/* AutoSave Indicator */}
              <div className="flex items-center gap-1 text-[11px]">
                {saveStatus === 'saving' && (
                  <span className="text-zinc-400 flex items-center gap-1 animate-pulse">
                    <Cloud className="w-3.5 h-3.5 text-military-400" /> Salvando...
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Salvo automaticamente
                  </span>
                )}
                {saveStatus === 'unsaved' && (
                  <span className="text-amber-400 flex items-center gap-1">
                    <Save className="w-3.5 h-3.5" /> Alterações pendentes
                  </span>
                )}
              </div>
            </div>

            {/* Editable Title */}
            <div className="mt-1">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={handleTitleSubmit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSubmit();
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                    autoFocus
                    className="text-lg font-bold text-zinc-100 bg-zinc-800 border border-military-500 rounded px-2 py-0.5 outline-none"
                  />
                  <button
                    onClick={handleTitleSubmit}
                    className="text-xs bg-military-600 px-2 py-1 rounded text-white font-medium"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <h1
                  onClick={() => setIsEditingTitle(true)}
                  className="text-lg font-bold text-zinc-100 cursor-pointer hover:text-military-300 transition flex items-center gap-2 group"
                  title="Clique para editar o título deste canvas"
                >
                  {instanceTitle || toolTitle}
                  <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400 font-normal">
                    (clique para renomear)
                  </span>
                </h1>
              )}
              <p className="text-xs text-zinc-400 mt-0.5">{toolDescription}</p>
            </div>
          </div>
        </div>

        {/* Actions Cluster */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Templates Dropdown */}
          {templates.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setShowTemplatesDropdown(!showTemplatesDropdown)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition flex items-center gap-1.5 border border-zinc-700"
              >
                <Layers className="w-3.5 h-3.5 text-military-400" />
                Templates
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {showTemplatesDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl z-50 p-2 space-y-1">
                  <div className="px-2 py-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 mb-1">
                    Carregar Template
                  </div>
                  {templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        onApplyTemplate(tpl);
                        setShowTemplatesDropdown(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800 transition text-xs group"
                    >
                      <div className="font-semibold text-zinc-200 group-hover:text-military-300">
                        {tpl.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 line-clamp-1">
                        {tpl.description}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Link to Product OS Button */}
          <button
            onClick={onOpenLinkModal}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 border ${
              isLinked
                ? 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800/80'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
            }`}
            title="Conectar dados deste Canvas a entidades do Product OS"
          >
            <Link2 className="w-3.5 h-3.5 text-military-400" />
            {isLinked ? 'Gerenciar Vínculo' : 'Vincular ao Product OS'}
          </button>

          {/* AI Product Coach Button */}
          <button
            onClick={onOpenAICoach}
            className="px-3.5 py-1.5 bg-gradient-to-r from-military-700 to-military-600 hover:from-military-600 hover:to-military-500 text-zinc-100 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-sm border border-military-500/40"
            title="Receber feedback crítico e recomendações do Product Coach de IA"
          >
            <Sparkles className="w-3.5 h-3.5 text-military-300 animate-pulse" />
            Product Coach (IA)
          </button>

          {/* Export / Print */}
          <button
            onClick={onOpenExportModal}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-lg transition border border-zinc-700"
            title="Exportar / Imprimir Canvas"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Duplicate */}
          <button
            onClick={onDuplicate}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-lg transition border border-zinc-700"
            title="Duplicar este Canvas"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="p-2 bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 rounded-lg transition border border-zinc-700"
            title="Limpar campos do Canvas"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
