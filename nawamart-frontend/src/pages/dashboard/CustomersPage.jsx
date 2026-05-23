import { Users } from 'lucide-react'

export default function CustomersPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-cairo font-extrabold text-2xl text-text">العملاء</h1>
        <p className="font-cairo text-sm text-text-muted mt-0.5">قائمة عملائك وتفاصيل طلباتهم.</p>
      </div>

      {/* Empty / Coming-soon state */}
      <div className="bg-white border border-border rounded-2xl flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Users size={28} className="text-primary" />
        </div>
        <h3 className="font-cairo font-bold text-text text-lg mb-1">قريباً</h3>
        <p className="font-cairo text-sm text-text-muted max-w-xs leading-relaxed">
          ستتمكن قريباً من عرض جميع عملائك، ومتابعة طلباتهم، والتواصل معهم مباشرةً.
        </p>
      </div>

    </div>
  )
}
