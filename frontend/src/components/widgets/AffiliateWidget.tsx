'use client';

import React from 'react';
import { BaseWidget } from './BaseWidget';

export function AffiliateWidget() {
  return (
    <BaseWidget id="affiliate" title="Affiliate Marketing" icon="💰">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">450</p>
            <p className="text-xs text-zinc-500">Clicks</p>
          </div>
          <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">23</p>
            <p className="text-xs text-zinc-500">Orders</p>
          </div>
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <p className="text-lg font-bold text-green-600 dark:text-green-400">$89</p>
            <p className="text-xs text-zinc-500">Earnings</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Conversion Rate: <span className="font-bold">5.1%</span>
          </p>
        </div>
        <p className="text-xs text-zinc-400 text-center">
          Connect Amazon Associates in Phase 2
        </p>
      </div>
    </BaseWidget>
  );
}
