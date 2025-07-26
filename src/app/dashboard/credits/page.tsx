'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline/index.js';
import { getUserProfile } from '@/lib/api';

const plans = [
  {
    id: 'credit_100',
    name: '100 Credits',
    price: 4.99,
    credits: 100,
    description: 'Perfect for individuals getting started with meeting summaries.',
    features: [
      '100 meeting credits',
      'Basic summary templates',
      'Email support',
    ],
    featured: false,
  },
  {
    id: 'credit_500',
    name: '500 Credits',
    price: 19.99,
    credits: 500,
    description: 'For professionals who need more frequent meeting summaries.',
    features: [
      '500 meeting credits',
      'Advanced summary templates',
      'Priority email support',
      'Export to PDF & DOCX',
    ],
    featured: true,
  },
  {
    id: 'credit_1000',
    name: '1000 Credits',
    price: 34.99,
    credits: 1000,
    description: 'For teams and organizations with high-volume needs.',
    features: [
      '1000 meeting credits',
      'All Professional features',
      '24/7 priority support',
      'Team collaboration',
    ],
    featured: false,
  },
];

export default function BuyCredits() {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        setLoading(true);
        const response = await getUserProfile();
        setCredits(response.data.credits);
      } catch (error) {
        console.error('Failed to fetch credits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold leading-6 text-gray-900">Buy Credits</h1>
        <p className="mt-2 text-sm text-gray-500">
          Current credits: <span className="font-semibold">{credits}</span>
        </p>
      </div>

      <div className="mt-8">
        <div className="relative">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border ${
                  plan.featured ? 'border-indigo-600' : 'border-gray-200'
                } bg-white p-8 shadow-sm`}
              >
                {plan.featured && (
                  <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 px-3 py-1 text-center text-sm font-medium text-white">
                    Most popular
                  </div>
                )}
                <h3 className="text-lg font-semibold leading-5">{plan.name}</h3>
                <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
                <p className="mt-4">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    ${plan.price}
                  </span>
                </p>
                <ul role="list" className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex">
                      <CheckCircleIcon
                        className="h-5 w-5 flex-shrink-0 text-green-500"
                        aria-hidden="true"
                      />
                      <span className="ml-3 text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`mt-8 block w-full rounded-md py-2 text-center text-sm font-semibold ${
                    plan.featured
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  }`}
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Need more flexibility?</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Contact us for custom plans tailored to your specific needs.</p>
          </div>
          <div className="mt-5">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
            >
              Contact sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}