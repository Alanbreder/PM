import { apiFetch } from './api.js';
import {
  RoadmapItem,
  CreateRoadmapItemInput,
  UpdateRoadmapItemInput,
  RoadmapLineage,
  RoadmapTimeframe,
  RoadmapStatus,
} from '../types.js';

export const roadmapApi = {
  list: async (
    workspaceId: string,
    timeframe?: RoadmapTimeframe,
    status?: RoadmapStatus
  ): Promise<RoadmapItem[]> => {
    const params = new URLSearchParams();
    if (timeframe) params.append('timeframe', timeframe);
    if (status) params.append('status', status);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await apiFetch(`/api/roadmap${queryString}`, { method: 'GET' }, workspaceId);
    return res.data || [];
  },

  getById: async (workspaceId: string, id: string): Promise<RoadmapItem> => {
    const res = await apiFetch(`/api/roadmap/${id}`, { method: 'GET' }, workspaceId);
    return res.data;
  },

  getLineage: async (workspaceId: string, id: string): Promise<RoadmapLineage> => {
    const res = await apiFetch(`/api/roadmap/${id}/lineage`, { method: 'GET' }, workspaceId);
    return res.data;
  },

  create: async (workspaceId: string, input: CreateRoadmapItemInput): Promise<RoadmapItem> => {
    const res = await apiFetch(
      '/api/roadmap',
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
      workspaceId
    );
    return res.data;
  },

  update: async (
    workspaceId: string,
    id: string,
    input: UpdateRoadmapItemInput
  ): Promise<RoadmapItem> => {
    const res = await apiFetch(
      `/api/roadmap/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      },
      workspaceId
    );
    return res.data;
  },

  delete: async (workspaceId: string, id: string): Promise<void> => {
    await apiFetch(
      `/api/roadmap/${id}`,
      {
        method: 'DELETE',
      },
      workspaceId
    );
  },
};
