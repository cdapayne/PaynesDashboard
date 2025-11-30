'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BaseWidget } from './BaseWidget';
import { api, RSSItem } from '@/lib/api';

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

export function RSSWidget() {
  const [items, setItems] = useState<RSSItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRSSItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getRSSItems(10);
      setItems(response.data.items);
    } catch (err) {
      console.error('Failed to fetch RSS items:', err);
      setError('Failed to load feeds');
      // Show placeholder data on error
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRSSItems();
  }, [fetchRSSItems]);

  const handleRefresh = () => {
    fetchRSSItems();
  };

  return (
    <BaseWidget 
      id="rss" 
      title="RSS Feeds" 
      icon="📰"
      isLoading={isLoading}
      error={error ?? undefined}
      onRefresh={handleRefresh}
    >
      <div className="space-y-2">
        {items.length > 0 ? (
          items.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-zinc-50 dark:bg-zinc-700 rounded hover:bg-zinc-100 dark:hover:bg-zinc-600 cursor-pointer transition-colors"
            >
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 text-sm line-clamp-1">
                {item.title}
              </h4>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-blue-500">{item.source}</span>
                <span className="text-xs text-zinc-400">{formatTimeAgo(item.pubDate)}</span>
              </div>
            </a>
          ))
        ) : !isLoading && !error ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
            No RSS feeds configured. Add feeds via the RSS_FEED_URLS environment variable.
          </p>
        ) : null}
      </div>
    </BaseWidget>
  );
}
