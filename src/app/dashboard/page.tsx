'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, DocumentTextIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline/index.js';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';

type Summary = {
  id: string;
  title: string;
  date: string;
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

type DashboardData = {
  user: {
    id: string;
    name: string;
    email: string;
    credits: number;
    memberSince: string;
  };
  recentSummaries: Summary[];
  creditStats: CreditStats;
};

export default function DashboardHome() {
  const { getAuthHeader } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // First, try to get the auth token
        const authHeader = getAuthHeader();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        console.log('Fetching dashboard data from:', `${apiUrl}/api/user/dashboard`);
        
        // Make the request with proper CORS settings
        const response = await fetch(`${apiUrl}/api/user/dashboard`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader,
          },
          credentials: 'include',
        });
        
        if (response.status === 404) {
          console.warn('Dashboard endpoint not found (404). This might be expected if the backend is not fully implemented yet.');
          // Set mock data for development
          setDashboardData({
            user: {
              id: 'user-123',
              name: 'Demo User',
              email: 'demo@example.com',
              credits: 10,
              memberSince: new Date().toISOString(),
            },
            recentSummaries: [],
            creditStats: {
              currentBalance: 10,
              totalUsed: 0,
              recentTransactions: []
            }
          });
          return;
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch dashboard data (${response.status})`);
        }
        
        const responseData = await response.json() as { data: DashboardData };
        setDashboardData(responseData.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(`Failed to load dashboard data: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
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
    return null;
  }

  const { user, recentSummaries, creditStats } = dashboardData;

  return (
    <div className="space-y-8 p-4 sm:p-6">
      {/* Header with welcome message */}
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold leading-6 text-gray-900">Welcome back, {user.name}!</h1>
        <p className="mt-1 text-sm text-gray-500">
          Member since {formatDate(user.memberSince)} • {user.credits} credits available
        </p>
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
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
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
                      <DocumentTextIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{summary.title}</h3>
                      <p className="mt-1 text-xs text-gray-500">{formatDate(summary.date)}</p>
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No summaries created yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first meeting summary.</p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
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
