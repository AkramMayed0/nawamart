import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Palette, Check, Sparkles, Grid3X3, Search, ChevronDown, Eye, Shirt, Monitor, Pizza, Smartphone, Star, ArrowLeft, ShoppingBag, ExternalLink } from 'lucide-react'
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
  fashion: Shirt,
  electronics: Monitor,
  food: Pizza,
  digital: Smartphone,
  general: Palette,
}

const CATEGORY_COLORS = {
  fashion: 'from-pink-500 to-rose-600',
  electronics: 'from-blue-500 to-cyan-600',
  food: 'from-orange-500 to-amber-600',
  digital: 'from-purple-500 to-violet-600',
  general: 'from-teal-500 to-emerald-600',
}

export default function ThemesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const storeRaw = useAuthStore((s) => s.store)
  const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw

  const [category, setCategory] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  const { data: themesRes, isLoading } = useQuery({
    queryKey: ['themes', category, filterType, searchQuery, page],
    queryFn: () => getThemes({ category: category !== 'all' ? category : undefined, type: filterType !== 'all' ? filterType : undefined, search: searchQuery || undefined, page, limit: 20 }),
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
      queryClient.invalidateQueries({ queryKey: ['themes'] })
    },
  })

  const themes = themesRes?.data?.data?.data || []
  const pagination = themesRes?.data?.data?.pagination
  const currentThemeId = currentSettingsRes?.data?.data?.theme?._id
  const categories = categoriesRes?.data?.data || []
  const currentTheme = themes.find((t) => t._id === currentThemeId)

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-violet-600 shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
            <Sparkles size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-cairo text-2xl font-bold text-text">متجر القوالب</h1>
            <p className="font-cairo text-sm text-text-muted">تصفح واختر القالب المناسب لمتجرك</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button onClick={() => navigate('/dashboard/customize')} className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-white px-4 py-2 font-cairo text-sm font-semibold text-text-muted transition-all hover:border-accent/30 hover:text-text">
            <ArrowLeft size={16} />
            مركز التخصيص
          </button>
        </div>
      </div>

      {currentTheme && (
        <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-primary/[0.02] to-accent/5 border border-primary/10 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 shadow-sm">
              <Check size={28} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-cairo text-xs text-emerald-600 font-bold mb-0.5">القالب المثبت حالياً</p>
              <h3 className="font-cairo text-lg font-bold text-text">{currentTheme.name}</h3>
              <p className="font-cairo text-sm text-text-muted">{currentTheme.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(`/dashboard/themes/${currentTheme._id}/customize`)} className="rounded-xl bg-accent px-5 py-2.5 font-cairo text-sm font-bold text-white transition-all hover:bg-accent/90 shadow-sm">
                تخصيص
              </button>
              <button onClick={() => { if (confirm('هل أنت متأكد من إلغاء تثبيت هذا القالب؟')) uninstallMutation.mutate() }} className="rounded-xl border border-border/60 px-4 py-2.5 font-cairo text-sm font-semibold text-text-muted transition-all hover:border-danger/30 hover:text-danger">
                إلغاء التثبيت
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="ابحث عن قالب..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
            className="w-full rounded-xl border border-border bg-white py-2.5 pr-10 pl-4 font-cairo text-sm text-text placeholder:text-text-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <select
          value={filterType}
           onChange={(e) => { setFilterType(e.target.value); setPage(1) }}
          className="rounded-xl border border-border bg-white px-4 py-2.5 font-cairo text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          <option value="all">جميع الأنواع</option>
          <option value="free">المجانية</option>
          <option value="premium">المدفوعة</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setCategory('all'); setPage(1) }}
          className={`rounded-full px-5 py-2.5 font-cairo text-sm font-semibold transition-all ${
            category === 'all' ? 'bg-accent text-white shadow-sm shadow-accent/20' : 'bg-bg-soft text-text-muted hover:bg-border'
          }`}
        >
          <Grid3X3 size={14} className="inline ml-1.5" />
          الكل
        </button>
        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.value] || Palette
          return (
            <button
              key={cat.value}
              onClick={() => { setCategory(cat.value); setPage(1) }}
              className={`rounded-full px-5 py-2.5 font-cairo text-sm font-semibold transition-all ${
                category === cat.value
                  ? 'bg-accent text-white shadow-sm shadow-accent/20'
                  : 'bg-bg-soft text-text-muted hover:bg-border'
              }`}
            >
              <Icon size={14} className="inline ml-1.5" />
              {cat.label}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-[360px] rounded-2xl" />
          ))}
        </div>
      ) : themes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-bg-soft mb-6">
            <Palette size={40} className="opacity-40" />
          </div>
          <p className="font-cairo text-lg font-bold text-text mb-1">لا توجد قوالب</p>
          <p className="font-cairo text-sm">لم يتم العثور على قوالب تطابق بحثك</p>
          <button onClick={() => { setSearchQuery(''); setCategory('all'); setFilterType('all') }} className="mt-4 rounded-xl bg-accent/10 px-5 py-2.5 font-cairo text-sm font-bold text-accent transition-all hover:bg-accent hover:text-white">
            مسح التصفية
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {themes.map((theme) => {
              const isInstalled = currentThemeId === theme._id
              const isPremium = theme.type === 'premium'
              const CatIcon = CATEGORY_ICONS[theme.category] || Palette
              const catColor = CATEGORY_COLORS[theme.category] || 'from-gray-500 to-gray-600'
              return (
                <div
                  key={theme._id}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className={`aspect-[16/10] bg-gradient-to-br ${catColor} flex items-center justify-center relative overflow-hidden`}>
                    {theme.thumbnail ? (
                      <img src={theme.thumbnail} alt={theme.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-white/70">
                        <CatIcon size={48} className="opacity-50" />
                        <span className="font-cairo text-xs opacity-60">{CATEGORY_LABELS[theme.category] || theme.category}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                      <div className="w-full flex gap-2">
                        <button
                          onClick={() => navigate(`/dashboard/themes/${theme._id}/customize`)}
                          className="flex-1 rounded-xl bg-white/95 px-3 py-2.5 font-cairo text-xs font-bold text-text backdrop-blur-sm transition-all hover:bg-white shadow-sm"
                        >
                          <Eye size={14} className="inline ml-1" />
                          معاينة وتخصيص
                        </button>
                        {theme.preview && (
                          <a href={theme.preview} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white/20 px-3 py-2.5 font-cairo text-xs font-bold text-white backdrop-blur-sm transition-all hover:bg-white/30" title="معاينة حية">
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                    {isPremium && (
                      <div className="absolute left-3 top-3 rounded-full bg-gradient-to-l from-amber-500 to-amber-600 px-3 py-1 font-cairo text-[11px] font-bold text-white shadow-lg">
                        <Sparkles size={11} className="inline ml-1" />
                        مدفوع
                      </div>
                    )}
                    {isInstalled && (
                      <div className="absolute right-3 top-3 rounded-full bg-gradient-to-l from-emerald-500 to-emerald-600 px-3 py-1 font-cairo text-[11px] font-bold text-white shadow-lg">
                        <Check size={11} className="inline ml-1" />
                        مثبت
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-cairo text-base font-bold text-text">{theme.name}</h3>
                      <span className="flex items-center gap-1 rounded-lg bg-bg-soft px-2 py-0.5 font-cairo text-[10px] text-text-muted">
                        <CatIcon size={10} />
                        {CATEGORY_LABELS[theme.category] || theme.category}
                      </span>
                    </div>
                    <p className="mb-3 line-clamp-2 font-cairo text-sm text-text-muted leading-relaxed">{theme.description}</p>
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {theme.features?.slice(0, 3).map((feat, i) => (
                        <span key={i} className="rounded-md bg-bg-soft px-2 py-0.5 font-cairo text-[11px] text-text-muted">
                          <Check size={9} className="inline ml-0.5 text-emerald-500" />
                          {feat}
                        </span>
                      ))}
                      {theme.features?.length > 3 && (
                        <span className="rounded-md bg-bg-soft px-2 py-0.5 font-cairo text-[11px] text-text-subtle">
                          +{theme.features.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <span className="font-cairo text-base font-bold text-text">
                        {isPremium ? (
                          <span className="flex items-center gap-1">
                            <ShoppingBag size={14} className="text-amber-500" />
                            ${theme.price}
                          </span>
                        ) : (
                          <span className="text-emerald-600">مجاني</span>
                        )}
                      </span>
                      {isInstalled ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => navigate(`/dashboard/themes/${theme._id}/customize`)}
                            className="rounded-lg bg-accent/10 px-3.5 py-2 font-cairo text-xs font-bold text-accent transition-all hover:bg-accent hover:text-white"
                          >
                            تخصيص
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => installMutation.mutate(theme._id)}
                          disabled={installMutation.isPending}
                          className="rounded-lg bg-gradient-to-l from-accent to-accent-600 px-4 py-2 font-cairo text-xs font-bold text-white shadow-sm shadow-accent/20 transition-all hover:shadow-md hover:shadow-accent/30 disabled:opacity-50 active:scale-[0.97]"
                        >
                          {installMutation.isPending ? '...جاري' : (
                            <span className="flex items-center gap-1">
                              <ShoppingBag size={13} />
                              تثبيت
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="flex items-center gap-1 rounded-xl border border-border/60 px-4 py-2.5 font-cairo text-sm font-semibold text-text-muted transition-all hover:border-accent/30 hover:text-text disabled:opacity-30"
              >
                <ChevronDown size={16} className="rotate-90" />
                السابق
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                  const start = Math.max(0, pagination.page - 4)
                  const p = start + i + 1
                  if (p > pagination.pages) return null
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-9 w-9 rounded-lg font-cairo text-sm font-bold transition-all ${
                        pagination.page === p ? 'bg-accent text-white shadow-sm shadow-accent/20' : 'bg-bg-soft text-text-muted hover:bg-border'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={pagination.page >= pagination.pages}
                className="flex items-center gap-1 rounded-xl border border-border/60 px-4 py-2.5 font-cairo text-sm font-semibold text-text-muted transition-all hover:border-accent/30 hover:text-text disabled:opacity-30"
              >
                التالي
                <ChevronDown size={16} className="-rotate-90" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
