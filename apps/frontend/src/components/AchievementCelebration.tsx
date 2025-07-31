'use client';

import { useState } from 'react';

interface AchievementCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  achievementType: 'distance' | 'pace' | 'duration';
  value: string;
  previousBest?: string;
  location: string;
}

export default function AchievementCelebration({
  isOpen,
  onClose,
  achievementType,
  value,
  previousBest,
  location
}: AchievementCelebrationProps) {
  const [celebration, setCelebration] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateCelebration = async () => {
    if (hasGenerated || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/runs/generate-achievement', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          achievementType,
          value,
          previousBest,
          location
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate celebration');
      }

      const data = await response.json();
      setCelebration(data.celebration);
      setHasGenerated(true);
    } catch {
      setCelebration('🎉 Amazing achievement! You crushed your personal record!');
      setHasGenerated(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate celebration when modal opens
  if (isOpen && !hasGenerated && !isLoading) {
    generateCelebration();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2C2C2C] rounded-3xl p-8 max-w-md w-full border border-[#39B262] shadow-2xl">
        <div className="text-center">
          <div className="text-4xl mb-4">🏆</div>
          <h2 className="text-xl font-bold text-[#39B262] mb-4">Personal Record!</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2 py-8">
              <div className="w-6 h-6 border-2 border-[#39B262] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[#C5C5C5]">Generating celebration...</span>
            </div>
          ) : celebration ? (
            <div className="bg-[#191919] rounded-2xl p-4 border border-[#2C2C2C] mb-6">
              <p className="text-[#FFFFFF] text-sm leading-relaxed whitespace-pre-wrap">{celebration}</p>
            </div>
          ) : (
            <p className="text-[#FFFFFF] mb-6">🎉 Amazing achievement! You crushed your personal record!</p>
          )}
          
          <button
            onClick={onClose}
            className="w-full bg-[#39B262] hover:bg-[#2d8a4d] text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
}
