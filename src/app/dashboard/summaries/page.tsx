'use client';

import { useState, useEffect } from 'react';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline/index.js';
import { getUserHistory } from '@/lib/api';
import Link from 'next/link';

export default function DetailedSummaries() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummaries();
  }, [pagination.offset]);

  const fetchSummaries = async () => {
    try {
      setLoading(true);
      const response = await getUserHistory(pagination.limit, pagination.offset);
      setMeetings(response.data.items);
      setPagination({
        ...pagination,
        total: response.data.pagination.total,
        hasMore: (pagination.offset + response.data.items.length) < response.data.pagination.total
      });
    } catch (error) {
      console.error('Failed to fetch summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    if (pagination.offset > 0) {
      setPagination({
        ...pagination,
        offset: Math.max(0, pagination.offset - pagination.limit)
      });
    }
  };

  const handleNext = () => {
    if (pagination.hasMore) {
      setPagination({
        ...pagination,
        offset: pagination.offset + pagination.limit
      });
    }
  };

  if (loading && meetings.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold leading-6 text-gray-900">Detailed Summaries</h1>
        <p className="mt-2 text-sm text-gray-500">View and manage all your meeting summaries in one place.</p>
      </div>

      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {meetings.map((meeting) => (
              <li key={meeting.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-medium text-indigo-600 truncate">
                      {meeting.title || 'Untitled Meeting'}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Completed
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        {new Date(meeting.created_at).toLocaleDateString()}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        {new Date(meeting.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-700">
                      {meeting.summary_text?.substring(0, 200) || 'No summary available'}...
                    </p>
                  </div>
                  <div className="mt-4 flex space-x-4">
                    <Link
                      href={`/dashboard/summaries/${meeting.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Full Summary
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <nav
          className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
          aria-label="Pagination"
        >
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{pagination.offset + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.offset + pagination.limit, pagination.total)}
              </span> of{' '}
              <span className="font-medium">{pagination.total}</span> results
            </p>
          </div>
          <div className="flex-1 flex justify-between sm:justify-end">
            <button
              onClick={handlePrev}
              disabled={pagination.offset === 0}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${
                pagination.offset === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!pagination.hasMore}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${
                !pagination.hasMore ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}