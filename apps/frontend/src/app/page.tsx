'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { AuthClient } from '@/lib/auth';
import { Run, RunStats } from '@/lib/types';
import { PaceUnit } from '@/lib/units';
import { PersonalRecords } from '@/lib/records';
import PhotoLightbox from '@/components/PhotoLightbox';
import PaceDisplay, { DistanceDisplay } from '@/components/PaceDisplay';
import UnitToggle from '@/components/UnitToggle';
import { PersonalRecordsDisplay } from '@/components/PersonalRecords';
import { RunAchievements } from '@/components/RunAchievements';
import { RunActions } from '@/components/RunActions';
import { BulkOperations } from '@/components/BulkOperations';
import { QuickEditModal } from '@/components/QuickEditModal';
import AIInsights from '@/components/AIInsights';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-slate-800 rounded-lg animate-pulse" />
});

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [runs, setRuns] = useState<Run[]>([]);
  const [stats, setStats] = useState<RunStats | null>(null);
  const [personalRecords, setPersonalRecords] = useState<{
    bestDistance?: import('@/lib/records').PersonalRecord;
    bestPace?: import('@/lib/records').PersonalRecord;
    bestDuration?: import('@/lib/records').PersonalRecord;
  }>({});
  const [error, setError] = useState<string>('');
  const [showMap, setShowMap] = useState<string>('');
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; alt: string } | null>(null);
  const [unitPreference, setUnitPreference] = useState<PaceUnit>('metric');
  
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedRuns, setSelectedRuns] = useState<string[]>([]);
  const [editingRun, setEditingRun] = useState<Run | null>(null);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const isAuth = await AuthClient.checkSession();
      setIsAuthenticated(isAuth);
      
      if (!isAuth) {
        setIsLoading(false);
        router.push('/login');
        return;
      }

      try {
        const [runsResponse, statsResponse] = await Promise.all([
          AuthClient.getRuns(),
          AuthClient.getRunStats(),
        ]);

        setRuns(runsResponse.runs || []);
        setStats(statsResponse.stats || null);
        
        const records = PersonalRecords.getCurrentRecords(runsResponse.runs || []);
        setPersonalRecords(records);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await AuthClient.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDeleteRun = async (runId: string) => {
    try {
      const response = await AuthClient.deleteRun(runId);
      
      if (response.success) {
        setRuns(prevRuns => {
          const updated = prevRuns.filter(run => run.id !== runId);
          const records = PersonalRecords.getCurrentRecords(updated);
          setPersonalRecords(records);
          return updated;
        });
        
        const statsResponse = await AuthClient.getRunStats();
        setStats(statsResponse.stats || null);
      } else {
        setError(response.error || 'Failed to delete run');
      }
    } catch (error) {
      console.error('Error deleting run:', error);
      setError('An unexpected error occurred');
    }
  };

  const handleEditRun = (run: Run) => {
    setEditingRun(run);
  };

  const handleSaveEdit = async (runId: string, data: import('@/lib/types').UpdateRunData) => {
    try {
      console.log('Updating run with data:', data);
      const response = await AuthClient.updateRun(runId, data);
      console.log('Update response:', response);
      
      if (response.run) {
        setRuns(prevRuns => {
          const updated = prevRuns.map(run => 
            run.id === runId ? response.run! : run
          );
          const records = PersonalRecords.getCurrentRecords(updated);
          setPersonalRecords(records);
          return updated;
        });
        
        const statsResponse = await AuthClient.getRunStats();
        setStats(statsResponse.stats || null);
      } else {
        console.error('Update failed:', response);
        throw new Error(response.message || response.error || 'Failed to update run');
      }
    } catch (error) {
      console.error('Error in handleSaveEdit:', error);
      throw error;
    }
  };

  const handleBulkSelect = (runId: string, selected: boolean) => {
    setSelectedRuns(prev => 
      selected 
        ? [...prev, runId]
        : prev.filter(id => id !== runId)
    );
  };

  const handleSelectAll = () => {
    setSelectedRuns(runs.map(run => run.id));
  };

  const handleDeselectAll = () => {
    setSelectedRuns([]);
  };

  const handleBulkDelete = async (runIds: string[]) => {
    try {
      const deletePromises = runIds.map(id => AuthClient.deleteRun(id));
      await Promise.all(deletePromises);
      
      setRuns(prevRuns => {
        const updated = prevRuns.filter(run => !runIds.includes(run.id));
        const records = PersonalRecords.getCurrentRecords(updated);
        setPersonalRecords(records);
        return updated;
      });
      
      setSelectedRuns([]);
      setIsBulkMode(false);
      
      const statsResponse = await AuthClient.getRunStats();
      setStats(statsResponse.stats || null);
    } catch (error) {
      console.error('Error bulk deleting runs:', error);
      setError('Failed to delete some runs');
    }
  };

  const formatDuration = (durationSec: number): string => {
    const minutes = Math.round(durationSec / 60);
    return `${minutes} min`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <div className="text-[#C5C5C5]">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#191919] text-[#FFFFFF]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#191919] border-b border-[#2C2C2C] backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-20 sm:h-24">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#FFFFFF]">
                Run Tracker
              </h1>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Unit Toggle */}
              <UnitToggle 
                onUnitChange={setUnitPreference}
                size="sm"
                className="flex-shrink-0"
              />
              
              {/* Primary CTA */}
              <button
                onClick={() => router.push('/add-run')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F8F8F8] hover:bg-[#E8E8E8] text-black font-medium rounded-2xl transition-colors shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Record run</span>
                <span className="sm:hidden">Add</span>
              </button>
              
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-3 text-[#C5C5C5] hover:text-[#FFFFFF] hover:bg-[#2C2C2C] rounded-2xl transition-colors"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden lg:inline text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8" key={`stats-${unitPreference}`}>
            <div className="bg-[#2C2C2C] p-4 sm:p-5 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#39B262]/20 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#39B262]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#FFFFFF] mb-1">{stats.totalRuns}</div>
              <div className="text-[#C5C5C5] text-sm font-medium">Total Runs</div>
            </div>
            <div className="bg-[#2C2C2C] p-4 sm:p-5 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#39B262]/20 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#39B262]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#FFFFFF] mb-1">
                <DistanceDisplay distanceKm={stats.totalDistance} />
              </div>
              <div className="text-[#C5C5C5] text-sm font-medium">Total Distance</div>
            </div>
            <div className="bg-[#2C2C2C] p-4 sm:p-5 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#39B262]/20 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#39B262]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#FFFFFF] mb-1">
                <PaceDisplay paceSecPerKm={stats.averagePace} />
              </div>
              <div className="text-[#C5C5C5] text-sm font-medium">Average Pace</div>
            </div>
            <div className="bg-[#2C2C2C] p-4 sm:p-5 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#39B262]/20 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#39B262]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#FFFFFF] mb-1">
                {stats.bestPace ? (
                  <PaceDisplay paceSecPerKm={stats.bestPace} />
                ) : 'N/A'}
              </div>
              <div className="text-[#C5C5C5] text-sm font-medium">Best Pace</div>
            </div>
          </div>
        )}

        {/* Personal Records Section */}
        <PersonalRecordsDisplay records={personalRecords} />

        {/* AI Insights Section */}
        <AIInsights className="mb-6 sm:mb-8" />

        {/* Runs List */}
        <div className="bg-[#2C2C2C] rounded-2xl">
          <div className="p-4 sm:p-6 border-b border-[#191919]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-[#FFFFFF]">Recent Runs</h2>
              {runs.length > 0 && !isBulkMode && (
                <button
                  onClick={() => setIsBulkMode(true)}
                  className="flex items-center space-x-1 px-3 py-2 text-xs sm:text-sm bg-[#39B262] hover:bg-[#2F8B4F] text-white rounded-xl transition-colors font-medium"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">Bulk Actions</span>
                  <span className="sm:hidden">Select</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Bulk Operations Bar */}
          {isBulkMode && runs.length > 0 && (
            <BulkOperations
              selectedRuns={selectedRuns}
              totalRuns={runs.length}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onBulkDelete={handleBulkDelete}
              onExitBulkMode={() => {
                setIsBulkMode(false);
                setSelectedRuns([]);
              }}
            />
          )}
          
          {runs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-[#C5C5C5] mb-4">No runs yet!</div>
              <button
                onClick={() => router.push('/add-run')}
                className="px-6 py-3 bg-[#39B262] hover:bg-[#2F8B4F] text-[#FFFFFF] font-semibold rounded-lg transition-colors"
              >
                Add Your First Run
              </button>
            </div>
          ) : (
            <div className="p-4 sm:p-6 pt-6 sm:pt-8">
              <div className="space-y-4 sm:space-y-5" key={`runs-${unitPreference}`}>
                {runs.map((run) => (
                <div key={run.id} className="bg-[#191919] rounded-3xl border border-[#2C2C2C] shadow-lg hover:shadow-xl hover:shadow-[#39B262]/5 transition-all duration-300 hover:border-[#39B262]/30 hover:bg-[#1F1F1F] overflow-hidden">
                  <div className="p-5 sm:p-6">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg sm:text-xl text-[#FFFFFF] truncate mb-1 leading-tight">{run.locationText}</h3>
                        <p className="text-[#C5C5C5] text-sm font-medium">{formatDate(run.date)}</p>
                      </div>
                      <div className="flex items-center space-x-3 ml-4">
                        {run.photoUrl && (
                          <button
                            onClick={() => setLightboxPhoto({ url: run.photoUrl!, alt: `Run at ${run.locationText}` })}
                            className="relative group p-2 rounded-xl hover:bg-[#2C2C2C]/70 transition-all duration-200 border border-transparent hover:border-[#39B262]/20"
                          >
                            <Image
                              src={run.photoUrl}
                              alt="Run photo"
                              width={44}
                              height={44}
                              className="w-11 h-11 rounded-lg object-cover group-hover:opacity-90 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-xl">
                              <span className="text-[#FFFFFF] text-xs">🔍</span>
                            </div>
                          </button>
                        )}
                        {run.lat && run.lon && (
                          <button
                            onClick={() => setShowMap(showMap === run.id ? '' : run.id)}
                            className={`p-3 rounded-xl transition-all duration-200 border ${
                              showMap === run.id 
                                ? 'text-[#39B262] bg-[#39B262]/15 border-[#39B262]/30 shadow-lg' 
                                : 'text-[#C5C5C5] hover:text-[#39B262] hover:bg-[#39B262]/10 border-[#2C2C2C] hover:border-[#39B262]/20'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Stats Section */}
                    <div className="grid grid-cols-3 gap-4 mb-5">
                      <div className="bg-[#2C2C2C]/30 rounded-2xl p-4 text-center border border-[#2C2C2C]/50">
                        <div className="text-xl sm:text-2xl font-bold text-[#FFFFFF] mb-1">
                          <DistanceDisplay distanceKm={run.distanceKm} />
                        </div>
                        <div className="text-xs font-semibold text-[#C5C5C5] uppercase tracking-wider">Distance</div>
                      </div>
                      <div className="bg-[#2C2C2C]/30 rounded-2xl p-4 text-center border border-[#2C2C2C]/50">
                        <div className="text-xl sm:text-2xl font-bold text-[#FFFFFF] mb-1">
                          {formatDuration(run.durationSec)}
                        </div>
                        <div className="text-xs font-semibold text-[#C5C5C5] uppercase tracking-wider">Duration</div>
                      </div>
                      <div className="bg-[#2C2C2C]/30 rounded-2xl p-4 text-center border border-[#2C2C2C]/50">
                        <div className="text-xl sm:text-2xl font-bold text-[#FFFFFF] mb-1">
                          <PaceDisplay paceSecPerKm={run.paceSecPerKm} />
                        </div>
                        <div className="text-xs font-semibold text-[#C5C5C5] uppercase tracking-wider">Pace</div>
                      </div>
                    </div>
                    
                    {/* Achievement Badges */}
                    <div className="mb-4">
                      <RunAchievements run={run} allRuns={runs} />
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#2C2C2C]/50">
                      <div className="flex items-center space-x-2">
                        <RunActions
                          run={run}
                          onEdit={handleEditRun}
                          onDelete={handleDeleteRun}
                          onBulkSelect={handleBulkSelect}
                          isBulkMode={isBulkMode}
                          isSelected={selectedRuns.includes(run.id)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Map Section - Show when toggled */}
                  {showMap === run.id && run.lat && run.lon && (
                    <div className="border-t border-[#2C2C2C]/50 bg-[#2C2C2C]/20 -mx-5 sm:-mx-6 px-5 sm:px-6 py-5">
                      <MapComponent
                        latitude={run.lat}
                        longitude={run.lon}
                        locationText={run.locationText}
                      />
                    </div>
                  )}
                </div>
              ))}
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Photo Lightbox */}
      <PhotoLightbox
        isOpen={!!lightboxPhoto}
        photoUrl={lightboxPhoto?.url || ''}
        altText={lightboxPhoto?.alt || ''}
        onClose={() => setLightboxPhoto(null)}
      />
      
      {/* Quick Edit Modal */}
      <QuickEditModal
        run={editingRun}
        isOpen={!!editingRun}
        onClose={() => setEditingRun(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
