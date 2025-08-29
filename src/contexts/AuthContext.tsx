'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { syncUser } from '@/lib/api';

// Define the shape of our API token response
export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  apiToken: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  getAuthHeader: () => { Authorization: string } | {};
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to store tokens in localStorage
const storeTokens = (tokens: AuthTokens) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('apiToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('tokenExpiry', (Date.now() + tokens.expiresIn * 1000).toString());
  }
};

// Helper function to clear tokens from localStorage
const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('apiToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    id: number;
    email: string;
    name: string;
    credits: number;
    created_at: string;
    updated_at: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Define the user data type
  type UserData = {
    id: number;
    email: string;
    name: string;
    credits: number;
    created_at: string;
    updated_at: string;
    token?: string;
  };

  // Function to exchange Supabase token for our backend token and get user data
  const exchangeToken = useCallback(async (supabaseToken: string): Promise<{token: string, userData: UserData}> => {
    try {
      console.log('[AuthContext] Exchanging Supabase token for API token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      console.log('[AuthContext] Making request to:', `${apiUrl}/api/user/auth`);
      const response = await fetch(`${apiUrl}/api/user/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseToken}`
        },
        body: JSON.stringify({ token: supabaseToken })
      });

      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        const errorMessage = responseData.message || responseData.error || 'Failed to authenticate with backend';
        console.error(`[AuthContext] Token exchange failed: ${response.status} - ${errorMessage}`, responseData);
        throw new Error(errorMessage);
      }

      console.log('[AuthContext] Token exchange successful, response:', responseData);
      
      // The token and user data are in the data field of the response
      const { data: userData } = responseData;
      
      if (!userData || !userData.token) {
        console.error('[AuthContext] Invalid token response format - missing token:', responseData);
        throw new Error('No access token received from backend');
      }
      
      // Extract the token and user info
      const accessToken = userData.token;
      const refreshToken = userData.refreshToken; // If available
      const expiresIn = 3600; // Default to 1 hour if not provided
      
      if (!accessToken) {
        throw new Error('Access token is empty or undefined');
      }
      
      // Store tokens and user data in localStorage
      if (typeof window !== 'undefined') {
        console.log('[AuthContext] Storing tokens and user data in localStorage');
        localStorage.setItem('apiToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        const expiryTime = Date.now() + (expiresIn * 1000);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
        
        // Store user data in localStorage
        const { token, refreshToken: _, ...userDataToStore } = userData;
        localStorage.setItem('userData', JSON.stringify(userDataToStore));
        
        console.log(`[AuthContext] Auth data stored in localStorage, expires at: ${new Date(expiryTime).toISOString()}`);
      }
      
      // Update the API token and user data in state
      setApiToken(accessToken);
      setUserData(userData);
      
      return { token: accessToken, userData };
    } catch (error) {
      console.error('[AuthContext] Token exchange failed:', error);
      // Clear any partial auth state on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('apiToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiry');
      }
      throw error;
    }
  }, []);

  // Initialize auth state and check for existing session
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        console.log('[AuthContext] Initializing auth...');
        
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('[AuthContext] Supabase session:', { session, error });
        
        // Check for existing API token and user data
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('apiToken') : null;
        const expiry = typeof window !== 'undefined' ? localStorage.getItem('tokenExpiry') : null;
        const storedUserData = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
        
        console.log('[AuthContext] Stored auth data:', { 
          hasToken: !!storedToken, 
          tokenExpired: expiry ? Date.now() > parseInt(expiry, 10) : 'no expiry',
          hasUserData: !!storedUserData 
        });
        
        if (!isMounted) return;
        
        // If we have a valid session and token, use them
        if (session?.access_token && storedToken && expiry && Date.now() < parseInt(expiry, 10)) {
          console.log('[AuthContext] Using existing valid session and token');
          setSession(session);
          setUser(session.user);
          setApiToken(storedToken);
          
          // Load user data from localStorage if available
          if (storedUserData) {
            try {
              const parsedUserData = JSON.parse(storedUserData);
              setUserData(parsedUserData);
              console.log('[AuthContext] Loaded user data from localStorage');
            } catch (e) {
              console.error('[AuthContext] Failed to parse stored user data:', e);
            }
          }
          
          // If we're on the login/signup page, redirect to dashboard
          if (['/login', '/signup', '/'].includes(window.location.pathname)) {
            console.log('[AuthContext] Redirecting to dashboard from:', window.location.pathname);
            router.push('/dashboard');
          }
        } 
        // If we have a session but no valid token, exchange it
        else if (session?.access_token) {
          console.log('[AuthContext] Exchanging Supabase token for API token');
          try {
            const { token, userData } = await exchangeToken(session.access_token);
            if (!isMounted) return;
            
            console.log('[AuthContext] Token exchange successful, user data:', userData);
            setSession(session);
            setUser(session.user);
            setUserData(userData);
            setApiToken(token);
            
            // Redirect to dashboard after successful token exchange
            if (['/login', '/signup', '/'].includes(window.location.pathname)) {
              console.log('[AuthContext] Redirecting to dashboard after token exchange');
              router.push('/dashboard');
            }
          } catch (error) {
            console.error('[AuthContext] Token exchange failed:', error);
            if (!isMounted) return;
            
            // Clear all auth state on error
            await supabase.auth.signOut();
            clearTokens();
            setSession(null);
            setUser(null);
            setApiToken(null);
            
            // Only redirect if we're not already on the login page
            if (window.location.pathname !== '/login') {
              router.push('/login');
            }
          }
        } 
        // No valid session or token
        else {
          console.log('[AuthContext] No valid session or token');
          clearTokens();
          setSession(null);
          setUser(null);
          setApiToken(null);
          
          // Only redirect if we're not already on a public page
          if (!['/login', '/signup', '/'].includes(window.location.pathname)) {
            console.log('[AuthContext] Redirecting to login from protected route');
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearTokens();
        setSession(null);
        setUser(null);
        setApiToken(null);
        
        if (!['/login', '/signup', '/'].includes(window.location.pathname)) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        if (!isMounted) return;
        console.log(`[AuthContext] Auth state changed: ${event}`, { session });
        
        if (event === 'SIGNED_IN' && session) {
          try {
            console.log('[AuthContext] User signed in, exchanging token...');
            // Exchange the token when user signs in
            const { token, userData } = await exchangeToken(session.access_token);
            if (!isMounted) return;
            
            console.log('[AuthContext] Token exchange successful, updating state...', { userData });
            setSession(session);
            setUser(session.user);
            setUserData(userData);
            setApiToken(token);
            
            // Ensure the token and user data are set in localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('apiToken', token);
              // Store user data without the token
              const { token: _, ...userDataToStore } = userData;
              localStorage.setItem('userData', JSON.stringify(userDataToStore));
              console.log('[AuthContext] Auth data set in localStorage');
            }
            
            console.log('[AuthContext] Auth state updated after sign in');
          } catch (error) {
            console.error('[AuthContext] Error during token exchange:', error);
            if (isMounted) {
              await supabase.auth.signOut();
              clearTokens();
              setSession(null);
              setUser(null);
              setApiToken(null);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear state and tokens when user signs out
          console.log('[AuthContext] User signed out, clearing state');
          clearTokens();
          if (isMounted) {
            setSession(null);
            setUser(null);
            setApiToken(null);
          }
        } else if (event === 'INITIAL_SESSION') {
          console.log('[AuthContext] Initial session:', { session });
          // Handle initial session
          if (session) {
            setSession(session);
            setUser(session.user);
            // Check if we have a valid API token
            const storedToken = typeof window !== 'undefined' ? localStorage.getItem('apiToken') : null;
            const expiry = typeof window !== 'undefined' ? localStorage.getItem('tokenExpiry') : null;
            const isTokenValid = storedToken && expiry && Date.now() < parseInt(expiry, 10);
            
            if (isTokenValid) {
              console.log('[AuthContext] Using existing valid API token');
              setApiToken(storedToken);
              
              // Try to load user data from localStorage
              const storedUserData = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
              if (storedUserData) {
                try {
                  const userData = JSON.parse(storedUserData);
                  setUserData(userData);
                  console.log('[AuthContext] Loaded user data from localStorage');
                } catch (e) {
                  console.error('[AuthContext] Failed to parse stored user data:', e);
                }
              }
            } else if (storedToken) {
              console.log('[AuthContext] Existing API token expired or invalid, exchanging...');
              // Token expired, exchange for a new one
              exchangeToken(session.access_token)
                .then(({ token, userData }) => {
                  if (isMounted) {
                    setApiToken(token);
                    setUserData(userData);
                    
                    // Store the updated token and user data
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('apiToken', token);
                      const { token: _, ...userDataToStore } = userData;
                      localStorage.setItem('userData', JSON.stringify(userDataToStore));
                      console.log('[AuthContext] Updated auth data in localStorage');
                    }
                  }
                })
                .catch(error => {
                  console.error('[AuthContext] Failed to exchange token:', error);
                  // Clear invalid tokens on error
                  clearTokens();
                  if (isMounted) {
                    setApiToken(null);
                    setUserData(null);
                  }
                });
            }
          } else {
            console.log('[AuthContext] No active session, clearing state');
            clearTokens();
            if (isMounted) {
              setSession(null);
              setUser(null);
              setApiToken(null);
            }
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [router, exchangeToken]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      clearTokens();
      setUser(null);
      setSession(null);
      setApiToken(null);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [router]);

  // Helper function to get auth header for API requests
  const getAuthHeader = () => {
    if (!apiToken) return {};
    return { Authorization: `Bearer ${apiToken}` };
  };

  // Login function that handles both Supabase auth and token exchange
  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('[AuthContext] Logging in with email:', email);
      
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('[AuthContext] Login error:', error);
        return { success: false, error: error.message };
      }
      
      if (!data?.session) {
        console.error('[AuthContext] No session returned after login');
        return { success: false, error: 'No session returned after login' };
      }
      
      console.log('[AuthContext] Supabase login successful, exchanging token...');
      
      // Exchange the Supabase token for our backend token
      const { token, userData } = await exchangeToken(data.session.access_token);
      
      // Update state with the new session and token
      setSession(data.session);
      setUser(data.user);
      setUserData(userData);
      setApiToken(token);
      
      console.log('[AuthContext] Login and token exchange successful');
      return { success: true };
      
    } catch (error: any) {
      console.error('[AuthContext] Login failed:', error);
      // Clear any partial auth state on error
      await supabase.auth.signOut();
      clearTokens();
      setSession(null);
      setUser(null);
      setUserData(null);
      setApiToken(null);
      
      return { 
        success: false, 
        error: error.message || 'An error occurred during login' 
      };
    } finally {
      setLoading(false);
    }
  }, [exchangeToken]);

  const value = {
    user,
    session,
    loading,
    apiToken,
    login,
    signOut: logout,
    logout,
    getAuthHeader,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};