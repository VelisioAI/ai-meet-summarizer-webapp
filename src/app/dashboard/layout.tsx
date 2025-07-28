'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '../../components/sidebar';
import UserMenu from '@/components/UserMenu';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, apiToken } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle authentication state and redirects
  useEffect(() => {
    // Only run client-side
    if (typeof window === 'undefined') return;

    console.log('[DashboardLayout] Auth state:', { 
      hasUser: !!user, 
      hasToken: !!apiToken, 
      loading, 
      isRedirecting,
      pathname: window.location.pathname
    });

    // If we're still loading, show loading state
    if (loading) {
      console.log('[DashboardLayout] Still loading auth state...');
      return;
    }

    // If we're already redirecting, do nothing
    if (isRedirecting) {
      console.log('[DashboardLayout] Already redirecting...');
      return;
    }

    // If we have a user but no token yet, wait for the token exchange to complete
    if (user && !apiToken) {
      console.log('[DashboardLayout] User exists but no API token yet, waiting for token exchange...');
      return;
    }

    // If user is not authenticated, redirect to login
    if (!user || !apiToken) {
      console.log('[DashboardLayout] Not authenticated, redirecting to login');
      setIsRedirecting(true);
      // Store the current path to redirect back after login
      const returnTo = window.location.pathname !== '/login' ? window.location.pathname : undefined;
      router.push(`/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`);
    } else {
      console.log('[DashboardLayout] User is authenticated and has valid token');
    }
  }, [user, loading, apiToken, router, isRedirecting]);

  // Show loading state while checking auth
  if (loading || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If redirecting, show loading state
  if (isRedirecting || !user || !apiToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Render the dashboard layout for authenticated users
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
