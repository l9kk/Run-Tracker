import React, { useState, useEffect } from 'react';
import { PersonalRecord } from '../lib/records';
import { UnitConverter, UnitPreferences, PaceUnit } from '../lib/units';

interface AchievementBadgeProps {
  record: PersonalRecord;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadge({ record, size = 'md' }: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const getIcon = () => {
    switch (record.type) {
      case 'distance':
        return (
          <svg className={iconClasses[size]} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'pace':
        return (
          <svg className={iconClasses[size]} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
          </svg>
        );
      case 'duration':
        return (
          <svg className={iconClasses[size]} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getBadgeColor = () => {
    switch (record.type) {
      case 'distance':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'pace':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'duration':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-1 rounded-full border font-medium
        ${sizeClasses[size]} ${getBadgeColor()}
      `}
      title={record.description}
    >
      {getIcon()}
      <span className="capitalize">{record.type} PR</span>
    </span>
  );
}

interface PersonalRecordsDisplayProps {
  records: {
    bestDistance?: PersonalRecord;
    bestPace?: PersonalRecord;
    bestDuration?: PersonalRecord;
  };
}

export function PersonalRecordsDisplay({ records }: PersonalRecordsDisplayProps) {
  const [currentUnit, setCurrentUnit] = useState<PaceUnit>('metric');
  
  useEffect(() => {
    const preferredUnit = UnitPreferences.getPreferredUnit();
    setCurrentUnit(preferredUnit);
    
    // Listen for unit changes in localStorage
    const handleStorageChange = () => {
      const newUnit = UnitPreferences.getPreferredUnit();
      setCurrentUnit(newUnit);
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen for manual unit toggle calls
    const interval = setInterval(() => {
      const newUnit = UnitPreferences.getPreferredUnit();
      if (newUnit !== currentUnit) {
        setCurrentUnit(newUnit);
      }
    }, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [currentUnit]);

  const hasRecords = Object.values(records).some(record => record !== undefined);

  if (!hasRecords) {
    return null;
  }

  return (
    <div className="bg-[#2C2C2C] rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
      <h3 className="text-lg sm:text-xl font-semibold text-[#FFFFFF] mb-4 sm:mb-6">
        Personal Records
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {records.bestDistance && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#C5C5C5] mb-2">
              Longest Run
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-[#FFFFFF] mb-1">
              {UnitConverter.formatDistance(Number(records.bestDistance.value), currentUnit)}
            </span>
            <span className="text-xs text-[#C5C5C5]">
              {new Date(records.bestDistance.date).toLocaleDateString()}
            </span>
          </div>
        )}
        
        {records.bestPace && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#C5C5C5] mb-2">
              Best Pace
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-[#FFFFFF] mb-1">
              {UnitConverter.formatPace(records.bestPace.value, currentUnit)}
            </span>
            <span className="text-xs text-[#C5C5C5]">
              {new Date(records.bestPace.date).toLocaleDateString()}
            </span>
          </div>
        )}
        
        {records.bestDuration && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#C5C5C5] mb-2">
              Longest Duration
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-[#FFFFFF] mb-1">
              {formatDurationDisplay(records.bestDuration.value)}
            </span>
            <span className="text-xs text-[#C5C5C5]">
              {new Date(records.bestDuration.date).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDurationDisplay(durationSec: number): string {
  const minutes = Math.round(durationSec / 60);
  return `${minutes} min`;
}
