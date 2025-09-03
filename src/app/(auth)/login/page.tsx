'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, login, loginWithGoogle } = useAuth();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      const searchParams = new URLSearchParams(window.location.search);
      const returnTo = searchParams.get('returnTo') || '/dashboard';
      console.log('[Login] User already logged in, redirecting to:', returnTo);
      router.push(returnTo);
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    console.log('[Login] Attempting to sign in with email:', email);

    try {
      // Get returnTo parameter from URL if it exists
      const searchParams = new URLSearchParams(window.location.search);
      const returnTo = searchParams.get('returnTo') || '/dashboard';
      
      // Call the login function from AuthContext
      const result = await login(email, password);
      
      if (result.success) {
        console.log('[Login] Login successful, redirecting to:', returnTo);
        router.push(returnTo);
      } else {
        throw new Error(result.error || 'Login failed');
      }
      
    } catch (err: any) {
      console.error('[Login] Error during login:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(ellipse 80% 60% at 20% 30%, #012a20 0%, transparent 50%), radial-gradient(ellipse 60% 80% at 80% 70%, #013b2e 0%, transparent 50%), radial-gradient(ellipse 100% 70% at 50% 50%, #050d18 0%, transparent 30%)",
              "radial-gradient(ellipse 70% 90% at 30% 20%, #013b2e 0%, transparent 50%), radial-gradient(ellipse 90% 60% at 70% 80%, #012a20 0%, transparent 50%), radial-gradient(ellipse 80% 80% at 40% 60%, #050d18 0%, transparent 30%)",
              "radial-gradient(ellipse 90% 70% at 10% 80%, #024a3a 0%, transparent 50%), radial-gradient(ellipse 70% 100% at 90% 20%, #013b2e 0%, transparent 50%), radial-gradient(ellipse 60% 90% at 60% 40%, #050d18 0%, transparent 30%)",
              "radial-gradient(ellipse 60% 80% at 80% 60%, #012a20 0%, transparent 50%), radial-gradient(ellipse 100% 70% at 20% 90%, #024a3a 0%, transparent 50%), radial-gradient(ellipse 80% 60% at 50% 20%, #050d18 0%, transparent 30%)",
              "radial-gradient(ellipse 80% 60% at 20% 30%, #012a20 0%, transparent 50%), radial-gradient(ellipse 60% 80% at 80% 70%, #013b2e 0%, transparent 50%), radial-gradient(ellipse 100% 70% at 50% 50%, #050d18 0%, transparent 30%)"
            ]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 sm:px-6 lg:px-8">
        <motion.div 
          className="w-full max-w-md space-y-8 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="backdrop-blur-xl bg-black/30 border border-green-500/20 rounded-2xl p-8 shadow-2xl"
            whileHover={{ 
              boxShadow: '0 0 30px rgba(34, 197, 94, 0.2)',
              borderColor: 'rgba(34, 197, 94, 0.4)'
            }}
          >
            <div className="text-center">
              <motion.h2 
                className="text-3xl font-bold bg-gradient-to-r from-white via-green-200 to-green-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Welcome Back
              </motion.h2>
              <motion.p 
                className="mt-2 text-sm text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Don't have an account?{' '}
                <Link href="/signup" className="font-medium text-green-400 hover:text-green-300 transition-colors">
                  Sign up
                </Link>
              </motion.p>
            </div>
        <motion.form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {error && (
            <motion.div 
              className="rounded-lg bg-red-900/20 backdrop-blur-md border border-red-500/30 p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-300">{error}</h3>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="space-y-4">
            <motion.div 
              className="space-y-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-300">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-200"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </motion.div>

            <motion.div 
              className="space-y-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </motion.div>

            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-green-500/20"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  Sign in
                  <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </span>
              )}
            </button>
          </motion.div>
          <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.7 }}
  className="mt-4"
>
  <button
    type="button"
    onClick={loginWithGoogle}
    disabled={loading}
    className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-700 rounded-lg text-white bg-black/30 hover:bg-black/40 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50 transition-all duration-200"
  >
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.8-4.1 2.8-6.9 0-.6 0-1.2-.1-1.8H12z"/>
      <path fill="#34A853" d="M6.5 14.3l-.9.7-2.4-1.8c1.3 2.6 3.9 4.4 6.8 4.4 2 0 3.6-.6 4.8-1.6l-3.1-2.4c-.9.6-2 .9-3.2.9-2.5 0-4.6-1.6-5.3-3.8z"/>
      <path fill="#4A90E2" d="M20.6 7.5c-.8-.8-1.8-1.3-2.8-1.6-1-.3-2-.4-3-.4-2.9 0-5.4 1.8-6.8 4.4l2.4 1.8c.7-2.2 2.8-3.8 5.3-3.8 1.2 0 2.3.4 3.2.9l2.8-2.3z"/>
      <path fill="#FBBC05" d="M3.2 6.2l2.4 1.8c1-1.9 3-3.2 5.3-3.2 1.2 0 2.3.3 3.2.9l2.8-2.3c-1.4-1-3.1-1.6-4.8-1.6-2.9 0-5.5 1.7-6.8 4.4z"/>
    </svg>
    <span>Sign in with Google</span>
  </button>
</motion.div>

        </motion.form>

        <motion.div 
          className="mt-6 text-sm text-center text-gray-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link 
            href="/" 
            className="inline-flex items-center text-green-400 hover:text-green-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to home
          </Link>
        </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
