import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { listApiKeys, createApiKey, updateApiKey, deleteApiKey, rotateApiKey, getApiKeyScopes } from '@/api/apiKeys'
import usePageTitle from '@/hooks/usePageTitle'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Key, Plus, Trash2, RefreshCw, Copy, Eye, EyeOff, Check } from 'lucide-react'

function ApiKeyRow({ apiKey: k, onDelete, onRotate, onToggle }) {
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    if (!k.fullKey) return
    navigator.clipboard.writeText(k.fullKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-accent-50/30 transition-all">
      <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center shrink-0">
        <Key size={18} className="text-accent-700" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-inter font-bold text-sm text-accent-700">{k.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <code className="font-mono text-xs bg-bg-soft px-2 py-0.5 rounded-lg text-text-muted">
            {showKey && k.fullKey ? k.fullKey : `${k.prefix}...`}
          </code>
          {k.fullKey && (
            <button onClick={() => setShowKey(!showKey)} className="text-text-muted hover:text-text">
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}
          {k.fullKey && (
            <button onClick={handleCopy} className="text-text-muted hover:text-primary">
              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            </button>
          )}
        </div>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {k.scopes?.map((s) => (
            <span key={s} className="font-cairo text-[10px] bg-primary-5 text-primary px-2 py-0.5 rounded-full font-semibold">
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="text-center shrink-0">
        <p className="font-cairo text-[11px] text-text-muted">
          {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString('ar-YE') : 'لم يستخدم'}
        </p>
        <p className="font-cairo text-[10px] text-text-subtle">آخر استخدام</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onRotate(k)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-primary-50 hover:text-primary transition-all"
          title="تحديث المفتاح"
        >
          <RefreshCw size={15} />
        </button>
        <button
          onClick={() => onDelete(k)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-danger-100 hover:text-danger transition-all"
          title="حذف"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

const SCOPE_LABELS = {
  'products:read': 'قراءة المنتجات',
  'products:write': 'كتابة المنتجات',
  'orders:read': 'قراءة الطلبات',
  'orders:write': 'كتابة الطلبات',
  'customers:read': 'قراءة العملاء',
  'customers:write': 'كتابة العملاء',
  'store:read': 'قراءة المتجر',
  'store:write': 'كتابة المتجر',
  'webhooks:manage': 'إدارة webhooks',
  'analytics:read': 'قراءة التحليلات',
}

export default function ApiKeysPage() {
  usePageTitle('مفاتيح API')
  const storeRaw = useAuthStore(s => s.store)
  const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw
  const queryClient = useQueryClient()

  const { data: keys = [], isLoading } = useQuery({
    queryKey: ['apiKeys', store?._id],
    queryFn: () => listApiKeys(store._id).then(r => r.data.data),
    enabled: !!store?._id,
  })

  const { data: scopeData } = useQuery({
    queryKey: ['apiKeyScopes'],
    queryFn: () => getApiKeyScopes().then(r => r.data.data),
  })

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', scopes: [], expiresAt: '' })
  const [newKey, setNewKey] = useState(null)

  function resetForm() {
    setForm({ name: '', scopes: [], expiresAt: '' })
    setShowForm(false)
    setNewKey(null)
  }

  function toggleScope(scope) {
    setForm(f => ({
      ...f,
      scopes: f.scopes.includes(scope)
        ? f.scopes.filter(s => s !== scope)
        : [...f.scopes, scope],
    }))
  }

  const { mutate: doCreate, isPending: creating } = useMutation({
    mutationFn: () => createApiKey(store._id, form),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys', store._id] })
      setNewKey(res.data.data)
      toast.success('تم إنشاء المفتاح')
    },
    onError: (err) => toast.error(err?.message || 'خطأ'),
  })

  const { mutate: doDelete } = useMutation({
    mutationFn: () => deleteApiKey(target._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys', store._id] })
      toast.success('تم الحذف')
      setTarget(null)
    },
    onError: (err) => toast.error(err?.message || 'خطأ'),
  })

  const { mutate: doRotate } = useMutation({
    mutationFn: () => rotateApiKey(target._id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys', store._id] })
      setNewKey(res.data.data)
      toast.success('تم تحديث المفتاح')
      setTarget(null)
    },
    onError: (err) => toast.error(err?.message || 'خطأ'),
  })

  const [target, setTarget] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || form.scopes.length === 0) {
      toast.error('الاسم والصلاحيات مطلوبة')
      return
    }
    doCreate()
  }

  if (!store) return null

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent-50 to-accent-100 flex items-center justify-center shadow-sm">
            <Key size={20} className="text-accent-700" />
          </div>
          <div>
            <h1 className="font-cairo font-extrabold text-2xl text-text">مفاتيح API</h1>
            <p className="font-cairo text-sm text-text-muted">أنشئ وأدر مفاتيح API للتكامل مع التطبيقات الخارجية.</p>
          </div>
        </div>
        <Button variant="accent" size="md" onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus size={16} />
          مفتاح جديد
        </Button>
      </div>

      {newKey && (
        <div className="bg-success-50 border border-success rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="font-cairo font-bold text-base text-success-dark mb-2">تم إنشاء المفتاح</h3>
          <p className="font-cairo text-sm text-text-muted mb-3">انسخ المفتاح الآن — لن تتمكن من رؤيته مرة أخرى.</p>
          <div className="flex items-center gap-2 bg-white rounded-xl border border-success p-3">
            <code className="font-mono text-sm text-text flex-1 break-all" dir="ltr">{newKey.key}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(newKey.key)
                toast.success('تم النسخ')
              }}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary text-white hover:bg-primary-700 transition-all"
            >
              <Copy size={16} />
            </button>
          </div>
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => setNewKey(null)}>حسناً</Button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="font-cairo font-bold text-base text-text mb-4">مفتاح API جديد</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input label="الاسم" placeholder="مفتاح التطبيق" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <Input label="تاريخ الانتهاء (اختياري)" type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
          </div>
          <label className="font-cairo text-sm font-semibold text-text block mb-2">الصلاحيات</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
            {(scopeData || Object.entries(SCOPE_LABELS).map(([k, v]) => ({ key: k, label: v }))).map((s) => {
              const scopeKey = s.key || s
              const scopeLabel = s.label || SCOPE_LABELS[s] || s
              return (
                <label key={scopeKey} className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${form.scopes.includes(scopeKey) ? 'bg-primary-5 border-primary text-primary' : 'border-border text-text-muted hover:border-primary/30'}`}>
                  <input type="checkbox" checked={form.scopes.includes(scopeKey)} onChange={() => toggleScope(scopeKey)} className="sr-only" />
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${form.scopes.includes(scopeKey) ? 'bg-primary border-primary' : 'border-border'}`}>
                    {form.scopes.includes(scopeKey) && <Check size={10} className="text-white" />}
                  </div>
                  <span className="font-cairo text-xs font-semibold">{scopeLabel}</span>
                </label>
              )
            })}
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="primary" loading={creating}>إنشاء</Button>
            <Button type="button" variant="ghost" onClick={resetForm}>إلغاء</Button>
          </div>
        </form>
      )}

      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        {isLoading && <div className="p-8 text-center font-cairo text-text-muted">جاري التحميل...</div>}
        {!isLoading && keys.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-bg-soft mx-auto mb-4 flex items-center justify-center">
              <Key size={28} className="text-text-subtle" />
            </div>
            <h3 className="font-cairo font-bold text-text mb-1">لا توجد مفاتيح API</h3>
            <p className="font-cairo text-sm text-text-muted">أنشئ أول مفتاح API لبدء التكامل.</p>
          </div>
        )}
        {keys.map(k => (
          <ApiKeyRow
            key={k._id}
            apiKey={k}
            onDelete={(k) => { setTarget(k); if (confirm('حذف مفتاح API؟')) doDelete() }}
            onRotate={(k) => { setTarget(k); if (confirm('تحديث مفتاح API؟')) doRotate() }}
            onToggle={() => {}}
          />
        ))}
      </div>
    </div>
  )
}
