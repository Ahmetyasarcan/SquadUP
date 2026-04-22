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
import { AlertCircle, RefreshCw, Search } from 'lucide-react';
import toast from 'react-hot-toast';

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
    if (res.data) {
      setActivities(res.data.activities);
    } else if (res.error) {
      setError(res.error);
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
    } else if (res.error) {
      // Revert optimistic update on error
      const revertedActivities = activities.map((a) =>
        a.id === activityId
          ? { ...a, current_participants: a.current_participants }
          : a
      );
      setActivities(revertedActivities);
      toast.error(res.error);
    }
  }

  // Loading state with skeletons
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="h-8 w-48 skeleton rounded-lg mb-2" />
            <div className="h-4 w-64 skeleton rounded" />
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

  // Error state with retry
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-1">{error}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Backend'in çalıştığından emin ol:{' '}
            <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">python app.py</code>
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadActivities}>
          <RefreshCw className="w-4 h-4" />
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {UI_TEXT.activities.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Sana uygun aktiviteyi bul ve katıl
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
            icon={<Search className="w-8 h-8 text-gray-400" />}
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
                  onJoin={handleJoin}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
