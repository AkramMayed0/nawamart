import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { getDataRequests, requestDataExport, requestDataDeletion, downloadExport } from '@/api/compliance'
import usePageTitle from '@/hooks/usePageTitle'
import Button from '@/components/ui/Button'
import { Shield, Download, Trash2, FileJson, Clock, CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react'

const STATUS_MAP = {
  pending: { label: 'قيد الانتظار', icon: Clock, color: 'text-warning bg-warning-100' },
  processing: { label: 'قيد المعالجة', icon: Clock, color: 'text-info bg-info-100' },
  completed: { label: 'مكتمل', icon: CheckCircle, color: 'text-success bg-success-100' },
  rejected: { label: 'مرفوض', icon: XCircle, color: 'text-danger bg-danger-100' },
}

function RequestRow({ request, onView }) {
  const st = STATUS_MAP[request.status] || STATUS_MAP.pending
  const StatusIcon = st.icon
  const isExport = request.type === 'export'

  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-accent-50/30 transition-all">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isExport ? 'bg-primary-50' : 'bg-danger-50'}`}>
        {isExport ? <FileJson size={18} className="text-primary" /> : <Trash2 size={18} className="text-danger" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-cairo font-bold text-sm text-text">
          {isExport ? 'تصدير البيانات' : 'حذف البيانات'}
        </p>
        <p className="font-cairo text-xs text-text-muted">
          {new Date(request.createdAt).toLocaleString('ar-YE')}
          {request.reason && ` — ${request.reason}`}
        </p>
      </div>
      <span className={`font-cairo text-xs font-bold px-2.5 py-1 rounded-xl inline-flex items-center gap-1.5 ${st.color}`}>
        <StatusIcon size={12} />
        {st.label}
      </span>
      <button onClick={() => onView(request)} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-primary-50 hover:text-primary transition-all">
        <Eye size={15} />
      </button>
    </div>
  )
}

export default function CompliancePage() {
  usePageTitle('الامتثال والخصوصية')
  const storeRaw = useAuthStore(s => s.store)
  const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw
  const queryClient = useQueryClient()

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['dataRequests'],
    queryFn: () => getDataRequests().then(r => r.data.data),
  })

  const { mutate: doExport, isPending: exporting } = useMutation({
    mutationFn: () => requestDataExport({ storeId: store?._id, reason: 'طلب تصدير من لوحة التحكم' }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['dataRequests'] })
      toast.success('تم تقديم طلب التصدير')
    },
    onError: (err) => toast.error(err?.message || 'خطأ'),
  })

  const { mutate: doDeletion, isPending: deleting } = useMutation({
    mutationFn: () => requestDataDeletion({ storeId: store?._id, reason: 'طلب حذف من لوحة التحكم' }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['dataRequests'] })
      toast.success('تم تقديم طلب حذف البيانات')
    },
    onError: (err) => toast.error(err?.message || 'خطأ'),
  })

  const [viewRequest, setViewRequest] = useState(null)

  const { data: exportData, refetch: doDownload } = useQuery({
    queryKey: ['exportDownload', viewRequest?._id],
    queryFn: () => downloadExport(viewRequest._id).then(r => r.data.data),
    enabled: false,
  })

  function handleDownload(req) {
    setViewRequest(req)
    doDownload().then((res) => {
      if (res.data) {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `export-${req._id}.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('تم تحميل البيانات')
      }
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center shadow-sm">
            <Shield size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="font-cairo font-extrabold text-2xl text-text">الامتثال والخصوصية</h1>
            <p className="font-cairo text-sm text-text-muted">إدارة خصوصية البيانات والامتثال للوائح حماية البيانات.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <FileJson size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-cairo font-bold text-base text-text">تصدير البيانات</h3>
              <p className="font-cairo text-xs text-text-muted">احصل على نسخة من جميع بياناتك</p>
            </div>
          </div>
          <p className="font-cairo text-sm text-text-muted mb-4 leading-relaxed">
            يمكنك طلب تصدير جميع بياناتك بما في ذلك المنتجات والطلبات والعملاء بصيغة JSON. سيتم إعلامك عند اكتمال التصدير.
          </p>
          <Button variant="primary" size="sm" onClick={() => doExport()} loading={exporting}>
            <Download size={16} />
            طلب تصدير البيانات
          </Button>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-danger-50 flex items-center justify-center">
              <Trash2 size={20} className="text-danger" />
            </div>
            <div>
              <h3 className="font-cairo font-bold text-base text-text">حذف البيانات</h3>
              <p className="font-cairo text-xs text-text-muted">حذف حسابك وجميع بياناتك</p>
            </div>
          </div>
          <div className="bg-danger-50 border border-danger/20 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-danger shrink-0" />
              <p className="font-cairo text-xs text-danger font-semibold">هذا الإجراء لا رجعة فيه. سيتم حذف جميع بيانات متجرك.</p>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={() => { if (confirm('هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء لا رجعة فيه.')) doDeletion() }} loading={deleting}>
            <Trash2 size={16} />
            طلب حذف البيانات
          </Button>
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-cairo font-bold text-base text-text">سجل الطلبات</h3>
        </div>
        {isLoading && <div className="p-8 text-center font-cairo text-text-muted">جاري التحميل...</div>}
        {!isLoading && requests.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-bg-soft mx-auto mb-4 flex items-center justify-center">
              <Shield size={28} className="text-text-subtle" />
            </div>
            <h3 className="font-cairo font-bold text-text mb-1">لا توجد طلبات</h3>
            <p className="font-cairo text-sm text-text-muted">لم تقم بتقديم أي طلبات بيانات بعد.</p>
          </div>
        )}
        {requests.map(r => (
          <RequestRow
            key={r._id}
            request={r}
            onView={(req) => {
              setViewRequest(req)
              if (req.status === 'completed' && req.type === 'export') {
                handleDownload(req)
              } else {
                toast('الطلب لا يزال قيد المعالجة')
              }
            }}
          />
        ))}
      </div>
    </div>
  )
}
