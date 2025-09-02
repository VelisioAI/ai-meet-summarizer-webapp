'use client';

import { useEffect, useState } from 'react';
import { DocumentTextIcon, EyeIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

type Summary = {
  id: string;
  title: string;
  summary_status: string;
  created_at: string;
  has_summary: boolean;
};

type Pagination = {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

type SummaryHistoryResponse = {
  success: boolean;
  data: {
    items: Summary[];
    pagination: Pagination;
  };
};

export default function SummariesPage() {
  const { getAuthHeader } = useAuth();
  const router = useRouter();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummaries = async (offset: number = 0, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const authHeader = getAuthHeader();
      const authToken = 'Authorization' in authHeader ? authHeader.Authorization : null;

      if (!authToken) {
        setError('No authorization token found. Please log in again.');
        return;
      }

      const response = await fetch(`${apiUrl}/api/user/history?offset=${offset}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        credentials: process.env.NODE_ENV === 'production' ? 'include' : 'same-origin',
      });

      const resData: SummaryHistoryResponse = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error('message' in resData ? resData.message : 'Failed to fetch summary history');
      }

      if (append) {
        setSummaries(prev => [...prev, ...(resData.data.items || [])]);
      } else {
        setSummaries(resData.data.items || []);
      }
      setPagination(resData.data.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, [getAuthHeader]);

  const handleLoadMore = () => {
    if (pagination && pagination.hasMore) {
      const nextOffset = pagination.offset + pagination.limit;
      fetchSummaries(nextOffset, true);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900/30 text-green-400 border border-green-500/30';
      case 'pending':
        return 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30';
      case 'failed':
        return 'bg-red-900/30 text-red-400 border border-red-500/30';
      case 'not_requested':
        return 'bg-gray-800/30 text-gray-400 border border-gray-700/50';
      case 'processing':
        return 'bg-blue-900/30 text-blue-400 border border-blue-500/30';
      default:
        return 'bg-gray-800/30 text-gray-400 border border-gray-700/50';
    }
  };

  const handleViewDetails = (summaryId: string) => {
    router.push(`/dashboard/summaries/${summaryId}`);
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

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Meeting Summaries</h1>
          <p className="text-gray-400">
            Review all your past meetings and transcripts
            {pagination && (
              <span className="ml-2 text-sm bg-gray-800/50 text-gray-300 px-2 py-1 rounded-md">
                Showing {summaries.length} of {pagination.total} total
              </span>
            )}
          </p>
        </div>

        {/* Summaries Grid */}
        {Array.isArray(summaries) && summaries.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {summaries.map((summary) => (
              <motion.div 
                key={summary.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-black/30 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 hover:border-green-500/30 transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                      <DocumentTextIcon className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">
                          {summary.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(summary.summary_status)}`}>
                          {summary.summary_status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-500" />
                          <span>{formatDateTime(summary.created_at)}</span>
                        </div>
                        {summary.has_summary && (
                          <div className="flex items-center text-green-400">
                            <EyeIcon className="h-4 w-4 mr-1.5" />
                            <span>Summary Available</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => handleViewDetails(summary.id)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-4 md:mt-0 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-green-600/80 hover:bg-green-600 text-white text-sm font-medium transition-colors group-hover:shadow-lg group-hover:shadow-green-500/10"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Details
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-300">No summaries found</h3>
            <p className="mt-2 text-gray-400">Your meeting summaries will appear here.</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && (pagination.hasMore || pagination.offset > 0) && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Back to top
            </button>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (pagination.offset > 0) {
                    const newOffset = Math.max(0, pagination.offset - pagination.limit);
                    fetchSummaries(newOffset);
                  }
                }}
                disabled={pagination.offset === 0}
                className="px-4 py-2 rounded-lg border border-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <button
                onClick={handleLoadMore}
                disabled={!pagination.hasMore || loadingMore}
                className="px-4 py-2 rounded-lg bg-green-600/80 hover:bg-green-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {loadingMore ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    Next
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}