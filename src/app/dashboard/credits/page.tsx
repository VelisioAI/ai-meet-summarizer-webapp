'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '@/components/CheckoutForm';
import { formatPrice, fetchProducts, createPaymentIntent, type Product } from '@/lib/stripe';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type Stats = {
  currentBalance: number;
  totalEarned: number;
  totalUsed: number;
  totalTransactions: number;
  usagePercentage: number;
};

type Transaction = {
  id: string;
  change: number;
  reason: string;
  timestamp: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function CreditsPage() {
  const { getAuthHeader } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  // Checkout state
  const [clientSecret, setClientSecret] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const fetchCredits = async (page = 1) => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const authHeader = getAuthHeader();

      const res = await fetch(`${apiUrl}/api/credits/history?page=${page}`, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error('Failed to fetch credit data');

      setStats(data.data.stats);
      setTransactions(data.data.transactions);
      setPagination(data.data.pagination);
    } catch (err: any) {
      setError(err.message || 'Error fetching credits');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductList = async () => {
    try {
      const authHeader = getAuthHeader();
      const productList = await fetchProducts(authHeader);
      setProducts(productList);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Error fetching products');
    }
  };

  useEffect(() => {
    fetchCredits(1);
    fetchProductList();
  }, []);

  const handlePurchase = async (product: Product) => {
    try {
      setPaymentLoading(true);
      setSelectedProduct(product);
      
      const authHeader = getAuthHeader();
      const paymentData = await createPaymentIntent(product.id, authHeader);
      
      setClientSecret(paymentData.clientSecret);
      setShowCheckout(true);
    } catch (err: any) {
      console.error('Error creating payment intent:', err);
      setError(err.message || 'Error initiating payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowCheckout(false);
    setClientSecret('');
    setSelectedProduct(null);
    // Refresh credit data
    fetchCredits(pagination?.page || 1);
    // Show success message
    alert('Payment successful! Your credits have been added to your account.');
  };

  const handlePaymentCancel = () => {
    setShowCheckout(false);
    setClientSecret('');
    setSelectedProduct(null);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!stats) return null;

  return (
    <div className="p-6 space-y-8">
      {/* Credit Stats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Your Credits</h1>
        <p className="text-gray-600">Track your balance, usage, and transactions.</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-indigo-600 font-medium">Current Balance</p>
            <p className="text-3xl font-bold text-indigo-900">{stats.currentBalance}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Total Earned</p>
            <p className="text-3xl font-bold text-green-900">{stats.totalEarned}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600 font-medium">Total Used</p>
            <p className="text-3xl font-bold text-red-900">{stats.totalUsed}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600 font-medium">Total Transactions</p>
            <p className="text-3xl font-bold text-yellow-900">{stats.totalTransactions}</p>
          </div>
        </div>
      </div>

      {/* Buy More Credits */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Buy More Credits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="p-6 border rounded-lg text-center hover:border-indigo-600 hover:shadow-md transition-all duration-200 bg-gradient-to-b from-white to-gray-50"
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                <p className="text-3xl font-bold text-indigo-600 mt-2">
                  {product.credits} Credits
                </p>
                <p className="text-lg text-gray-600 mt-1">
                  {formatPrice(product.price)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatPrice(Math.round(product.price / product.credits))} per credit
                </p>
              </div>
              <button
                onClick={() => handlePurchase(product)}
                disabled={paymentLoading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {paymentLoading ? 'Processing...' : 'Purchase'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Stripe Checkout Modal */}
      {showCheckout && clientSecret && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Complete Purchase</h3>
              <button
                onClick={handlePaymentCancel}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedProduct.name}</p>
              <p className="text-sm text-gray-600">
                {selectedProduct.credits} credits for {formatPrice(selectedProduct.price)}
              </p>
            </div>

            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#4f46e5',
                  },
                },
              }}
            >
              <CheckoutForm
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </Elements>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Description</th>
                  <th className="text-left py-2">Date</th>
                  <th className="text-right py-2">Credits</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b">
                    <td className="py-3">
                      <p className="font-medium">{tx.reason}</p>
                    </td>
                    <td className="py-3">
                      <p className="text-sm text-gray-600">{formatDate(tx.timestamp)}</p>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`font-medium ${tx.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.change >= 0 ? '+' : ''}{tx.change}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No transactions found.</p>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center space-x-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => fetchCredits(pageNum)}
                className={`px-4 py-2 border rounded-lg transition-colors duration-200 ${
                  pageNum === pagination.page 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}