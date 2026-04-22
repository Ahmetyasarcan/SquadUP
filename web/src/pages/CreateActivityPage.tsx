import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { createActivity } from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { UI_TEXT, CATEGORIES, COMPETITION_LEVELS, CATEGORY_ICONS } from '../constants/translations';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import type { Category } from '../types';
import toast from 'react-hot-toast';

const CATEGORY_OPTIONS: Category[] = ['sports', 'esports', 'board_games', 'outdoor'];

interface FormState {
  title: string;
  description: string;
  category: Category;
  competition_level: number;
  location: string;
  datetime: string;
  max_participants: number;
}

export default function CreateActivityPage() {
  const { user, addActivity } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    category: 'sports',
    competition_level: 3,
    location: '',
    datetime: '',
    max_participants: 10,
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear individual error on change
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = 'Başlık gerekli';
    else if (form.title.length < 5) newErrors.title = 'En az 5 karakter';
    if (!form.description.trim()) newErrors.description = 'Açıklama gerekli';
    if (!form.location.trim()) newErrors.location = 'Konum gerekli';
    if (!form.datetime) newErrors.datetime = 'Tarih ve saat gerekli';
    else if (new Date(form.datetime) < new Date()) newErrors.datetime = 'Geçmiş bir tarih seçemezsiniz';
    if (form.max_participants < 2) newErrors.max_participants = 'En az 2 katılımcı olmalı';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      toast.error('Aktivite oluşturmak için giriş yapın');
      navigate('/login');
      return;
    }

    if (!validate()) {
      toast.error('Lütfen tüm alanları doğru doldurun');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Aktivite oluşturuluyor...');

    const res = await createActivity({ ...form, creator_id: user.id });
    setLoading(false);

    if (res.data) {
      addActivity(res.data.activity);
      toast.dismiss(toastId);
      toast.success(UI_TEXT.create.success);
      navigate('/activities');
    } else {
      toast.dismiss(toastId);
      toast.error(res.error ?? 'Bir hata oluştu');
    }
  }

  // Auth guard
  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 animate-fade-in-up">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
            <PlusCircle className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Giriş Gerekli
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            Aktivite oluşturmak için önce giriş yapmanız gerekiyor.
          </p>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Giriş Yap
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <PlusCircle className="w-5 h-5 text-primary-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{UI_TEXT.create.title}</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{UI_TEXT.create.subtitle}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-5 animate-fade-in-up"
        >
          <Input
            label={`${UI_TEXT.create.activityTitle} *`}
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Örn: Kadıköy Halı Saha Maçı"
            error={errors.title}
            maxLength={100}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {UI_TEXT.create.description} *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Aktivite hakkında kısa bir açıklama..."
              rows={3}
              maxLength={500}
              className={`w-full px-4 py-2.5 text-sm border rounded-xl
                bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-colors
                ${errors.description
                  ? 'border-red-400 dark:border-red-500'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">⚠ {errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-400 text-right">{form.description.length}/500</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {UI_TEXT.create.category} *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => update('category', cat)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all
                    ${form.category === cat
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  <span>{CATEGORY_ICONS[cat]}</span>
                  {CATEGORIES[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Competition level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {UI_TEXT.create.competitionLevel}: <span className="text-primary-600 dark:text-primary-400 font-bold">{COMPETITION_LEVELS[form.competition_level]}</span>
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={form.competition_level}
              onChange={(e) => update('competition_level', +e.target.value)}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
              <span>Başlangıç</span><span>Orta</span><span>Profesyonel</span>
            </div>
          </div>

          <Input
            label={`${UI_TEXT.create.location} *`}
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="Örn: Kadıköy Halı Saha, Online (Discord)"
            error={errors.location}
          />

          <Input
            label={`${UI_TEXT.create.datetime} *`}
            type="datetime-local"
            value={form.datetime}
            onChange={(e) => update('datetime', e.target.value)}
            error={errors.datetime}
          />

          <Input
            label={`${UI_TEXT.create.maxParticipants}: ${form.max_participants}`}
            type="number"
            min={2}
            max={100}
            value={form.max_participants}
            onChange={(e) => update('max_participants', +e.target.value)}
            error={errors.max_participants}
          />

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              İptal
            </Button>
            <Button type="submit" variant="primary" size="lg" loading={loading} className="flex-1">
              <PlusCircle className="w-4 h-4" />
              {UI_TEXT.create.submit}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
