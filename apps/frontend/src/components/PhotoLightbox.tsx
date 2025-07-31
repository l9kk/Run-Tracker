'use client';

import { useEffect } from 'react';
import Image from 'next/image';

interface PhotoLightboxProps {
  isOpen: boolean;
  photoUrl: string;
  altText: string;
  onClose: () => void;
}

export default function PhotoLightbox({ isOpen, photoUrl, altText, onClose }: PhotoLightboxProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Lightbox Content */}
      <div className="relative z-10 max-w-4xl max-h-[90vh] p-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-20 w-12 h-12 bg-[#2C2C2C] hover:bg-[#39B262] border border-[#2C2C2C] hover:border-[#39B262] rounded-full flex items-center justify-center text-[#C5C5C5] hover:text-[#FFFFFF] transition-all duration-200 shadow-lg"
          title="Close (Esc)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        <div className="relative max-w-full max-h-[80vh]">
          <Image
            src={photoUrl}
            alt={altText}
            width={800}
            height={600}
            className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-[#2C2C2C]"
            priority
          />
        </div>

        {/* Caption */}
        <div className="mt-6 text-center">
          <p className="text-[#C5C5C5] text-sm font-medium bg-[#2C2C2C]/80 px-4 py-2 rounded-2xl inline-block">{altText}</p>
        </div>
      </div>
    </div>
  );
}
