'use client';

import React from 'react';
import { BaseWidget } from './BaseWidget';

export function AIWidget() {
  return (
    <BaseWidget id="ai" title="AI Content" icon="🤖">
      <div className="space-y-4">
        <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
          <h4 className="font-medium text-zinc-800 dark:text-zinc-200 text-sm mb-2">
            Quick Generate
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button className="p-2 text-xs bg-white dark:bg-zinc-700 rounded shadow-sm hover:shadow transition-shadow">
              📝 App Description
            </button>
            <button className="p-2 text-xs bg-white dark:bg-zinc-700 rounded shadow-sm hover:shadow transition-shadow">
              📋 Release Notes
            </button>
            <button className="p-2 text-xs bg-white dark:bg-zinc-700 rounded shadow-sm hover:shadow transition-shadow">
              📣 Marketing Copy
            </button>
            <button className="p-2 text-xs bg-white dark:bg-zinc-700 rounded shadow-sm hover:shadow transition-shadow">
              🐦 Social Post
            </button>
          </div>
        </div>
        <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          <p>Recent Generations: <span className="font-bold">5</span></p>
          <p className="text-xs text-zinc-400 mt-1">Tokens Used: 2,500</p>
        </div>
        <p className="text-xs text-zinc-400 text-center">
          Connect OpenAI API in Phase 2
        </p>
      </div>
    </BaseWidget>
  );
}
