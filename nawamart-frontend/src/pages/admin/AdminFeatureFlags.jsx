import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import usePageTitle from '@/hooks/usePageTitle'
import Icon from '@/components/ui/Icon'
import { ToggleLeft, Plus, RefreshCw, AlertTriangle, FlaskConical, Check, X } from 'lucide-react'

export default function AdminFeatureFlags() {
  usePageTitle('إدارة الميزات')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-feature-flags'],
    queryFn: () => import('@/api/admin').then(m => m.getFeatureFlags?.()).then(r => r?.data || { data: [] }),
  })

  const flags = data?.data ?? []

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <ToggleLeft size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="font-cairo font-extrabold text-xl text-text">إدارة الميزات</h1>
            <p className="font-cairo text-sm text-text-muted">الميزات المتاحة على المنصة وإدارتها</p>
          </div>
        </div>
      </div>

      {isLoading && <div className="text-center py-12 text-text-muted">جاري التحميل...</div>}

      {!isLoading && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-bg/60">
                <th className="text-right font-cairo text-xs font-bold text-text-muted px-4 py-3">الميزة</th>
                <th className="text-right font-cairo text-xs font-bold text-text-muted px-4 py-3">المفتاح</th>
                <th className="text-center font-cairo text-xs font-bold text-text-muted px-4 py-3">مفعلة</th>
                <th className="text-center font-cairo text-xs font-bold text-text-muted px-4 py-3">نسبة التفعيل</th>
                <th className="text-center font-cairo text-xs font-bold text-text-muted px-4 py-3">بيتا</th>
                <th className="text-center font-cairo text-xs font-bold text-text-muted px-4 py-3">قديمة</th>
                <th className="text-center font-cairo text-xs font-bold text-text-muted px-4 py-3">الخطة المطلوبة</th>
              </tr>
            </thead>
            <tbody>
              {flags.map((f) => (
                <tr key={f._id} className="border-b border-border last:border-0 hover:bg-bg/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-cairo font-semibold text-sm text-text">{f.name}</p>
                    {f.description && <p className="font-cairo text-xs text-text-muted mt-0.5">{f.description}</p>}
                  </td>
                  <td className="px-4 py-3"><code className="text-xs font-mono bg-bg-soft px-2 py-0.5 rounded text-text-muted">{f.key}</code></td>
                  <td className="px-4 py-3 text-center">{f.enabled ? <Check size={16} className="inline text-success" /> : <X size={16} className="inline text-danger" />}</td>
                  <td className="px-4 py-3 text-center font-cairo text-sm">{f.rolloutPercentage}%</td>
                  <td className="px-4 py-3 text-center">{f.beta ? <FlaskConical size={14} className="inline text-warning" /> : '—'}</td>
                  <td className="px-4 py-3 text-center">{f.deprecated ? <span className="text-danger flex items-center justify-center gap-1"><AlertTriangle size={14} /> نعم</span> : '—'}</td>
                  <td className="px-4 py-3 text-center"><span className="text-xs font-bold bg-bg-soft px-2 py-1 rounded-md">{f.requiredPlan}</span></td>
                </tr>
              ))}
              {flags.length === 0 && (
                <tr><td colSpan="7" className="text-center py-12 text-text-muted font-cairo">لا توجد ميزات بعد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
