import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { getLocations, createLocation, updateLocation, deleteLocation } from '@/api/inventory'
import usePageTitle from '@/hooks/usePageTitle'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { MapPin, Plus, X, Warehouse, Building, Package } from 'lucide-react'

export default function InventoryLocationsPage() {
  usePageTitle('مواقع المخزون')
  const storeRaw = useAuthStore(s => s.store)
  const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-locations', store?._id],
    queryFn: () => getLocations({ storeId: store?._id }).then(r => r.data),
    enabled: !!store?._id,
  })

  const locations = data?.data ?? []

  const { mutate: doCreate, isPending: creating } = useMutation({
    mutationFn: (formData) => createLocation(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-locations'] })
      toast.success('تم إضافة الموقع')
      setModalOpen(false)
      setName('')
      setAddress('')
    },
    onError: (err) => toast.error(err?.message || 'حدث خطأ'),
  })

  const { mutate: doUpdate, isPending: updating } = useMutation({
    mutationFn: ({ id, data }) => updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-locations'] })
      toast.success('تم تحديث الموقع')
      setModalOpen(false)
      setEditTarget(null)
      setName('')
      setAddress('')
    },
    onError: (err) => toast.error(err?.message || 'حدث خطأ'),
  })

  const { mutate: doDelete, isPending: deleting } = useMutation({
    mutationFn: (id) => deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-locations'] })
      toast.success('تم حذف الموقع')
      setDeleteTarget(null)
    },
    onError: (err) => toast.error(err?.message || 'حدث خطأ'),
  })

  function openCreate() {
    setEditTarget(null)
    setName('')
    setAddress('')
    setModalOpen(true)
  }

  function openEdit(loc) {
    setEditTarget(loc)
    setName(loc.name)
    setAddress(loc.address || '')
    setModalOpen(true)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (editTarget) {
      doUpdate({ id: editTarget._id, data: { name, address } })
    } else {
      doCreate({ storeId: store._id, name, address })
    }
  }

  if (!store) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-warning-100 flex items-center justify-center mx-auto mb-4">
          <Building size={28} className="text-warning" />
        </div>
        <h2 className="font-cairo font-bold text-xl text-text mb-2">لم يتم إنشاء المتجر بعد</h2>
        <button onClick={() => navigate('/onboarding')} className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-700 transition-colors">إنشاء المتجر</button>
      </div>
    )
  }

  if (store?.plan === 'starter') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-warning-100 flex items-center justify-center mx-auto mb-4">
          <Warehouse size={28} className="text-warning" />
        </div>
        <h2 className="font-cairo font-bold text-xl text-text mb-2">مواقع المخزون متاحة للخطة الاحترافية</h2>
        <p className="font-cairo text-sm text-text-muted mb-6">قم بالترقية إلى الخطة الاحترافية أو خطة الأعمال لإدارة مواقع مخزون متعددة.</p>
        <Button variant="primary" onClick={() => navigate('/dashboard/subscriptions')}>الترقية الآن</Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-info-50 to-info-100 flex items-center justify-center shadow-sm">
            <MapPin size={20} className="text-info" />
          </div>
          <div>
            <h1 className="font-cairo font-extrabold text-2xl text-text mb-0.5">مواقع المخزون</h1>
            <p className="font-cairo text-sm text-text-muted">{locations.length} موقع</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/inventory')}>
            <Package size={15} /> المخزون
          </Button>
          <Button variant="accent" size="sm" onClick={openCreate}>
            <Plus size={15} /> إضافة موقع
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-border rounded-2xl p-5 animate-pulse">
            <div className="h-5 w-2/3 bg-border rounded mb-3" />
            <div className="h-4 w-1/2 bg-border rounded" />
          </div>
        ))}
        {!isLoading && locations.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-info-50 to-accent-50 border border-primary-100 flex items-center justify-center mb-5 shadow-sm">
              <MapPin size={32} className="text-primary" />
            </div>
            <h3 className="font-cairo font-bold text-xl text-text mb-2">لا توجد مواقع بعد</h3>
            <p className="font-cairo text-sm text-text-muted mb-6">أضف موقعاً لتتبع المخزون في مواقع متعددة.</p>
            <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-cairo text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700">
              <Plus size={16} /> إضافة موقع
            </button>
          </div>
        )}
        {!isLoading && locations.map(loc => (
          <div
            key={loc._id}
            className={`bg-white border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md ${loc.isActive ? 'border-border' : 'border-dashed border-border opacity-60'}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-info-50 flex items-center justify-center">
                  <Building size={18} className="text-info" />
                </div>
                <div>
                  <h3 className="font-cairo font-bold text-sm text-text">{loc.name}</h3>
                  {!loc.isActive && <span className="font-cairo text-[11px] text-text-muted">غير نشط</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(loc)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-primary-50 hover:text-primary transition-all">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={() => setDeleteTarget(loc)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-danger-100 hover:text-danger transition-all">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
            {loc.address && <p className="font-cairo text-xs text-text-muted mb-3">{loc.address}</p>}
            <div className="flex items-center gap-4 pt-3 border-t border-border">
              <div>
                <p className="font-cairo text-[11px] text-text-muted">المنتجات</p>
                <p className="dk-num font-bold text-sm text-text">{loc.itemCount || 0}</p>
              </div>
              <div>
                <p className="font-cairo text-[11px] text-text-muted">إجمالي الكمية</p>
                <p className="dk-num font-bold text-sm text-text">{loc.totalQuantity || 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null) }}
        title={editTarget ? 'تعديل الموقع' : 'إضافة موقع'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-cairo text-sm font-bold text-text mb-1.5">اسم الموقع</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={'مثال: المخزن الرئيسي، فرع صنعاء'}
              className="w-full h-11 px-4 rounded-xl border border-border bg-white font-cairo text-sm text-text outline-none focus:border-primary transition-colors"
              required
            />
          </div>
          <div>
            <label className="block font-cairo text-sm font-bold text-text mb-1.5">العنوان</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="العنوان (اختياري)"
              className="w-full h-11 px-4 rounded-xl border border-border bg-white font-cairo text-sm text-text outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => { setModalOpen(false); setEditTarget(null) }}>إلغاء</Button>
            <Button variant="accent" className="flex-1" type="submit" loading={creating || updating}>
              {editTarget ? 'تحديث' : 'إضافة'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="حذف الموقع" size="sm">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-danger-100 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-danger"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </div>
          <p className="font-cairo font-bold text-lg text-text mb-2">تأكيد الحذف</p>
          <p className="font-cairo text-sm text-text-muted mb-6">هل أنت متأكد من حذف الموقع <span className="font-bold text-text">{deleteTarget?.name}</span>؟ سيتم نقل المنتجات المرتبطة به إلى المخزون العام.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>إلغاء</Button>
            <Button variant="danger" className="flex-1" onClick={() => doDelete(deleteTarget._id)} loading={deleting}>حذف</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
