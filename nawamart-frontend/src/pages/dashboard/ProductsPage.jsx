import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { getMerchantProducts, createProduct, updateProduct, deleteProduct } from '@/api/products'
import usePageTitle from '@/hooks/usePageTitle'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import { ProductRowSkeleton } from '@/components/ui/Skeleton'
import ProductFormModal from '@/components/dashboard/ProductForm'
import DeleteConfirm from '@/components/dashboard/DeleteConfirm'
import BulkActionBar from '@/components/dashboard/BulkActionBar'
import { resolveAssetUrl } from '@/utils/assets'
import {
  Store, Package, Search, Download, Filter, X, Tag,
  LayoutGrid, List, Plus,
} from 'lucide-react'

const PAGE_SIZE = 20

/* ── Status helpers ── */
function getStatusInfo(product) {
  if (!product.isActive) return { label: 'مؤرشف', color: '#6B7280', bg: 'rgba(107,114,128,0.10)' }
  if (!product.unlimitedStock && product.stock === 0) return { label: 'نفد', color: '#E74C3C', bg: 'rgba(231,76,60,0.10)' }
  return { label: 'نشط', color: '#27AE60', bg: 'rgba(39,174,96,0.10)' }
}

function StatusDot({ product }) {
  const s = getStatusInfo(product)
  return (
    <span
      className="inline-flex items-center gap-1.5 font-cairo text-[11px] font-bold px-2.5 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0, display: 'inline-block' }} />
      {s.label}
    </span>
  )
}

/* ── Empty state ── */
function EmptyProducts({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mb-5 opacity-40">
        <rect width="80" height="80" rx="20" fill="currentColor" className="text-bg-soft" />
        <path d="M24 28h32v4H24zM24 40h20v4H24zM24 52h14v4H24z" fill="currentColor" className="text-border-strong" />
        <circle cx="56" cy="54" r="10" stroke="currentColor" strokeWidth="2.5" className="text-accent" fill="none" />
        <path d="M60 54h-4m0 0h-4m4 0v-4m0 4v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-accent" />
      </svg>
      <h3 className="font-cairo font-bold text-xl text-text mb-2">لا توجد منتجات</h3>
      <p className="font-cairo text-sm text-text-muted mb-6 max-w-xs mx-auto leading-7">
        متجرك لا يزال فارغاً. أضف أول منتج لتنطلق في عالم البيع.
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 font-cairo text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
        style={{ background: 'linear-gradient(135deg,#C93F2B,#A62F20)', boxShadow: '0 4px 14px rgba(201,63,43,0.35)' }}
      >
        <Plus size={16} /> أضف أول منتج
      </button>
    </div>
  )
}

/* ── Skeleton grid cards ── */
function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="h-40 bg-bg-soft" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-bg-soft rounded-lg w-3/4" />
        <div className="h-3 bg-bg-soft rounded-lg w-1/2" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 bg-bg-soft rounded-full w-14" />
          <div className="h-5 bg-bg-soft rounded-full w-10" />
        </div>
      </div>
    </div>
  )
}

/* ── Product card (grid view) ── */
function ProductCard({ product, onEdit, onDelete }) {
  const hasSale = product.salePrice && product.salePrice < product.price
  const effectivePrice = hasSale ? product.salePrice : product.price

  return (
    <div
      className="group bg-surface border border-border rounded-2xl overflow-hidden shadow-sm cursor-pointer"
      style={{ transition: 'transform 150ms ease, box-shadow 150ms ease' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '' }}
    >
      {/* Image */}
      <div className="relative h-40 bg-bg-soft">
        {product.images?.[0]
          ? <img src={resolveAssetUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><Package size={32} className="text-border-strong" /></div>
        }
        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); onEdit(product) }}
            className="w-8 h-8 rounded-xl bg-white/90 flex items-center justify-center text-text hover:bg-white transition-colors"
          ><Icon name="edit" size={14} /></button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(product) }}
            className="w-8 h-8 rounded-xl bg-white/90 flex items-center justify-center text-danger hover:bg-white transition-colors"
          ><Icon name="trash" size={14} /></button>
        </div>
      </div>
      {/* Info */}
      <div className="p-3">
        <p className="font-cairo font-semibold text-sm text-text truncate mb-1">{product.name}</p>
        <p className="font-cairo font-bold text-sm text-text">
          {effectivePrice?.toLocaleString('ar-YE')}
          <span className="font-normal text-xs text-text-muted mr-1">ر.ي</span>
          {hasSale && <span className="font-normal text-xs text-text-subtle line-through mr-2">{product.price?.toLocaleString('ar-YE')}</span>}
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <StatusDot product={product} />
          {product.unlimitedStock
            ? null
            : product.stock > 0
              ? <span className="font-cairo text-[10px] text-text-muted">{product.stock} قطعة</span>
              : null
          }
        </div>
      </div>
    </div>
  )
}

/* ── Product row (list view) ── */
function ProductRow({ product, onEdit, onDelete, selected, onToggle }) {
  const hasSale = product.salePrice && product.salePrice < product.price
  const effectivePrice = hasSale ? product.salePrice : product.price
  return (
    <tr className="group hover:bg-bg-soft transition-colors">
      <td className="data-table" style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle' }}>
        <input type="checkbox" checked={selected} onChange={() => onToggle(product._id)} className="accent-primary rounded" />
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle' }}>
        <div className="w-10 h-10 rounded-xl bg-bg-soft border border-border overflow-hidden shrink-0">
          {product.images?.[0]
            ? <img src={resolveAssetUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-border-strong" /></div>
          }
        </div>
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle' }}>
        <p className="font-cairo font-semibold text-sm text-text truncate max-w-[180px]">{product.name}</p>
        {product.category && <span className="font-cairo text-[11px] text-text-muted">{product.category}</span>}
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle' }}>
        <span className="font-cairo font-bold text-sm text-text">
          {effectivePrice?.toLocaleString('ar-YE')}
          <span className="font-normal text-xs text-text-muted mr-1">ر.ي</span>
        </span>
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle' }}>
        <span className="font-cairo text-sm text-text">
          {product.unlimitedStock ? 'غير محدود' : product.stock}
        </span>
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle' }}>
        <StatusDot product={product} />
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle' }}>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(product)} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-primary-50 hover:text-primary transition-all">
            <Icon name="edit" size={14} />
          </button>
          <button onClick={() => onDelete(product)} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-danger-100 hover:text-danger transition-all">
            <Icon name="trash" size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <p className="font-cairo text-sm text-text-muted">
        عرض <span className="font-semibold text-text">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}</span> من <span className="font-semibold text-text">{total}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(page - 1)} disabled={page === 1} className="w-9 h-9 rounded-xl flex items-center justify-center border border-border text-text-muted hover:bg-bg disabled:opacity-40 transition-all">
          <Icon name="chevron" size={16} />
        </button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          let p
          if (totalPages <= 7) p = i + 1
          else if (page <= 4) p = i + 1
          else if (page >= totalPages - 3) p = totalPages - 6 + i
          else p = page - 3 + i
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-cairo text-sm font-semibold transition-all ${p === page ? 'bg-accent text-white shadow-sm' : 'border border-border text-text-muted hover:bg-bg'}`}
            >{p}</button>
          )
        })}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className="w-9 h-9 rounded-xl flex items-center justify-center border border-border text-text-muted hover:bg-bg disabled:opacity-40 transition-all">
          <Icon name="chevron" size={16} className="icon-flip" />
        </button>
      </div>
    </div>
  )
}

const STATUS_PILLS = [
  { value: '',         label: 'الكل' },
  { value: 'active',   label: 'نشط' },
  { value: 'archived', label: 'مؤرشف' },
  { value: 'out',      label: 'نفد' },
]

export default function ProductsPage() {
  usePageTitle('المنتجات')
  const storeRaw = useAuthStore(s => s.store)
  const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [page, setPage]           = useState(1)
  const [search, setSearch]       = useState('')
  const [visibility, setVisibility] = useState('')
  const [category, setCategory]   = useState('')
  const [sort, setSort]           = useState('')
  const [view, setView]           = useState('grid')
  const [selectedIds, setSelectedIds] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filters = { page, limit: PAGE_SIZE, sort, storeId: store?._id }
  if (search) filters.search = search
  if (visibility && visibility !== 'out') filters.visibility = visibility
  if (category) filters.category = category

  const { data, isLoading } = useQuery({
    queryKey: ['merchant-products', store?._id, page, search, visibility, category, sort],
    queryFn: () => getMerchantProducts(filters).then(r => r.data),
    enabled: !!store?._id,
  })

  const products = data?.data ?? []
  const pagination = data?.pagination ?? null

  /* Filter 'out' locally as stock-based */
  const displayProducts = visibility === 'out'
    ? products.filter(p => !p.unlimitedStock && p.stock === 0)
    : products

  const { mutate: doCreate, isPending: creating } = useMutation({
    mutationFn: (formData) => { formData.append('storeId', store._id); return createProduct(formData) },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['merchant-products'] }); toast.success('تم إضافة المنتج'); setModalOpen(false) },
    onError: (err) => toast.error(err?.message || 'حدث خطأ'),
  })

  const { mutate: doUpdate, isPending: updating } = useMutation({
    mutationFn: (formData) => updateProduct(editTarget._id, formData),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['merchant-products'] }); toast.success('تم تعديل المنتج'); setModalOpen(false); setEditTarget(null) },
    onError: (err) => toast.error(err?.message || 'حدث خطأ'),
  })

  const { mutate: doDelete, isPending: deleting } = useMutation({
    mutationFn: () => deleteProduct(deleteTarget._id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['merchant-products'] }); toast.success('تم حذف المنتج'); setDeleteTarget(null) },
    onError: (err) => toast.error(err?.message || 'حدث خطأ'),
  })

  function toggleSelect(id) { setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]) }
  function selectAll() { if (selectedIds.length === products.length) setSelectedIds([]); else setSelectedIds(products.map(p => p._id)) }

  function openAdd() { setEditTarget(null); setModalOpen(true) }

  if (!store) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-warning-100 flex items-center justify-center mx-auto mb-4">
          <Store size={28} className="text-warning" />
        </div>
        <h2 className="font-cairo font-bold text-xl text-text mb-2">لم يتم إنشاء المتجر بعد</h2>
        <p className="font-cairo text-sm text-text-muted mb-6">أنشئ متجرك أولاً لإضافة المنتجات.</p>
        <button onClick={() => navigate('/onboarding')} className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-700 transition-colors">
          إنشاء المتجر
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">

      {/* ── Page header ── */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(16,185,129,0.12)' }}>
            <Package size={20} style={{ color: '#10B981' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cairo font-extrabold text-2xl text-text">المنتجات</h1>
              {pagination && (
                <span className="font-cairo text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.10)', color: '#10B981' }}>
                  {pagination.total}
                </span>
              )}
            </div>
            <p className="font-cairo text-sm text-text-muted">إدارة منتجات متجرك</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open(`/api/export/products?storeId=${store._id}`, '_blank')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-text-muted hover:bg-bg font-cairo text-sm font-semibold transition-all"
          >
            <Download size={15} /> تصدير CSV
          </button>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-cairo text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#C93F2B,#A62F20)', boxShadow: '0 4px 12px rgba(201,63,43,0.30)' }}
          >
            <Plus size={16} /> إضافة منتج
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="بحث عن منتج..."
            className="w-full h-10 pr-9 pl-3 rounded-xl border border-border bg-surface font-cairo text-sm text-text outline-none focus:border-accent transition-colors"
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1) }} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status pills */}
        <div className="filter-pills">
          {STATUS_PILLS.map(pill => (
            <button
              key={pill.value}
              onClick={() => { setVisibility(pill.value); setPage(1) }}
              className={`filter-pill ${visibility === pill.value ? 'active' : ''}`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-bg-soft rounded-xl p-1 border border-border">
          <button
            onClick={() => setView('grid')}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${view === 'grid' ? 'bg-surface shadow-sm text-text' : 'text-text-muted hover:text-text'}`}
          ><LayoutGrid size={15} /></button>
          <button
            onClick={() => setView('list')}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${view === 'list' ? 'bg-surface shadow-sm text-text' : 'text-text-muted hover:text-text'}`}
          ><List size={15} /></button>
        </div>
      </div>

      <BulkActionBar selectedIds={selectedIds} storeId={store._id} onComplete={() => { setSelectedIds([]); queryClient.invalidateQueries({ queryKey: ['merchant-products'] }) }} />

      {/* ── Content ── */}
      {view === 'grid' ? (
        /* Grid view */
        isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            <EmptyProducts onAdd={openAdd} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {displayProducts.map(p => (
                <ProductCard key={p._id} product={p} onEdit={setEditTarget} onDelete={setDeleteTarget} />
              ))}
            </div>
            {pagination && <div className="mt-4 bg-surface border border-border rounded-2xl overflow-hidden"><Pagination page={page} total={pagination.total} pageSize={PAGE_SIZE} onChange={setPage} /></div>}
          </>
        )
      ) : (
        /* List / table view */
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          {displayProducts.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 bg-bg/60 border-b border-border">
              <input type="checkbox" checked={products.length > 0 && selectedIds.length === products.length} onChange={selectAll} className="accent-primary rounded" />
              <span className="font-cairo text-xs font-bold text-text-muted">
                {selectedIds.length > 0 ? `محدد ${selectedIds.length}` : 'اختيار الكل'}
              </span>
            </div>
          )}
          {isLoading && Array.from({ length: 5 }).map((_, i) => <ProductRowSkeleton key={i} />)}
          {!isLoading && displayProducts.length === 0 && <EmptyProducts onAdd={openAdd} />}
          {!isLoading && displayProducts.length > 0 && (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}></th>
                    <th style={{ width: 56 }}></th>
                    <th>المنتج</th>
                    <th>السعر</th>
                    <th>المخزون</th>
                    <th>الحالة</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {displayProducts.map(p => (
                    <ProductRow
                      key={p._id}
                      product={p}
                      onEdit={setEditTarget}
                      onDelete={setDeleteTarget}
                      selected={selectedIds.includes(p._id)}
                      onToggle={toggleSelect}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pagination && <Pagination page={page} total={pagination.total} pageSize={PAGE_SIZE} onChange={setPage} />}
        </div>
      )}

      {modalOpen && (
        <ProductFormModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditTarget(null) }}
          onSubmit={editTarget ? doUpdate : doCreate}
          initialData={editTarget}
          loading={creating || updating}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={doDelete}
          productName={deleteTarget?.name}
          loading={deleting}
        />
      )}
    </div>
  )
}
