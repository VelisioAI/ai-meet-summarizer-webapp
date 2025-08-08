import { AuthTokens } from '@/contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  auth?: boolean;
};

// Helper to get auth header
export const getAuthHeader = (): HeadersInit => {
  if (typeof window === 'undefined') return {};
  
  const token = localStorage.getItem('apiToken');
  if (!token) return {};
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Check if token is expired
function isTokenExpired(): boolean {
  if (typeof window === 'undefined') return true;
  
  const expiry = localStorage.getItem('tokenExpiry');
  if (!expiry) return true;
  
  return Date.now() >= parseInt(expiry, 10);
}

// Main API fetch function
export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  // Skip token refresh for auth endpoints
  const isAuthEndpoint = endpoint.startsWith('/api/auth') || 
                        endpoint === '/login' || 
                        endpoint === '/signup';
  
  // Check if token needs refresh (only for non-auth endpoints)
  if (!isAuthEndpoint && isTokenExpired()) {
    try {
      await refreshToken();
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear auth state and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('apiToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiry');
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please log in again.');
    }
  }

  // Add auth headers if not explicitly disabled
  if (options.credentials !== 'omit') {
    options.headers = {
      ...getAuthHeader(),
      ...options.headers,
    };
  }

  // Determine if we're making a cross-origin request
  const isCrossOrigin = new URL(API_BASE_URL).origin !== window.location.origin;
  
  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // Only include credentials for same-origin or when explicitly needed
    credentials: isCrossOrigin && process.env.NODE_ENV === 'production' ? 'include' : 'same-origin',
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

  // Handle 401 Unauthorized - try to refresh token
  if (response.status === 401 && !isAuthEndpoint) {
    try {
      const newToken = await refreshToken();
      if (newToken) {
        // Update the authorization header with the new token
        const newHeaders = new Headers(options.headers);
        newHeaders.set('Authorization', `Bearer ${newToken}`);
        
        // Retry the original request with the new token
        return apiFetch<T>(endpoint, {
          ...options,
          headers: newHeaders,
        });
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear auth state and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('apiToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiry');
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `API request failed with status ${response.status}`
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

// Helper for GET requests
export const apiGet = <T>(endpoint: string, options: RequestInit = {}) => {
  return apiFetch<T>(endpoint, {
    ...options,
    method: 'GET',
  });
};

// Helper for POST requests
export const apiPost = <T>(
  endpoint: string,
  data: any,
  options: RequestInit = {}
) => {
  return apiFetch<T>(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Helper for PUT requests
export const apiPut = <T>(
  endpoint: string,
  data: any,
  options: RequestInit = {}
) => {
  return apiFetch<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Helper for DELETE requests
export const apiDelete = <T>(endpoint: string, options: RequestInit = {}) => {
  return apiFetch<T>(endpoint, {
    ...options,
    method: 'DELETE',
  });
};

// Helper function to refresh the access token
export async function refreshToken(): Promise<string | undefined> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/user/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json() as AuthTokens;
    
    // Store the new tokens
    localStorage.setItem('apiToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('tokenExpiry', (Date.now() + data.expiresIn * 1000).toString());
    
    return data.accessToken;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    // Clear tokens on refresh failure
    localStorage.removeItem('apiToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    throw error;
  }
}

// Helper to make authenticated API requests with token refresh
export async function authenticatedFetch<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  // If token is expired, try to refresh it first
  if (isTokenExpired()) {
    try {
      await refreshToken();
    } catch (error) {
      // If refresh fails, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please log in again.');
    }
  }

  // Make the request with the current token
  return apiFetch<T>(endpoint, options);
}

// Enhanced Summary-specific API functions
export interface TranscriptItem {
  timestamp?: string;
  speaker?: string;
  text: string;
  startTime?: number;
  endTime?: number;
}

export interface MeetingMetadata {
  duration_minutes?: number;
  participants?: string[];
  meeting_title?: string;
  meeting_url?: string;
  [key: string]: any;
}

export interface SummaryData {
  id: string;
  title: string;
  summary_text: string | null;
  transcript_text: string;
  transcript_json: TranscriptItem[] | null;
  meeting_metadata: MeetingMetadata | null;
  summary_status: string;
  created_at: string;
  meeting_duration_minutes?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  credits: number;
  created_at: string;
  updated_at?: string;
}

export interface SummaryHistoryItem {
  id: string;
  title: string;
  summary_status: string;
  created_at: string;
  has_summary: boolean;
}

export interface SummaryHistoryResponse {
  success: boolean;
  data: {
    items: SummaryHistoryItem[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

// Get user profile
export const getUserProfile = async (): Promise<{ success: boolean; data: UserProfile }> => {
  return apiGet<{ success: boolean; data: UserProfile }>('/api/user');
};

// Get user's summary history
export const getUserHistory = async (limit = 10, offset = 0): Promise<SummaryHistoryResponse> => {
  return apiGet<SummaryHistoryResponse>(`/api/user/history?limit=${limit}&offset=${offset}`);
};

// Get specific summary by ID
export const getSummary = async (summaryId: string): Promise<{ success: boolean; data: SummaryData }> => {
  return apiGet<{ success: boolean; data: SummaryData }>(`/api/summary/${summaryId}`);
};

// Create a new summary (AI processing)
export const createSummary = async (data: {
  title?: string;
  transcript_id: string;
  custom_prompt?: string;
}): Promise<{ success: boolean; data: any }> => {
  return apiPost<{ success: boolean; data: any }>('/api/summary', data);
};

// Process transcript (upload meeting data)
export const processTranscript = async (data: {
  title?: string;
  transcript_text: string;
  transcript_json?: TranscriptItem[];
  meeting_metadata?: MeetingMetadata;
  meeting_duration_minutes?: number;
  should_summarize?: boolean;
}): Promise<{ success: boolean; data: any }> => {
  return apiPost<{ success: boolean; data: any }>('/api/transcript', data);
};

// Get dashboard data
export const getDashboardData = async (): Promise<{
  success: boolean;
  data: {
    user: UserProfile;
    recentSummaries: Array<{
      id: string;
      title: string;
      createdAt: string;
    }>;
    recentTransactions: Array<{
      change: number;
      reason: string;
      date: string;
    }>;
    creditsUsed: number;
  };
}> => {
  return apiGet<any>('/api/user/dashboard');
};

// Sync user with backend (for authentication)
export const syncUser = async (token: string): Promise<{ success: boolean; data: any }> => {
  return apiPost<{ success: boolean; data: any }>('/api/user/auth', { token });
};

export default {
  getUserProfile,
  getUserHistory,
  getSummary,
  createSummary,
  processTranscript,
  getDashboardData,
  syncUser,
  apiFetch,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
};