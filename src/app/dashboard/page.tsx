'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

type Summary = {
  id: string;
  title: string;
  createdAt: string;
};

type Transaction = {
  change: number;
  reason: string;
  date: string;
};

type CreditStats = {
  currentBalance: number;
  totalUsed: number;
  recentTransactions: Transaction[];
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
    recentTransactions: Transaction[];
    creditsUsed: number;
  };
};

export default function DashboardHome() {
  const { getAuthHeader } = useAuth();
  const [dashboardData, setDashboardData] = useState<{
    userProfile: UserProfile;
    recentSummaries: Summary[];
    creditStats: CreditStats;
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

        const creditStats: CreditStats = {
          currentBalance: resData.data.user.credits,
          totalUsed: resData.data.creditsUsed,
          recentTransactions: resData.data.recentTransactions || [],
        };

        setDashboardData({
          userProfile: resData.data.user,
          recentSummaries: resData.data.recentSummaries,
          creditStats,
        });
      } catch (err: any) {
        setError(err?.message || 'Unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [getAuthHeader]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700">No dashboard data available</h2>
        <p className="mt-2 text-gray-500">Please try refreshing the page or contact support if the issue persists.</p>
      </div>
    );
  }

  const { userProfile, recentSummaries, creditStats } = dashboardData;

  return (
    <div className="space-y-8 p-4 sm:p-6">
      {/* Welcome Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userProfile.name}! 👋</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your account.</p>
      </div>

      {/* Credit Stats */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Credit Balance</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-indigo-50 px-4 py-5 sm:p-6 rounded-lg">
            <dt className="text-sm font-medium text-indigo-600 truncate">Current Balance</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{creditStats.currentBalance}</dd>
          </div>
          <div className="bg-green-50 px-4 py-5 sm:p-6 rounded-lg">
            <dt className="text-sm font-medium text-green-600 truncate">Total Used</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{creditStats.totalUsed}</dd>
          </div>
          <div className="bg-white px-4 py-5 sm:p-6 rounded-lg border border-gray-200">
            <dt className="text-sm font-medium text-gray-600 truncate">Recent Transactions</dt>
            <dd className="mt-1 text-sm text-gray-900 space-y-2">
              {creditStats.recentTransactions.length > 0 ? (
                creditStats.recentTransactions.slice(0, 3).map((tx, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="truncate">{tx.reason}</span>
                    <span className={`ml-2 font-medium ${tx.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.change >= 0 ? '+' : ''}{tx.change}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No recent transactions</p>
              )}
            </dd>
          </div>
        </div>
      </div>

      {/* Recent Summaries */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
          <h2 className="text-lg font-medium text-gray-900">Recent Summaries</h2>
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              New Meeting
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          {recentSummaries.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentSummaries.map((summary) => (
                <div key={summary.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                      <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{summary.title}</h3>
                      <p className="mt-1 text-xs text-gray-500">{formatDate(summary.createdAt)}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">pending</span>
                        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">View details</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No summaries created yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first meeting summary.</p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  New Meeting
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
