'use client';

import React from 'react';
import { BaseWidget } from './BaseWidget';

export function SocialWidget() {
  const platforms = [
    { name: 'Facebook', icon: '👍', value: '1,500', metric: 'likes' },
    { name: 'YouTube', icon: '▶️', value: '5,000', metric: 'subscribers' },
    { name: 'TikTok', icon: '🎵', value: '10K', metric: 'followers' },
  ];

  return (
    <BaseWidget id="social" title="Social Media" icon="📱">
      <div className="space-y-3">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-700 rounded"
          >
            <div className="flex items-center gap-2">
              <span>{platform.icon}</span>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {platform.name}
              </span>
            </div>
            <div className="text-right">
              <p className="font-bold text-zinc-800 dark:text-zinc-200">{platform.value}</p>
              <p className="text-xs text-zinc-500">{platform.metric}</p>
            </div>
          </div>
        ))}
        <p className="text-xs text-zinc-400 text-center mt-2">
          Connect your social accounts in Phase 2
        </p>
      </div>
    </BaseWidget>
  );
}
