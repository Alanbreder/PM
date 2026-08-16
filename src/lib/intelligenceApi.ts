import { apiFetch } from './api';
import { DiscoveryHealthMetrics, ProductInsight, InsightStatus } from '../types';

export const getDiscoveryHealth = async (workspaceId: string): Promise<DiscoveryHealthMetrics> => {
  const res = await apiFetch(`/api/workspaces/${workspaceId}/intelligence/health`, {}, workspaceId);
  return res.data;
};

export const getInsights = async (workspaceId: string, status?: InsightStatus): Promise<ProductInsight[]> => {
  const query = status ? `?status=${status}` : '';
  const res = await apiFetch(`/api/workspaces/${workspaceId}/intelligence/insights${query}`, {}, workspaceId);
  return res.data;
};

export const generateInsights = async (workspaceId: string): Promise<ProductInsight[]> => {
  const res = await apiFetch(`/api/workspaces/${workspaceId}/intelligence/generate`, {
    method: 'POST',
  }, workspaceId);
  return res.data;
};

export const updateInsightStatus = async (
  workspaceId: string,
  insightId: string,
  status: InsightStatus,
  feedbackNotes?: string
): Promise<ProductInsight> => {
  const res = await apiFetch(`/api/workspaces/${workspaceId}/intelligence/insights/${insightId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, feedback_notes: feedbackNotes }),
  }, workspaceId);
  return res.data;
};
