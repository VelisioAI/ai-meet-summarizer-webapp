import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const token = (await supabase.auth.getSession()).data.session?.access_token;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

// User API
export const getUserProfile = async () => {
  return apiClient('/api/user');
};

export const syncUser = async (user: any) => {
  return apiClient('/api/user/sync', {
    method: 'POST',
    body: JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || '',
    }),
  });
};

export const getUserHistory = async (limit = 10, offset = 0) => {
  return apiClient(`/api/user/history?limit=${limit}&offset=${offset}`);
};

// Summary API
export const getSummary = async (id: string) => {
  return apiClient(`/api/summary/${id}`);
};

export const createSummary = async (data: any) => {
  return apiClient('/api/summary', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Transcript API
export const processTranscript = async (data: any) => {
  return apiClient('/api/transcript', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Credit API
export const logCreditTransaction = async (data: any) => {
  return apiClient('/api/credit-log', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};