import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Zap } from 'lucide-react';
import type { Activity } from '../types';
import {
  CATEGORIES,
  CATEGORY_ICONS,
  COMPETITION_LEVELS,
  COMPETITION_COLORS,
  UI_TEXT,
} from '../constants/translations';
import { formatDateTime, getRelativeTime, formatScore } from '../utils/formatters';
import Card from './ui/Card';
import Button from './ui/Button';
import StatusBadge from './StatusBadge';

interface ActivityCardProps {
  activity: Activity;
  onJoin?: (id: string) => Promise<void>;
  showMatchScore?: boolean;
}

export default function ActivityCard({ activity, onJoin, showMatchScore = false }: ActivityCardProps) {
  const [joining, setJoining] = useState(false);

  const count = activity.participant_count ?? activity.current_participants;
  const isFull = count >= activity.max_participants;
  const spotsLeft = activity.max_participants - count;
  const fillPercent = Math.round((count / activity.max_participants) * 100);

  const label = activity.match_result?.label;
  const score = activity.score ?? activity.match_result?.final_score;

  const matchBadge =
    label === 'perfect_match'
      ? { text: UI_TEXT.recommendations.perfectMatch, cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800' }
      : label === 'good_match'
      ? { text: UI_TEXT.recommendations.goodMatch, cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800' }
      : { text: UI_TEXT.recommendations.lowMatch, cls: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' };

  async function handleJoin(e: React.MouseEvent) {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    if (!onJoin) return;
    setJoining(true);
    await onJoin(activity.id);
    setJoining(false);
  }

  return (
    <Link to={`/activities/${activity.id}`} className="block group">
      <Card className="flex flex-col overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
        {/* Category banner */}
        <div className="relative h-2 bg-gradient-to-r from-primary-500 to-primary-400 dark:from-primary-700 dark:to-primary-600" />

        <div className="flex flex-col flex-1 p-5 gap-4">
          {/* Top row: category + match badge + status */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                <span>{CATEGORY_ICONS[activity.category]}</span>
                {CATEGORIES[activity.category]}
              </span>
              <StatusBadge
                datetime={activity.datetime}
                currentParticipants={count}
                maxParticipants={activity.max_participants}
              />
            </div>

            {showMatchScore && score !== undefined && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${matchBadge.cls}`}>
                <Zap className="w-3 h-3" />
                {matchBadge.text} {formatScore(score)}
              </span>
            )}
          </div>

          {/* Title */}
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {activity.title}
            </h3>
            {activity.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {activity.description}
              </p>
            )}
          </div>

          {/* Meta info */}
          <div className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 flex-shrink-0 text-primary-500" />
              <span>{getRelativeTime(activity.datetime)}</span>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span className="text-gray-400 dark:text-gray-500 text-xs">{formatDateTime(activity.datetime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0 text-primary-500" />
              <span className="truncate">{activity.location}</span>
            </div>
          </div>

          {/* Score breakdown (mini bars) */}
          {showMatchScore && activity.match_result?.breakdown && (
            <div className="space-y-1.5 pt-1 border-t border-gray-100 dark:border-gray-800">
              {(['interest', 'competition', 'reliability'] as const).map((key) => {
                const item = activity.match_result!.breakdown[key];
                const labels = { interest: '🎯 İlgi', competition: '⚔️ Seviye', reliability: '🛡️ Güvenilirlik' };
                return (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <span className="w-20 text-gray-500 dark:text-gray-400 flex-shrink-0">{labels[key]}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${item.score * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-400 dark:text-gray-500 w-8 text-right">{formatScore(item.score)}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer: participants + level + join */}
          <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
            {/* Participant bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {count} / {activity.max_participants}
                </span>
                <span className={isFull ? 'text-red-500 font-medium' : 'text-emerald-600 dark:text-emerald-400 font-medium'}>
                  {isFull ? 'Dolu' : `${spotsLeft} yer açık`}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isFull ? 'bg-red-400' : 'bg-emerald-500'}`}
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-lg font-medium ${COMPETITION_COLORS[activity.competition_level]}`}>
                {COMPETITION_LEVELS[activity.competition_level]}
              </span>
              {onJoin && (
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={handleJoin}
                  disabled={isFull || joining}
                  loading={joining}
                >
                  {isFull ? 'Dolu' : 'Katıl'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
