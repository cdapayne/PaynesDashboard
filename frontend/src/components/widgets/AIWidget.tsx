'use client';

import React, { useState, useEffect } from 'react';
import { BaseWidget } from './BaseWidget';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type GenerationType = 'app-description' | 'release-notes' | 'marketing-copy' | 'social-post';

interface GenerationModalProps {
  type: GenerationType;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (content: string) => void;
}

function GenerationModal({ type, isOpen, onClose, onGenerate }: GenerationModalProps) {
  const { token } = useAuth();
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const titles: Record<GenerationType, string> = {
    'app-description': '📝 Generate App Description',
    'release-notes': '📋 Generate Release Notes',
    'marketing-copy': '📣 Generate Marketing Copy',
    'social-post': '🐦 Generate Social Post',
  };

  const placeholders: Record<GenerationType, string> = {
    'app-description': 'Enter app name and key features...',
    'release-notes': 'Enter version and changes...',
    'marketing-copy': 'Describe your product and target audience...',
    'social-post': 'Enter topic and platform (e.g., Twitter, LinkedIn)...',
  };

  const handleGenerate = async () => {
    if (!token || !context.trim()) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.generateAIContent(token, type, context);
      setResult(response.data.content);
      onGenerate(response.data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-zinc-800 rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          ✕
        </button>

        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-4">
          {titles[type]}
        </h3>

        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder={placeholders[type]}
          className="w-full h-24 p-3 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-zinc-200 resize-none"
        />

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !context.trim()}
          className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Result:</span>
              <button
                onClick={handleCopy}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                📋 Copy
              </button>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-700 rounded text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AIWidget() {
  const { isAuthenticated } = useAuth();
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [modalType, setModalType] = useState<GenerationType | null>(null);
  const [generationCount, setGenerationCount] = useState(0);

  useEffect(() => {
    api.getAIStatus()
      .then((response) => setIsConfigured(response.data.configured))
      .catch(() => setIsConfigured(false));
  }, []);

  const handleOpenModal = (type: GenerationType) => {
    if (!isAuthenticated) {
      alert('Please sign in to use AI generation');
      return;
    }
    if (!isConfigured) {
      alert('OpenAI API not configured. Set OPENAI_API_KEY environment variable.');
      return;
    }
    setModalType(type);
  };

  const handleGeneration = () => {
    setGenerationCount((prev) => prev + 1);
  };

  return (
    <>
      <BaseWidget id="ai" title="AI Content" icon="🤖">
        <div className="space-y-4">
          <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
            <h4 className="font-medium text-zinc-800 dark:text-zinc-200 text-sm mb-2">
              Quick Generate
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleOpenModal('app-description')}
                className="p-2 text-xs bg-white dark:bg-zinc-700 rounded shadow-sm hover:shadow transition-shadow"
              >
                📝 App Description
              </button>
              <button
                onClick={() => handleOpenModal('release-notes')}
                className="p-2 text-xs bg-white dark:bg-zinc-700 rounded shadow-sm hover:shadow transition-shadow"
              >
                📋 Release Notes
              </button>
              <button
                onClick={() => handleOpenModal('marketing-copy')}
                className="p-2 text-xs bg-white dark:bg-zinc-700 rounded shadow-sm hover:shadow transition-shadow"
              >
                📣 Marketing Copy
              </button>
              <button
                onClick={() => handleOpenModal('social-post')}
                className="p-2 text-xs bg-white dark:bg-zinc-700 rounded shadow-sm hover:shadow transition-shadow"
              >
                🐦 Social Post
              </button>
            </div>
          </div>
          <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            <p>Session Generations: <span className="font-bold">{generationCount}</span></p>
            {isConfigured === false && (
              <p className="text-xs text-amber-500 mt-1">⚠️ OpenAI API not configured</p>
            )}
            {isConfigured === true && (
              <p className="text-xs text-green-500 mt-1">✓ OpenAI API connected</p>
            )}
          </div>
        </div>
      </BaseWidget>

      {modalType && (
        <GenerationModal
          type={modalType}
          isOpen={true}
          onClose={() => setModalType(null)}
          onGenerate={handleGeneration}
        />
      )}
    </>
  );
}
