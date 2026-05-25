import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Copy, ExternalLink, Eye, Package, Plus, Settings, Store, Tag } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getProductsByStore } from '@/api/products'
import { resolveAssetUrl } from '@/utils/assets'

function StatBox({ icon: Icon, label, value, tone = 'primary' }) {
  const tones = {
    primary: 'bg-primary-50 text-primary border-primary-100',
    success: 'bg-success-100 text-success-dark border-success-100',
    warning: 'bg-warning-100 text-warning border-warning-100',
    accent: 'bg-accent-50 text-accent-700 border-accent-100',
  }

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg border ${tones[tone]}`}>
        <Icon size={18} />
      </div>
      <p className="font-inter text-2xl font-extrabold leading-none text-text dk-num">{value}</p>
      <p className="mt-2 font-cairo text-sm font-semibold text-text-muted">{label}</p>
    </div>
  )
}

function MiniProduct({ product }) {
  const price = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <div className="aspect-[4/3] bg-bg-soft">
        {product.images?.[0] ? (
          <img src={resolveAssetUrl(product.images[0])} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-subtle">
            <Package size={30} />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="truncate font-cairo text-sm font-bold text-text">{product.name}</p>
        <p className="mt-1 font-inter text-sm font-extrabold text-primary">
          {(price ?? 0).toLocaleString('en-US')}
          <span className="mr-1 font-cairo text-xs font-normal text-text-muted">ر.ي</span>
        </p>
      </div>
    </div>
  )
}

export default function ShopPage() {
  const store = useAuthStore((state) => state.store)
  const shopPath = store?.slug ? `/store/${store.slug}` : ''
  const shopUrl = store?.slug ? `${window.location.origin}${shopPath}` : ''

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['public-shop-products', store?._id],
    queryFn: () => getProductsByStore(store._id).then((response) => response.data.data ?? []),
    enabled: !!store?._id && store?.isActive !== false,
    staleTime: 60_000,
  })

  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))]
  const featuredProducts = products.slice(0, 6)

  async function copyShopUrl() {
    if (!shopUrl) return

    try {
      await navigator.clipboard.writeText(shopUrl)
      toast.success('تم نسخ رابط المتجر')
    } catch {
      toast.error('تعذر نسخ الرابط')
    }
  }

  if (!store) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center" dir="rtl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-bg-soft text-text-subtle">
          <Store size={30} />
        </div>
        <h1 className="font-cairo text-2xl font-extrabold text-text">لا يوجد متجر بعد</h1>
        <p className="mx-auto mt-2 max-w-md font-cairo text-sm leading-7 text-text-muted">
          أنشئ متجرك مرة واحدة، وبعدها سيظهر رابط المتجر العام الذي ترسله لعملائك.
        </p>
        <Link
          to="/onboarding"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 font-cairo text-sm font-bold text-white transition-colors hover:bg-primary-700"
        >
          إنشاء المتجر
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8" dir="rtl">
      <div className="mb-6 rounded-lg border border-border bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-bg-soft">
              {store.logo ? (
                <img src={resolveAssetUrl(store.logo)} alt={store.name} className="h-full w-full object-cover" />
              ) : (
                <Store size={28} className="text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-cairo text-sm text-text-muted">متجرك كما يظهر للعملاء</p>
              <h1 className="truncate font-cairo text-2xl font-extrabold leading-tight text-text">{store.name}</h1>
              <p className="mt-1 break-all font-inter text-sm text-primary">{shopUrl}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copyShopUrl}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 font-cairo text-sm font-bold text-text-muted transition-colors hover:bg-bg-soft hover:text-text"
            >
              <Copy size={16} />
              نسخ الرابط
            </button>
            <a
              href={shopPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-cairo text-sm font-bold text-white transition-colors hover:bg-primary-700"
            >
              <ExternalLink size={16} />
              فتح كعميل
            </a>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatBox icon={Eye} label="حالة الظهور" value={store.isActive ? 'ظاهر' : 'موقوف'} tone={store.isActive ? 'success' : 'warning'} />
        <StatBox icon={Package} label="منتجات ظاهرة" value={isLoading ? '...' : products.length.toLocaleString('en-US')} />
        <StatBox icon={Tag} label="أقسام المتجر" value={categories.length.toLocaleString('en-US')} tone="accent" />
        <StatBox icon={Store} label="نوع المتجر" value={store.type === 'digital' ? 'رقمي' : 'مادي'} />
      </div>

      {!store.isActive && (
        <div className="mb-6 rounded-lg border border-warning-100 bg-warning-100/60 p-4 font-cairo text-sm font-semibold text-warning">
          المتجر موقوف حاليا، لذلك لن يظهر للعملاء حتى يتم تفعيله.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-lg border border-border bg-white p-4">
          <h2 className="font-cairo text-base font-extrabold text-text">إدارة المتجر</h2>
          <div className="mt-4 grid gap-2">
            <Link
              to="/dashboard/products"
              className="inline-flex h-10 items-center justify-center gap-2 rounded bg-primary px-4 font-cairo text-sm font-bold text-white transition-colors hover:bg-primary-700"
            >
              <Plus size={16} />
              إضافة منتجات
            </Link>
            <Link
              to="/dashboard/settings"
              className="inline-flex h-10 items-center justify-center gap-2 rounded border border-border bg-white px-4 font-cairo text-sm font-bold text-text-muted transition-colors hover:bg-bg-soft hover:text-text"
            >
              <Settings size={16} />
              إعدادات المتجر
            </Link>
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <p className="font-cairo text-xs font-bold text-text-muted">الرابط العام</p>
            <p className="mt-1 break-all font-inter text-xs leading-6 text-text-muted">{shopUrl}</p>
          </div>
        </aside>

        <section className="rounded-lg border border-border bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-cairo text-base font-extrabold text-text">معاينة سريعة للواجهة</h2>
              <p className="mt-1 font-cairo text-sm text-text-muted">هذه ليست صفحة داخلية مكررة، بل ملخص لما سيجده العميل في المتجر العام.</p>
            </div>
            <a href={shopPath} target="_blank" rel="noopener noreferrer" className="font-cairo text-sm font-bold text-primary hover:underline">
              عرض الصفحة الكاملة
            </a>
          </div>

          <div className="rounded-lg bg-primary p-5 text-white">
            <p className="font-cairo text-sm text-white/75">{store.type === 'digital' ? 'متجر رقمي' : 'متجر منتجات مادية'}</p>
            <h3 className="mt-1 font-cairo text-2xl font-extrabold">{store.name}</h3>
            <p className="mt-2 max-w-xl font-cairo text-sm leading-7 text-white/75">
              {store.description || 'أضف وصفا جذابا من صفحة الإعدادات ليظهر هنا ويقنع العميل بالشراء.'}
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
              {featuredProducts.map((product) => (
                <MiniProduct key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-border bg-bg p-8 text-center">
              <Package size={30} className="mx-auto text-text-subtle" />
              <p className="mt-3 font-cairo text-sm font-bold text-text">لا توجد منتجات ظاهرة بعد</p>
              <p className="mt-1 font-cairo text-xs text-text-muted">أضف منتجات من لوحة التحكم لتظهر في متجر العميل.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
