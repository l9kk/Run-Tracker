'use client';

import { useEffect, useState } from 'react';
import { UnitConverter, UnitPreferences, PaceUnit } from '@/lib/units';

interface PaceDisplayProps {
  paceSecPerKm: number;
  className?: string;
  showUnit?: boolean;
  unit?: PaceUnit;
}

export default function PaceDisplay({ 
  paceSecPerKm, 
  className = '', 
  showUnit = true,
  unit 
}: PaceDisplayProps) {
  const [preferredUnit, setPreferredUnit] = useState<PaceUnit>('metric');

  useEffect(() => {
    setPreferredUnit(UnitPreferences.getPreferredUnit());
  }, []);

  const displayUnit = unit || preferredUnit;
  const formattedPace = UnitConverter.formatPace(paceSecPerKm, displayUnit, showUnit);

  return (
    <span className={className}>
      {formattedPace}
    </span>
  );
}

interface DistanceDisplayProps {
  distanceKm: number;
  className?: string;
  showUnit?: boolean;
  unit?: PaceUnit;
}

export function DistanceDisplay({ 
  distanceKm, 
  className = '', 
  showUnit = true,
  unit 
}: DistanceDisplayProps) {
  const [preferredUnit, setPreferredUnit] = useState<PaceUnit>('metric');

  useEffect(() => {
    setPreferredUnit(UnitPreferences.getPreferredUnit());
  }, []);

  const displayUnit = unit || preferredUnit;
  const formattedDistance = UnitConverter.formatDistance(distanceKm, displayUnit, showUnit);

  return (
    <span className={className}>
      {formattedDistance}
    </span>
  );
}
