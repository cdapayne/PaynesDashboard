'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '../auth';

export function Header() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <header className="bg-white dark:bg-zinc-900 shadow-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚀</span>
              <div>
                <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
                  PaynesDashboard
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  A Dev Hustler&apos;s Dashboard
                </p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
              ) : isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {user?.name}
                    </p>
                    <p className="text-xs text-zinc-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-300 hover:text-zinc-800 dark:hover:text-white border border-zinc-300 dark:border-zinc-600 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
}
