'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { AuthClient } from '@/lib/auth';

interface PhotoUploadProps {
  onUploadComplete: (photoUrl: string) => void;
  onUploadError: (error: string) => void;
  currentPhotoUrl?: string;
}

export default function PhotoUpload({ onUploadComplete, onUploadError, currentPhotoUrl }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    if (file.size > 30 * 1024 * 1024) {
      onUploadError('File size must be less than 30MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      onUploadError('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const response = await AuthClient.generatePresignedUrl(file.name, file.type);
      
      const uploadResponse = await fetch(response.presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      setUploadProgress(100);
      onUploadComplete(response.publicUrl);
    } catch (error) {
      onUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onUploadComplete, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="space-y-4">
      {/* Current Photo Preview */}
      {currentPhotoUrl && (
        <div className="relative">
          <Image
            src={currentPhotoUrl}
            alt="Run photo"
            width={400}
            height={192}
            className="w-full h-48 object-cover rounded-lg border border-slate-700"
          />
          <div className="absolute top-2 right-2 bg-slate-900 bg-opacity-75 rounded-full p-2">
            <span className="text-green-400 text-sm">📷</span>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-green-500 bg-green-500/10'
            : 'border-slate-600 hover:border-slate-500 bg-slate-800/30'
        } ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="space-y-3">
            <div className="text-green-400 text-2xl">⏳</div>
            <div className="text-slate-300">Uploading...</div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : isDragActive ? (
          <div className="space-y-2">
            <div className="text-green-400 text-3xl">📤</div>
            <div className="text-slate-300">Drop your photo here</div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-slate-400 text-3xl">📷</div>
            <div className="text-slate-300 font-medium">
              {currentPhotoUrl ? 'Replace photo' : 'Add run photo'}
            </div>
            <div className="text-slate-400 text-sm">
              Drag & drop or click to select
            </div>
            <div className="text-slate-500 text-xs">
              JPEG, PNG, WebP • Max 30MB
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
