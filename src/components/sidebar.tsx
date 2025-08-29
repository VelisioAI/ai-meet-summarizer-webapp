'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeIcon, DocumentTextIcon, CreditCardIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

type MenuItem = {
  name: string;
  icon: React.ElementType;
  path: string;
};

const menuItems: MenuItem[] = [
  { name: 'Home', icon: HomeIcon, path: '/dashboard' },
  { name: 'Summaries', icon: DocumentTextIcon, path: '/dashboard/summaries' },
  { name: 'Credits', icon: CreditCardIcon, path: '/dashboard/credits' },
];

export default function Sidebar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed inset-y-0 left-4 my-4 h-[calc(100vh-2rem)] w-64 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 flex-col z-50 transition-all duration-300 hover:shadow-lg hover:shadow-black/20">
        {/* Logo */}
        <div className="flex items-center justify-center h-20 border-b border-white/10">
          <motion.div
            className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            SummarifyAI
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <motion.div
                key={item.name}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="group"
              >
                <a
                  href={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 relative ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-green-400/20 to-emerald-500/20 border border-green-400/30'
                      : 'text-gray-300 hover:text-white group-hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isActive ? 'text-green-400' : ''}`} />
                  <span className="ml-4">{item.name}</span>
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-r-full"
                      layoutId="activeIndicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </a>
              </motion.div>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-white/10">
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center w-full p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <div className="ml-3 text-left">
                <p className="text-sm font-medium text-white truncate">
                  {user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 right-0 mb-2 w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden z-10"
                >
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm text-left text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 z-50 transition-all duration-300 hover:shadow-lg hover:shadow-black/20">
        <nav className="flex items-center justify-around py-2 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <motion.div
                key={item.name}
                whileTap={{ scale: 0.95 }}
                className="flex-1 flex justify-center"
              >
                <a
                  href={item.path}
                  className={`flex items-center justify-center p-3 rounded-lg transition-all duration-200 relative ${
                    isActive
                      ? 'text-green-400 bg-gradient-to-r from-green-400/20 to-emerald-500/20 border border-green-400/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                  aria-label={item.name}
                >
                  <Icon className="h-6 w-6" />
                  {isActive && (
                    <motion.div
                      className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-b-full"
                      layoutId="mobileActiveIndicator"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </a>
              </motion.div>
            );
          })}
          
          {/* User Menu Button */}
          <div className="flex-1 flex justify-center relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center justify-center p-3 text-gray-300 hover:text-white rounded-lg transition-colors hover:bg-gray-800/50"
              aria-label="User menu"
            >
              <UserCircleIcon className="h-6 w-6" />
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full right-0 mb-2 min-w-48 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-10"
                >
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm text-left text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </div>
    </>
  );
}