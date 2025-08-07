'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  CalendarIcon,
  SpeakerWaveIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface TranscriptItem {
  timestamp?: string;
  speaker?: string;
  text: string;
  startTime?: number;
  endTime?: number;
}

interface MeetingMetadata {
  duration_minutes?: number;
  participants?: string[];
  meeting_title?: string;
  meeting_url?: string;
  [key: string]: any;
}

interface SummaryData {
  id: string;
  title: string;
  summary_text: string | null;
  transcript_text: string;
  transcript_json: TranscriptItem[] | null;
  meeting_metadata: MeetingMetadata | null;
  summary_status: string;
  created_at: string;
  meeting_duration_minutes?: number;
}

interface ApiResponse {
  success: boolean;
  data: SummaryData;
  message?: string;
}

export default function SummaryDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { getAuthHeader } = useAuth();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{
    summary: boolean;
    transcript: boolean;
    metadata: boolean;
  }>({
    summary: true,
    transcript: true,
    metadata: false,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const authHeader = getAuthHeader();

        if (!authHeader?.Authorization) {
          setError('No authorization token found. Please log in again.');
          return;
        }

        const response = await fetch(`${apiUrl}/api/summary/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader,
          },
          credentials: process.env.NODE_ENV === 'production' ? 'include' : 'same-origin',
        });

        const resData: ApiResponse = await response.json();

        if (!response.ok || !resData.success) {
          throw new Error(resData.message || 'Failed to fetch summary details');
        }

        setSummary(resData.data);
      } catch (err: any) {
        console.error('Error fetching summary:', err);
        setError(err?.message || 'Failed to load summary details');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [id, getAuthHeader]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Processing' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed' },
      not_requested: { color: 'bg-gray-100 text-gray-800', text: 'Transcript Only' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_requested;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderTranscript = () => {
    if (!summary) return null;

    // Try to parse transcript_json first, fallback to transcript_text
    let transcriptItems: TranscriptItem[] = [];
    
    if (summary.transcript_json && Array.isArray(summary.transcript_json)) {
      transcriptItems = summary.transcript_json;
    } else if (summary.transcript_text) {
      // If transcript_json is not available, create a simple item from transcript_text
      transcriptItems = [{ text: summary.transcript_text, speaker: 'Meeting Transcript' }];
    }

    if (transcriptItems.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2">No transcript available</p>
        </div>
      );
    }

    const displayItems = showFullTranscript ? transcriptItems : transcriptItems.slice(0, 5);

    return (
      <div className="space-y-4">
        {displayItems.map((item, index) => (
          <div key={index} className="flex space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <SpeakerWaveIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                {item.speaker && (
                  <p className="text-sm font-medium text-gray-900">
                    {item.speaker}
                  </p>
                )}
                {item.timestamp && (
                  <span className="text-xs text-gray-500">
                    {item.timestamp}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                {item.text}
              </p>
            </div>
          </div>
        ))}
        
        {transcriptItems.length > 5 && (
          <div className="text-center">
            <button
              onClick={() => setShowFullTranscript(!showFullTranscript)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              {showFullTranscript ? 'Show Less' : `Show ${transcriptItems.length - 5} More Items`}
              <ChevronDownIcon 
                className={`ml-1 h-4 w-4 transform transition-transform ${showFullTranscript ? 'rotate-180' : ''}`} 
              />
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading summary</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard/summaries')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
              Back to Summaries
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Summary not found</h3>
          <p className="mt-1 text-sm text-gray-500">The requested summary could not be found.</p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard/summaries')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
              Back to Summaries
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard/summaries')}
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Back to Summaries
            </button>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(summary.summary_status)}
          </div>
        </div>
        
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {summary.title || 'Meeting Summary'}
          </h1>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {formatDate(summary.created_at)}
            </div>
            {(summary.meeting_duration_minutes || summary.meeting_metadata?.duration_minutes) && (
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {formatDuration(summary.meeting_duration_minutes || summary.meeting_metadata?.duration_minutes || 0)}
              </div>
            )}
            {summary.meeting_metadata?.participants && (
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                {summary.meeting_metadata.participants.length} participants
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Summary Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={() => toggleSection('summary')}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-medium text-gray-900">AI Summary</h3>
            <ChevronRightIcon 
              className={`h-5 w-5 text-gray-400 transform transition-transform ${expandedSections.summary ? 'rotate-90' : ''}`} 
            />
          </button>
        </div>
        {expandedSections.summary && (
          <div className="px-6 py-4">
            {summary.summary_text ? (
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {summary.summary_text}
                </div>
              </div>
            ) : summary.summary_status === 'pending' ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">AI summary is being generated...</p>
              </div>
            ) : summary.summary_status === 'failed' ? (
              <div className="text-center py-8 text-red-600">
                <p>Failed to generate AI summary. Please try again later.</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No AI summary was requested for this meeting.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transcript Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={() => toggleSection('transcript')}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-medium text-gray-900">Meeting Transcript</h3>
            <ChevronRightIcon 
              className={`h-5 w-5 text-gray-400 transform transition-transform ${expandedSections.transcript ? 'rotate-90' : ''}`} 
            />
          </button>
        </div>
        {expandedSections.transcript && (
          <div className="px-6 py-4">
            {renderTranscript()}
          </div>
        )}
      </div>

      {/* Meeting Metadata Section */}
      {summary.meeting_metadata && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <button
              onClick={() => toggleSection('metadata')}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-lg font-medium text-gray-900">Meeting Details</h3>
              <ChevronRightIcon 
                className={`h-5 w-5 text-gray-400 transform transition-transform ${expandedSections.metadata ? 'rotate-90' : ''}`} 
              />
            </button>
          </div>
          {expandedSections.metadata && (
            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                {summary.meeting_metadata.meeting_title && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Meeting Title</dt>
                    <dd className="mt-1 text-sm text-gray-900">{summary.meeting_metadata.meeting_title}</dd>
                  </div>
                )}
                {summary.meeting_metadata.participants && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Participants</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {summary.meeting_metadata.participants.join(', ')}
                    </dd>
                  </div>
                )}
                {summary.meeting_metadata.meeting_url && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Meeting URL</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a 
                        href={summary.meeting_metadata.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        {summary.meeting_metadata.meeting_url}
                      </a>
                    </dd>
                  </div>
                )}
                {summary.meeting_metadata.duration_minutes && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Duration</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDuration(summary.meeting_metadata.duration_minutes)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  );
}