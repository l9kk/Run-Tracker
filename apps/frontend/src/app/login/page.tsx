'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthClient } from '@/lib/auth';
import { loginSchema, LoginFormData } from '@/lib/validations';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await AuthClient.login(data.email, data.password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#191919] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#2C2C2C] rounded-3xl p-8 sm:p-10 border border-[#2C2C2C] shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#FFFFFF] mb-3">
              Welcome Back
            </h1>
            <p className="text-[#C5C5C5] text-base">
              Sign in to your Run Tracker account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[#EB5757]/10 border border-[#EB5757]/20 rounded-2xl">
              <p className="text-[#EB5757] text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#FFFFFF] mb-3"
              >
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="w-full px-4 py-4 bg-[#191919] border border-[#2C2C2C] rounded-2xl text-[#FFFFFF] placeholder-[#C5C5C5] focus:border-[#39B262] focus:ring-2 focus:ring-[#39B262]/20 focus:outline-none transition-all hover:border-[#39B262]/50"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-[#EB5757] font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#FFFFFF] mb-3"
              >
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className="w-full px-4 py-4 bg-[#191919] border border-[#2C2C2C] rounded-2xl text-[#FFFFFF] placeholder-[#C5C5C5] focus:border-[#39B262] focus:ring-2 focus:ring-[#39B262]/20 focus:outline-none transition-all hover:border-[#39B262]/50"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-[#EB5757] font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#39B262] hover:bg-[#2F8B4F] disabled:bg-[#39B262]/50 disabled:cursor-not-allowed text-[#FFFFFF] font-bold py-4 px-4 rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-[#39B262]/50 shadow-lg hover:shadow-xl mt-8"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-5 bg-[#191919] rounded-2xl border border-[#2C2C2C]/50">
            <p className="text-[#C5C5C5] text-sm mb-3 font-semibold">Demo Account:</p>
            <p className="text-[#FFFFFF] text-sm font-mono bg-[#2C2C2C]/50 p-3 rounded-xl">
              demo@runtracker.com / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
