'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthClient } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await AuthClient.checkSession();
      setIsAuthenticated(isAuth);
      setIsLoading(false);
      
      if (!isAuth) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await AuthClient.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirecting to login
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-green-400">🏃‍♂️ Run Tracker</h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Welcome to Run Tracker!</h2>
          <p className="text-slate-400 mb-8">
            Your personal running companion is ready to go.
          </p>
          
          {/* Demo Success Message */}
          <div className="max-w-md mx-auto p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="text-green-400 text-4xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-green-400 mb-2">
              Authentication Working!
            </h3>
            <p className="text-slate-300 text-sm">
              You successfully logged in. The JWT cookie authentication system is working perfectly.
            </p>
          </div>

          {/* Next Steps */}
          <div className="mt-8 text-slate-400">
            <p className="text-sm">
              Ready to start tracking your runs! 🎯
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
