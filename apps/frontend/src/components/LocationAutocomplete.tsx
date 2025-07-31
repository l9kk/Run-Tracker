'use client';

import { useState, useEffect, useRef } from 'react';
import { GeocodingService } from '@/lib/geocoding';

interface LocationSuggestion {
  id: number;
  displayName: string;
  shortName: string;
  lat: number;
  lon: number;
  type: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lon: number }) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Enter location...",
  className = "",
  error
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [geoLocationLoading, setGeoLocationLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    setSelectedIndex(-1);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (inputValue.length >= 3) {
        setIsLoading(true);
        try {
          const results = await GeocodingService.searchLocations(inputValue);
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Location search failed:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    onChange(suggestion.shortName, { lat: suggestion.lat, lon: suggestion.lon });
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  const handleCurrentLocation = async () => {
    setGeoLocationLoading(true);
    try {
      const coords = await GeocodingService.getCurrentLocation();
      const locationName = await GeocodingService.reverseGeocode(coords.lat, coords.lon);
      
      if (locationName) {
        const shortName = locationName.split(', ').slice(0, 2).join(', ');
        onChange(shortName, coords);
      } else {
        onChange(`${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`, coords);
      }
    } catch (error) {
      console.error('Current location failed:', error);
    } finally {
      setGeoLocationLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className={`w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 pr-20 ${className}`}
        />
        
        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={geoLocationLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-green-400 transition-colors disabled:opacity-50"
          title="Use current location"
        >
          {geoLocationLoading ? (
            <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-slate-400">
              <div className="inline-block w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin mr-2"></div>
              Searching locations...
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full p-3 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0 ${
                  index === selectedIndex ? 'bg-slate-700' : ''
                }`}
              >
                <div className="text-slate-200 font-medium">
                  {suggestion.shortName}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {suggestion.displayName}
                </div>
              </button>
            ))
          ) : value.length >= 3 ? (
            <div className="p-4 text-center text-slate-400">
              No locations found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
