'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchCredits(1);
  }, []);

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
        <p className="text-black">Track your balance, usage, and transactions.</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-indigo-600 font-medium">Current Balance</p>
            <p className="text-3xl font-bold">{stats.currentBalance}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Total Earned</p>
            <p className="text-3xl font-bold">{stats.totalEarned}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600 font-medium">Total Used</p>
            <p className="text-3xl font-bold">{stats.totalUsed}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600 font-medium">Total Transactions</p>
            <p className="text-3xl font-bold">{stats.totalTransactions}</p>
          </div>
        </div>

        
      </div>

      {/* Transaction History */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
        {transactions.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {transactions.map((tx) => (
              <li key={tx.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{tx.reason}</p>
                  <p className="text-xs text-black">{formatDate(tx.timestamp)}</p>
                </div>
                <span className={`font-medium ${tx.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.change >= 0 ? '+' : ''}{tx.change}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-black">No transactions found.</p>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4 flex justify-center space-x-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => fetchCredits(pageNum)}
                className={`px-3 py-1 border rounded ${
                  pageNum === pagination.page ? 'bg-indigo-600 text-white' : 'bg-white text-black'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Buy More Credits */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Buy More Credits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[100, 500, 1000].map((amount) => (
            <button
              key={amount}
              onClick={() => alert(`Purchase ${amount} credits`)}
              className="p-4 border rounded-lg text-center hover:border-indigo-600 hover:shadow"
            >
              <p className="text-lg font-bold">{amount} Credits</p>
              <p className="text-black">₹{amount / 2}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
