'use client';

import React from 'react';

interface BaseWidgetProps {
  id: string;
  title: string;
  icon: string;
  children?: React.ReactNode;
  isLoading?: boolean;
  error?: string;
  onRefresh?: () => void;
}

export function BaseWidget({ 
  id, 
  title, 
  icon, 
  children, 
  isLoading = false, 
  error,
  onRefresh 
}: BaseWidgetProps) {
  return (
    <div 
      className="h-full w-full bg-white dark:bg-zinc-800 rounded-lg shadow-md overflow-hidden flex flex-col"
      data-widget-id={id}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">{title}</h3>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors disabled:opacity-50"
            aria-label="Refresh widget"
          >
            <svg 
              className={`w-4 h-4 text-zinc-600 dark:text-zinc-400 ${isLoading ? 'animate-spin' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          </button>
        )}
      </div>

      {/* Widget Content */}
      <div className="flex-1 p-4 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
