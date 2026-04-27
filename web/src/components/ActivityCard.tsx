import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Trophy } from 'lucide-react';
import type { Activity } from '../types';
import { CATEGORIES, COMPETITION_LEVELS } from '../constants/translations';
import { formatDateTime } from '../utils/formatters';
import Button from './ui/Button';

interface ActivityCardProps {
  activity: Activity;
  onPress?: () => void;
  onJoin?: () => void;
  showMatchScore?: boolean;
}

export default function ActivityCard({
  activity,
  onPress,
  onJoin,
  showMatchScore = false,
}: ActivityCardProps) {
  const isFull = activity.current_participants >= activity.max_participants;
  const spotsLeft = activity.max_participants - activity.current_participants;

  return (
    <Link to={`/activities/${activity.id}`} className="block">
    <div
      onClick={onPress}
      className="group relative bg-dark-card border border-dark-border rounded-xl p-6 
               hover:border-primary-400 hover:shadow-glow-cyan transition-all duration-300 
               cursor-pointer transform hover:-translate-y-1"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-card rounded-xl opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        {/* Match Score Badge */}
        {showMatchScore && activity.match_score && (
          <div className="mb-3">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold
                ${
                  activity.match_score > 0.8
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-neon'
                    : 'bg-dark-hover text-primary-400 border border-primary-400'
                }`}
            >
              {activity.match_score > 0.8 ? '🎯 Mükemmel' : '✨ İyi'} 
              {' '}({Math.round(activity.match_score * 100)}%)
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-primary-400 
                     transition-colors duration-200">
          {activity.title}
        </h3>

        {/* Category & Level Tags */}
        <div className="flex gap-2 mb-3 flex-wrap">
          <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-lg text-xs 
                         font-semibold border border-primary-500/30">
            {CATEGORIES[activity.category]}
          </span>
          <span className="px-3 py-1 bg-secondary-500/20 text-secondary-400 rounded-lg text-xs 
                         font-medium border border-secondary-500/30">
            <Trophy className="w-3 h-3 inline mr-1" />
            {COMPETITION_LEVELS[activity.competition_level]}
          </span>
        </div>

        {/* Description */}
        <p className="text-slate-400 mb-4 line-clamp-2 text-sm">
          {activity.description}
        </p>

        {/* Info Grid */}
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-4 h-4 text-primary-400" />
            <span>{formatDateTime(activity.datetime)}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <MapPin className="w-4 h-4 text-primary-400" />
            <span>{activity.location}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Users className="w-4 h-4 text-primary-400" />
            <span>
              {activity.current_participants} / {activity.max_participants}
              {!isFull && spotsLeft <= 3 && (
                <span className="ml-2 text-xs text-amber-400 font-semibold">
                  (Son {spotsLeft} kişi!)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Join Button */}
        {onJoin && (
          <Button
            variant={isFull ? 'ghost' : 'neon'}
            onClick={(e) => {
              e.stopPropagation();
              onJoin();
            }}
            disabled={isFull}
            className="w-full"
          >
            {isFull ? 'Dolu' : 'Katıl'}
          </Button>
        )}
      </div>

      {/* Glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 
                    rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300 
                    -z-10"></div>
    </div>
    </Link>
  );
}
