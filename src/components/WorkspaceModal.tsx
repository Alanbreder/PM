import React, { useState } from 'react';
import { Workspace } from '../types';
import { apiFetch } from '../lib/api';
import { FolderKanban } from 'lucide-react';

interface WorkspaceModalProps {
  onClose: () => void;
  onCreated: (ws: Workspace) => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch('/api/workspaces', {
        method: 'POST',
        body: JSON.stringify({ name, description: description || undefined }),
      });
      onCreated(res.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao criar workspace');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full text-slate-100 shadow-2xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-indigo-400" />
          Criar Novo Workspace
        </h3>

        {error && <div className="mb-4 text-xs text-rose-400">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Nome do Workspace</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Produto B2B SaaS"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Descreva o escopo e produto deste workspace..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg"
            >
              {submitting ? 'Criando...' : 'Criar Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
