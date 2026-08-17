import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Users, Plus, AlertCircle, Trash2, Tag, CheckCircle2, HeartHandshake } from 'lucide-react';

interface PersonasViewProps {
  workspaceId: string;
}

export const PersonasView: React.FC<PersonasViewProps> = ({ workspaceId }) => {
  const [personas, setPersonas] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState(false);

  // Persona Form
  const [name, setName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [segment, setSegment] = useState('');
  const [description, setDescription] = useState('');
  const [jobsInput, setJobsInput] = useState('');
  const [painsInput, setPainsInput] = useState('');
  const [goalsInput, setGoalsInput] = useState('');

  // Segment Form
  const [segName, setSegName] = useState('');
  const [segType, setSegType] = useState('enterprise');
  const [segDesc, setSegDesc] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, sRes] = await Promise.all([
        apiFetch('/api/personas', {}, workspaceId),
        apiFetch('/api/personas/segments', {}, workspaceId),
      ]);
      setPersonas(pRes.data || []);
      setSegments(sRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar personas e segmentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) loadData();
  }, [workspaceId]);

  const handleCreatePersona = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch(
        '/api/personas',
        {
          method: 'POST',
          body: JSON.stringify({
            name,
            role_title: roleTitle,
            segment,
            description,
            jobs_to_be_done: jobsInput.split('\n').filter((l) => l.trim()),
            pains: painsInput.split('\n').filter((l) => l.trim()),
            goals: goalsInput.split('\n').filter((l) => l.trim()),
          }),
        },
        workspaceId
      );
      setShowPersonaModal(false);
      setName('');
      setRoleTitle('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar persona');
    }
  };

  const handleCreateSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch(
        '/api/personas/segments',
        {
          method: 'POST',
          body: JSON.stringify({
            name: segName,
            type: segType,
            description: segDesc,
          }),
        },
        workspaceId
      );
      setShowSegmentModal(false);
      setSegName('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar segmento');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-military-400" />
            Personas & Segmentos de Clientes
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Mapeie o perfil do usuário, dores reais, Jobs-To-Be-Done (JTBD) e critérios de segmentação para guiar o Discovery.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSegmentModal(true)}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition"
          >
            + Novo Segmento
          </button>
          <button
            onClick={() => setShowPersonaModal(true)}
            className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg transition flex items-center gap-2 shadow"
          >
            <Plus className="w-4 h-4" /> Criar Persona
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-zinc-400 text-sm">Carregando personas e segmentos...</div>
      ) : (
        <div className="space-y-6">
          {/* Segments horizontal list */}
          {segments.length > 0 && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Segmentos de Mercado & Clientes ({segments.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {segments.map((seg) => (
                  <span
                    key={seg.id}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-medium flex items-center gap-2"
                  >
                    <Tag className="w-3 h-3 text-military-400" />
                    <strong>{seg.name}</strong> ({seg.type})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Personas Cards Grid */}
          {personas.length === 0 ? (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-12 text-center">
              <Users className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-zinc-100 mb-1">Nenhuma Persona Cadastrada</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
                Crie a primeira persona para entender quem se beneficia da sua solução.
              </p>
              <button
                onClick={() => setShowPersonaModal(true)}
                className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow"
              >
                Criar Persona
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {personas.map((p) => (
                <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-zinc-100">{p.name}</h3>
                      <p className="text-xs text-military-300 font-medium">{p.role_title} • {p.segment || 'Geral'}</p>
                    </div>
                    <span className="w-8 h-8 rounded-full bg-military-900/80 border border-military-700/50 text-military-300 font-bold flex items-center justify-center text-xs">
                      {p.name.charAt(0)}
                    </span>
                  </div>

                  {p.description && <p className="text-xs text-zinc-300 italic">{p.description}</p>}

                  {/* JTBD */}
                  {p.jobs_to_be_done && p.jobs_to_be_done.length > 0 && (
                    <div className="space-y-1 pt-2 border-t border-zinc-800">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase">Jobs To Be Done (JTBD)</span>
                      <ul className="space-y-1">
                        {p.jobs_to_be_done.map((job: string, i: number) => (
                          <li key={i} className="text-xs text-zinc-200 flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{job}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pains */}
                  {p.pains && p.pains.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-rose-400 uppercase">Dores Principais (Pains)</span>
                      <ul className="space-y-1">
                        {p.pains.map((pain: string, i: number) => (
                          <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5"></span>
                            <span>{pain}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Persona Modal */}
      {showPersonaModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-lg w-full text-zinc-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-zinc-100 mb-4">Nova Persona do Produto</h3>
            <form onSubmit={handleCreatePersona} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Nome da Persona</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Camila Engenheira"
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Cargo / Papel</label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="Tech Lead / PM"
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Segmento</label>
                <input
                  type="text"
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                  placeholder="Enterprise / SMB"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Resumo do perfil comportamental..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Jobs To Be Done (1 por linha)</label>
                <textarea
                  value={jobsInput}
                  onChange={(e) => setJobsInput(e.target.value)}
                  rows={3}
                  placeholder="Configurar integração sem ler PDF&#10;Testar webhooks em tempo real"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Dores (1 por linha)</label>
                <textarea
                  value={painsInput}
                  onChange={(e) => setPainsInput(e.target.value)}
                  rows={3}
                  placeholder="Erros opacos de chave de API&#10;Falta de logs em tempo real"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPersonaModal(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow"
                >
                  Salvar Persona
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Segment Modal */}
      {showSegmentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full text-zinc-100">
            <h3 className="text-base font-bold text-zinc-100 mb-4">Novo Segmento de Clientes</h3>
            <form onSubmit={handleCreateSegment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Nome do Segmento</label>
                <input
                  type="text"
                  value={segName}
                  onChange={(e) => setSegName(e.target.value)}
                  placeholder="Ex: Enterprise Tech"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Tipo</label>
                <select
                  value={segType}
                  onChange={(e) => setSegType(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                >
                  <option value="enterprise">Enterprise</option>
                  <option value="smb">SMB / PME</option>
                  <option value="b2b">B2B Geral</option>
                  <option value="b2c">B2C</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Descrição & Critérios</label>
                <textarea
                  value={segDesc}
                  onChange={(e) => setSegDesc(e.target.value)}
                  rows={3}
                  placeholder="Mais de 50 colaboradores e volume alto de chamadas..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSegmentModal(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow"
                >
                  Salvar Segmento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
