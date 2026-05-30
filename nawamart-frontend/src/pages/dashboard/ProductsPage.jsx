import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import {
  getProductsByStore,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/api/products'
import usePageTitle from '@/hooks/usePageTitle'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import { ProductRowSkeleton } from '@/components/ui/Skeleton'
import ProductFormModal from '@/components/dashboard/ProductForm'
import DeleteConfirm from '@/components/dashboard/DeleteConfirm'
import { resolveAssetUrl } from '@/utils/assets'
import { Store, Tag, Package, Crown } from 'lucide-react'

function EmptyProducts({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-bg-soft border border-border flex items-center justify-center mb-4">
        <Package size={28} className="text-text-subtle" />
      </div>
      <h3 className="font-cairo font-bold text-text mb-1">لا توجد منتجات بعد</h3>
      <p className="font-cairo text-sm text-text-muted mb-5">أضف أول منتج لبدء البيع.</p>
      <Button variant="primary" size="md" onClick={onAdd}>
        <Icon name="plus" size={16} />
        أضف أول منتج
      </Button>
    </div>
  )
}

function ProductRow({ product, onEdit, onDelete }) {
  const hasSale = product.salePrice && product.salePrice < product.price
  const effectivePrice = hasSale ? product.salePrice : product.price

  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-bg transition-colors">
      <div className="w-12 h-12 rounded-lg bg-bg-soft border border-border overflow-hidden shrink-0">
        {product.images?.[0]
          ? <img src={resolveAssetUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><Icon name="image" size={18} className="text-border-strong" /></div>
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-cairo font-semibold text-sm text-text truncate">{product.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {product.category && (
            <span className="inline-flex items-center gap-1 font-cairo text-[11px] text-text-muted bg-bg-soft px-1.5 py-0.5 rounded">
              <Tag size={10} />
              {product.category}
            </span>
          )}
          {product.description && (
            <p className="font-cairo text-xs text-text-muted truncate">{product.description}</p>
          )}
        </div>
      </div>

      <div className="text-left shrink-0">
        <p className="dk-num font-bold text-sm text-text whitespace-nowrap">
          {effectivePrice?.toLocaleString('ar-YE')}
          <span className="font-cairo font-normal text-xs text-text-muted mr-1">ر.ي</span>
        </p>
        {hasSale && (
          <p className="dk-num text-[11px] text-text-subtle line-through">
            {product.price?.toLocaleString('ar-YE')} ر.ي
          </p>
        )}
      </div>

      <span className={`font-cairo text-xs font-semibold px-2 py-0.5 rounded-pill whitespace-nowrap ${
        product.unlimitedStock ? 'bg-info-100 text-info' :
        product.stock > 0 ? 'bg-success-100 text-success-dark' : 'bg-danger-100 text-danger'
      }`}>
        {product.unlimitedStock ? 'متوفر' : product.stock > 0 ? `${product.stock} متوفر` : 'نفد'}
      </span>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEdit(product)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-primary-50 hover:text-primary transition-colors"
        >
          <Icon name="edit" size={15} />
        </button>
        <button
          onClick={() => onDelete(product)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-danger-100 hover:text-danger transition-colors"
        >
          <Icon name="trash" size={15} />
        </button>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  usePageTitle('المنتجات')
  const storeRaw    = useAuthStore(s => s.store)
  const store       = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw
  const plan        = store?.plan || 'starter'
  const queryClient = useQueryClient()
  const navigate    = useNavigate()

  if (!store) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-warning-100 flex items-center justify-center mx-auto mb-4">
          <Store size={28} className="text-warning" />
        </div>
        <h2 className="font-cairo font-bold text-xl text-text mb-2">لم يتم إنشاء المتجر بعد</h2>
        <p className="font-cairo text-sm text-text-muted mb-6">أنشئ متجرك أولاً لإضافة المنتجات.</p>
        <button
          onClick={() => navigate('/onboarding')}
          className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-700 transition-colors"
        >
          إنشاء المتجر
        </button>
      </div>
    )
  }

  const [modalOpen,    setModalOpen]    = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', store?._id],
    queryFn: () => getProductsByStore(store._id).then(r => r.data.data),
    enabled: !!store?._id,
  })

  const { mutate: doCreate, isPending: creating } = useMutation({
    mutationFn: (formData) => {
      formData.append('storeId', store._id)
      return createProduct(formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', store._id] })
      toast.success('تم إضافة المنتج')
      setModalOpen(false)
    },
    onError: (err) => toast.error(err?.message || 'حدث خطأ أثناء الإضافة'),
  })

  const { mutate: doUpdate, isPending: updating } = useMutation({
    mutationFn: (formData) => updateProduct(editTarget._id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', store._id] })
      toast.success('تم تعديل المنتج')
      setModalOpen(false)
      setEditTarget(null)
    },
    onError: (err) => toast.error(err?.message || 'حدث خطأ أثناء التعديل'),
  })

  const { mutate: doDelete, isPending: deleting } = useMutation({
    mutationFn: () => deleteProduct(deleteTarget._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', store._id] })
      toast.success('تم حذف المنتج')
      setDeleteTarget(null)
    },
    onError: (err) => toast.error(err?.message || 'حدث خطأ أثناء الحذف'),
  })

  function openAdd()     { setEditTarget(null); setModalOpen(true) }
  function openEdit(p)   { setEditTarget(p);    setModalOpen(true) }

  const isSaving = creating || updating
  const isStarter = plan === 'starter'
  const atLimit = isStarter && products.length >= 10

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">

      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-cairo font-extrabold text-2xl text-text mb-0.5">المنتجات</h1>
          <p className="font-cairo text-sm text-text-muted">أضف وأدر منتجات متجرك.</p>
        </div>
        {atLimit ? (
          <a
            href="/subscribe?plan=pro"
            className="inline-flex items-center gap-1.5 font-cairo font-bold text-sm px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-700 active:scale-95 transition-all"
          >
            <Crown size={15} />
            ترقية لـ Pro
          </a>
        ) : (
          <Button variant="primary" size="md" onClick={openAdd}>
            <Icon name="plus" size={16} />
            إضافة منتج
          </Button>
        )}
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        {isLoading && Array.from({ length: 5 }).map((_, i) => <ProductRowSkeleton key={i} />)}
        {!isLoading && products.length === 0 && <EmptyProducts onAdd={openAdd} />}
        {!isLoading && products.map(p => (
          <ProductRow
            key={p._id}
            product={p}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
        ))}
      </div>

      <ProductFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null) }}
        onSubmit={editTarget ? doUpdate : doCreate}
        initialData={editTarget}
        loading={isSaving}
      />

      <DeleteConfirm
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        productName={deleteTarget?.name}
        loading={deleting}
      />
    </div>
  )
}