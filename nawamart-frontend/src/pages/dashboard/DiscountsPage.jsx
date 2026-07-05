import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { listDiscounts, createDiscount, updateDiscount, deleteDiscount } from '@/api/discounts'
import usePageTitle from '@/hooks/usePageTitle'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Icon from '@/components/ui/Icon'
import { Tag, Plus, Trash2, Percent, Coins, Calendar, Power } from 'lucide-react'

const DISCOUNT_TYPES = [
  { value: 'percentage', label: 'نسبة %' },
  { value: 'fixed', label: 'قيمة ثابتة' },
]

function DiscountRow({ discount, onEdit, onDelete }) {
  const isExpired = discount.expiresAt && new Date(discount.expiresAt) < new Date()
  const isExhausted = discount.usageLimit && discount.usedCount >= discount.usageLimit
  const status = !discount.isActive ? 'معطل' : isExpired ? 'منتهي' : isExhausted ? 'مستنفذ' : 'نشط'
  const statusColor = !discount.isActive || isExpired ? 'bg-danger-100 text-danger' : isExhausted ? 'bg-warning-100 text-warning' : 'bg-success-100 text-success-dark'

  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-accent-50/30 transition-all">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center shrink-0">
          <Tag size={18} className="text-accent-700" />
        </div>
        <div>
          <p className="font-inter font-bold text-sm text-accent-700">{discount.code}</p>
          <p className="font-cairo text-xs text-text-muted">
            {discount.type === 'percentage' ? `${discount.value}%` : `${discount.value.toLocaleString('ar-YE')} ريال`}
            {discount.minOrderAmount > 0 && ` · الحد الأدنى ${discount.minOrderAmount.toLocaleString('ar-YE')} ريال`}
          </p>
        </div>
      </div>
      <div className="text-center shrink-0">
        <p className="font-cairo text-xs font-bold text-text">{discount.usedCount}</p>
        <p className="font-cairo text-[10px] text-text-muted">{discount.usageLimit ? `/ ${discount.usageLimit}` : 'غير محدود'}</p>
      </div>
      <span className={`font-cairo text-xs font-bold px-2.5 py-1 rounded-xl ${statusColor}`}>{status}</span>
      {discount.expiresAt && (
        <p className="font-cairo text-[11px] text-text-muted shrink-0">
          {new Date(discount.expiresAt).toLocaleDateString('ar-YE')}
        </p>
      )}
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => onEdit(discount)} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-primary-50 hover:text-primary transition-all">
          <Icon name="edit" size={15} />
        </button>
        <button onClick={() => onDelete(discount)} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-danger-100 hover:text-danger transition-all">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

export default function DiscountsPage() {
  usePageTitle('أكواد الخصم')
  const storeRaw = useAuthStore(s => s.store)
  const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw
  const queryClient = useQueryClient()

  const { data: discounts = [], isLoading } = useQuery({
    queryKey: ['discounts', store?._id],
    queryFn: () => listDiscounts(store._id).then(r => r.data.data),
    enabled: !!store?._id,
  })

  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', minOrderAmount: '', maxDiscount: '', usageLimit: '', perUserLimit: '1', appliesTo: 'all', startsAt: '', expiresAt: '' })

  function resetForm() {
    setForm({ code: '', type: 'percentage', value: '', minOrderAmount: '', maxDiscount: '', usageLimit: '', perUserLimit: '1', appliesTo: 'all', startsAt: '', expiresAt: '' })
    setEditTarget(null)
    setShowForm(false)
  }

  function openEdit(d) {
    setEditTarget(d)
    setForm({
      code: d.code, type: d.type, value: String(d.value),
      minOrderAmount: String(d.minOrderAmount || ''),
      maxDiscount: String(d.maxDiscount || ''),
      usageLimit: String(d.usageLimit || ''),
      perUserLimit: String(d.perUserLimit || '1'),
      appliesTo: d.appliesTo,
      startsAt: d.startsAt ? new Date(d.startsAt).toISOString().slice(0, 16) : '',
      expiresAt: d.expiresAt ? new Date(d.expiresAt).toISOString().slice(0, 16) : '',
    })
    setShowForm(true)
  }

  const { mutate: doCreate, isPending: creating } = useMutation({
    mutationFn: () => createDiscount(store._id, form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['discounts', store._id] }); toast.success('تم إنشاء الكود'); resetForm() },
    onError: (err) => toast.error(err?.message || 'خطأ'),
  })

  const { mutate: doUpdate, isPending: updating } = useMutation({
    mutationFn: () => updateDiscount(editTarget._id, form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['discounts', store._id] }); toast.success('تم التحديث'); resetForm() },
    onError: (err) => toast.error(err?.message || 'خطأ'),
  })

  const { mutate: doDelete } = useMutation({
    mutationFn: () => deleteDiscount(editTarget._id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['discounts', store._id] }); toast.success('تم الحذف'); setEditTarget(null) },
    onError: (err) => toast.error(err?.message || 'خطأ'),
  })

  function handleSubmit(e) {
    e.preventDefault()
    if (editTarget) doUpdate()
    else doCreate()
  }

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  if (!store) return null

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent-50 to-accent-100 flex items-center justify-center shadow-sm">
            <Tag size={20} className="text-accent-700" />
          </div>
          <div>
            <h1 className="font-cairo font-extrabold text-2xl text-text">أكواد الخصم</h1>
            <p className="font-cairo text-sm text-text-muted">أنشئ وأدر أكواد الخصم والتخفيضات.</p>
          </div>
        </div>
        <Button variant="accent" size="md" onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus size={16} />
          إضافة كود
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="font-cairo font-bold text-base text-text mb-4">{editTarget ? 'تعديل الكود' : 'كود خصم جديد'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="الكود" placeholder="SAVE20" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} required />
            <div className="flex flex-col gap-1.5">
              <label className="font-cairo text-sm font-semibold text-text">النوع</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className="h-10 rounded-lg border border-border bg-white px-3 font-cairo text-sm outline-none focus:border-primary">
                {DISCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <Input label={form.type === 'percentage' ? 'النسبة %' : 'القيمة (ريال)'} type="number" min="0" placeholder="10" value={form.value} onChange={e => set('value', e.target.value)} required />
            <Input label="الحد الأدنى للطلب" type="number" min="0" placeholder="0" value={form.minOrderAmount} onChange={e => set('minOrderAmount', e.target.value)} />
            {form.type === 'percentage' && <Input label="الحد الأقصى للخصم" type="number" min="0" placeholder="5000" value={form.maxDiscount} onChange={e => set('maxDiscount', e.target.value)} />}
            <Input label="حد الاستخدام الكلي" type="number" min="1" placeholder="غير محدود" value={form.usageLimit} onChange={e => set('usageLimit', e.target.value)} />
            <Input label="حد الاستخدام لكل عميل" type="number" min="1" placeholder="1" value={form.perUserLimit} onChange={e => set('perUserLimit', e.target.value)} />
            <Input label="تاريخ البدء" type="datetime-local" value={form.startsAt} onChange={e => set('startsAt', e.target.value)} />
            <Input label="تاريخ الانتهاء" type="datetime-local" value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} />
          </div>
          <div className="flex gap-3 mt-4">
            <Button type="submit" variant="primary" loading={creating || updating}>{editTarget ? 'تحديث' : 'إنشاء'}</Button>
            <Button type="button" variant="ghost" onClick={resetForm}>إلغاء</Button>
          </div>
        </form>
      )}

      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        {isLoading && <div className="p-8 text-center font-cairo text-text-muted">جاري التحميل...</div>}
        {!isLoading && discounts.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-bg-soft mx-auto mb-4 flex items-center justify-center"><Tag size={28} className="text-text-subtle" /></div>
            <h3 className="font-cairo font-bold text-text mb-1">لا توجد أكواد خصم</h3>
            <p className="font-cairo text-sm text-text-muted">أنشئ أول كود خصم لزيادة المبيعات.</p>
          </div>
        )}
        {discounts.map(d => <DiscountRow key={d._id} discount={d} onEdit={openEdit} onDelete={d => { setEditTarget(d); if (confirm('حذف كود الخصم؟')) doDelete() }} />)}
      </div>
    </div>
  )
}
