import React, { useState } from 'react';

interface BulkOperationsProps {
  selectedRuns: string[];
  totalRuns: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDelete: (runIds: string[]) => void;
  onExitBulkMode: () => void;
}

export function BulkOperations({
  selectedRuns,
  totalRuns,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  onExitBulkMode
}: BulkOperationsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleBulkDelete = () => {
    if (showDeleteConfirm) {
      onBulkDelete(selectedRuns);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const isAllSelected = selectedRuns.length === totalRuns && totalRuns > 0;
  const isSomeSelected = selectedRuns.length > 0;

  return (
    <div className="bg-[#2C2C2C] border border-[#2C2C2C] rounded-3xl p-4 sm:p-5 mb-4 shadow-lg">
      {/* Mobile-first stacked layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        
        {/* Selection Info */}
        <div className="flex items-center justify-between sm:justify-start">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-[#FFFFFF]">
              <span className="text-[#39B262] font-bold">{selectedRuns.length}</span>
              <span className="hidden sm:inline"> of {totalRuns} runs selected</span>
              <span className="sm:hidden">/{totalRuns}</span>
            </span>
            
            {/* Quick Select Toggle - Mobile Optimized */}
            <button
              onClick={isAllSelected ? onDeselectAll : onSelectAll}
              className="text-sm px-4 py-2 rounded-2xl bg-[#39B262]/15 text-[#39B262] border border-[#39B262]/30 hover:bg-[#39B262]/25 hover:border-[#39B262]/50 transition-all duration-200 touch-manipulation font-medium"
            >
              {isAllSelected ? '✓ All' : 'Select All'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">{isSomeSelected && (
            <>
              {showDeleteConfirm ? (
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <span className="text-sm text-[#EB5757] flex-1 sm:flex-none font-medium">
                    Delete {selectedRuns.length}?
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 text-sm bg-[#EB5757] hover:bg-[#EB5757]/80 text-[#FFFFFF] rounded-2xl transition-all duration-200 touch-manipulation font-bold shadow-lg hover:shadow-xl"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-sm bg-[#191919] hover:bg-[#191919]/80 text-[#C5C5C5] hover:text-[#FFFFFF] rounded-2xl transition-all duration-200 touch-manipulation border border-[#2C2C2C] hover:border-[#39B262]/30"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 text-sm bg-[#EB5757] hover:bg-[#EB5757]/80 text-[#FFFFFF] rounded-2xl transition-all duration-200 touch-manipulation font-bold shadow-lg hover:shadow-xl"
                >
                  <span className="hidden sm:inline">Delete Selected</span>
                  <span className="sm:hidden">🗑 Delete</span>
                </button>
              )}
            </>
          )}
          
          <button
            onClick={onExitBulkMode}
            className="px-4 py-2 text-sm bg-[#191919] hover:bg-[#191919]/80 text-[#C5C5C5] hover:text-[#FFFFFF] rounded-2xl transition-all duration-200 touch-manipulation border border-[#2C2C2C] hover:border-[#39B262]/30 font-medium"
          >
            <span className="hidden sm:inline">Exit Bulk Mode</span>
            <span className="sm:hidden">Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
}
