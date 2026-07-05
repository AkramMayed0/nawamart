import { Package, ShoppingBag, Search, Inbox, FileText } from 'lucide-react'
import clsx from 'clsx'

const icons = {
  package: Package,
  shopping: ShoppingBag,
  search: Search,
  inbox: Inbox,
  file: FileText,
}

export default function EmptyState({
  icon = 'inbox',
  title = 'لا توجد بيانات',
  description = 'لم يتم العثور على أي عناصر بعد.',
  action,
  className = '',
}) {
  const Icon = icons[icon] || Inbox

  return (
    <div className={clsx(
      'flex flex-col items-center justify-center py-16 px-6 text-center',
      className,
    )}>
      <div className="w-16 h-16 rounded-2xl bg-bg-soft flex items-center justify-center mb-5">
        <Icon size={28} className="text-text-subtle" />
      </div>
      <h3 className="font-cairo font-extrabold text-base text-text mb-1.5">{title}</h3>
      <p className="font-cairo text-sm text-text-muted max-w-xs mb-5">{description}</p>
      {action}
    </div>
  )
}
