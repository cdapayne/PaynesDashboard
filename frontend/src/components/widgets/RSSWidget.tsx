'use client';

import React from 'react';
import { BaseWidget } from './BaseWidget';

export function RSSWidget() {
  const feedItems = [
    { title: 'Sample Feed Item 1', source: 'Tech Blog', time: '2 hours ago' },
    { title: 'Sample Feed Item 2', source: 'Dev Weekly', time: '5 hours ago' },
    { title: 'Sample Feed Item 3', source: 'Indie News', time: '1 day ago' },
    { title: 'Sample Feed Item 4', source: 'App Digest', time: '2 days ago' },
  ];

  return (
    <BaseWidget id="rss" title="RSS Feeds" icon="📰">
      <div className="space-y-2">
        {feedItems.map((item, index) => (
          <div
            key={index}
            className="p-3 bg-zinc-50 dark:bg-zinc-700 rounded hover:bg-zinc-100 dark:hover:bg-zinc-600 cursor-pointer transition-colors"
          >
            <h4 className="font-medium text-zinc-800 dark:text-zinc-200 text-sm line-clamp-1">
              {item.title}
            </h4>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-blue-500">{item.source}</span>
              <span className="text-xs text-zinc-400">{item.time}</span>
            </div>
          </div>
        ))}
        <p className="text-xs text-zinc-400 text-center pt-2">
          Add your RSS feeds in Phase 2
        </p>
      </div>
    </BaseWidget>
  );
}
