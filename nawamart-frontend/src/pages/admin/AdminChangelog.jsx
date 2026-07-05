import { useQuery } from '@tanstack/react-query'
import usePageTitle from '@/hooks/usePageTitle'
import { Megaphone, Sparkles, Bug, RefreshCw, AlertTriangle, Check, X } from 'lucide-react'

const TYPE_CONFIG = {
  new_feature: { label: 'ميزة جديدة', color: 'bg-success-100 text-success', icon: Sparkles },
  improvement: { label: 'تحسين', color: 'bg-info-100 text-info', icon: RefreshCw },
  bugfix:      { label: 'إصلاح خلل', color: 'bg-warning-100 text-warning', icon: Bug },
  deprecation: { label: 'إيقاف تدريجي', color: 'bg-danger-100 text-danger', icon: AlertTriangle },
  breaking:    { label: 'تغيير جذري', color: 'bg-danger-100 text-danger', icon: AlertTriangle },
}

export default function AdminChangelog() {
  usePageTitle('سجل التحديثات')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-changelog'],
    queryFn: () => import('@/api/admin').then(m => m.getChangelogEntries?.()).then(r => r?.data || { data: [] }),
  })

  const entries = data?.data ?? []

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-info-100 flex items-center justify-center">
          <Megaphone size={20} className="text-info" />
        </div>
        <div>
          <h1 className="font-cairo font-extrabold text-xl text-text">سجل التحديثات</h1>
          <p className="font-cairo text-sm text-text-muted">إدارة تحديثات المنصة وإصداراتها</p>
        </div>
      </div>

      {isLoading && <div className="text-center py-12 text-text-muted">جاري التحميل...</div>}

      {!isLoading && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-bg/60">
                <th className="text-right font-cairo text-xs font-bold text-text-muted px-4 py-3">العنوان</th>
                <th className="text-right font-cairo text-xs font-bold text-text-muted px-4 py-3">النوع</th>
                <th className="text-right font-cairo text-xs font-bold text-text-muted px-4 py-3">الإصدار</th>
                <th className="text-center font-cairo text-xs font-bold text-text-muted px-4 py-3">منشور</th>
                <th className="text-center font-cairo text-xs font-bold text-text-muted px-4 py-3">تاريخ النشر</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.improvement
                return (
                  <tr key={entry._id} className="border-b border-border last:border-0 hover:bg-bg/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-cairo font-semibold text-sm text-text">{entry.title}</p>
                      {entry.description && <p className="font-cairo text-xs text-text-muted mt-0.5 line-clamp-1">{entry.description}</p>}
                    </td>
                    <td className="px-4 py-3"><span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${cfg.color}`}>{cfg.label}</span></td>
                    <td className="px-4 py-3"><code className="text-xs font-mono bg-bg-soft px-2 py-0.5 rounded">{entry.version || '—'}</code></td>
                    <td className="px-4 py-3 text-center">{entry.isPublished ? <Check size={16} className="inline text-success" /> : <X size={16} className="inline text-danger" />}</td>
                    <td className="px-4 py-3 text-center text-sm text-text-muted">{entry.publishedAt ? new Date(entry.publishedAt).toLocaleDateString('ar-YE') : '—'}</td>
                  </tr>
                )
              })}
              {entries.length === 0 && (
                <tr><td colSpan="5" className="text-center py-12 text-text-muted font-cairo">لا توجد تحديثات بعد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
