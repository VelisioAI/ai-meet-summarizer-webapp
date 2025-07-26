'use client';

import { useParams } from 'next/navigation';
import { getSummary } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function SummaryDetail() {
  const { id } = useParams();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await getSummary(id as string);
        setSummary(response.data);
      } catch (error) {
        console.error('Failed to fetch summary:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSummary();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-500">Summary not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold leading-6 text-gray-900">
          {summary.title || 'Meeting Summary'}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {new Date(summary.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Summary</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            AI-generated meeting summary
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Transcript</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <div className="whitespace-pre-wrap max-h-60 overflow-y-auto p-3 bg-gray-100 rounded">
                  {summary.transcript_text}
                </div>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Summary</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <div className="whitespace-pre-wrap p-3 bg-gray-50 rounded">
                  {summary.summary_text || 'No summary available'}
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}