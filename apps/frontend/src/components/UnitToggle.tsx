'use client';

import { useState, useEffect } from 'react';
import { UnitPreferences, PaceUnit } from '@/lib/units';

interface UnitToggleProps {
  onUnitChange?: (unit: PaceUnit) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function UnitToggle({ 
  onUnitChange, 
  className = '',
  size = 'md' 
}: UnitToggleProps) {
  const [unit, setUnit] = useState<PaceUnit>('metric');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const preferredUnit = UnitPreferences.getPreferredUnit();
    setUnit(preferredUnit);
    setIsLoading(false);
  }, []);

  const handleToggle = () => {
    const newUnit = UnitPreferences.toggleUnit();
    setUnit(newUnit);
    onUnitChange?.(newUnit);
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base', 
    lg: 'text-lg'
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-[#2C2C2C] rounded-xl px-4 py-2.5 ${className}`}>
        <span className="text-transparent text-sm font-medium">km • mi</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`
        inline-flex items-center gap-2 px-4 py-2.5
        bg-[#2C2C2C] hover:bg-[#2C2C2C]/80 
        border border-[#2C2C2C] hover:border-[#39B262]/30
        rounded-xl transition-all duration-200
        font-medium text-[#C5C5C5] hover:text-[#FFFFFF]
        focus:outline-none focus:ring-2 focus:ring-[#39B262]/20
        whitespace-nowrap flex-shrink-0
        ${sizeClasses[size]} ${className}
      `}
      title={`Switch to ${unit === 'metric' ? 'imperial (miles)' : 'metric (km)'} units`}
    >
      <span className={unit === 'metric' ? 'text-[#FFFFFF]' : 'text-[#C5C5C5]'}>
        km
      </span>
      <div className="w-1 h-1 bg-[#C5C5C5] rounded-full"></div>
      <span className={unit === 'imperial' ? 'text-[#FFFFFF]' : 'text-[#C5C5C5]'}>
        mi
      </span>
    </button>
  );
}
