import React, { useState, useEffect } from 'react';
import { Run, UpdateRunData } from '../lib/types';

interface QuickEditModalProps {
  run: Run | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (runId: string, data: UpdateRunData) => Promise<void>;
}

export function QuickEditModal({ run, isOpen, onClose, onSave }: QuickEditModalProps) {
  const [formData, setFormData] = useState<UpdateRunData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (run) {
      setFormData({
        locationText: run.locationText,
        distanceKm: run.distanceKm,
        durationMinutes: Math.round(run.durationSec / 60),
        date: run.date,
      });
    }
  }, [run]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!run) return;

    if (formData.durationMinutes && formData.durationMinutes <= 0) {
      setError('Duration must be greater than 0 minutes');
      return;
    }

    if (formData.distanceKm && formData.distanceKm <= 0) {
      setError('Distance must be greater than 0');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSave(run.id, formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update run');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !run) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#2C2C2C] rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#2C2C2C]">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#FFFFFF]">
              Edit Run
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-[#C5C5C5] hover:text-[#FFFFFF] hover:bg-[#39B262]/20 rounded-xl transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-[#EB5757]/10 border border-[#EB5757]/20 rounded-2xl">
              <p className="text-[#EB5757] text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#FFFFFF] mb-3">
                Location
              </label>
              <input
                type="text"
                value={formData.locationText || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, locationText: e.target.value }))}
                className="w-full px-4 py-4 bg-[#191919] border border-[#2C2C2C] rounded-2xl text-[#FFFFFF] placeholder-[#C5C5C5] focus:border-[#39B262] focus:ring-2 focus:ring-[#39B262]/20 focus:outline-none transition-all hover:border-[#39B262]/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#FFFFFF] mb-3">
                Distance (km)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.distanceKm || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, distanceKm: parseFloat(e.target.value) }))}
                className="w-full px-4 py-4 bg-[#191919] border border-[#2C2C2C] rounded-2xl text-[#FFFFFF] placeholder-[#C5C5C5] focus:border-[#39B262] focus:ring-2 focus:ring-[#39B262]/20 focus:outline-none transition-all hover:border-[#39B262]/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#FFFFFF] mb-3">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.durationMinutes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="30"
                min="0.1"
                step="0.1"
                className="w-full px-4 py-4 bg-[#191919] border border-[#2C2C2C] rounded-2xl text-[#FFFFFF] placeholder-[#C5C5C5] focus:border-[#39B262] focus:ring-2 focus:ring-[#39B262]/20 focus:outline-none transition-all hover:border-[#39B262]/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#FFFFFF] mb-3">
                Date
              </label>
              <input
                type="date"
                value={formData.date ? formData.date.split('T')[0] : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-4 bg-[#191919] border border-[#2C2C2C] rounded-2xl text-[#FFFFFF] placeholder-[#C5C5C5] focus:border-[#39B262] focus:ring-2 focus:ring-[#39B262]/20 focus:outline-none transition-all hover:border-[#39B262]/50"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-[#C5C5C5] bg-[#191919] hover:bg-[#191919]/80 hover:text-[#FFFFFF] rounded-2xl transition-all duration-200 border border-[#2C2C2C] hover:border-[#39B262]/30 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-[#39B262] hover:bg-[#2F8B4F] text-[#FFFFFF] rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg hover:shadow-xl"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
