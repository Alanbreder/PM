const getAuthToken = (): string | null => {
  return localStorage.getItem('product_os_token') || 'demo-token';
};

export const apiFetch = async (url: string, options: RequestInit = {}, workspaceId?: string) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // In demo/dev test mode, set test header if no real token
  if (token === 'demo-token') {
    headers['x-test-user-id'] = 'usr_demo_admin';
    headers['x-test-user-email'] = 'demo@productos.io';
  }

  if (workspaceId) {
    headers['x-workspace-id'] = workspaceId;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || `Erro ${response.status}: Falha na requisição`);
  }

  return data;
};
