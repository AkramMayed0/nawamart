import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Palette, Check, Sparkles, Grid3X3, Search, ChevronDown, Eye } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getThemes, getThemeCategories, installTheme, uninstallTheme } from '@/api/themes'
import { useAuthStore } from '@/store/authStore'
import { getThemeSettings } from '@/api/themeSettings'
import Skeleton from '@/components/ui/Skeleton'

const CATEGORY_LABELS = {
  all: 'الكل',
  fashion: 'أزياء',
  electronics: 'إلكترونيات',
  food: 'طعام',
  digital: 'رقمي',
  general: 'عام',
}

const CATEGORY_ICONS = {
  fashion: '👗',
  electronics: '💻',
  food: '🍕',
  digital: '📱',
  general: '🎨',
}

export default function ThemesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const store = useAuthStore((s) => s.store)

  const [category, setCategory] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: themesRes, isLoading } = useQuery({
    queryKey: ['themes', category, filterType, searchQuery],
    queryFn: () => getThemes({ category: category !== 'all' ? category : undefined, type: filterType !== 'all' ? filterType : undefined, search: searchQuery || undefined }),
  })

  const { data: categoriesRes } = useQuery({
    queryKey: ['theme-categories'],
    queryFn: getThemeCategories,
  })

  const { data: currentSettingsRes } = useQuery({
    queryKey: ['theme-settings', store?._id],
    queryFn: () => getThemeSettings(store._id),
    enabled: !!store?._id,
  })

  const installMutation = useMutation({
    mutationFn: (themeId) => installTheme(store._id, themeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-settings', store?._id] })
      queryClient.invalidateQueries({ queryKey: ['themes'] })
    },
  })

  const uninstallMutation = useMutation({
    mutationFn: () => uninstallTheme(store._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-settings', store?._id] })
    },
  })

  const themes = themesRes?.data?.data || []
  const pagination = themesRes?.data?.pagination
  const currentThemeId = currentSettingsRes?.data?.theme?._id
  const categories = categoriesRes?.data || []

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-sm">
          <Palette size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-cairo text-xl font-bold text-text">متجر القوالب</h1>
          <p className="font-cairo text-sm text-text-muted">تصفح واختر القالب المناسب لمتجرك</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="بحث عن قالب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-white py-2.5 pr-10 pl-4 font-cairo text-sm text-text placeholder:text-text-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-xl border border-border bg-white px-4 py-2.5 font-cairo text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          <option value="all">جميع الأنواع</option>
          <option value="free">المجانية</option>
          <option value="premium">المدفوعة</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory('all')}
          className={`rounded-full px-4 py-2 font-cairo text-sm font-semibold transition-all ${
            category === 'all' ? 'bg-accent text-white shadow-sm shadow-accent/20' : 'bg-bg-soft text-text-muted hover:bg-border'
          }`}
        >
          الكل
        </button>
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`rounded-full px-4 py-2 font-cairo text-sm font-semibold transition-all ${
              category === cat.value ? 'bg-accent text-white shadow-sm shadow-accent/20' : 'bg-bg-soft text-text-muted hover:bg-border'
            }`}
          >
            {CATEGORY_ICONS[cat.value] || '🎨'} {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-[320px] rounded-2xl" />
          ))}
        </div>
      ) : themes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-muted">
          <Palette size={48} className="mb-4 opacity-30" />
          <p className="font-cairo text-lg font-semibold">لا توجد قوالب</p>
          <p className="font-cairo text-sm">لم يتم العثور على قوالب تطابق بحثك</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {themes.map((theme) => {
              const isInstalled = currentThemeId === theme._id
              const isPremium = theme.type === 'premium'
              return (
                <div
                  key={theme._id}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="aspect-[16/10] bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center relative overflow-hidden">
                    {theme.thumbnail ? (
                      <img src={theme.thumbnail} alt={theme.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-text-muted">
                        <Palette size={40} className="opacity-30" />
                        <span className="font-cairo text-xs opacity-50">{theme.category}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <button
                        onClick={() => navigate(`/dashboard/themes/${theme._id}/customize`)}
                        className="w-full rounded-lg bg-white/90 px-3 py-2 font-cairo text-sm font-bold text-text backdrop-blur-sm transition-colors hover:bg-white"
                      >
                        <Eye size={16} className="inline ml-1" />
                        تخصيص القالب
                      </button>
                    </div>
                    {isPremium && (
                      <div className="absolute left-3 top-3 rounded-full bg-amber-500 px-3 py-1 font-cairo text-xs font-bold text-white shadow-sm">
                        <Sparkles size={12} className="inline ml-1" />
                        مدفوع
                      </div>
                    )}
                    {isInstalled && (
                      <div className="absolute right-3 top-3 rounded-full bg-emerald-500 px-3 py-1 font-cairo text-xs font-bold text-white shadow-sm">
                        <Check size={12} className="inline ml-1" />
                        مثبت
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-cairo text-base font-bold text-text">{theme.name}</h3>
                      <span className="font-cairo text-xs text-text-subtle">{CATEGORY_LABELS[theme.category] || theme.category}</span>
                    </div>
                    <p className="mb-3 line-clamp-2 font-cairo text-sm text-text-muted">{theme.description}</p>
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {theme.features?.slice(0, 3).map((feat, i) => (
                        <span key={i} className="rounded-md bg-bg-soft px-2 py-0.5 font-cairo text-[11px] text-text-muted">
                          {feat}
                        </span>
                      ))}
                      {theme.features?.length > 3 && (
                        <span className="rounded-md bg-bg-soft px-2 py-0.5 font-cairo text-[11px] text-text-subtle">
                          +{theme.features.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-cairo text-sm font-bold text-text">
                        {isPremium ? `$${theme.price}` : 'مجاني'}
                      </span>
                      {isInstalled ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/dashboard/themes/${theme._id}/customize`)}
                            className="rounded-lg bg-primary/10 px-4 py-2 font-cairo text-sm font-bold text-primary transition-colors hover:bg-primary/20"
                          >
                            تخصيص
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('هل أنت متأكد من إلغاء تثبيت هذا القالب؟')) {
                                uninstallMutation.mutate()
                              }
                            }}
                            className="rounded-lg bg-danger-100 px-4 py-2 font-cairo text-sm font-bold text-danger transition-colors hover:bg-danger-200"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => installMutation.mutate(theme._id)}
                          disabled={installMutation.isPending}
                          className="rounded-lg bg-accent px-4 py-2 font-cairo text-sm font-bold text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
                        >
                          {installMutation.isPending ? '...جاري' : 'تثبيت'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`h-9 w-9 rounded-lg font-cairo text-sm font-bold transition-colors ${
                    pagination.page === p ? 'bg-accent text-white' : 'bg-bg-soft text-text-muted hover:bg-border'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
