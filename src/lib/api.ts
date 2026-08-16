export const getAuthToken = (): string | null => {
  return localStorage.getItem('product_os_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('product_os_token', token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('product_os_token');
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

  if (workspaceId) {
    headers['x-workspace-id'] = workspaceId;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error: any = new Error(data.message || data.error || `Erro ${response.status}: Falha na requisição`);
    error.status = response.status;
    error.code = data.error;
    throw error;
  }

  return data;
};

