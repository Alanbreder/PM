import React from 'react';
import { Plus, Trash2, Layers, Tag } from 'lucide-react';

interface StoryTask {
  id: string;
  name: string;
  mvp_stories: string[];
  release_1_stories: string[];
  release_2_stories: string[];
}

interface StoryActivity {
  id: string;
  name: string;
  tasks: StoryTask[];
}

interface StoryMapToolProps {
  data: {
    activities?: StoryActivity[];
  };
  onChange: (newData: any) => void;
}

export const StoryMapTool: React.FC<StoryMapToolProps> = ({ data, onChange }) => {
  const activities = data.activities || [
    {
      id: 'act_1',
      name: '1. Buscar Produtos',
      tasks: [
        {
          id: 'task_1',
          name: 'Pesquisar por texto',
          mvp_stories: ['Campo de busca com correspondência exata'],
          release_1_stories: ['Auto-complete e sugestões'],
          release_2_stories: ['Busca por imagem e voz'],
        },
      ],
    },
  ];

  const addActivity = () => {
    const newAct: StoryActivity = {
      id: `act_${Date.now()}`,
      name: `Nova Atividade ${activities.length + 1}`,
      tasks: [
        {
          id: `task_${Date.now()}_1`,
          name: 'Passo Inicial',
          mvp_stories: ['História MVP'],
          release_1_stories: [],
          release_2_stories: [],
        },
      ],
    };
    onChange({ ...data, activities: [...activities, newAct] });
  };

  const removeActivity = (actIdx: number) => {
    const updated = activities.filter((_, idx) => idx !== actIdx);
    onChange({ ...data, activities: updated });
  };

  const updateActivityName = (actIdx: number, name: string) => {
    const updated = [...activities];
    updated[actIdx].name = name;
    onChange({ ...data, activities: updated });
  };

  const addTask = (actIdx: number) => {
    const updated = [...activities];
    updated[actIdx].tasks.push({
      id: `task_${Date.now()}`,
      name: 'Novo Passo de Usuário',
      mvp_stories: ['História de Usuário'],
      release_1_stories: [],
      release_2_stories: [],
    });
    onChange({ ...data, activities: updated });
  };

  const removeTask = (actIdx: number, taskIdx: number) => {
    const updated = [...activities];
    updated[actIdx].tasks = updated[actIdx].tasks.filter((_, idx) => idx !== taskIdx);
    onChange({ ...data, activities: updated });
  };

  const updateTaskName = (actIdx: number, taskIdx: number, name: string) => {
    const updated = [...activities];
    updated[actIdx].tasks[taskIdx].name = name;
    onChange({ ...data, activities: updated });
  };

  const addStory = (
    actIdx: number,
    taskIdx: number,
    release: 'mvp_stories' | 'release_1_stories' | 'release_2_stories'
  ) => {
    const updated = [...activities];
    updated[actIdx].tasks[taskIdx][release].push('Nova História');
    onChange({ ...data, activities: updated });
  };

  const updateStory = (
    actIdx: number,
    taskIdx: number,
    release: 'mvp_stories' | 'release_1_stories' | 'release_2_stories',
    storyIdx: number,
    text: string
  ) => {
    const updated = [...activities];
    updated[actIdx].tasks[taskIdx][release][storyIdx] = text;
    onChange({ ...data, activities: updated });
  };

  const removeStory = (
    actIdx: number,
    taskIdx: number,
    release: 'mvp_stories' | 'release_1_stories' | 'release_2_stories',
    storyIdx: number
  ) => {
    const updated = [...activities];
    updated[actIdx].tasks[taskIdx][release] = updated[actIdx].tasks[taskIdx][release].filter(
      (_, idx) => idx !== storyIdx
    );
    onChange({ ...data, activities: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-military-400 uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          User Story Mapping (Jeff Patton Framework)
        </div>
        <button
          onClick={addActivity}
          className="px-3 py-1.5 bg-military-600 hover:bg-military-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar Atividade / Épico
        </button>
      </div>

      {/* Horizontal Activities Board */}
      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-zinc-700">
        {activities.map((act, actIdx) => (
          <div
            key={act.id || actIdx}
            className="w-96 shrink-0 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col space-y-4 shadow-sm"
          >
            {/* Activity Header (Top Backbone) */}
            <div className="bg-military-950 border border-military-800/80 p-3 rounded-xl flex items-center justify-between">
              <input
                type="text"
                value={act.name}
                onChange={(e) => updateActivityName(actIdx, e.target.value)}
                className="font-bold text-xs text-military-200 bg-transparent outline-none w-full border-b border-transparent focus:border-military-500"
              />
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => addTask(actIdx)}
                  className="px-2 py-1 bg-military-900 hover:bg-military-800 text-military-200 text-[10px] font-semibold rounded transition"
                  title="Adicionar passo de usuário"
                >
                  <Plus className="w-3 h-3" />
                </button>
                {activities.length > 1 && (
                  <button
                    onClick={() => removeActivity(actIdx)}
                    className="p-1 text-military-400 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Tasks and Release Slices */}
            <div className="space-y-4">
              {act.tasks.map((task, taskIdx) => (
                <div
                  key={task.id || taskIdx}
                  className="bg-zinc-950 border border-zinc-800/90 rounded-xl p-3.5 space-y-3"
                >
                  {/* Task Step Name */}
                  <div className="flex items-center justify-between bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                    <input
                      type="text"
                      value={task.name}
                      onChange={(e) => updateTaskName(actIdx, taskIdx, e.target.value)}
                      placeholder="Passo de usuário..."
                      className="font-semibold text-xs text-zinc-100 bg-transparent outline-none w-full border-b border-transparent focus:border-military-500"
                    />
                    <button
                      onClick={() => removeTask(actIdx, taskIdx)}
                      className="text-zinc-600 hover:text-rose-400 p-1 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Slice 1: MVP (Essential) */}
                  <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-2.5 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      <span>Fatia 1: MVP (Essencial)</span>
                      <button
                        onClick={() => addStory(actIdx, taskIdx, 'mvp_stories')}
                        className="hover:text-emerald-300"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {task.mvp_stories.map((story, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-1.5 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-between gap-1 text-[11px] text-zinc-200"
                        >
                          <input
                            type="text"
                            value={story}
                            onChange={(e) =>
                              updateStory(actIdx, taskIdx, 'mvp_stories', sIdx, e.target.value)
                            }
                            className="bg-transparent outline-none w-full"
                          />
                          <button
                            onClick={() => removeStory(actIdx, taskIdx, 'mvp_stories', sIdx)}
                            className="text-zinc-600 hover:text-rose-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Slice 2: Release 1 (Expansion) */}
                  <div className="bg-sky-950/20 border border-sky-900/40 rounded-lg p-2.5 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-sky-400">
                      <span>Fatia 2: Release 1 (Expansão)</span>
                      <button
                        onClick={() => addStory(actIdx, taskIdx, 'release_1_stories')}
                        className="hover:text-sky-300"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {task.release_1_stories.map((story, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-1.5 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-between gap-1 text-[11px] text-zinc-200"
                        >
                          <input
                            type="text"
                            value={story}
                            onChange={(e) =>
                              updateStory(actIdx, taskIdx, 'release_1_stories', sIdx, e.target.value)
                            }
                            className="bg-transparent outline-none w-full"
                          />
                          <button
                            onClick={() =>
                              removeStory(actIdx, taskIdx, 'release_1_stories', sIdx)
                            }
                            className="text-zinc-600 hover:text-rose-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Slice 3: Release 2 (Delighters) */}
                  <div className="bg-purple-950/20 border border-purple-900/40 rounded-lg p-2.5 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      <span>Fatia 3: Release 2 (Futuro)</span>
                      <button
                        onClick={() => addStory(actIdx, taskIdx, 'release_2_stories')}
                        className="hover:text-purple-300"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {task.release_2_stories.map((story, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-1.5 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-between gap-1 text-[11px] text-zinc-200"
                        >
                          <input
                            type="text"
                            value={story}
                            onChange={(e) =>
                              updateStory(actIdx, taskIdx, 'release_2_stories', sIdx, e.target.value)
                            }
                            className="bg-transparent outline-none w-full"
                          />
                          <button
                            onClick={() =>
                              removeStory(actIdx, taskIdx, 'release_2_stories', sIdx)
                            }
                            className="text-zinc-600 hover:text-rose-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
