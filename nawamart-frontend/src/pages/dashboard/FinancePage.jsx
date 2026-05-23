import { Banknote } from 'lucide-react'

export default function FinancePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-cairo font-extrabold text-2xl text-text">المالية</h1>
        <p className="font-cairo text-sm text-text-muted mt-0.5">تقارير المبيعات والإيرادات.</p>
      </div>

      {/* Empty / Coming-soon state */}
      <div className="bg-white border border-border rounded-2xl flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-success-100 flex items-center justify-center mb-4">
          <Banknote size={28} className="text-success" />
        </div>
        <h3 className="font-cairo font-bold text-text text-lg mb-1">قريباً</h3>
        <p className="font-cairo text-sm text-text-muted max-w-xs leading-relaxed">
          ستجد هنا تقارير مفصّلة عن مبيعاتك، إيراداتك، وإحصائيات أداء متجرك.
        </p>
      </div>

    </div>
  )
}
