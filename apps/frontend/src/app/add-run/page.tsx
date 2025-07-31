'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthClient } from '@/lib/auth';
import { addRunFormSchema, AddRunFormData } from '@/lib/validations';
import { Run } from '@/lib/types';
import PhotoUpload from '@/components/PhotoUpload';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import AchievementCelebration from '@/components/AchievementCelebration';

export default function AddRunPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoError, setPhotoError] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [achievementData, setAchievementData] = useState<{
    type: 'distance' | 'pace' | 'duration';
    value: string;
    previousBest?: string;
    location: string;
  } | null>(null);

  const getTodaysDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddRunFormData>({
    resolver: zodResolver(addRunFormSchema),
    defaultValues: {
      date: getTodaysDate(),
    },
  });

  const onSubmit = async (data: AddRunFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const runData = {
        locationText: data.locationText,
        distanceKm: data.distanceKm,
        durationMinutes: data.durationMinutes,
        date: data.date || new Date().toISOString(),
        photoUrl: photoUrl || undefined,
        lat: coordinates?.lat,
        lon: coordinates?.lon,
      };

      let currentRuns: Run[] = [];
      try {
        const runsResponse = await AuthClient.getRuns();
        currentRuns = Array.isArray(runsResponse) ? runsResponse : (runsResponse.runs || []);
      } catch (error) {
        console.warn('Could not fetch existing runs for achievement check:', error);
      }

      const isDistanceRecord = currentRuns.length === 0 || !currentRuns.some((run: Run) => run.distanceKm >= data.distanceKm);
      const currentPaceMin = data.durationMinutes / data.distanceKm;
      const isFastestPace = currentRuns.length === 0 || !currentRuns.some((run: Run) => (run.durationSec / 60 / run.distanceKm) <= currentPaceMin);

      await AuthClient.createRun(runData);

      if (isDistanceRecord && currentRuns.length > 0) {
        const previousBest = Math.max(...currentRuns.map((run: Run) => run.distanceKm)).toFixed(1) + 'km';
        
        setAchievementData({
          type: 'distance',
          value: `${data.distanceKm}km`,
          previousBest,
          location: data.locationText
        });
        setShowCelebration(true);
        
        setTimeout(() => router.push('/'), 10000);
      } else if (isFastestPace && currentRuns.length > 0) {
        const pace = Math.floor(currentPaceMin);
        const seconds = Math.round((currentPaceMin % 1) * 60);
        
        setAchievementData({
          type: 'pace',
          value: `${pace}:${seconds.toString().padStart(2, '0')}/km`,
          location: data.locationText
        });
        setShowCelebration(true);
        
        setTimeout(() => router.push('/'), 20000);
      } else if (currentRuns.length === 0) {
        setAchievementData({
          type: 'distance',
          value: `${data.distanceKm}km`,
          previousBest: undefined,
          location: data.locationText
        });
        setShowCelebration(true);
        
        setTimeout(() => router.push('/'), 20000);
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create run');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = (url: string) => {
    setPhotoUrl(url);
    setPhotoError('');
  };

  const handlePhotoError = (errorMessage: string) => {
    setPhotoError(errorMessage);
    setPhotoUrl('');
  };

  return (
    <div className="min-h-screen bg-[#191919] text-[#FFFFFF]">
      {/* Header */}
      <header className="border-b border-[#2C2C2C] bg-[#191919]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="mr-4 p-3 hover:bg-[#2C2C2C] rounded-2xl transition-all duration-200 text-[#C5C5C5] hover:text-[#FFFFFF] border border-[#2C2C2C] hover:border-[#39B262]/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-[#39B262]">Add New Run</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#2C2C2C] rounded-3xl p-8 sm:p-10 border border-[#2C2C2C] shadow-2xl">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[#EB5757]/10 border border-[#EB5757]/20 rounded-2xl">
              <p className="text-[#EB5757] text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Add Run Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Date Field */}
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-semibold text-[#FFFFFF] mb-3"
              >
                Date
              </label>
              <input
                {...register('date')}
                type="date"
                id="date"
                className="w-full px-4 py-4 bg-[#191919] border border-[#2C2C2C] rounded-2xl text-[#FFFFFF] placeholder-[#C5C5C5] focus:border-[#39B262] focus:ring-2 focus:ring-[#39B262]/20 focus:outline-none transition-all hover:border-[#39B262]/50"
              />
              {errors.date && (
                <p className="mt-2 text-sm text-[#EB5757] font-medium">{errors.date.message}</p>
              )}
            </div>

            {/* Location Field */}
            <div>
              <label
                htmlFor="locationText"
                className="block text-sm font-semibold text-[#FFFFFF] mb-3"
              >
                Location *
              </label>
              <Controller
                name="locationText"
                control={control}
                render={({ field }) => (
                  <LocationAutocomplete
                    value={field.value || ''}
                    onChange={(value, coords) => {
                      field.onChange(value);
                      setCoordinates(coords || null);
                    }}
                    placeholder="e.g., Central Park, New York"
                    error={errors.locationText?.message}
                  />
                )}
              />
            </div>

            {/* Distance Field */}
            <div>
              <label
                htmlFor="distanceKm"
                className="block text-sm font-semibold text-[#FFFFFF] mb-3"
              >
                Distance (km) *
              </label>
              <input
                {...register('distanceKm', { valueAsNumber: true })}
                type="number"
                step="0.01"
                id="distanceKm"
                className="w-full px-4 py-4 bg-[#191919] border border-[#2C2C2C] rounded-2xl text-[#FFFFFF] placeholder-[#C5C5C5] focus:border-[#39B262] focus:ring-2 focus:ring-[#39B262]/20 focus:outline-none transition-all hover:border-[#39B262]/50"
                placeholder="e.g., 5.00"
              />
              {errors.distanceKm && (
                <p className="mt-2 text-sm text-[#EB5757] font-medium">{errors.distanceKm.message}</p>
              )}
            </div>

            {/* Duration Field */}
            <div>
              <label
                htmlFor="durationMinutes"
                className="block text-sm font-semibold text-[#FFFFFF] mb-3"
              >
                Time (minutes) *
              </label>
              <input
                {...register('durationMinutes', { valueAsNumber: true })}
                type="number"
                id="durationMinutes"
                min="1"
                step="1"
                className="w-full px-4 py-4 bg-[#191919] border border-[#2C2C2C] rounded-2xl text-[#FFFFFF] placeholder-[#C5C5C5] focus:border-[#39B262] focus:ring-2 focus:ring-[#39B262]/20 focus:outline-none transition-all hover:border-[#39B262]/50"
                placeholder="e.g., 25"
              />
              <p className="mt-2 text-xs text-[#C5C5C5] font-medium">
                Enter time in minutes (e.g., 25 for 25 minutes)
              </p>
              {errors.durationMinutes && (
                <p className="mt-2 text-sm text-[#EB5757] font-medium">{errors.durationMinutes.message}</p>
              )}
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-semibold text-[#FFFFFF] mb-3">
                Photo (optional)
              </label>
              <PhotoUpload
                onUploadComplete={handlePhotoUpload}
                onUploadError={handlePhotoError}
                currentPhotoUrl={photoUrl}
              />
              {photoError && (
                <p className="mt-2 text-sm text-[#EB5757] font-medium">{photoError}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#39B262] hover:bg-[#2F8B4F] disabled:bg-[#39B262]/50 disabled:cursor-not-allowed text-[#FFFFFF] font-bold py-4 px-4 rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-[#39B262]/50 shadow-lg hover:shadow-xl mt-8"
            >
              {isLoading ? 'Adding Run...' : 'Add Run'}
            </button>
          </form>
        </div>
      </main>

      {/* Achievement Celebration Modal */}
      {achievementData && (
        <AchievementCelebration
          isOpen={showCelebration}
          onClose={() => {
            setShowCelebration(false);
            router.push('/');
          }}
          achievementType={achievementData.type}
          value={achievementData.value}
          previousBest={achievementData.previousBest}
          location={achievementData.location}
        />
      )}
    </div>
  );
}
