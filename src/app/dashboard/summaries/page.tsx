'use client';

import { useEffect, useState } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

type Summary = {
  id: string;
  title: string;
  summary: string;
  meetingDate: string;
  durationMinutes: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type SummaryHistoryResponse = {
  success: boolean;
  data: {
    summaries: Summary[];
    pagination: Pagination;
  };
};

export default function SummariesPage() {
  const { getAuthHeader } = useAuth();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const authHeader = getAuthHeader();

        if (!authHeader?.Authorization) {
          setError('No authorization token found. Please log in again.');
          return;
        }

        const response = await fetch(`${apiUrl}/api/user/history`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader,
          },
          credentials: process.env.NODE_ENV === 'production' ? 'include' : 'same-origin',
        });

        const resData: SummaryHistoryResponse = await response.json();

        if (!response.ok || !resData.success) {
          throw new Error('Failed to fetch summary history');
        }

        setSummaries(resData.data.summaries);
        setPagination(resData.data.pagination);
      } catch (err: any) {
        setError(err?.message || 'Unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, [getAuthHeader]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

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
        <p className="text-gray-600 mt-2">Review all your past meetings and summaries.</p>
      </div>

      {Array.isArray(summaries) && summaries.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map((summary) => (
            <div key={summary.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                  <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{summary.title}</h3>
                  <p className="mt-1 text-xs text-gray-500">Meeting Date: {formatDate(summary.meetingDate)}</p>
                  <p className="mt-1 text-xs text-gray-500">Duration: {summary.durationMinutes} mins</p>
                  <p className="mt-2 text-sm text-gray-700 line-clamp-3">{summary.summary}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">{summary.status}</span>
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">No summaries found</h3>
          <p className="mt-1 text-sm text-gray-500">You haven't created any summaries yet.</p>
        </div>
      )}
    </div>
  );
}
