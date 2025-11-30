'use client';

import React from 'react';
import { BaseWidget } from './BaseWidget';

export function AnalyticsWidget() {
  return (
    <BaseWidget id="analytics" title="Analytics" icon="📊">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,234</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Downloads</p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">$5,678</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Revenue</p>
          </div>
        </div>
        <div className="text-center p-2 bg-zinc-100 dark:bg-zinc-700 rounded">
          <span className="text-green-500 font-medium">↑ 12%</span>
          <span className="text-sm text-zinc-500 ml-2">vs last month</span>
        </div>
        <p className="text-xs text-zinc-400 text-center">
          Connect your App Store Connect and Google Play accounts in Phase 2
        </p>
      </div>
    </BaseWidget>
  );
}
