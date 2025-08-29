'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import Sidebar from '../../components/sidebar';
import UserMenu from '@/components/UserMenu';

const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-50 h-screen w-full overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black">
      {/* Large organic flowing shapes */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(ellipse 80% 60% at 20% 30%, #012a20 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 70%, #013b2e 0%, transparent 60%), radial-gradient(ellipse 100% 70% at 50% 50%, #0a1929 0%, transparent 50%)",
            "radial-gradient(ellipse 70% 90% at 30% 20%, #013b2e 0%, transparent 60%), radial-gradient(ellipse 90% 60% at 70% 80%, #012a20 0%, transparent 60%), radial-gradient(ellipse 80% 80% at 40% 60%, #0a1929 0%, transparent 50%)",
            "radial-gradient(ellipse 90% 70% at 10% 80%, #024a3a 0%, transparent 60%), radial-gradient(ellipse 70% 100% at 90% 20%, #013b2e 0%, transparent 60%), radial-gradient(ellipse 60% 90% at 60% 40%, #0a1929 0%, transparent 50%)",
            "radial-gradient(ellipse 60% 80% at 80% 60%, #012a20 0%, transparent 60%), radial-gradient(ellipse 100% 70% at 20% 90%, #024a3a 0%, transparent 60%), radial-gradient(ellipse 80% 60% at 50% 20%, #0a1929 0%, transparent 50%)",
            "radial-gradient(ellipse 80% 60% at 20% 30%, #012a20 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 70%, #013b2e 0%, transparent 60%), radial-gradient(ellipse 100% 70% at 50% 50%, #0a1929 0%, transparent 50%)"
          ]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Additional flowing layer for depth */}
      <motion.div
        className="absolute inset-0 opacity-70"
        animate={{
          background: [
            "radial-gradient(ellipse 120% 80% at 60% 40%, transparent 40%,rgb(14, 103, 57) 60%, transparent 80%), radial-gradient(ellipse 100% 120% at 40% 80%, transparent 30%, #03523e 50%, transparent 70%)",
            "radial-gradient(ellipse 100% 100% at 80% 20%, transparent 35%, #024a3a 55%, transparent 75%), radial-gradient(ellipse 80% 140% at 20% 60%, transparent 25%, #013b2e 45%, transparent 65%)",
            "radial-gradient(ellipse 140% 90% at 30% 70%, transparent 40%, #076259 60%, transparent 80%), radial-gradient(ellipse 90% 110% at 70% 30%, transparent 30%, #024a3a 50%, transparent 70%)",
            "radial-gradient(ellipse 110% 130% at 50% 90%, transparent 35%, #086b4f 55%, transparent 75%), radial-gradient(ellipse 130% 80% at 80% 50%, transparent 40%, #013b2e 60%, transparent 80%)",
            "radial-gradient(ellipse 120% 80% at 60% 40%, transparent 40%, #086b4f 60%, transparent 80%), radial-gradient(ellipse 100% 120% at 40% 80%, transparent 30%, #03523e 50%, transparent 70%)"
          ]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  </div>
);

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
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <div className="flex flex-col md:flex-row flex-1">
        <div className="md:fixed md:inset-y-0 md:left-4 md:my-4 md:h-[calc(100vh-2rem)] md:w-64">
          <Sidebar />
        </div>
        <main className="flex-1 md:ml-72 p-4 md:p-8 mt-16 md:mt-0">
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}