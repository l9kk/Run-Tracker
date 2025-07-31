'use client';

import { useState, useEffect } from 'react';

interface AIInsightsProps {
  className?: string;
}

export default function AIInsights({ className = '' }: AIInsightsProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const authToken = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch('/api/runs/insights', {
        credentials: 'include',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }

      const data = await response.json();
      setInsights(data.insights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (isLoading) {
    return (
      <div className={`bg-[#2C2C2C] rounded-3xl p-6 border border-[#2C2C2C] ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🧠</span>
          <h3 className="text-lg font-bold text-[#FFFFFF]">AI Insights</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="inline-block w-6 h-6 border-2 border-[#39B262] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-[#C5C5C5]">Analyzing your running data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-[#2C2C2C] rounded-3xl p-6 border border-[#2C2C2C] ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🧠</span>
          <h3 className="text-lg font-bold text-[#FFFFFF]">AI Insights</h3>
        </div>
        <div className="text-[#EB5757] text-sm">
          {error}
        </div>
        <button
          onClick={fetchInsights}
          className="mt-3 px-4 py-2 bg-[#39B262] text-white rounded-xl hover:bg-[#2d8a4d] transition-all duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className={`bg-[#2C2C2C] rounded-3xl p-6 border border-[#2C2C2C] ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🧠</span>
          <h3 className="text-lg font-bold text-[#FFFFFF]">AI Insights</h3>
        </div>
        <p className="text-[#C5C5C5] text-sm">
          Add more runs to get personalized insights about your running patterns and progress!
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-[#2C2C2C] rounded-3xl p-6 border border-[#2C2C2C] ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🧠</span>
        <h3 className="text-lg font-bold text-[#FFFFFF]">AI Insights</h3>
      </div>
      <div className="text-[#FFFFFF] text-sm leading-relaxed whitespace-pre-line">
        {insights}
      </div>
      <button
        onClick={fetchInsights}
        className="mt-4 px-4 py-2 bg-[#39B262]/20 text-[#39B262] rounded-xl hover:bg-[#39B262]/30 transition-all duration-200 text-sm"
      >
        Refresh Insights
      </button>
    </div>
  );
}
