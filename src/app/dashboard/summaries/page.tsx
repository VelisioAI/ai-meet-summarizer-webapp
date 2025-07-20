import { CalendarIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline/index.js';

const meetings = [
  {
    id: 1,
    title: 'Q2 Planning Meeting',
    date: '2023-05-15',
    time: '10:00 AM - 11:30 AM',
    participants: 8,
    summary: 'Discussed the roadmap for Q2 2023 focusing on new features and improvements. The team aligned on priorities and set clear milestones for the upcoming quarter.',
  },
  {
    id: 2,
    title: 'Product Demo',
    date: '2023-05-10',
    time: '2:00 PM - 3:00 PM',
    participants: 5,
    summary: 'Demonstrated the latest product features to the stakeholders. Received positive feedback on the new dashboard interface and performance improvements.',
  },
  {
    id: 3,
    title: 'Team Retrospective',
    date: '2023-05-05',
    time: '11:00 AM - 12:30 PM',
    participants: 12,
    summary: 'Conducted a retrospective on the last sprint. Identified several areas for improvement in our development process and collaboration.',
  },
];

export default function DetailedSummaries() {
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
                    <p className="text-lg font-medium text-indigo-600 truncate">{meeting.title}</p>
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
                        {meeting.date}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        {meeting.time}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <UserGroupIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        {meeting.participants} participants
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-700">{meeting.summary}</p>
                  </div>
                  <div className="mt-4 flex space-x-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Full Summary
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Pagination */}
        <nav
          className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
          aria-label="Pagination"
        >
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">3</span> of{' '}
              <span className="font-medium">12</span> results
            </p>
          </div>
          <div className="flex-1 flex justify-between sm:justify-end">
            <button
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
