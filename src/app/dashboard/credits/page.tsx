'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '@/components/CheckoutForm';
import { formatPrice, fetchProducts, createPaymentIntent, type Product } from '@/lib/stripe';
import { motion } from 'framer-motion';

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

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(ellipse 80% 60% at 20% 30%, #012a20 0%, transparent 50%), radial-gradient(ellipse 60% 80% at 80% 70%, #013b2e 0%, transparent 50%), radial-gradient(ellipse 100% 70% at 50% 50%, #050d18 0%, transparent 30%)",
                "radial-gradient(ellipse 70% 90% at 30% 20%, #013b2e 0%, transparent 50%), radial-gradient(ellipse 90% 60% at 70% 80%, #012a20 0%, transparent 50%), radial-gradient(ellipse 80% 80% at 40% 60%, #050d18 0%, transparent 30%)",
              ]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        <div className="p-6 text-white text-center">
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(ellipse 80% 60% at 20% 30%, #012a20 0%, transparent 50%), radial-gradient(ellipse 60% 80% at 80% 70%, #013b2e 0%, transparent 50%), radial-gradient(ellipse 100% 70% at 50% 50%, #050d18 0%, transparent 30%)",
                "radial-gradient(ellipse 70% 90% at 30% 20%, #013b2e 0%, transparent 50%), radial-gradient(ellipse 90% 60% at 70% 80%, #012a20 0%, transparent 50%), radial-gradient(ellipse 80% 80% at 40% 60%, #050d18 0%, transparent 30%)",
              ]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        <div className="p-6 text-red-400 text-center">{error}</div>
      </div>
    );
  }
  
  if (!stats) return null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(ellipse 80% 60% at 20% 30%, #012a20 0%, transparent 50%), radial-gradient(ellipse 60% 80% at 80% 70%, #013b2e 0%, transparent 50%), radial-gradient(ellipse 100% 70% at 50% 50%, #050d18 0%, transparent 30%)",
              "radial-gradient(ellipse 70% 90% at 30% 20%, #013b2e 0%, transparent 50%), radial-gradient(ellipse 90% 60% at 70% 80%, #012a20 0%, transparent 50%), radial-gradient(ellipse 80% 80% at 40% 60%, #050d18 0%, transparent 30%)",
              "radial-gradient(ellipse 90% 70% at 10% 80%, #024a3a 0%, transparent 50%), radial-gradient(ellipse 70% 100% at 90% 20%, #013b2e 0%, transparent 50%), radial-gradient(ellipse 60% 90% at 60% 40%, #050d18 0%, transparent 30%)",
              "radial-gradient(ellipse 60% 80% at 80% 60%, #012a20 0%, transparent 50%), radial-gradient(ellipse 100% 70% at 20% 90%, #024a3a 0%, transparent 50%), radial-gradient(ellipse 80% 60% at 50% 20%, #050d18 0%, transparent 30%)",
              "radial-gradient(ellipse 80% 60% at 20% 30%, #012a20 0%, transparent 50%), radial-gradient(ellipse 60% 80% at 80% 70%, #013b2e 0%, transparent 50%), radial-gradient(ellipse 100% 70% at 50% 50%, #050d18 0%, transparent 30%)"
            ]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="p-6 space-y-8 relative z-10">
        {/* Credit Stats */}
        <motion.div 
          className="backdrop-blur-xl bg-black/30 border border-green-500/20 rounded-2xl p-8 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ 
            boxShadow: '0 0 30px rgba(34, 197, 94, 0.2)',
            borderColor: 'rgba(34, 197, 94, 0.4)'
          }}
        >
          <motion.h1 
            className="text-3xl font-bold mb-4 bg-gradient-to-r from-white via-green-200 to-green-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Your Credits
          </motion.h1>
          <motion.p 
            className="text-gray-400 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Track your balance, usage, and transactions.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-500/30 p-6 rounded-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05, borderColor: 'rgba(59, 130, 246, 0.5)' }}
            >
              <p className="text-sm text-blue-300 font-medium">Current Balance</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.currentBalance}</p>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md border border-green-500/30 p-6 rounded-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05, borderColor: 'rgba(34, 197, 94, 0.5)' }}
            >
              <p className="text-sm text-green-300 font-medium">Total Earned</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalEarned}</p>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-md border border-red-500/30 p-6 rounded-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05, borderColor: 'rgba(239, 68, 68, 0.5)' }}
            >
              <p className="text-sm text-red-300 font-medium">Total Used</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalUsed}</p>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 backdrop-blur-md border border-amber-500/30 p-6 rounded-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05, borderColor: 'rgba(245, 158, 11, 0.5)' }}
            >
              <p className="text-sm text-amber-300 font-medium">Total Transactions</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalTransactions}</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Buy More Credits */}
        <motion.div 
          className="backdrop-blur-xl bg-black/30 border border-green-500/20 rounded-2xl p-8 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ 
            boxShadow: '0 0 30px rgba(34, 197, 94, 0.2)',
            borderColor: 'rgba(34, 197, 94, 0.4)'
          }}
        >
          <motion.h2 
            className="text-2xl font-bold mb-6 bg-gradient-to-r from-white via-green-200 to-green-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Buy More Credits
          </motion.h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                className="backdrop-blur-md bg-white/5 border border-green-500/20 rounded-xl p-6 text-center hover:border-green-400/40 hover:bg-white/10 transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 10px 40px rgba(34, 197, 94, 0.15)'
                }}
              >
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-3">{product.name}</h3>
                  <motion.p 
                    className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent"
                    whileHover={{ scale: 1.1 }}
                  >
                    {product.credits}
                  </motion.p>
                  <p className="text-sm text-gray-400 mt-1">Credits</p>
                  <p className="text-2xl text-white font-semibold mt-3">
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {formatPrice(Math.round(product.price / product.credits))} per credit
                  </p>
                </div>
                
                <motion.button
                  onClick={() => handlePurchase(product)}
                  disabled={paymentLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-green-500/20"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {paymentLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Purchase'
                  )}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stripe Checkout Modal */}
        {showCheckout && clientSecret && selectedProduct && (
          <motion.div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="backdrop-blur-xl bg-black/40 border border-green-500/30 rounded-2xl p-8 shadow-2xl max-w-md w-full my-8 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Complete Purchase</h3>
                <button
                  onClick={handlePaymentCancel}
                  className="text-gray-400 hover:text-white text-xl leading-none transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="font-medium text-white">{selectedProduct.name}</p>
                <p className="text-sm text-gray-300">
                  {selectedProduct.credits} credits for {formatPrice(selectedProduct.price)}
                </p>
              </div>

              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#22c55e',
                    },
                  },
                }}
              >
                <CheckoutForm
                  onSuccess={handlePaymentSuccess}
                  onCancel={handlePaymentCancel}
                />
              </Elements>
            </motion.div>
          </motion.div>
        )}

        {/* Transaction History */}
        <motion.div 
          className="backdrop-blur-xl bg-black/30 border border-green-500/20 rounded-2xl p-8 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ 
            boxShadow: '0 0 30px rgba(34, 197, 94, 0.2)',
            borderColor: 'rgba(34, 197, 94, 0.4)'
          }}
        >
          <motion.h2 
            className="text-2xl font-bold mb-6 bg-gradient-to-r from-white via-green-200 to-green-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Transaction History
          </motion.h2>
          
          {transactions.length > 0 ? (
            <motion.div 
              className="overflow-x-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 text-gray-300 font-semibold">Description</th>
                    <th className="text-left py-3 text-gray-300 font-semibold">Date</th>
                    <th className="text-right py-3 text-gray-300 font-semibold">Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, index) => (
                    <motion.tr 
                      key={tx.id} 
                      className="border-b border-gray-800 hover:bg-white/5 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                    >
                      <td className="py-4">
                        <p className="font-medium text-white">{tx.reason}</p>
                      </td>
                      <td className="py-4">
                        <p className="text-sm text-gray-400">{formatDate(tx.timestamp)}</p>
                      </td>
                      <td className="py-4 text-right">
                        <motion.span 
                          className={`font-semibold ${tx.change >= 0 ? 'text-green-400' : 'text-red-400'}`}
                          whileHover={{ scale: 1.1 }}
                        >
                          {tx.change >= 0 ? '+' : ''}{tx.change}
                        </motion.span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <motion.p 
              className="text-gray-400 text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              No transactions found.
            </motion.p>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <motion.div 
              className="mt-8 flex justify-center space-x-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <motion.button
                  key={pageNum}
                  onClick={() => fetchCredits(pageNum)}
                  className={`px-4 py-2 border rounded-lg font-medium transition-all duration-200 ${
                    pageNum === pagination.page 
                      ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-500/20' 
                      : 'bg-black/30 text-gray-300 border-gray-600 hover:bg-white/10 hover:border-green-500/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {pageNum}
                </motion.button>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}