import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getChangelog } from '@/api/changelog'
import usePageTitle from '@/hooks/usePageTitle'
import { ArrowLeft, Tag, Clock, AlertTriangle, Sparkles, Bug, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

const TYPE_CONFIG = {
  new_feature: { label: 'ميزة جديدة', color: 'bg-success-100 text-success', icon: Sparkles },
  improvement: { label: 'تحسين', color: 'bg-info-100 text-info', icon: RefreshCw },
  bugfix:      { label: 'إصلاح خلل', color: 'bg-warning-100 text-warning', icon: Bug },
  deprecation: { label: 'إيقاف تدريجي', color: 'bg-danger-100 text-danger', icon: AlertTriangle },
  breaking:    { label: 'تغيير جذري', color: 'bg-danger-100 text-danger', icon: AlertTriangle },
}

export default function ChangelogPage() {
  usePageTitle('سجل التحديثات')
  const [filter, setFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['changelog', filter],
    queryFn: () => getChangelog(filter ? { type: filter } : {}).then(r => r.data),
  })

  const entries = data?.data ?? []

  return (
    <div className="min-h-screen bg-bg font-cairo" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text mb-6 transition-colors">
          <ArrowLeft size={16} /> العودة للرئيسية
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <RefreshCw size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="font-cairo font-extrabold text-2xl text-text">سجل التحديثات</h1>
            <p className="font-cairo text-sm text-text-muted">آخر التحديثات والميزات الجديدة في نوامارت</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-8 mt-6 flex-wrap">
          <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!filter ? 'bg-primary text-white' : 'bg-surface border border-border text-text-muted hover:bg-bg'}`}>الكل</button>
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => setFilter(key)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === key ? `${cfg.color} border-0` : 'bg-surface border border-border text-text-muted hover:bg-bg'}`}>{cfg.label}</button>
          ))}
        </div>

        {isLoading && <div className="text-center py-12 text-text-muted text-sm">جاري التحميل...</div>}

        {!isLoading && entries.length === 0 && (
          <div className="text-center py-12">
            <RefreshCw size={40} className="mx-auto text-border-strong mb-3" />
            <p className="font-cairo text-text-muted">لا توجد تحديثات بعد</p>
          </div>
        )}

        <div className="space-y-4">
          {entries.map((entry) => {
            const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.improvement
            const Icon = cfg.icon
            return (
              <div key={entry._id} className="bg-surface rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl ${cfg.color} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${cfg.color}`}>{cfg.label}</span>
                      {entry.version && <span className="text-[10px] font-bold font-mono bg-bg-soft text-text-muted px-2 py-0.5 rounded-md">{entry.version}</span>}
                    </div>
                    <h3 className="font-cairo font-bold text-base text-text mb-1">{entry.title}</h3>
                    {entry.description && <p className="font-cairo text-sm text-text-muted leading-7 whitespace-pre-line">{entry.description}</p>}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="flex items-center gap-1 text-[11px] text-text-subtle"><Clock size={12} />{new Date(entry.publishedAt).toLocaleDateString('ar-YE')}</span>
                      {entry.featureKey && <span className="flex items-center gap-1 text-[11px] text-text-subtle"><Tag size={12} />{entry.featureKey}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
