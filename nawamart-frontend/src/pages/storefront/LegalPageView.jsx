import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPublicLegalPage } from '@/api/compliance'
import usePageTitle from '@/hooks/usePageTitle'
import { FileText } from 'lucide-react'

const PAGE_LABELS = {
  privacy_policy: 'سياسة الخصوصية',
  terms_of_service: 'شروط الخدمة',
  refund_policy: 'سياسة الاسترجاع',
  shipping_policy: 'سياسة الشحن',
  cookie_policy: 'سياسة ملفات تعريف الارتباط',
  dpa: 'اتفاقية معالجة البيانات',
}

export default function LegalPageView() {
  const { slug, type } = useParams()
  const pageLabel = PAGE_LABELS[type] || type

  usePageTitle(pageLabel)

  const { data, isLoading, error } = useQuery({
    queryKey: ['legalPage', slug, type],
    queryFn: () => getPublicLegalPage(slug, type).then(r => r.data.data),
    enabled: !!slug && !!type,
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-cairo text-text-muted">جاري التحميل...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-bg-soft mb-4 flex items-center justify-center">
          <FileText size={28} className="text-text-subtle" />
        </div>
        <h1 className="font-cairo font-bold text-text text-xl mb-2">الصفحة غير موجودة</h1>
        <p className="font-cairo text-sm text-text-muted">الصفحة القانونية غير متوفرة أو لم يتم نشرها بعد.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-cairo font-extrabold text-2xl text-text mb-2">{data.title}</h1>
      <p className="font-cairo text-sm text-text-muted mb-8">
        آخر تحديث: {new Date(data.updatedAt).toLocaleDateString('ar-YE')}
        {data.effectiveDate && ` · تاريخ السريان: ${new Date(data.effectiveDate).toLocaleDateString('ar-YE')}`}
      </p>
      <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        <pre className="font-cairo text-sm text-text leading-relaxed whitespace-pre-wrap">{data.content}</pre>
      </div>
    </div>
  )
}
