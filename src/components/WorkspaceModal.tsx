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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full text-zinc-100 shadow-2xl">
        <h3 className="text-base font-bold text-zinc-100 mb-4 flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-military-400" />
          Criar Novo Workspace
        </h3>

        {error && <div className="mb-4 text-xs text-rose-400">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Nome do Workspace</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Produto B2B SaaS"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Descreva o escopo e produto deste workspace..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow"
            >
              {submitting ? 'Criando...' : 'Criar Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
