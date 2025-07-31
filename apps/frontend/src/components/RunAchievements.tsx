import React from 'react';
import { Run } from '../lib/types';
import { PersonalRecords } from '../lib/records';
import { AchievementBadge } from './PersonalRecords';

interface RunAchievementsProps {
  run: Run;
  allRuns: Run[];
}

export function RunAchievements({ run, allRuns }: RunAchievementsProps) {
  const achievements = PersonalRecords.getRunAchievements(run.id, allRuns);
  const isCurrentRecord = PersonalRecords.isCurrentRecord(run.id, allRuns);

  if (achievements.length === 0 && !isCurrentRecord) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {achievements.map((achievement, index) => (
        <AchievementBadge 
          key={`${achievement.type}-${index}`} 
          record={achievement} 
          size="sm" 
        />
      ))}
      {isCurrentRecord && achievements.length === 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          Current Record
        </span>
      )}
    </div>
  );
}
