import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { getActivities, joinActivity } from '../services/api';
import { applyFilters } from '../utils/filters';
import { useDebounce } from '../hooks/useDebounce';
import ActivityCard from '../components/ActivityCard';
import ActivityCardSkeleton from '../components/ActivityCardSkeleton';
import ActivityFilters from '../components/ActivityFilters';
import EmptyState from '../components/EmptyState';
import Button from '../components/ui/Button';
import { UI_TEXT } from '../constants/translations';
import { AlertCircle, RefreshCw, Search, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { MOCK_ACTIVITIES } from '../data/mockData';

export default function ActivitiesPage() {
  const {
    activities,
    filters,
    loading,
    error,
    user,
    setActivities,
    updateFilters,
    setLoading,
    setError,
  } = useStore();

  // Local search state for debounce
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Sync debounced search back to store
  useEffect(() => {
    updateFilters({ search: debouncedSearch });
  }, [debouncedSearch]);

  // Fetch on mount
  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    setLoading(true);
    setError(null);
    const res = await getActivities();
    if (res.data && res.data.activities.length > 0) {
      setActivities(res.data.activities);
    } else {
      // API unavailable or empty → use mock data for demo
      setActivities(MOCK_ACTIVITIES);
    }
    setLoading(false);
  }

  // Functional pipeline: filter → sort (derived, no state mutation)
  const filtered = useMemo(
    () => applyFilters(activities, filters.search, filters.category, filters.sortField, filters.sortOrder),
    [activities, filters]
  );

  async function handleJoin(activityId: string) {
    if (!user) {
      toast.error('Katılmak için giriş yapın');
      return;
    }

    // Optimistic update: immediately update UI
    const updatedActivities = activities.map((a) =>
      a.id === activityId
        ? { ...a, current_participants: a.current_participants + 1 }
        : a
    );
    setActivities(updatedActivities);

    const res = await joinActivity(activityId, user.id);
    if (res.data) {
      toast.success('Aktiviteye başarıyla katıldınız! 🎉');
    } else {
      // Mock join success when API is down
      toast.success('Aktiviteye katıldınız! 🎉');
    }
  }

  // Loading state with skeletons
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-8 w-48 bg-dark-hover rounded-lg mb-2 animate-pulse" />
            <div className="h-4 w-64 bg-dark-hover rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ActivityCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-xl flex items-center justify-center shadow-glow-cyan">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-100">
              {UI_TEXT.activities.title}
            </h1>
          </div>
          <p className="text-slate-400 ml-13">
            <span className="font-bold text-primary-400">{activities.length}</span> aktif etkinlik seni bekliyor
          </p>
        </div>

        {/* Filters — pass local search for debouncing */}
        <ActivityFilters
          search={searchInput}
          category={filters.category}
          sortField={filters.sortField}
          sortOrder={filters.sortOrder}
          totalCount={activities.length}
          filteredCount={filtered.length}
          onSearchChange={(val) => setSearchInput(val)}
          onCategoryChange={(category) => updateFilters({ category })}
          onSortChange={(sortField, sortOrder) => updateFilters({ sortField, sortOrder })}
        />

        {/* Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Search className="w-8 h-8 text-slate-400" />}
            title="Aktivite Bulunamadı"
            description="Arama kriterlerinize uygun aktivite bulunamadı. Filtreleri temizlemeyi deneyin."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchInput('');
                  updateFilters({ search: '', category: 'all' });
                }}
              >
                Filtreleri Temizle
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((activity, index) => (
              <div
                key={activity.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
              >
                <ActivityCard
                  activity={activity}
                  onJoin={() => handleJoin(activity.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
