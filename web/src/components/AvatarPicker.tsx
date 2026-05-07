import React from 'react';
import { getAvatarUrl, AVATAR_SEEDS } from '../utils/avatars';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface AvatarPickerProps {
  currentSeed: string;
  onSelect: (seed: string) => void;
}

export default function AvatarPicker({ currentSeed, onSelect }: AvatarPickerProps) {
  const currentIndex = AVATAR_SEEDS.indexOf(currentSeed);
  
  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % AVATAR_SEEDS.length;
    onSelect(AVATAR_SEEDS[nextIndex]);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + AVATAR_SEEDS.length) % AVATAR_SEEDS.length;
    onSelect(AVATAR_SEEDS[prevIndex]);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="relative group">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative flex items-center justify-center gap-6">
          <button 
            type="button"
            onClick={handlePrev}
            className="p-2 rounded-full glass border border-dark-border hover:border-primary-400 text-slate-400 hover:text-primary-400 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-800 transform group-hover:scale-105 transition-all duration-300">
            <img 
              src={getAvatarUrl(currentSeed)} 
              alt="Avatar Preview" 
              className="w-full h-full object-cover"
            />
          </div>

          <button 
            type="button"
            onClick={handleNext}
            className="p-2 rounded-full glass border border-dark-border hover:border-primary-400 text-slate-400 hover:text-primary-400 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <p className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary-400" />
          Karakterini Seç
        </p>
        <p className="text-xs text-slate-500">Ok butonları ile değiştirebilirsin</p>
      </div>

      <div className="flex gap-2 overflow-x-auto max-w-full pb-2 px-4 scrollbar-hide">
        {AVATAR_SEEDS.slice(0, 8).map(seed => (
          <button
            key={seed}
            type="button"
            onClick={() => onSelect(seed)}
            className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
              currentSeed === seed ? 'border-primary-500 scale-110 shadow-glow-cyan' : 'border-transparent opacity-50 hover:opacity-100'
            }`}
          >
            <img src={getAvatarUrl(seed)} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
