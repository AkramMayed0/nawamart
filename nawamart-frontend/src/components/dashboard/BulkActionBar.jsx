import { useState } from 'react'
import { Archive, Trash2, DollarSign, Package, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { bulkArchive, bulkDelete, bulkUpdatePrice, bulkUpdateStock } from '@/api/bulk'

const ACTIONS = [
  { key: 'archive', icon: Archive, label: 'أرشفة', color: 'text-warning hover:bg-warning-100 border-warning/30' },
  { key: 'delete', icon: Trash2, label: 'حذف', color: 'text-danger hover:bg-danger-100 border-danger/30' },
  { key: 'price', icon: DollarSign, label: 'تحديث السعر', color: 'text-info hover:bg-info-100 border-info/30' },
  { key: 'stock', icon: Package, label: 'تحديث المخزون', color: 'text-accent-700 hover:bg-accent-50 border-accent/30' },
]

export default function BulkActionBar({ selectedIds, storeId, onComplete }) {
  const [action, setAction] = useState(null)
  const [operation, setOperation] = useState('set')
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  if (selectedIds.length === 0) return null

  async function execute() {
    setLoading(true)
    try {
      let res
      const payload = { ids: selectedIds, storeId }
      if (action === 'archive') res = await bulkArchive(payload)
      else if (action === 'delete') res = await bulkDelete(payload)
      else if (action === 'price') res = await bulkUpdatePrice({ ...payload, operation, value: Number(value) })
      else if (action === 'stock') res = await bulkUpdateStock({ ...payload, operation, value: Number(value) })
      toast.success(res.data.message)
      setAction(null)
      setValue('')
      onComplete?.()
    } catch (err) {
      toast.error(err?.message || 'حدث خطأ')
    }
    setLoading(false)
  }

  if (action && ['price', 'stock'].includes(action)) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-surface border-2 border-primary rounded-2xl shadow-lg">
        <span className="font-cairo text-sm font-bold text-text shrink-0">
          {action === 'price' ? 'تحديث السعر' : 'تحديث المخزون'} ({selectedIds.length})
        </span>
        <select value={operation} onChange={e => setOperation(e.target.value)}
          className="h-10 rounded-lg border border-border bg-surface px-3 font-cairo text-sm outline-none focus:border-primary">
          <option value="set">تعيين</option>
          <option value="increase">زيادة</option>
          <option value="decrease">تخفيض</option>
        </select>
        <div className="w-24">
          <Input type="number" min="0" value={value} onChange={e => setValue(e.target.value)} placeholder="القيمة" />
        </div>
        <Button size="sm" variant="primary" onClick={execute} loading={loading}>تطبيق</Button>
        <button onClick={() => { setAction(null); setValue('') }} className="text-text-muted hover:text-text">
          <X size={18} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border-2 border-accent/20 rounded-2xl shadow-sm">
      <span className="font-cairo text-xs font-bold text-text-muted ml-2">{selectedIds.length} منتج</span>
      <div className="h-5 w-px bg-border" />
      {ACTIONS.map(a => (
        <button
          key={a.key}
          onClick={() => {
            if (a.key === 'archive') execute(a.key)
            else if (a.key === 'delete') { if (confirm(`حذف ${selectedIds.length} منتج؟`)) execute(a.key) }
            else setAction(a.key)
          }}
          disabled={loading}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-cairo text-xs font-bold transition-all ${a.color}`}
        >
          <a.icon size={14} />
          {a.label}
        </button>
      ))}
      <div className="flex-1" />
      <button onClick={() => onComplete?.([])} className="text-text-muted hover:text-text p-1">
        <X size={16} />
      </button>
    </div>
  )
}
