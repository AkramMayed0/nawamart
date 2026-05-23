import { Link } from 'react-router-dom'
import Icon from '@/components/ui/Icon'

export default function NotFound({ message = 'الصفحة غير موجودة', sub = 'تحقق من الرابط وحاول مجدداً.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center" dir="rtl">
      <div className="w-16 h-16 rounded-2xl bg-danger-100 flex items-center justify-center mb-5">
        <Icon name="x" size={28} className="text-danger" />
      </div>
      <h2 className="font-cairo font-extrabold text-xl text-text mb-2">{message}</h2>
      <p className="font-cairo text-sm text-text-muted mb-6 max-w-xs">{sub}</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 font-cairo font-semibold text-sm text-primary hover:underline"
      >
        <Icon name="home" size={15} />
        العودة للرئيسية
      </Link>
    </div>
  )
}
