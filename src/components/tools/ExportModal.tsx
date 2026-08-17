import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  Copy, 
  Check, 
  X, 
  FileText, 
  Share2, 
  Layers,
  Sparkles
} from 'lucide-react';
import { ToolKey } from '../../types/tools';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolKey: ToolKey;
  toolTitle: string;
  instanceTitle: string;
  canvasData: Record<string, any>;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  toolKey,
  toolTitle,
  instanceTitle,
  canvasData,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      tool_key: toolKey,
      title: instanceTitle || toolTitle,
      exported_at: new Date().toISOString(),
      canvas_data: canvasData,
    }, null, 2));

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${toolKey}_${instanceTitle.replace(/\s+/g, '_').toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const generateMarkdown = () => {
    let md = `# ${instanceTitle || toolTitle}\n`;
    md += `*Tipo de Ferramenta: ${toolTitle} | Exportado via Product OS em ${new Date().toLocaleDateString('pt-BR')}*\n\n`;

    Object.entries(canvasData).forEach(([key, value]) => {
      const formattedKey = key.replace(/_/g, ' ').toUpperCase();
      if (typeof value === 'object' && value !== null) {
        md += `### ${formattedKey}\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\`\n\n`;
      } else {
        md += `### ${formattedKey}\n${value || '*(Não informado)*'}\n\n`;
      }
    });

    return md;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(canvasData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl text-zinc-100 animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-military-600/30 text-military-300 border border-military-500/40">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Exportar & Compartilhar Canvas</h2>
              <p className="text-[11px] text-zinc-400">
                {instanceTitle || toolTitle}
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

        {/* Options */}
        <div className="p-5 space-y-3 text-xs">
          {/* Print Option */}
          <button
            onClick={handlePrint}
            className="w-full p-3.5 bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 rounded-xl flex items-center justify-between transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-military-950 border border-military-700/60 text-military-300 group-hover:scale-105 transition">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-zinc-200 group-hover:text-military-300">
                  Imprimir ou Salvar como PDF
                </div>
                <div className="text-[11px] text-zinc-400">
                  Layout limpo otimizado para formato A4 e apresentações de comitê.
                </div>
              </div>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">PDF / Impressora</span>
          </button>

          {/* Copy Markdown */}
          <button
            onClick={handleCopyMarkdown}
            className="w-full p-3.5 bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 rounded-xl flex items-center justify-between transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 group-hover:scale-105 transition">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-zinc-200 group-hover:text-military-300">
                  Copiar em Markdown
                </div>
                <div className="text-[11px] text-zinc-400">
                  Formato ideal para colar no Notion, Jira, Slack ou Confluence.
                </div>
              </div>
            </div>
            <span className="text-xs text-military-400 font-medium">
              {copiedMd ? <Check className="w-4 h-4 text-emerald-400" /> : 'Copiar'}
            </span>
          </button>

          {/* Download JSON */}
          <button
            onClick={handleDownloadJSON}
            className="w-full p-3.5 bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 rounded-xl flex items-center justify-between transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 group-hover:scale-105 transition">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-zinc-200 group-hover:text-military-300">
                  Baixar Arquivo JSON
                </div>
                <div className="text-[11px] text-zinc-400">
                  Backup bruto estruturado com todos os dados preenchidos.
                </div>
              </div>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">.json</span>
          </button>

          {/* Copy JSON */}
          <button
            onClick={handleCopyJSON}
            className="w-full p-3.5 bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 rounded-xl flex items-center justify-between transition group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 group-hover:scale-105 transition">
                <Copy className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-zinc-200 group-hover:text-military-300">
                  Copiar JSON para Área de Transferência
                </div>
                <div className="text-[11px] text-zinc-400">
                  Copia a estrutura de dados para integração ou migração.
                </div>
              </div>
            </div>
            <span className="text-xs text-military-400 font-medium">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : 'Copiar'}
            </span>
          </button>
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
