'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, DocumentTextIcon, CreditCardIcon } from '@heroicons/react/24/outline';

export function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Home', href: '/dashboard', icon: HomeIcon, current: pathname === '/dashboard' },
    { 
      name: 'Detailed Summaries', 
      href: '/dashboard/summaries', 
      icon: DocumentTextIcon, 
      current: pathname.startsWith('/dashboard/summaries') 
    },
    { name: 'Buy Credits', href: '/dashboard/credits', icon: CreditCardIcon, current: pathname === '/dashboard/credits' },
  ];

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex-shrink-0 flex items-center px-4">
            <h1 className="text-xl font-bold text-indigo-600">Meet Summarizer</h1>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  item.current
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                )}
              >
                <item.icon
                  className={classNames(
                    item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                    'mr-3 flex-shrink-0 h-6 w-6'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}