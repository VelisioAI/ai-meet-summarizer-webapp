import { CheckCircleIcon } from '@heroicons/react/24/solid/index.js';

const plans = [
  {
    name: 'Starter',
    price: 9,
    description: 'Perfect for individuals getting started with meeting summaries.',
    features: [
      '10 meeting summaries per month',
      'Basic summary templates',
      'Email support',
      'Export to PDF',
    ],
    featured: false,
  },
  {
    name: 'Professional',
    price: 29,
    description: 'For professionals who need more frequent meeting summaries.',
    features: [
      '50 meeting summaries per month',
      'Advanced summary templates',
      'Priority email support',
      'Export to PDF & DOCX',
      'Custom branding',
    ],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 99,
    description: 'For teams and organizations with high-volume needs.',
    features: [
      'Unlimited meeting summaries',
      'All Professional features',
      '24/7 priority support',
      'Team collaboration',
      'API access',
      'Custom templates',
    ],
    featured: false,
  },
];

export default function BuyCredits() {
  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold leading-6 text-gray-900">Buy Credits</h1>
        <p className="mt-2 text-sm text-gray-500">
          Choose a plan that works best for you. Credits never expire.
        </p>
      </div>

      <div className="mt-8">
        <div className="relative">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
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
                  <span className="text-base font-medium text-gray-500">/month</span>
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
                  Get started
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
