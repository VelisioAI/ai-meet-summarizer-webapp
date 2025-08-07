'use client';

import { useEffect, useState } from 'react';
import { DocumentTextIcon, EyeIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

      if (!authHeader?.Authorization) {
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
        throw new Error(resData.message || 'Failed to fetch summary history');
      }

      if (append) {
        setSummaries(prev => [...prev, ...(resData.data.items || [])]);
      } else {
        setSummaries(resData.data.items || []);
      }
      setPagination(resData.data.pagination);
    } catch (err: any) {
      setError(err?.message || 'Unknown error occurred.');
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
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'not_requested':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-8 p-4 sm:p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Meeting Summaries</h1>
        <p className="text-gray-600 mt-2">
          Review all your past meetings and transcripts.
          {pagination && (
            <span className="ml-2 text-sm">
              Showing {summaries.length} of {pagination.total} total
            </span>
          )}
        </p>
      </div>

      {Array.isArray(summaries) && summaries.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {summaries.map((summary) => (
              <li key={summary.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DocumentTextIcon className="h-10 w-10 text-gray-400" />
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {summary.title}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(summary.summary_status)}`}>
                          {summary.summary_status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p>Created {formatDateTime(summary.created_at)}</p>
                        {summary.has_summary && (
                          <>
                            <span className="mx-2">•</span>
                            <p className="text-green-600">AI Summary Available</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewDetails(summary.id)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {pagination && pagination.hasMore && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    disabled={pagination.offset === 0}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleLoadMore}
                    disabled={!pagination.hasMore || loadingMore}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? 'Loading...' : 'Next'}
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{pagination.offset + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.offset + pagination.limit, pagination.total)}
                      </span>{' '}
                      of <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={handleLoadMore}
                      disabled={!pagination.hasMore || loadingMore}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      {loadingMore ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-500 mr-2"></div>
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-white shadow rounded-lg">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No meeting transcripts found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start recording meetings with the Chrome extension to see your transcripts here.
          </p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <DocumentTextIcon className="-ml-1 mr-2 h-5 w-5" />
              Install Chrome Extension
            </button>
          </div>
        </div>
      )}
    </div>
  );
}