'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, DocumentTextIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/sidebar';

type Summary = {
  id: string;
  title: string;
  createdAt: string;
};

type Transaction = {
  id: string;
  amount: number;
  reason: string;
  date: string;
};

type CreditInfo = {
  currentBalance: number;
  totalUsed: number;
  totalEarned: number;
  usagePercentage: number;
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
  credits: number;
  memberSince: string;
};

type DashboardResponse = {
  success: boolean;
  data: {
    user: UserProfile;
    recentSummaries: Summary[];
    creditInfo: CreditInfo;
    recentTransactions: Transaction[];
  };
};

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

export default function DashboardHome() {
  const { getAuthHeader } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<{
    userProfile: UserProfile;
    recentSummaries: Summary[];
    creditInfo: CreditInfo;
    recentTransactions: Transaction[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const authHeader = getAuthHeader();

        if (!authHeader?.Authorization) {
          setError('No authorization token found. Please log in again.');
          return;
        }

        const response = await fetch(`${apiUrl}/api/user/dashboard`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader,
          },
          credentials: process.env.NODE_ENV === 'production' ? 'include' : 'same-origin',
        });

        const resData: DashboardResponse = await response.json();

        if (!response.ok || !resData.success) {
          throw new Error('Failed to fetch dashboard data');
        }

        setDashboardData({
          userProfile: resData.data.user,
          recentSummaries: resData.data.recentSummaries,
          creditInfo: resData.data.creditInfo,
          recentTransactions: resData.data.recentTransactions || [],
        });
      } catch (err: any) {
        setError(err?.message || 'Unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [getAuthHeader]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const handleViewDetails = (summaryId: string) => {
    router.push(`/dashboard/summaries/${summaryId}`);
  };

  const handleNewMeeting = () => {
    router.push('/dashboard/summaries');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <AnimatedBackground />
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AnimatedBackground />
        <div className="backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 max-w-md w-full">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-300">{error}</h3>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-200 hover:text-white"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AnimatedBackground />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-200">No dashboard data available</h2>
          <p className="mt-2 text-gray-400">Please try refreshing the page or contact support if the issue persists.</p>
        </div>
      </div>
    );
  }

  const { userProfile, recentSummaries, creditInfo, recentTransactions } = dashboardData;

  return (
    <div className="relative min-h-screen bg-transparent overflow-hidden">
      <AnimatedBackground />
      
      {/* Content */}
      <div className="relative z-10 h-full w-full">
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          {/* Welcome Section */}
          <motion.div 
            className="backdrop-blur-xl bg-black/30 border border-green-500/20 rounded-2xl p-6 mb-8 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  Welcome back, {userProfile.name}!
                </h1>
                <p className="text-gray-300 mt-1">Here's what's happening with your account.</p>
              </div>
              <div className="text-sm text-gray-400">
                Member since {new Date(userProfile.memberSince).toLocaleDateString()}
              </div>
            </div>
          </motion.div>

          {/* Credit Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {/* Current Balance Card */}
            <motion.div 
              className="backdrop-blur-xl bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-500/20 rounded-2xl p-5 hover:border-green-400/40 transition-all duration-300 group"
              whileHover={{ y: -3, boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.1)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                  <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Current Balance</p>
                  <p className="text-2xl font-bold text-white">{creditInfo.currentBalance} <span className="text-sm font-normal text-gray-400">credits</span></p>
                </div>
              </div>
            </motion.div>

            {/* Total Used Card */}
            <motion.div 
              className="backdrop-blur-xl bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border border-blue-500/20 rounded-2xl p-5 hover:border-blue-400/40 transition-all duration-300 group"
              whileHover={{ y: -3, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Used</p>
                  <p className="text-2xl font-bold text-white">{creditInfo.totalUsed} <span className="text-sm font-normal text-gray-400">credits</span></p>
                </div>
              </div>
            </motion.div>

            {/* Usage Progress Card */}
            <motion.div 
              className="backdrop-blur-xl bg-gradient-to-br from-purple-900/30 to-violet-900/20 border border-purple-500/20 rounded-2xl p-5 hover:border-purple-400/40 transition-all duration-300 group"
              whileHover={{ y: -3, boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.1)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="mb-2 flex justify-between items-center">
                <p className="text-sm font-medium text-gray-400">Usage Progress</p>
                <span className="text-sm font-medium text-purple-400">{creditInfo.usagePercentage}%</span>
              </div>
              <div className="w-full bg-gray-800/30 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${creditInfo.usagePercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400">
                {creditInfo.usagePercentage >= 80 ? (
                  <span className="text-yellow-400">You've used {creditInfo.usagePercentage}% of your credits</span>
                ) : (
                  `You've used ${creditInfo.usagePercentage}% of your credits`
                )}
              </p>
            </motion.div>
          </div>

          {/* Recent Summaries and Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Summaries */}
            <motion.div 
              className="backdrop-blur-xl bg-black/20 border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-green-400" />
                  Recent Summaries
                </h2>
                <button
                  onClick={handleNewMeeting}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white bg-green-600 hover:bg-green-700 transition-colors group"
                >
                  <PlusIcon className="h-3.5 w-3.5 mr-1.5 group-hover:rotate-90 transition-transform" />
                  New Summary
                </button>
              </div>
              
              {recentSummaries.length > 0 ? (
                <div className="space-y-3">
                  {recentSummaries.slice(0, 3).map((summary) => (
                    <motion.div 
                      key={summary.id}
                      className="p-4 bg-black/30 rounded-xl border border-gray-700/50 hover:border-green-500/40 transition-colors cursor-pointer group"
                      whileHover={{ x: 2 }}
                      onClick={() => handleViewDetails(summary.id)}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-white line-clamp-1 group-hover:text-green-400 transition-colors">
                          {summary.title}
                        </h3>
                        <span className="text-xs px-2 py-1 bg-gray-700/50 rounded-full text-gray-300">
                          {new Date(summary.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                        <EyeIcon className="h-3.5 w-3.5 mr-1.5" />
                        Click to view details
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-500 mb-3 opacity-50" />
                  <p className="text-sm text-gray-400 mb-4">No recent summaries found</p>
                  <button
                    onClick={handleNewMeeting}
                    className="mt-3 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-1.5" />
                    Create your first summary
                  </button>
                </div>
              )}
            </motion.div>

            {/* Recent Transactions */}
            <motion.div 
              className="backdrop-blur-xl bg-black/20 border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-colors"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-lg font-semibold text-white flex items-center mb-5">
                <svg className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Recent Transactions
              </h2>
              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.slice(0, 3).map((tx) => (
                    <motion.div 
                      key={tx.id} 
                      className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-gray-700/50 hover:border-blue-500/40 transition-colors group"
                      whileHover={{ x: 2 }}
                    >
                      <div>
                        <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{tx.reason}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(tx.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`text-sm font-semibold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.amount >= 0 ? '+' : ''}{tx.amount}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-500 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-400 mb-4">No recent transactions</p>
                  <p className="text-xs text-gray-500">Your transaction history will appear here</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
