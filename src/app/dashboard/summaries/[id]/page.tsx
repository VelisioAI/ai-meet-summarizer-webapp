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
  ChevronRightIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
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

interface StatusInfo {
  message: string;
  estimatedTimeRemaining?: string;
  canRetry?: boolean;
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
  updated_at?: string;
  meeting_duration_minutes?: number;
  statusInfo?: StatusInfo;
}

interface ApiResponse {
  success: boolean;
  data: SummaryData;
  message?: string;
}

interface GenerateSummaryResponse {
  success: boolean;
  data: {
    summaryId: string;
    status: string;
    estimatedTime: string;
    creditsDeducted: number;
    remainingCredits: number;
  };
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
  const [generatingSummary, setGeneratingSummary] = useState(false);
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
        const authToken = 'Authorization' in authHeader ? authHeader.Authorization : null;

        if (!authToken) {
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

  // Auto-refresh for pending summaries
  useEffect(() => {
    if (summary?.summary_status === 'pending') {
      const interval = setInterval(async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          const authHeader = getAuthHeader();
          const authToken = 'Authorization' in authHeader ? authHeader.Authorization : null;
          
          if (!authToken) {
            console.error('No authorization token found');
            clearInterval(interval);
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
          if (resData.success && resData.data.summary_status !== 'pending') {
            setSummary(resData.data);
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Error polling summary status:', error);
        }
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [summary?.summary_status, id, getAuthHeader]);

  const handleGenerateSummary = async () => {
    if (!summary || generatingSummary) return;

    try {
      setGeneratingSummary(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const authHeader = getAuthHeader();
      const authToken = 'Authorization' in authHeader ? authHeader.Authorization : null;

      if (!authToken) {
        setError('No authorization token found. Please log in again.');
        return;
      }

      const response = await fetch(`${apiUrl}/api/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        credentials: process.env.NODE_ENV === 'production' ? 'include' : 'same-origin',
        body: JSON.stringify({
          transcript_id: summary.id,
          title: summary.title
        })
      });

      const resData: GenerateSummaryResponse = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to generate AI summary');
      }

      // Update summary status to pending
      setSummary(prev => prev ? {
        ...prev,
        summary_status: 'pending',
        statusInfo: {
          message: 'AI summary is being generated...',
          estimatedTimeRemaining: resData.data.estimatedTime
        }
      } : null);

    } catch (err: any) {
      console.error('Error generating summary:', err);
      setError(err?.message || 'Failed to generate AI summary');
    } finally {
      setGeneratingSummary(false);
    }
  };

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
      completed: { 
        color: 'bg-green-100 text-green-800', 
        text: 'AI Summary Complete',
        icon: CheckCircleIcon
      },
      pending: { 
        color: 'bg-blue-100 text-blue-800', 
        text: 'Generating AI Summary',
        icon: ArrowPathIcon
      },
      failed: { 
        color: 'bg-red-100 text-red-800', 
        text: 'AI Summary Failed',
        icon: ExclamationTriangleIcon
      },
      not_requested: { 
        color: 'bg-gray-100 text-gray-800', 
        text: 'Transcript Only',
        icon: DocumentTextIcon
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_requested;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
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

  const renderSummaryContent = () => {
    if (!summary) return null;

    if (summary.summary_status === 'pending') {
      return (
        <div className="text-center py-12 bg-gray-800/30 backdrop-blur-sm rounded-lg border border-green-500/20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <div className="mt-4">
            <h3 className="text-lg font-medium text-white">AI Summary in Progress</h3>
            <p className="mt-2 text-sm text-gray-300">
              Our Gemini AI is analyzing your meeting transcript...
            </p>
            {summary.statusInfo?.estimatedTimeRemaining && (
              <p className="text-xs text-green-400 mt-1">
                ⏱️ Estimated time: {summary.statusInfo.estimatedTimeRemaining}
              </p>
            )}
          </div>
        </div>
      );
    }

    if (summary.summary_status === 'failed') {
      return (
        <div className="text-center py-8 bg-red-900/20 backdrop-blur-sm rounded-lg border border-red-500/30">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <div className="mt-4">
            <h3 className="text-lg font-medium text-red-400">AI Summary Failed</h3>
            <p className="mt-2 text-sm text-red-300">
              There was an issue generating the AI summary. Please try again.
            </p>
            <button
              onClick={handleGenerateSummary}
              disabled={generatingSummary}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <SparklesIcon className="w-4 h-4 mr-2" />
              {generatingSummary ? 'Retrying...' : 'Retry AI Summary'}
            </button>
          </div>
        </div>
      );
    }

    if (summary.summary_text) {
      return (
        <div className="prose max-w-none">
          <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-lg border border-green-500/20">
            <div className="flex items-center mb-4">
              <SparklesIcon className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-sm font-medium text-green-400">Generated by Gemini AI</span>
            </div>
            <div 
              className="prose prose-invert max-w-none text-gray-200"
              dangerouslySetInnerHTML={{ __html: summary.summary_text.replace(/\n/g, '<br/>') }}
            />
          </div>
        </div>
      );
    }

    // No summary requested
    return (
      <div className="text-center py-12 bg-gray-800/30 backdrop-blur-sm rounded-xl border-2 border-dashed border-green-500/30">
        <SparklesIcon className="mx-auto h-12 w-12 text-green-400" />
        <div className="mt-4">
          <h3 className="text-lg font-medium text-white">Generate AI Summary</h3>
          <p className="mt-2 text-sm text-gray-300 max-w-md mx-auto">
            Transform your meeting transcript into a structured, actionable summary using our advanced AI. 
            Get key decisions, action items, and insights in seconds.
          </p>
          <div className="mt-6 space-y-2">
            <button
              onClick={handleGenerateSummary}
              disabled={generatingSummary}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:scale-105"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              {generatingSummary ? 'Generating...' : 'Generate AI Summary'}
            </button>
            <p className="text-xs text-gray-400">💎 Costs 1 credit • Powered by Google Gemini</p>
          </div>
        </div>
      </div>
    );
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
        <div className="text-center py-8 text-gray-400">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-2">No transcript available</p>
        </div>
      );
    }

    const displayItems = showFullTranscript ? transcriptItems : transcriptItems.slice(0, 5);

    return (
      <div className="space-y-4">
        {displayItems.map((item, index) => (
          <div key={index} className="flex space-x-3 p-4 bg-gray-800/30 rounded-lg hover:bg-gray-700/50 transition-colors">
            <div className="flex-shrink-0">
              <SpeakerWaveIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                {item.speaker && (
                  <p className="text-sm font-medium text-white">
                    {item.speaker}
                  </p>
                )}
                {item.timestamp && (
                  <span className="text-xs text-gray-500">
                    {item.timestamp}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-white whitespace-pre-wrap">
                {item.text}
              </p>
            </div>
          </div>
        ))}
        
        {transcriptItems.length > 5 && (
          <div className="text-center">
            <button
              onClick={() => setShowFullTranscript(!showFullTranscript)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-400">Loading meeting details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="text-center max-w-md">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-4 text-lg font-medium text-white">Error loading summary</h3>
          <p className="mt-2 text-sm text-gray-400">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard/summaries')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="text-center max-w-md">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-4 text-lg font-medium text-white">Summary not found</h3>
          <p className="mt-2 text-sm text-gray-400">The requested summary could not be found.</p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard/summaries')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
    <div className="min-h-screen text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 bg-black/30 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/dashboard/summaries')}
                  className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-1" />
                  Back to Summaries
                </button>
                <div className="hidden sm:block">
                  {getStatusBadge(summary.summary_status)}
                </div>
              </div>
              <h1 className="mt-4 text-2xl font-bold text-white">
                {summary.title || 'Meeting Summary'}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-500" />
                  {formatDate(summary.created_at)}
                </div>
                {(summary.meeting_duration_minutes || summary.meeting_metadata?.duration_minutes) && (
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1.5 text-gray-500" />
                    {formatDuration(summary.meeting_duration_minutes || summary.meeting_metadata?.duration_minutes || 0)}
                  </div>
                )}
                {summary.meeting_metadata?.participants && (
                  <div className="flex items-center">
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1.5 text-gray-500" />
                    {summary.meeting_metadata.participants.length} participants
                  </div>
                )}
              </div>
            </div>
            <div className="sm:hidden">
              {getStatusBadge(summary.summary_status)}
            </div>
          </div>
        </div>

        {/* AI Summary Section */}
        <div className="mb-6 bg-black/30 backdrop-blur-lg border border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-300 hover:border-green-500/30">
          <button
            onClick={() => toggleSection('summary')}
            className="flex items-center justify-between w-full text-left p-6 hover:bg-gray-700/20 transition-colors"
          >
            <div className="flex items-center">
              <SparklesIcon className="h-5 w-5 text-green-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">AI Summary</h3>
            </div>
            <ChevronDownIcon 
              className={`h-5 w-5 text-gray-400 transform transition-transform ${expandedSections.summary ? 'rotate-180' : ''}`} 
            />
          </button>
          {expandedSections.summary && (
            <div className="p-6 pt-0">
              {renderSummaryContent()}
            </div>
          )}
        </div>

        {/* Transcript Section */}
        <div className="mb-6 bg-black/30 backdrop-blur-lg border border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-300 hover:border-green-500/30">
          <button
            onClick={() => toggleSection('transcript')}
            className="flex items-center justify-between w-full text-left p-6 hover:bg-gray-700/20 transition-colors"
          >
            <div className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 text-green-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">Meeting Transcript</h3>
            </div>
            <ChevronDownIcon 
              className={`h-5 w-5 text-gray-400 transform transition-transform ${expandedSections.transcript ? 'rotate-180' : ''}`} 
            />
          </button>
          {expandedSections.transcript && (
            <div className="p-6 pt-0">
              {renderTranscript()}
            </div>
          )}
        </div>

        {/* Meeting Metadata Section */}
        {summary.meeting_metadata && (
          <div className="bg-black/30 backdrop-blur-lg border border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-300 hover:border-green-500/30">
            <button
              onClick={() => toggleSection('metadata')}
              className="flex items-center justify-between w-full text-left p-6 hover:bg-gray-700/20 transition-colors"
            >
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-400 mr-3" />
                <h3 className="text-lg font-semibold text-white">Meeting Details</h3>
              </div>
              <ChevronDownIcon 
                className={`h-5 w-5 text-gray-400 transform transition-transform ${expandedSections.metadata ? 'rotate-180' : ''}`} 
              />
            </button>
            {expandedSections.metadata && (
              <div className="p-6 pt-0">
                <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {summary.meeting_metadata.meeting_title && (
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <dt className="text-sm font-medium text-gray-400">Meeting Title</dt>
                      <dd className="mt-1 text-sm text-white">{summary.meeting_metadata.meeting_title}</dd>
                    </div>
                  )}
                  {summary.meeting_metadata.participants && (
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <dt className="text-sm font-medium text-gray-400">Participants</dt>
                      <dd className="mt-1 text-sm text-white">
                        {summary.meeting_metadata.participants.join(', ')}
                      </dd>
                    </div>
                  )}
                  {summary.meeting_metadata.meeting_url && (
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <dt className="text-sm font-medium text-gray-400">Meeting URL</dt>
                      <dd className="mt-1">
                        <a 
                          href={summary.meeting_metadata.meeting_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-green-400 hover:text-green-300 hover:underline break-all"
                        >
                          {summary.meeting_metadata.meeting_url}
                        </a>
                      </dd>
                    </div>
                  )}
                  {summary.meeting_metadata.duration_minutes && (
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <dt className="text-sm font-medium text-gray-400">Duration</dt>
                      <dd className="mt-1 text-sm text-white">
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
    </div>
  );
}