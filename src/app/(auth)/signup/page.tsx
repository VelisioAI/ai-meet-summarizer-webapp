'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext'; // adjust path if different
import { FcGoogle } from 'react-icons/fc';


export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { loginWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);


    try {
      // First, sign up the user with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) throw signUpError;

      // If email confirmation is required, show a success message
      if (data?.user?.identities?.length === 0) {
        setError('User already registered');
        return;
      }

      // Show success message and redirect to login
      alert('Please check your email to confirm your account. You can now sign in.');
      router.push('/login');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'An error occurred during signup');
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
                Create an Account
              </motion.h2>
              <motion.p 
                className="mt-2 text-sm text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-green-400 hover:text-green-300 transition-colors">
                  Sign in
                </Link>
              </motion.p>
            </div>

        {error && (
          <motion.div 
            className="rounded-lg bg-red-900/20 backdrop-blur-md border border-red-500/30 p-4 mt-4"
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

        <motion.form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-4">
            <motion.div 
              className="space-y-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="full-name" className="block text-sm font-medium text-gray-300">Full Name</label>
              <input
                id="full-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                disabled={loading}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-200"
                placeholder="Full Name"
              />
            </motion.div>

            <motion.div 
              className="space-y-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-300">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-200"
                placeholder="Email"
              />
            </motion.div>

            <motion.div 
              className="space-y-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
              />
            </motion.div>

            <motion.div 
              className="flex items-start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >

            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
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
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center">
                  Create Account
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
  transition={{ delay: 0.8 }}
  className="mt-4"
>
  <button
    type="button"
    onClick={loginWithGoogle}
    disabled={loading}
    className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-700 rounded-lg text-white bg-black/30
               hover:bg-black/50 hover:scale-105 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] focus:outline-none focus:ring-2 focus:ring-green-500/50
               disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
  >
    <FcGoogle className="w-6 h-6" />
    <span className="font-medium text-white">Sign up with Google</span>
  </button>
</motion.div>

        </motion.form>

        <motion.div 
          className="mt-6 text-sm text-center text-gray-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
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
